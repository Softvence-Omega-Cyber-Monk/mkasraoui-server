import { PartialType } from '@nestjs/mapped-types';
import { CreateAffiliatedProductDto } from './create-affiliated-product.dto';
import { IsOptional, IsString, IsNumber, IsUrl, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAffiliatedProductDto extends PartialType(CreateAffiliatedProductDto) {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Wireless Headphones Pro',
    description: 'Updated product title',
  })
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({
    example: 59.99,
    description: 'Updated product price',
  })
  price?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: 4.8,
    description: 'Updated average rating (usually server managed)',
  })
  avgRating?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    example: 10,
    description: 'Updated total ratings (usually server managed)',
  })
  totalRatings?: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiPropertyOptional({
    example: 'https://example.com/new-image.jpg',
    description: 'Updated product image URL',
  })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'eBay',
    description: 'Updated affiliated company name',
  })
  affiliatedCompany?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @ApiPropertyOptional({
    example: 'https://affiliate.example.com/new-product-link',
    description: 'Updated affiliate link',
  })
  link?: string;
}
