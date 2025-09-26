import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePromotionalEmailDto {

@ApiProperty({
    description: 'The subject of the email.',
    example: 'Exclusive Offer: 20% Off on All Products!',
})
  @IsNotEmpty({ message: 'The subject cannot be empty.' })
  @IsString({ message: 'The subject must be a string.' })
  readonly subject: string;
 
  @ApiProperty({
    description: 'The message content of the email.',
    example: 'Dear valued customer, we are pleased to introduce an exclusive offer for you. Enjoy 20% off on all our products today!',
  })
  @IsNotEmpty({ message: 'The message content cannot be empty.' })
  @IsString({ message: 'The message content must be a string.' })
  readonly message: string;
}