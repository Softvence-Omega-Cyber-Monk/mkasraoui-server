import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import sendResponse from '../utils/sendResponse';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: 'uuid-of-product' },
        quantity: { type: 'number', example: 2, default: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product added to cart successfully' })
  async addToCart(
    @Req() req: Request,
    @Body() dto: { productId: string; quantity?: number },
    @Res() res: Response,
  ) {
    const result = await this.cartService.addToCart(
      req.user!.id,
      dto.productId,
      dto.quantity ?? 1,
    );
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product added to cart successfully',
      data: result,
    });
  }

  @Get()
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart fetched successfully' })
  async getCart(@Req() req: Request, @Res() res: Response) {
    const result = await this.cartService.getCart(req.user!.id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Cart fetched successfully',
      data: result,
    });
  }

  @Patch('update')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Update quantity of a cart item' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: 'uuid-of-product' },
        quantity: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  async updateQuantity(
    @Req() req: Request,
    @Body() dto: { productId: string; quantity: number },
    @Res() res: Response,
  ) {
    const result = await this.cartService.updateQuantity(
      req.user!.id,
      dto.productId,
      dto.quantity,
    );
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Cart item updated successfully',
      data: result,
    });
  }

  @Delete('remove')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Remove a product from the cart' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: 'uuid-of-product' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Product removed from cart successfully' })
  async removeItem(
    @Req() req: Request,
    @Body() dto: { productId: string },
    @Res() res: Response,
  ) {
    const result = await this.cartService.removeItem(req.user!.id, dto.productId);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product removed from cart successfully',
      data: result,
    });
  }

  @Delete('clear')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Clear all items from the cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Req() req: Request, @Res() res: Response) {
    const result = await this.cartService.clearCart(req.user!.id);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Cart cleared successfully',
      data: result,
    });
  }
}
