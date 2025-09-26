import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' as any });
  }

/** Create an order and return Stripe Checkout URL */
async createCheckout(
  userId: string,
  body: CreateOrderDto,
) {
  const { items, totalPrice, shippingFee, shippingInfo, additionalNotes } = body;

  if (!items || items.length === 0) {
    throw new BadRequestException('No items provided');
  }

  // 1️⃣ Validate products exist
  const productIds = items.map((i) => i.productId);
  const products = await this.prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== items.length) {
    throw new BadRequestException('Some products are invalid');
  }

  // 2️⃣ Create Order in DB
  const order = await this.prisma.order.create({
    data: {
      userId,
      total: totalPrice, // ✅ frontend-sent total (items + shipping)
      status: 'PENDING',
      shippingAddress: JSON.stringify(shippingInfo),
      contactName: shippingInfo.name,
      contactPhone: shippingInfo.phone,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
         
        })),
      },
    },
    include: { items: { include: { product: true } }, user: true },
  });

  // 3️⃣ Create Stripe Checkout Session (Single total line item)
  const session = await this.stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: `Order #${order.id}` }, // ✅ Single line item label
          unit_amount: Math.round(totalPrice * 100), // ✅ total (items + shipping)
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: shippingInfo.email,
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      orderId: order.id,
      userId,
      additionalNotes: additionalNotes || '',
      shippingFee: shippingFee.toString(),
    },
  });

  return { order, checkoutUrl: session.url };
}



  /** Get all orders for a user with pagination */
async getUserOrders(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [orders, total] = await this.prisma.$transaction([
    this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.order.count({ where: { userId } }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    orders,
  };
}

/** Admin: Get all orders with pagination */
async getAllOrders(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [orders, total] = await this.prisma.$transaction([
    this.prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.order.count(),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    orders,
  };
}

  /** Update order status (admin only) */
  async updateOrderStatus(
    orderId: string,
    status: 'CANCELLED' |'DELIVERED',
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: { include: { product: true } }, user: true },
    });
  }

  /** Handle Stripe webhook for payment success */
  async handlePaymentSuccess(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.metadata?.orderId) {
      throw new NotFoundException('Order not found for this session');
    }

    return this.prisma.order.update({
      where: { id: session.metadata.orderId },
      data: {
        status: 'PAID',
        paymentIntentId: session.payment_intent as string,
      },
      include: { items: { include: { product: true } }, user: true },
    });
  }


  constructStripeEvent(req: Request, sig: string) {
  return this.stripe.webhooks.constructEvent(
    (req as any).rawBody, // ensure body is not parsed before
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

}
