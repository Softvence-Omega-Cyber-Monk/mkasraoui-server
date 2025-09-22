// import { Injectable, BadRequestException } from '@nestjs/common';
// import Stripe from 'stripe';
// import { ConfigService } from '@nestjs/config';
// import { OrderService } from '../order/order.service';

// @Injectable()
// export class PaymentsService {
//   private stripe: Stripe;

//   constructor(
//     private ordersService: OrderService,
//     private configService: ConfigService,
//   ) {
//     this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
//       apiVersion: '2024-06-20',
//     });
//   }

//   async createCheckoutSession(userId: string, productId: string) {
//     // 1. Fetch product details from DB
//     const product = await this.ordersService.getProductById(productId);
//     if (!product) throw new BadRequestException('Product not found');

//     // 2. Create Order with status PENDING
//     const order = await this.ordersService.createOrder(userId, product);

//     // 3. Create Stripe Checkout Session
//     const session = await this.stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       customer_email: (await this.ordersService.getUserEmail(userId)),
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: product.title,
//               description: product.description,
//             },
//             unit_amount: Math.round(product.price * 100), // in cents
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-success?orderId=${order.id}`,
//       cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/payment-cancel?orderId=${order.id}`,
//       metadata: { orderId: order.id },
//     });

//     return { url: session.url };
//   }

//   async handleWebhook(rawBody: Buffer, signature: string) {
//     let event: Stripe.Event;

//     try {
//       event = this.stripe.webhooks.constructEvent(
//         rawBody,
//         signature,
//         this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
//       );
//     } catch (err) {
//       throw new BadRequestException(`Webhook error: ${err.message}`);
//     }

//     // Handle event types
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const orderId = session.metadata?.orderId;

//       if (orderId) {
//         await this.ordersService.updateOrderStatus(orderId, 'PAID');
//         await this.ordersService.createTransaction({
//           orderId,
//           stripeId: session.payment_intent as string,
//           amount: session.amount_total / 100,
//           currency: session.currency,
//           status: 'succeeded',
//         });
//       }
//     }

//     return { received: true };
//   }
// }
