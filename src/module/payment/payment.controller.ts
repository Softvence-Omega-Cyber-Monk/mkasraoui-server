// import { Controller, Post, Body, Req, Res, Headers, RawBodyRequest } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { PaymentsService } from './payment.service';

// @Controller('payments')
// export class PaymentsController {
//   constructor(private readonly paymentsService: PaymentsService) {}

//   // User clicks "Shop Now"
//   @Post('checkout')
//   async createCheckout(@Body() body: { userId: string; productId: string }) {
//     return this.paymentsService.createCheckoutSession(body.userId, body.productId);
//   }

//   // Stripe Webhook (must use raw body)
//   @Post('webhook')
//   async handleWebhook(
//     @Req() req: RawBodyRequest<Request>,
//     @Res() res: Response,
//     @Headers('stripe-signature') signature: string,
//   ) {
//     const result = await this.paymentsService.handleWebhook(req.rawBody, signature);
//     res.json(result);
//   }
// }
