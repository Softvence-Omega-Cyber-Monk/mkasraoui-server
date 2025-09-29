// part-generation/dto/create-part-generation.dto.ts

import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsUUID,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

/**
 * DTO for an individual item/bullet point in a section.
 * Corresponds to the 'PlanItem' model.
 */
export class CreatePlanItemDto {
  @ApiProperty({ description: 'The text of the bullet point item.', minLength: 1 })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ description: 'The desired order of this item within its section.', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}

/**
 * DTO for a main category section (e.g., "Food & Treats," "Fun Activities").
 * Corresponds to the 'PlanSection' model.
 */
export class CreatePlanSectionDto {
  @ApiProperty({ description: 'The name of the section (e.g., "🎉 Fun Activities").', minLength: 1 })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ type: [CreatePlanItemDto], description: 'A list of items/bullet points for this section.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanItemDto)
  items: CreatePlanItemDto[];
}

/**
 * DTO for a specific scheduled event in the party timeline.
 * Corresponds to the 'TimelineEvent' model.
 */
export class CreateTimelineEventDto {
  @ApiProperty({ description: 'The time of the event (e.g., "3:00 PM").', example: '3:00 PM' })
  @IsString()
  @MinLength(1)
  time: string;

  @ApiProperty({ description: 'Description of the activity (e.g., "🦸‍♀️ Guest Arrival & Welcome").', minLength: 1 })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ description: 'The desired order of the event in the timeline.', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;
}

/**
 * DTO for a suggested product ID associated with the party plan.
 * Corresponds to the 'SuggestedGiftId' model.
 */
export class CreateSuggestedGiftIdDto {
  @ApiProperty({ description: 'A unique product ID (UUID) for a suggested gift.', example: '690ed4df-2d86-4d66-a311-60e8e09efe13' })
  @IsUUID()
  productId: string;
}

/**
 * The root DTO for creating a complete "Part Generation" (Party Plan).
 * Corresponds to the 'PartyPlan' model.
 */
export class CreatePartGenerationDto {
  @ApiProperty({ description: 'The title of the party plan.', example: 'Superhero Party for Alice' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    description: 'The scheduled date and time of the party (ISO 8601 format).',
    example: '2025-09-28T14:06:00Z',
  })
  @IsDateString()
  scheduledDate: Date;

  @ApiProperty({ type: [CreatePlanSectionDto], description: 'All categorized sections of the party plan (Theme, Activities, Food, Supplies, Gifts, New Adventures).' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanSectionDto)
  sections: CreatePlanSectionDto[];

  @ApiProperty({ type: [CreateTimelineEventDto], description: 'The sequential timeline/schedule of the party events.' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimelineEventDto)
  timelineEvents: CreateTimelineEventDto[];

  @ApiProperty({ type: [CreateSuggestedGiftIdDto], description: 'A list of suggested product IDs associated with the plan.', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSuggestedGiftIdDto)
  suggestedGifts?: CreateSuggestedGiftIdDto[];
}