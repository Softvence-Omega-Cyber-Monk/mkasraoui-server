import { Module } from '@nestjs/common';
import { ProviderPlanService } from './provider-plan.service';
import { ProviderPlanController } from './provider-plan.controller';

@Module({
  controllers: [ProviderPlanController],
  providers: [ProviderPlanService],
})
export class ProviderPlanModule {}
