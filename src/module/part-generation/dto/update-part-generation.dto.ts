import { PartialType } from '@nestjs/swagger';
import { CreatePartGenerationDto } from './create-part-generation.dto';

export class UpdatePartGenerationDto extends PartialType(CreatePartGenerationDto) {}
