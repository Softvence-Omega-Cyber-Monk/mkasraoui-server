import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderPaymentDto {
  @ApiProperty({
    example: 'q_1234567890',
    description: 'The ID of the quote for which payment is being made',
  })
  @IsNotEmpty({ message: 'Quote ID is required!' })
  @IsString({ message: 'Quote ID must be a string' })
  quoteId: string;


}
