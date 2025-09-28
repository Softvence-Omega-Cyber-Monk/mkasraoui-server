import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TShirtType, Gender, Theme } from '@prisma/client';

export class CreateCustomOrderDto {
  @ApiProperty({ enum: TShirtType, example: TShirtType.ADULT })
  @IsEnum(TShirtType)
  tShirtType: TShirtType;

  @ApiProperty({ example: 'L' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'Red' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: '10-12 years' })
  @IsString()
  @IsNotEmpty()
  Age: string;

  @ApiProperty({ enum: Theme, required: false, example: Theme.MUSIC })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '12' })
  @IsString()
  @IsNotEmpty()
  age: string;

  @ApiProperty({ example: 'Happy Birthday!' })
  @IsOptional()
  @IsString()
  optionalMessage?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mockupUrl?: string;

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  shippingFee: number;

  @ApiProperty({ example: 35.0, description: 'Total including shipping' })
  @IsNumber()
  total: number;

  @ApiProperty({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '12345' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ example: 'Berlin' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Berlin State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ example: '+49123456789' })
  @IsOptional()
  @IsString()
  contactPhone?: string;


}
