import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional} from 'class-validator';

// --- Base DTO for all updatable text/data fields ---
export class UpdateActivityDto {
    @ApiPropertyOptional({ required: true, example: 'Build a faster birdhouse' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ required: false, example: 'A slightly refined activity.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ required: false, example: '1. Cut metal; 2. Assemble; 3. Spray' })
    @IsOptional()
    @IsString()
    instruction_sheet?: string;

    @ApiPropertyOptional({ required: false, example: 'wood, nails, paint' }) // NEW FIELD
    @IsOptional()
    @IsString()
    material?: string; 
    

    @ApiPropertyOptional({ required: false, example: null, description: "Send 'null' to clear existing video/URL." })
    @IsOptional()
    @IsString()
    video?: string | null; 

    @ApiPropertyOptional({ required: false, example: null, description: "Send 'null' to clear existing PDF/URL." }) // NEW FIELD
    @IsOptional()
    @IsString()
    pdfFile?: string | null;
}

// ------------------------------------------------------------------

// --- DTO for the API endpoint that handles file uploads (multipart/form-data) ---
export class UpdateActivityMultipartDto extends UpdateActivityDto {
    // Overwrites the base 'video' property to define it as a file upload field for Swagger
    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'The new video file for the DIY activity (max 10MB).',
        required: false,
    })
    declare video?: any; 
    
    // NEW: Define the PDF file field for Swagger
    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'The new instruction PDF file for the DIY activity (max 10MB).',
        required: false,
    })
    declare pdfFile?: any; 
}