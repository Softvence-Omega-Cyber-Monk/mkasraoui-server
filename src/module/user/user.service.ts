import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, ServiceCategory } from '@prisma/client';

import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { MailService } from '../mail/mail.service';
import { MailTemplatesService } from '../mail/invitationFormat';


@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private mailTemplatesService:MailTemplatesService
  ) { }

  // User requests to become a provider
  async requestProvider(
    userId: string,
    dto: any,
    files: Express.Multer.File[],
  ) {
    const user = await this.prisma.user.findUnique(
      { where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isDeleted) throw new NotFoundException('The account is deleted!');
    if (user.role !== Role.USER)
      throw new BadRequestException('Only user can request to become a provider');
    if (user.isDeleted) throw new BadRequestException('User is deleted');

    const isExistRequest = await this.prisma.providerProfile.findUnique({
      where: { userId },
    });
    if (isExistRequest)
      throw new BadRequestException('You already sent a provider request');

    const imagePaths = files?.map((file) => buildFileUrl(file.filename)) || [];
    // Map and validate service categories
    const serviceCategories: ServiceCategory[] = dto.serviceCategory.map((c: string) => {
      const key = c.trim() as keyof typeof ServiceCategory;
      if (!(key in ServiceCategory)) {
        throw new BadRequestException(`Invalid service category: ${c}`);
      }
      return ServiceCategory[key];
    });
    const result = await this.prisma.providerProfile.create({
      data: {
        userId,
        bussinessName: dto.bussinessName,
        email: dto.email,
        contactName: dto.contactName,
        phone: dto.phone,
        serviceCategory: serviceCategories as ServiceCategory[],
        serviceArea: dto.serviceArea,
        latitude: dto.latitude,
        longitude: dto.longitude,
        description: dto.description,
        priceRange: dto.priceRange,
        website: dto.website,
        instagram: dto.instagram,
        portfolioImages: imagePaths,
        isApproved: false,
      },
    });

    return result;
  }

 // Admin approves provider request
async approveProviderRequest(requestId: string) {
  // Fetch the request
  const request = await this.prisma.providerProfile.findUnique({
    where: { id: requestId },
    include: { user: true }, // include user to get email and name
  });
  if (!request) throw new NotFoundException('Request not found');

  if (request.user.isDeleted) throw new NotFoundException('The account is deleted!');
  // Approve provider profile
  const provider = await this.prisma.providerProfile.update({
    where: { id: requestId },
    data: { isApproved: true },
  });

  // Update user role
  const updatedUser = await this.prisma.user.update({
    where: { id: request.userId,isDeleted:false },
    data: { role: Role.PROVIDER },
  });

  // Send approval email
  try {
    const dashboardLink = `${process.env.CLIENT_URL}/provider/dashboard`;
    const htmlContent = await this.mailTemplatesService.getProviderApprovalTemplate(
      updatedUser.name!,
      dashboardLink
    );

    await this.mailService.sendMail({
      to: updatedUser.email,
      subject: 'Your Provider Request Has Been Approved!',
      html: htmlContent,
    });

    console.log(`Approval email sent to ${updatedUser.email}`);
  } catch (err) {
    console.error('Failed to send approval email:', err);
    // optionally continue without failing the main request
  }

  return provider;
}

  // Admin rejects provider request
  async rejectProviderRequest(requestId: string) {
    const request = await this.prisma.providerProfile.findUnique({
      where: { id: requestId},
    });
    if (!request) throw new NotFoundException('Request not found');

    const result = await this.prisma.providerProfile.delete({
      where: { id: requestId },
    });

    return result;
  }


async deleteUser(userId:string){
  const isUserExist = await this.prisma.user.update({
    where:{
    id:userId,
    isDeleted:false
    },
    data:{
    isDeleted:true
    }
  })
  if(!isUserExist) throw new BadRequestException("The user not found!")

  return isUserExist
}


  async getAllProviders(query: any) {
    const {
      isApproved,
      page = 1,
      limit = 10,
      search,
      serviceCategory,
      serviceArea,
      priceRange,
    } = query;

    const where: any = {
      user:{isDeleted:false},
      ...(isApproved !== undefined && { isApproved: isApproved === 'true' }),
      ...(serviceCategory && { serviceCategory: { has: serviceCategory } }),
      ...(serviceArea && { serviceArea: { contains: serviceArea, mode: 'insensitive' } }),
      ...(priceRange && { priceRange: { equals: priceRange } }),
      ...(search && {
        OR: [
          { bussinessName: { contains: search, mode: 'insensitive' } },
          { serviceArea: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ],
      }),
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await this.prisma.$transaction([
      this.prisma.providerProfile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { user: true, reviews: true },
      }),
      this.prisma.providerProfile.count({ where }),
    ]);

    return {
      data: providers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getProviderById(id: string) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: {
         id ,
         user:{
          isDeleted:false
         }
        },
      include: {
        user: true,
        reviews: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async updateProviderProfile(
    userId: string,
    dto: any,
    files: Express.Multer.File[],
  ) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userId,
        user:{
          isDeleted:false
        }
       },
    });

    if (!profile) throw new NotFoundException('Provider profile not found');
    if (!profile.isApproved)
      throw new BadRequestException('Cannot update unapproved profile');

    // 1️⃣ Remove images
    let updatedImages = profile.portfolioImages || [];
    if (dto.removeImages && Array.isArray(dto.removeImages)) {
      for (const url of dto.removeImages) {
        try {
          const filePath = join(process.cwd(), 'uploads', url.split('/').pop()!);
          if (existsSync(filePath)) unlinkSync(filePath);
        } catch (err) {
          console.warn(`Failed to delete file: ${url}`, err.message);
        }
        updatedImages = updatedImages.filter((img) => img !== url);
      }
    }

    // 2️⃣ Add new uploaded images
    if (files && files.length > 0) {
      const newImagePaths = files.map((file) => buildFileUrl(file.filename));
      updatedImages = [...updatedImages, ...newImagePaths];
    }

    // 3️⃣ Validate service categories
    let serviceCategories = profile.serviceCategory;
    if (dto.serviceCategory) {
      serviceCategories = dto.serviceCategory.map((c: string) => {
        const key = c.trim().toUpperCase() as keyof typeof ServiceCategory;
        if (!(key in ServiceCategory)) {
          throw new BadRequestException(`Invalid service category: ${c}`);
        }
        return ServiceCategory[key];
      });
    }

    // 4️⃣ Explicitly update only valid fields
    const {
      bussinessName,
      email,
      contactName,
      phone,
      serviceArea,
      latitude,
      longitude,
      description,
      priceRange,
      website,
      instagram,
    } = dto;

    return this.prisma.providerProfile.update({
      where: { userId },
      data: {
        bussinessName,
        email,
        contactName,
        phone,
        serviceCategory: serviceCategories,
        serviceArea,
        latitude: Number(latitude),
        longitude: Number(longitude),
        description,
        priceRange,
        website,
        instagram,
        portfolioImages: updatedImages,
      },
    });
  }


  async providerMetaData(userId:string){
    const user = await this.prisma.user.findUnique({
      where:{
        id:userId,
        role:Role.PROVIDER,
        isDeleted:false
      },
      include:{
        providerProfile:true
      }
    })

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const totalBookings =await this.prisma.quote.count({ where: { providerId:user.providerProfile?.id } })

    const totalReview = await this.prisma.providerReview.count({
      where:{
        providerId:user.providerProfile?.id
      }
    })

    const avgRating = user.providerProfile?.avg_ratting;


    return {
    totalBookings,totalReview,avgRating
    }
    

  }


  async getMe(authUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: authUser.id,isDeleted:false },
      include: {
        subscription: true
      },

    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Compare JWT role with DB role
    if (authUser.role !== user.role) {
      throw new UnauthorizedException(
        '"Your provider request has been approved. Please login again.',
      );
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: {isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async updateUser(id: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id,isDeleted:false} });
    if (!user) throw new NotFoundException('User not found');
    const imageuer=dto.profileImage?buildFileUrl(dto.profileImage.filename):null;
    const result = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        profile_image: imageuer,
        
      },
    });

    return result;
  }
}
