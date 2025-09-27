import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MailService } from '../mail/mail.service';
import { MailTemplatesService } from '../mail/invitationFormat';

@Module({
  controllers: [UserController],
  providers: [UserService,MailService,MailTemplatesService],
})
export class UserModule {}
