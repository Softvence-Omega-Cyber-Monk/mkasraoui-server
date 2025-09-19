import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProviderReviewDto } from './dto/create-provider-review.dto';
import { UpdateProviderReviewDto } from './dto/update-provider-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProviderReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProviderReviewDto: CreateProviderReviewDto, userId: string) {
    // Check if the provider exists first
    const provider = await this.prisma.providerProfile.findUnique({
      where: { id: createProviderReviewDto.providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider with ID ${createProviderReviewDto.providerId} not found`);
    }

    // Use a transaction to ensure both operations are atomic.
    return this.prisma.$transaction(async (prisma) => {
      // Step 1: Create the new provider review
      const newReview = await prisma.providerReview.create({
        data: {
          rating: createProviderReviewDto.rating,
          description: createProviderReviewDto.description,
          providerId: createProviderReviewDto.providerId,
          productId: createProviderReviewDto.productId,
          userId: userId,
        },
      });

      const providerReviews = await prisma.providerReview.findMany({
        where: { providerId: createProviderReviewDto.providerId },
      });

      const totalRating = providerReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverage = totalRating / providerReviews.length;

      // Update the provider's profile with the new average rating and total review count
      await prisma.providerProfile.update({
        where: { id: createProviderReviewDto.providerId },
        data: {
          avg_ratting: newAverage,
          total_review: providerReviews.length,
        },
      });

      return newReview;
    });
  }

  async findAll() {
    return this.prisma.providerReview.findMany({
      include: {
        user: true,
        provider: true,
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.providerReview.findUnique({
      where: { id },
      include: {
        user: true,
        provider: true,
      },
    });

    if (!review) {
      throw new NotFoundException(`Provider review with ID ${id} not found`);
    }
    return review;
  }

  async update(id: string, updateProviderReviewDto: UpdateProviderReviewDto, userId: string) {
    const existingReview = await this.prisma.providerReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Provider review with ID ${id} not found`);
    }

    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('You can only update your own reviews.');
    }

    return this.prisma.providerReview.update({
      where: { id },
      data: { ...updateProviderReviewDto },
    });
  }

  async remove(id: string, userId: string) {
    const existingReview = await this.prisma.providerReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Provider review with ID ${id} not found`);
    }

    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own reviews.');
    }

    return this.prisma.providerReview.delete({
      where: { id },
    });
  }
}