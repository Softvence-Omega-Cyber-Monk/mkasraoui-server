import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import sendResponse from 'src/module/utils/sendResponse';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';
import { Public } from 'src/common/decorators/public.decorators';
import { CustomOrderService } from './custom-tshirt.service';
import { UpdateOrderStatusDto } from '../order/dto/update-order-status.dto';

@ApiTags('Custom Orders')
@Controller('custom-orders')
export class CustomOrderController {
  constructor(private readonly orderService: CustomOrderService) {}

  /** CREATE CUSTOM T-SHIRT ORDER */
  @Post()
  @ApiOperation({ summary: 'Create a custom t-shirt order and return Stripe Checkout URL' })
  async createOrder(
    @Req() req: ExpressRequest,
    @Body() body: CreateCustomOrderDto,
    @Res() res: ExpressResponse,
  ) {
    try {
      const result = await this.orderService.createCheckout(req.user!.id, body);
      return sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Custom order created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Custom Order creation error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }



  /** USER: GET MY CUSTOM ORDERS */
  @Get('my-orders')
  @ApiOperation({ summary: 'Get all custom orders for the authenticated user (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getUserOrders(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.orderService.getUserOrders(req.user!.id, page, limit);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Custom orders fetched successfully',
      data: result,
    });
  }

  /** ADMIN: GET ALL CUSTOM ORDERS */
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all custom orders (admin only, paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllOrders(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.orderService.getAllOrders(page, limit);

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All custom orders fetched successfully',
      data: result,
    });
  }


    /** GET SINGLE ORDER (user or admin) */
@Get(':id')
@ApiOperation({ summary: 'Get a single custom order by ID' })
async getOrderById(
  @Param('id') id: string,
  @Req() req: ExpressRequest,
  @Res() res: ExpressResponse,
) {
  const order = await this.orderService.getOrderById(id, req.user!.id, req.user!.role);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Custom order fetched successfully',
    data: order,
  });
}


  /** ADMIN: UPDATE CUSTOM ORDER STATUS */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update custom order status (admin only)' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @Res() res: ExpressResponse,
  ) {
    const order = await this.orderService.updateOrderStatus(id, body.status);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Custom order status updated successfully',
      data: order,
    });
  }

  /** VERIFY PAYMENT SESSION */
  @Get('verify/:sessionId')
  @Public()
  @ApiOperation({ summary: 'Verify Stripe Checkout Session for custom order' })
  async verifyCheckoutSession(
    @Param('sessionId') sessionId: string,
    @Res() res: ExpressResponse,
  ) {
    try {
      const order = await this.orderService.handlePaymentSuccess(sessionId);

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Checkout session verified successfully',
        data: order,
      });
    } catch (err: any) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: err.message || 'Failed to verify session',
        data: null,
      });
    }
  }

  /** STRIPE WEBHOOK */
  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook for custom order payment success' })
  async stripeWebhook(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig || Array.isArray(sig)) {
        return res.status(400).send('Missing Stripe signature');
      }

      const event = this.orderService.constructStripeEvent(req, sig);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        await this.orderService.handlePaymentSuccess(session.id);
      }

      return res.status(200).send({ received: true });
    } catch (err: any) {
      console.error('⚠️ Stripe webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
