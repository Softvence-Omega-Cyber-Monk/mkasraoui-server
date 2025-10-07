import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';

@Injectable()
export class CustomOrderService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2022-11-15' as any,
    });
  }

  /** Create a Custom T-Shirt Order and return Stripe Checkout URL */
  async createCheckout(userId: string, body: CreateCustomOrderDto) {
    const {
      tShirtType,
      size,
      gender,
      color,
      Age,
      theme,
      name,
      age,
      optionalMessage,
      quantity,
      shippingFee,
      address,
      state,
      city,
      zipCode,
      total,
      designUrl ,
      mockupUrl,
      contactName,
      contactPhone,
    } = body;


  const isUserExist = await this.prisma.user.findUnique({
    where:{id:userId}
  })
  if(!isUserExist){
    throw new BadRequestException('user does not exist!');
  }

    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Invalid quantity');
    }

    // 1️⃣ Create Custom Order in DB
    const order = await this.prisma.customOrder.create({
      data: {
        userId,
        tShirtType,
        size,
        gender,
        color,
        Age,
        theme,
        name,
        age,
        optionalMessage,
        quantity,
        shippingFee,
        total,
        status: 'PENDING',
        address,
        city,
        state,
        zipCode,
        designUrl,
        mockupUrl,
        contactName,
        contactPhone,
      },
      include: { user: true },
    });

    // 2️⃣ Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: `Custom T-Shirt Order #${order.id}` },
            unit_amount: Math.round(total * 100), // convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: isUserExist.email,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    return { order, checkoutUrl: session.url };
  }


  /** Get a single custom order by ID */
async getOrderById(orderId: string, userId: string, role: string) {
  const order = await this.prisma.customOrder.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    throw new NotFoundException('Order not found');
  }

  // Restrict normal users to only their own orders
  if (role !== 'ADMIN' && order.userId !== userId) {
    throw new BadRequestException('You are not authorized to view this order');
  }

  return order;
}

  /** Get all custom orders for a user (paginated) */
  async getUserOrders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.customOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customOrder.count({ where: { userId } }),
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

  /** Admin: Get all custom orders (paginated) */
  async getAllOrders(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.customOrder.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customOrder.count(),
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
  async updateOrderStatus(orderId: string, status: 'CANCELLED' | 'DELIVERED') {
    const order = await this.prisma.customOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.customOrder.update({
      where: { id: orderId },
      data: { status },
      include: { user: true },
    });
  }

  /** Handle Stripe payment success */
  async handlePaymentSuccess(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (!session || !session.metadata?.orderId) {
      throw new NotFoundException('Order not found for this session');
    }

    return this.prisma.customOrder.update({
      where: { id: session.metadata.orderId },
      data: {
        status: 'PAID',
        paymentIntentId: session.payment_intent as string,
      },
      include: { user: true },
    });
  }

  /** Construct Stripe event from webhook */
  constructStripeEvent(req: Request, sig: string) {
    return this.stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_CUSTOM_ORDER!,
    );
  }
}
