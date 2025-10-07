import { Module } from '@nestjs/common';
import { ProviderPaymentService } from './provider-payment.service';
import { ProviderPaymentController } from './provider-payment.controller';

@Module({
  controllers: [ProviderPaymentController],
  providers: [ProviderPaymentService],
})
export class ProviderPaymentModule {}
