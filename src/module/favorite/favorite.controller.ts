import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { AuthGuard } from '@nestjs/passport'; // Assuming you have a JWT strategy set up
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import sendResponse from '../utils/sendResponse';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @Post()
  @ApiOperation({ summary: "Add a product to the user's favorites" })
  @ApiBody({
    type: CreateFavoriteDto,
    description: "The product ID to add to favorites. User ID is taken from the authenticated request.",
    examples: {
      a: {
        summary: 'Example of adding a product',
        value: {
          product_id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        } as CreateFavoriteDto,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product added to favorites successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Product is already in favorites or an invalid product ID was provided.',
  })
  async create_favorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req.user as { id: string };
      const userId = user.id;

      if (!createFavoriteDto.product_id) {
        throw new HttpException('Product ID is required', HttpStatus.BAD_REQUEST);
      }

      const favoriteData = { ...createFavoriteDto};
      const result = await this.favoriteService.create(favoriteData,userId);

      sendResponse(res, {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'Product added to favorites successfully',
        data: result,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to add product to favorites',
        data: null,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find all favorite products for the authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of favorite products retrieved successfully.',
  })
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as { id: string };
      const favorites = await this.favoriteService.findAll(user.id);
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Favorite products retrieved successfully',
        data: favorites,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to retrieve favorite products',
        data: null,
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: "Remove a product from a user's favorites by favorite ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorite product removed successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Favorite record not found.',
  })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.favoriteService.remove(id);
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Favorite product removed successfully',
        data: result,
      });
    } catch (error) {
      sendResponse(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || 'Failed to remove favorite product',
         data: null,
      });
    }
  }
}