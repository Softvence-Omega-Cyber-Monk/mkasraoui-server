// src/invitations/invitations.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { MailTemplatesService } from '../mail/invitationFormat';
import { Status } from '@prisma/client';
import axios from 'axios';
@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private mailTemplatesService: MailTemplatesService
  ) { }

async createAndSendInvitation(email: string, imageUrl: string, userId: string) {
        const token = randomBytes(32).toString('hex');
        const fileCid = 'invitation-image'; // Unique Content ID for the image

        let fileContent: Buffer;
        let originalFilename: string;

        // 1. ✅ Re-introduced image fetching logic
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
            });

            fileContent = response.data;
            
            // Simple logic to get filename and ensure extension exists
            const urlParts = new URL(imageUrl).pathname.split('/');
            originalFilename = urlParts.pop() || 'invitation.jpg'; 
            if (!originalFilename.includes('.')) {
                originalFilename += '.jpg'; 
            }
        } catch (fetchError) {
            console.error('Failed to fetch image:', fetchError.message);
            throw new HttpException('Failed to fetch image from the provided URL.', HttpStatus.BAD_REQUEST);
        }

        try {
            const newInvitation = await this.prisma.invitation.create({
                data: {
                    email,
                    invitationToken: token,
                    status: 'PENDING',
                    userId: userId,
                    image: imageUrl, 
                },
            });
            console.log(newInvitation);
            
            const confirmationLink = `${process.env.CLIENT_URL}/invitations/confirm?token=${token}`;
            console.log(confirmationLink);
            
            // 2. ✅ Pass the CID source to the template
            const htmlContent = await this.mailTemplatesService.getInvitationTemplate(
                `cid:${fileCid}`, // 👈 Template now receives the CID string
                confirmationLink
            );

            const [emailResult, userUpdateResult] = await Promise.all([
                // 3. ✅ Re-introduced the attachments array
                this.mailService.sendMail({
                    to: email,
                    subject: 'Please Confirm Your Invitation',
                    html: htmlContent,
                    attachments: [{
                        filename: originalFilename,
                        content: fileContent,
                        cid: fileCid, // 👈 Links the attachment buffer to the HTML <img> tag
                    }],
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
            
            console.log('Invitation created and email sent. Email ID:', emailResult.messageId);
            return newInvitation;
        } catch (error) {
            console.error('Error in createAndSendInvitation:', error);
            
            if (error.code === 'P2002') {
                throw new HttpException('An invitation with this email already exists.', HttpStatus.CONFLICT);
            }
            throw new HttpException('Failed to create and send invitation.', HttpStatus.INTERNAL_SERVER_ERROR);
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