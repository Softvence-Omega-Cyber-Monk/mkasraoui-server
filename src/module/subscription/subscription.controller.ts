import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers, RawBodyRequest, HttpException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Public } from 'src/common/decorators/public.decorators';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('payment')
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto,@Req() req:any) {
    try{
      const userId=req.user.id
    const res=await this.subscriptionService.create_subscription(createSubscriptionDto,userId);
    return res
    }catch(err){
      throw new  HttpException(err.message, err.status || 500);
    }
    
  }

   @Post('webhook')
   @Public()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const res=await this.subscriptionService.handleWebhook(req);
  }

}
