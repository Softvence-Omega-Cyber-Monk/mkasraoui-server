import { IsString, IsNumber, IsNotEmpty, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderReviewDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  @ApiProperty({
    description: 'The rating of the provider, on a scale of 0 to 5.',
    example: 4.5,
  })
  rating: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'A written description or review of the provider.',
    example: 'This provider was excellent and very helpful.',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The ID of the provider being reviewed.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  providerId: string;

}