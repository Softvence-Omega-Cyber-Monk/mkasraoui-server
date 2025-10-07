import {
  Controller,
  Get,
  Req,
  Query,
  Post,
  Body,
  Headers,
  HttpStatus,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
import { ProviderPaymentService } from './provider-payment.service';
import { Public } from 'src/common/decorators/public.decorators';
import { Response } from 'express';
import Stripe from 'stripe';
import sendResponse from '../utils/sendResponse';
import { CreateProviderPaymentDto } from './dto/create-provider-payment.dto';

@Controller('provider/payment')
export class ProviderPaymentController {
  constructor(private readonly paymentService: ProviderPaymentService) {}

  @Get('onboarding-link')
  async getOnboardingLink(@Req() req, @Res() res: Response) {
    const result = await this.paymentService.getOnboardingLink(req.user.id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Onboarding link generated',
      data: result,
    });
  }

  @Get('onboarding-status')
  async onboardingStatus(@Req() req, @Res() res: Response) {
    const result = await this.paymentService.isOnboardingComplete(req.user.id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Onboarding status fetched',
      data: result,
    });
  }

  @Get('login-dashboard')
  async loginDashboard(@Req() req, @Res() res: Response) {
    const result = await this.paymentService.getLoginLink(req.user.id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Stripe login link generated',
      data: result,
    });
  }

@Post('checkout')
async createCheckout(@Req() req, @Body() body:CreateProviderPaymentDto, @Res() res: Response) {
  const result = await this.paymentService.createCheckoutSession(req.user.id, body.quoteId);
  return sendResponse(res, {
    statusCode: HttpStatus.OK,
    success: true,
    message: 'Checkout session created successfully',
    data: result,
  });
}


  @Get('balance')
  async getBalance(@Req() req, @Res() res: Response) {
    const result = await this.paymentService.getBalance(req.user.id);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Provider balance fetched',
      data: result,
    });
  }

  @Get('history')
  async getPaymentHistory(
    @Req() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.getProviderPayments(
      req.user.id,
      Number(page),
      Number(limit),
    );
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Payment history fetched',
      data: result,
    });
  }

   @Post('webhook')
   @Public()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const res=await this.paymentService.handleWebhook(req);
  }
}
