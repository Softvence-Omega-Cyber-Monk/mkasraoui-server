import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, ServiceCategory } from '@prisma/client';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // User requests to become a provider
async requestProvider(
    userId: string,
    dto: any,
    files: Express.Multer.File[],
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
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
    const isExist = await this.prisma.providerProfile.findUnique({
      where: { id: requestId },
    });
    if (!isExist) throw new NotFoundException('Request not found');

    // Create provider profile
    const provider = await this.prisma.providerProfile.update({
      where: {
        id: requestId,
      },
      data: {
        isApproved: true,
      },
    });
    // Update user role
    await this.prisma.user.update({
      where: { id: isExist.userId },
      data: { role: Role.PROVIDER },
    });

    return provider;
  }

  // Admin rejects provider request
  async rejectProviderRequest(requestId: string) {
    const request = await this.prisma.providerProfile.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    const result = await this.prisma.providerProfile.delete({
      where: { id: requestId },
    });

    return result;
  }

  // Get all providers with optional isApproved filter (admin only)
  async getAllProviders(isApproved?: boolean) {
    const providers = await this.prisma.providerProfile.findMany({
      where: isApproved !== undefined ? { isApproved } : {},
      orderBy: { createdAt: 'desc' },
      include: { user: true,reviews:true },
    });
    return providers;
  }

// async updateProviderProfile(
//   userId: string,
//   dto: any, // updated provider fields
//   files: Express.Multer.File[],
// ) {
//   const profile = await this.prisma.providerProfile.findUnique({
//     where: { userId },
//   });

//   if (!profile) throw new NotFoundException('Provider profile not found');
//   if (!profile.isApproved)
//     throw new BadRequestException('Cannot update unapproved profile');

//   // 1️⃣ Remove images specified in dto.removeImages
//   let updatedImages = profile.portfolioImages || [];
//   if (dto.removeImages && Array.isArray(dto.removeImages)) {
//     for (const url of dto.removeImages) {
//       const filePath = join(__dirname, '../../uploads', url.split('/').pop()!);
//       if (existsSync(filePath)) unlinkSync(filePath); // delete file from server
//       updatedImages = updatedImages.filter((img) => img !== url); // remove from array
//     }
//   }

//   // 2️⃣ Add new uploaded files
//   if (files && files.length > 0) {
//     const newImagePaths = files.map((file) => buildFileUrl(file.filename));
//     updatedImages = [...updatedImages, ...newImagePaths];
//   }

//   // 3️⃣ Validate service categories if provided
//   let serviceCategories = profile.serviceCategory;
//   if (dto.serviceCategory) {
//     serviceCategories = dto.serviceCategory.map((c: string) => {
//       const key = c.trim() as keyof typeof ServiceCategory;
//       if (!(key in ServiceCategory)) {
//         throw new BadRequestException(`Invalid service category: ${c}`);
//       }
//       return ServiceCategory[key];
//     });
//   }

//   // 4️⃣ Update provider profile in database
//   const updatedProfile = await this.prisma.providerProfile.update({
//     where: { userId },
//     data: {
//       ...dto,
//       serviceCategory: serviceCategories,
//       portfolioImages: updatedImages,
//     },
//   });

//   return updatedProfile;
// }

async updateProviderProfile(
  userId: string,
  dto: any,
  files: Express.Multer.File[],
) {
  const profile = await this.prisma.providerProfile.findUnique({
    where: { userId },
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



    async getMe(authUser: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isDeleted: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 🚨 Compare JWT role with DB role
    if (authUser.role !== user.role) {
      throw new UnauthorizedException(
        '"Your provider request has been approved. Please login again.',
      );
    }

    return user;
  }
}
