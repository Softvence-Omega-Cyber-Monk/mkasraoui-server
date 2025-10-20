import { IsString, IsNumber, IsNotEmpty, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAffiliatedProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Wireless Headphones', description: 'Product title' })
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 49.99, description: 'Product price in USD (or desired currency)' })
  price: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 0,
    description: 'Average rating (server will typically manage this; optional in DTO)',
  })
  avgRating?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 0,
    description: 'Total number of ratings (server-managed; optional here)',
  })
  totalRatings?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Image URL for the product (optional)',
    required: false,
  })
  imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @ApiProperty({
    example: 'https://affiliate.example.com/product/123',
    description: 'Affiliate link to the product',
  })
  link: string;
}
