import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailTemplatesService } from './invitationFormat';

@Module({
  controllers: [MailController],
  providers: [MailService,MailTemplatesService],
})
export class MailModule {}
