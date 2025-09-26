import { IsString, IsArray, IsOptional, IsNumber, IsBoolean, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderPlanDto {
  @ApiProperty({
    description: 'The display name of the plan (e.g., "Provider Subscriber").',
    example: 'Provider Subscriber',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A list of features included in the plan. Used to store complex feature data.',
    example: [
      'Catalog registration',
      'Geolocated visibility (clickable area)',
      'Quick quotes',
      'Customer reviews + quality badge (optional +€20/year)',
    ],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    description: 'The unique ID of the corresponding price object in a payment system (e.g., Stripe Price ID).',
    example: 'price_1RuIseCiM0crZsfwqv3vZZGj',
    required: false,
  })
  @IsOptional()
  @IsString()
  price_id?: string;

  @ApiProperty({
    description: 'The base price of the plan (e.g., 79.00).',
    example: 79.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Indicates whether the plan is currently available for subscription.',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({
    description: 'The duration of the plan (e.g., "month" or "year").',
    example: 'YEARLY',
    required: false,
  })
  @IsOptional()
  @IsString()
  plan_duration?: string;
}