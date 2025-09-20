import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { MailTemplatesService } from '../mail/invitationFormat';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService,PrismaService,MailService,MailTemplatesService],
})
export class InvitationsModule {}
