import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionMailTemplatesService } from '../mail/subscription.mail';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService,MailService,SubscriptionMailTemplatesService],
  exports:[SubscriptionService,SubscriptionMailTemplatesService]
})
export class SubscriptionModule {}
