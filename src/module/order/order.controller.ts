import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Res
} from '@nestjs/common';
import { OrderService } from './order.service';
import sendResponse from 'src/module/utils/sendResponse';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express'; // ✅ use Express types explicitly
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Public } from 'src/common/decorators/public.decorators';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** CREATE ORDER */
  @Post()
  @ApiOperation({ summary: 'Create an order and return Stripe Checkout URL' })
  async createOrder(
    @Req() req: ExpressRequest,
    @Body() body:CreateOrderDto,
    @Res() res: ExpressResponse,
  ) {
    const result = await this.orderService.createCheckout(req.user!.id, body);
    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  }

 /** GET ORDERS FOR CURRENT USER */
@Get('my-orders')
@ApiOperation({ summary: 'Get all orders for the authenticated user (paginated)' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items per page (default: 10)' })

async getUserOrders(
  @Req() req: ExpressRequest,
  @Res() res: ExpressResponse,
) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await this.orderService.getUserOrders(req.user!.id, page, limit);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });
}

/** ADMIN: GET ALL ORDERS */
@Get()
@Roles(Role.ADMIN)
@ApiOperation({ summary: 'Get all orders (admin only, paginated)' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number (default: 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Number of items per page (default: 10)' })
async getAllOrders(
  @Req() req: ExpressRequest,
  @Res() res: ExpressResponse,
) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await this.orderService.getAllOrders(page, limit);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });
}

/** UPDATE ORDER STATUS (ADMIN) */
@Patch(':id/status')
@Roles(Role.ADMIN)
@ApiOperation({ summary: 'Update order status (admin only)' })
async updateOrderStatus(
  @Param('id') id: string,
  @Body() body: UpdateOrderStatusDto,
  @Res() res: ExpressResponse,
) {
  const order = await this.orderService.updateOrderStatus(id, body.status);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
}




  /** VERIFY PAYMENT SESSION */
@Get('verify/:sessionId')
@Public()
@ApiOperation({ summary: 'Verify Stripe Checkout Session and return order' })
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

  /** STRIPE WEBHOOK: Handle payment success */
@Post('webhook')
@Public()
@ApiOperation({ summary: 'Stripe webhook for payment success' })
async stripeWebhook(
  @Req() req: ExpressRequest,      // raw body
  @Res() res: ExpressResponse,
) {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || Array.isArray(sig)) {
      return res.status(400).send('Missing Stripe signature');
    }

    const event = this.orderService.constructStripeEvent(req, sig);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
  const sessionId = session.id; // use checkout session id

  await this.orderService.handlePaymentSuccess(sessionId);
    }

    return res.status(200).send({ received: true });
  } catch (err: any) {
    console.error('⚠️ Stripe webhook error:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}


}
