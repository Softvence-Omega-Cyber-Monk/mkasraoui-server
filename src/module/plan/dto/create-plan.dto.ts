// src/plan/dto/create-plan.dto.ts

import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FeatureDto {
  @ApiProperty({
    description: 'The unique name of the feature.',
    example: 'ai_party_generator',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The usage limit or description for the feature.",
    example: "1 free use, then €4.90",
  })
  @IsString() 
  @IsNotEmpty()
  limit: string; 
}

export class CreatePlanDto {
  @ApiProperty({
    description: 'The unique name of the plan.',
    example: 'Non-Subscriber',
  })
  @IsString()
  @IsNotEmpty()
  plan_name: string;

  @ApiProperty({
    description: 'A list of features included in the plan with their usage limits.',
    type: [FeatureDto],
    example: [
      {
        name: "AI Party Generator",
        limit: "1 free use, then €4.90"
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @ApiProperty({
    description: 'The monthly price of the plan in a numerical format.',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'A flag indicating if the plan is currently active and available.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
  @ApiProperty({
    description: 'price id from stripe.',
    example: "price_1SAjNZRwOBvM8IAHJMvDXlJr",
  })
  @IsString()
  @IsOptional()
  price_id?:string;


}