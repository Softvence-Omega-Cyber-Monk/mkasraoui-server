import { PartialType } from '@nestjs/mapped-types';
import { CreateAffiliatedProductDto } from './create-affiliated-product.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAffiliatedProductDto extends PartialType(CreateAffiliatedProductDto) {
  // You can add/override validations if needed
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 3.5, description: 'Optional new average rating' })
  avgRating?: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 10, description: 'Optional new total ratings' })
  totalRatings?: number;
}
