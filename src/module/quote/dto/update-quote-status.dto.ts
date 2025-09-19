import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { QuoteStatus } from '@prisma/client';

export class UpdateQuoteStatusDto {
  @ApiProperty({ enum: QuoteStatus, example: QuoteStatus.BOOKED })
  @IsEnum(QuoteStatus)
  status: QuoteStatus;
}
