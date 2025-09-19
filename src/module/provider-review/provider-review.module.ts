import { Module } from '@nestjs/common';
import { ProviderReviewService } from './provider-review.service';
import { ProviderReviewController } from './provider-review.controller';

@Module({
  controllers: [ProviderReviewController],
  providers: [ProviderReviewService],
})
export class ProviderReviewModule {}
