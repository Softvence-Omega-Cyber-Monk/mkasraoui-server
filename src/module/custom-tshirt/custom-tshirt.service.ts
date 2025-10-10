import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { CreateCustomOrderDto } from './dto/create-custom-order.dto';
// import { getGelatoVariantUid } from './utils';
import axios from 'axios';
import { TShirtType } from '@prisma/client';

@Injectable()
export class CustomOrderService {
  private stripe: Stripe;
  private readonly gelatoApi = process.env.GELATO_API_URL;
  private readonly gelatoKey = process.env.GELATO_API_KEY;

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
      theme,
      name,
      age,
      optionalMessage,
      quantity,
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
        theme,
        name,
        age,
        optionalMessage,
        quantity,
        total,
        status: 'PENDING',
        address,
        city,
        state,
        zipCode,
        designUrl,
        mockupUrl,
        contactName,
        contactPhone
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

    
   
    const order=await this.prisma.customOrder.update({
      where: { id: session.metadata.orderId },
      data: {
        status: 'PAID',
        paymentIntentId: session.payment_intent as string,
      },
      include: { user: true },
    });

     await this.createGelatoOrder(order);
     
     return order

  }

  /** Construct Stripe event from webhook */
  constructStripeEvent(req: Request, sig: string) {
    return this.stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_CUSTOM_ORDER!,
    );
  }




private async createGelatoOrder(order:any) {
  try {

    let productUid:string= "";
    if(order.tShirtType===TShirtType.ADULT){
     productUid =`apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_prm_gsi_${order.size}_gco_${order.color}_gpr_4-0_bella-and-canvas_3001`;
   
    }
    if(order.tShirtType===TShirtType.CHILD){
    productUid=  `apparel_product_gca_t-shirt_gsc_crewneck_gcu_kids_gqa_organic_gsi_${order.size}_gco_${order.color}_gpr_4-0_sols_03578`;
    }
    const orderReferenceId = `ORDER-${order.id}`;
    const itemReferenceId = `ITEM-${order.id}`;

    const payload = {
      orderType: 'order',
      orderReferenceId,
      customerReferenceId: order.userId,
      currency: 'EUR',
      shipmentMethodUid: 'standard',
      items: [
        {
          itemReferenceId,
          productUid:productUid,
          quantity: order.quantity,
          files: [
            {
              type: 'default',
              url: order.designUrl,
            },
          ],
        },
      ],
      shippingAddress: {
        firstName: order.contactName || order.user.name || 'Customer',
        lastName: order.user.lastName || ' ',
        addressLine1: order.address || 'Unknown address',
        city: order.city || 'Paris',
        postCode: String(order.zipCode || '00000'),
        country: 'FR',
        phone: order.contactPhone || '+33000000000',
        email: order.user.email || 'test@example.com',
      },
    };

    console.log('🚀 Sending payload to Gelato:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${this.gelatoApi}/orders`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.gelatoKey,
        },
      },
    );

    const gelatoData = response.data;

    await this.prisma.customOrder.update({
      where: { id: order.id },
      data: {
        gelatoOrderId: gelatoData.id,
        gelatoStatus: gelatoData.status,
      },
    });

    console.log('✅ Gelato order created successfully:', gelatoData);
    return gelatoData;

  } catch (err: any) {
    console.error('❌ Failed to create Gelato order:', err.response?.data || err.message);
    throw new BadRequestException('Failed to create Gelato order');
  }
}


}
