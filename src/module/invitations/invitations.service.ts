// src/invitations/invitations.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { MailTemplatesService } from '../mail/invitationFormat';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Status } from '@prisma/client';
@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private mailTemplatesService: MailTemplatesService
  ) { }

async createAndSendInvitation(email: string, file: Express.Multer.File, userId: string) {
  const token = randomBytes(32).toString('hex');
  const fileCid = 'invitation-image';
  const fileContent = readFileSync(join(process.cwd(), file.path));

  try {
    const newInvitation = await this.prisma.invitation.create({
      data: {
        email,
        invitationToken: token,
        status: 'PENDING',
        userId: userId,
        image: fileCid,
      },
    });
    console.log(newInvitation);
    const confirmationLink = `${process.env.CLIENT_URL}/invitations/confirm?token=${token}`;
    console.log(confirmationLink);
    const htmlContent = await this.mailTemplatesService.getInvitationTemplate(
      fileCid, 
      confirmationLink
    );

    const [emailResult, userUpdateResult] = await Promise.all([
      this.mailService.sendMail({
        to: email,
        subject: 'Please Confirm Your Invitation',
        html: htmlContent,
        attachments: [{
          filename: file.originalname,
          content: fileContent,
          cid: fileCid,
        }, ],
      }),
      this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          confirmation_token: token,
          invitation_send: {
            increment: 1
          },
        },
      }),
    ]);
    return newInvitation;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpException('An invitation with this email already exists.', HttpStatus.CONFLICT);
    }
    throw new HttpException('Failed to create invitation.', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  async confirmInvitation(token: string) {
    const invitation = await this.prisma.invitation.findFirstOrThrow({
      where: { invitationToken: token },
    });
    console.log(invitation);
    if (!invitation) {
      throw new HttpException('Invalid or expired token.', HttpStatus.NOT_FOUND);
    }
    if (invitation.status === 'CONFIRMED') {
      return { message: 'Your invitation has already been confirmed.' };
    }

    const [invaitation_confirsm, update_confirm_invitation] = await Promise.all([
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'CONFIRMED',
        },
      }),
      this.prisma.user.update({
        where: {
          id: invitation.userId
        },
        data: {
          confirm_inviation: { increment: 1 },
          confirmation_token: null
        }
      })
    ])
   
    return { message: 'Invitation confirmed successfully.' };
  }
  async cancel_invitation(token: string) {
    const invitation = await this.prisma.invitation.findFirstOrThrow({
      where: { invitationToken: token },
    });
    console.log(invitation);
    if (!invitation) {
      throw new HttpException('Invalid or expired token.', HttpStatus.NOT_FOUND);
    }
    if (invitation.status === 'CONFIRMED') {
      return { message: 'Your invitation has already been confirmed.' };
    }
    const [invaitation_confirsm, update_confirm_invitation] = await Promise.all([
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status:Status.CANCELLED,
        },
      }),
      this.prisma.user.update({
        where: {
          id: invitation.userId
        },
        data: {
          confirm_inviation: { increment: 1 },
          confirmation_token: null
        }
      })
    ])
   
    return { message: 'Invitation confirmed successfully.' };
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