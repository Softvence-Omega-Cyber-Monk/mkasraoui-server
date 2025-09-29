import { Module } from '@nestjs/common';
import { PartGenerationService } from './part-generation.service';
import { PartGenerationController } from './part-generation.controller';

@Module({
  controllers: [PartGenerationController],
  providers: [PartGenerationService],
})
export class PartGenerationModule {}
