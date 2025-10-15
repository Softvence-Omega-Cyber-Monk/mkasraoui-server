import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class ActivityQuery {
  @ApiPropertyOptional({ description: 'Search term for product title or description.' })
   @IsOptional()
   @IsString()
    search:string
}