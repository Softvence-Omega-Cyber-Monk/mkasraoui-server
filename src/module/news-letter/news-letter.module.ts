import { Module } from '@nestjs/common';
import { NewsLetterService } from './news-letter.service';
import { NewsLetterController } from './news-letter.controller';

@Module({
  controllers: [NewsLetterController],
  providers: [NewsLetterService],
})
export class NewsLetterModule {}
