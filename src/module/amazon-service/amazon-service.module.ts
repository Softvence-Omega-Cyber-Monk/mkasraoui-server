import { Module } from '@nestjs/common';
import { AmazonController } from './amazon-service.controller';
import { AmazonService } from './amazon-service.service';


@Module({
  controllers: [AmazonController],
  providers: [AmazonService],
})
export class AmazonServiceModule {}
