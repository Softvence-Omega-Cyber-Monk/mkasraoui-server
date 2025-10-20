import { Module } from '@nestjs/common';
import { AffiliatedProductService } from './affiliated-product.service';
import { AffiliatedProductController } from './affiliated-product.controller';

@Module({
  controllers: [AffiliatedProductController],
  providers: [AffiliatedProductService],
})
export class AffiliatedProductModule {}
