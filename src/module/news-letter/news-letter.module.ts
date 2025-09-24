import { Module } from '@nestjs/common';
import { NewsLetterService } from './news-letter.service';
import { NewsLetterController } from './news-letter.controller';
import { PromotionalMailTemplatesService } from '../mail/promotinal_mail';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [NewsLetterController],
  providers: [NewsLetterService,PromotionalMailTemplatesService,MailService],
})
export class NewsLetterModule {}
