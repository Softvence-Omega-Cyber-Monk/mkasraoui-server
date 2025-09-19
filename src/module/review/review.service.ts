import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

async create(createReviewDto: CreateReviewDto, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      const newReview = await prisma.productReview.create({
        data: {
          rating: createReviewDto.rating,
          description: createReviewDto.description,
          productId: createReviewDto.productId,
          userId: userId,
        },
      });

      const { productId } = createReviewDto;
      const productReviews = await prisma.productReview.findMany({
        where: { productId },
      });
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const newAverage = totalRating / productReviews.length;
      await prisma.product.update({
        where: { id: productId },
        data: {
          avg_rating: newAverage,
        total_review:{increment:1}
        },
      });
      return newReview;
    });
  }

  // async findAll() {
  //   return this.prisma.productReview.findMany({
  //     include: {
  //       user: true,
  //       product: true,
  //     },
  //   });
  // }

  // async findOne(id: string) {
  //   const review = await this.prisma.productReview.findUnique({
  //     where: { id },
  //     include: {
  //       user: true,
  //       product: true,
  //     },
  //   });

  //   if (!review) {
  //     throw new NotFoundException(`Review with ID ${id} not found`);
  //   }

  //   return review;
  // }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const existingReview = await this.prisma.productReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('You can only update your own reviews.');
    }
    return this.prisma.productReview.update({
      where: { id },
      data: {
        ...updateReviewDto,
      },
    });
  }

  async remove(id: string, userId: string) {
    const existingReview = await this.prisma.productReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own reviews.');
    }
    return this.prisma.productReview.delete({
      where: { id },
    });
  }
}