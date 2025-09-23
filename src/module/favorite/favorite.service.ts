import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Assuming PrismaService is in this path
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFavoriteDto: CreateFavoriteDto,user_id) {
    try {
      const { product_id } = createFavoriteDto;

      // Check if the product already exists in the user's favorites
      const existingFavorite = await this.prisma.favorite.findFirst({
        where: {
          user_id: user_id,
          product_id: product_id,
        },
      });

      if (existingFavorite) {
        throw new HttpException('Product is already in favorites', HttpStatus.BAD_REQUEST);
      }

      // Create the new favorite record
      const newFavorite = await this.prisma.favorite.create({
        data: {
          user_id: user_id,
          product_id: product_id,
        },
      });

      return newFavorite;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add product to favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(user_id: string) {
    try {
      // Find all favorite products for a specific user
      const favorites = await this.prisma.favorite.findMany({
        where: { user_id: user_id },
        include: {
          prodcut: true, // Include the associated product data
        },
      });

      return favorites;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve favorite products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      // Check if the favorite record exists before attempting to delete
      const favoriteToDelete = await this.prisma.favorite.findUnique({
        where: { id: id },
      });

      if (!favoriteToDelete) {
        throw new HttpException('Favorite not found', HttpStatus.NOT_FOUND);
      }

      // Delete the favorite record
      const deletedFavorite = await this.prisma.favorite.delete({
        where: { id: id },
      });

      return deletedFavorite;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove favorite',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}