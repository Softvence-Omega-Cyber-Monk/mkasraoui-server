// src/invitations/invitations.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust this path as needed
import { MailService } from '../mail/mail.service';
import { buildFileUrl } from 'src/helper/urlBuilder';
import { MailTemplatesService } from '../mail/invitationFormat';
import { readFileSync } from 'fs';
import { join } from 'path';


@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private mailTemplatesService: MailTemplatesService
  ) {}

 async createAndSendInvitation(email: string, file: Express.Multer.File, userId: string) {
    const confirmationToken = randomBytes(32).toString('hex');
    const invitationToken = `cid:invitation-image`; 
    console.log(file)
     const fileContent = readFileSync(join(process.cwd(), file.path));
    try {
      const newInvitation = await this.prisma.invitation.create({
        data: {
          email,
          invitationToken: confirmationToken,
          status: 'PENDING',
          userId: userId,
          image: invitationToken,
        },
      });

      const confirmationLink = `https://your-domain.com/invitations/confirm?token=${confirmationToken}`;

      // Correct usage: Call the method on the injected service instance with await
      const htmlContent = await this.mailTemplatesService.getInvitationTemplate(
        invitationToken,
        confirmationLink
      );

      await this.mailService.sendMail({
        to: email,
        subject: 'Please Confirm Your Invitation',
        html: htmlContent,
        attachments: [
          {
            filename: file.originalname,
            content: fileContent,
            cid: 'invitation-image',
          },
        ],
      });

      return newInvitation;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException('An invitation with this email already exists.', HttpStatus.CONFLICT);
      }
      throw new HttpException('Failed to create invitation.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async confirmInvitation(token: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { invitationToken: token },
    });

    if (!invitation) {
      throw new HttpException('Invalid or expired token.', HttpStatus.NOT_FOUND);
    }
    

    if (invitation.status === 'CONFIRMED') {
        return { message: 'Your invitation has already been confirmed.' };
    }

    return this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'CONFIRMED',
      },
    });
  }

  findAll() {
    return this.prisma.invitation.findMany();
  }

  findOne(id: string) {
    return this.prisma.invitation.findUnique({ where: { id } });
  }



  remove(id: string) {
    return this.prisma.invitation.delete({ where: { id } });
  }
}