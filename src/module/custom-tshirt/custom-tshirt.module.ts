import { Module } from '@nestjs/common';
import { CustomOrderController } from './custom-tshirt.controller';
import { CustomOrderService } from './custom-tshirt.service';


@Module({
  controllers: [CustomOrderController],
  providers: [CustomOrderService],
})
export class CustomTshirtModule {}
