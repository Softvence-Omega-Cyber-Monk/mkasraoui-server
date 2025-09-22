import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class OrderService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' as any });
  }

  /** Create an order and return Stripe Checkout URL */
  async createCheckout(
    userId: string,
    shippingInfo: { shippingAddress: string; contactName: string; contactPhone: string },
  ) {
    // 1️⃣ Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2️⃣ Calculate total
    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // 3️⃣ Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        status: 'PENDING',
        shippingAddress: shippingInfo.shippingAddress,
        contactName: shippingInfo.contactName,
        contactPhone: shippingInfo.contactPhone,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    // 4️⃣ Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product.title },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    // 5️⃣ Clear cart
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { order, checkoutUrl: session.url };
  }

  /** Get all orders for a user */
  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin: Get all orders */
  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Update order status (admin only) */
  async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'DELIVERED',
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
