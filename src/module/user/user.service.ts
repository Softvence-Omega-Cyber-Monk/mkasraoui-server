import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestProviderDto } from './dto/request-provider.dto';
import { Role, ServiceCategory } from '@prisma/client';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // User requests to become a provider
  async requestProvider(userId: string, dto: RequestProviderDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if(user.role!==Role.USER) throw new BadRequestException('Only user can be requested to become an Provider');
    if (user.isDeleted) throw new BadRequestException('User is deleted');
   const isExistRequest = await this.prisma.providerProfile.findUnique({
    where:{userId}
   })
   if(isExistRequest) throw new BadRequestException("You Already sent provider request")
    const result = await this.prisma.providerProfile.create({
      data: {
        userId,
        bussinessName: dto.bussinessName,
        email: dto.email,
        contactName: dto.contactName,
        phone: dto.phone,
        serviceCategory: dto.serviceCategory as ServiceCategory[],
        serviceArea: dto.serviceArea,
        latitude: dto.latitude,
        longitude: dto.longitude,
        description: dto.description,
        priceRange: dto.priceRange,
        website: dto.website,
        instagram: dto.instagram,
        portfolioImages: dto.portfolioImages,
        isApproved:false
      },
    });

    return result
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
      where:{
        id:requestId
      },
      data: {
        isApproved: true,
      },
    });
    // Update user role
    await this.prisma.user.update({
      where: { id: isExist.userId },
      data: { role:Role.PROVIDER },
    });

    return provider
  }


  // Admin rejects provider request
  async rejectProviderRequest(requestId: string) {
    const request = await this.prisma.providerProfile.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    const result = await this.prisma.providerProfile.delete({ where: { id: requestId } });

    return result
  }


// Get all providers with optional isApproved filter (admin only)
async getAllProviders(isApproved?: boolean) {
  const providers = await this.prisma.providerProfile.findMany({
    where: isApproved !== undefined ? { isApproved } : {},
    orderBy: { createdAt: 'desc' },
    include:{user:true}
  });
  return providers;
}



// Update provider profile
async updateProviderProfile(userId: string, dto: UpdateProviderDto) {
  // Find provider profile
  const profile = await this.prisma.providerProfile.findUnique({
    where: { userId },
  });
  if (!profile) throw new NotFoundException('Provider profile not found');
  if (!profile.isApproved) throw new BadRequestException('Cannot update unapproved profile');

  // Update profile
  const updated = await this.prisma.providerProfile.update({
    where: { userId },
    data: { ...dto },
  });

  return updated;
}




}
