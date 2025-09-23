import { PartialType } from '@nestjs/swagger';
import { CreateNewsLetterDto } from './create-news-letter.dto';

export class UpdateNewsLetterDto extends PartialType(CreateNewsLetterDto) {}
