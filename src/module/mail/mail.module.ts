import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { SubscriptionMailTemplatesService } from './subscription.mail';

@Module({
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
