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

// FIX: Added the required 'shippingAddress' parameter for Gelato
 async createAndSendInvitation(
        email: string,
        imageUrl: string,
        userId: string,
        guest_name: string,
        guest_phone: string,
        party_id: string,
        shippingAddress: any
    ) {
        // Tokens
        const invitationToken = randomBytes(32).toString('hex');
        const confirmationToken = randomBytes(32).toString('hex'); 
        const fileCid = 'invitation-image';

        // Gelato API Constants
        const GELATO_API_KEY = process.env.GELATO_API_KEY || 'YOUR_KEY_HERE';
        const GELATO_ORDER_ENDPOINT = 'https://order.gelatoapis.com/v4/orders';
        const INVITATION_PRODUCT_UID = 'cards_pf_a5_pt_350-gsm-coated-silk_cl_4-4_ver';
        const orderReferenceId = `INVITE-${randomBytes(8).toString('hex')}`;

        let fileContent: Buffer;
        let originalFilename: string;

        // 1. Fetch Image Content
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
            });

            fileContent = response.data;
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
            // 2. CREATE INVITATION AND SHIPPING ADDRESS RECORDS
            const newInvitation = await this.prisma.invitation.create({
                data: {
                    email,
                    // Use invitationToken for the token used in the confirmation link
                    invitationToken: invitationToken, 
                    confirmation_token: confirmationToken, // Use this for internal tracking/verification
                    status: 'PENDING',
                    userId: userId,
                    image: imageUrl,
                    guest_name,
                    guest_phone,
                    party_id: party_id || null,
                    // Add the relationship data for ShippingAddress
                    shippingAddress: {
                        create: {
                            firstName: shippingAddress.firstName,
                            lastName: shippingAddress.lastName,
                            addressLine1: shippingAddress.addressLine1,
                            addressLine2: shippingAddress.addressLine2,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            // Ensure postcode is stored as a string
                            postcode: String(shippingAddress.postcode), 
                            country: shippingAddress.country,
                        }
                    }
                },
            });

            // 3. CONSTRUCT GELATO PAYLOAD
            const gelatoPayload = {
                orderType: "order",
                orderReferenceId: orderReferenceId,
                customerReferenceId: userId,
                currency: "EUR",
                shipmentMethodUid: "standard",
                shippingAddress: {
                    ...shippingAddress,
                    // Gelato requires 'postCode' camel case and consistent country code
                    country: shippingAddress.country.toUpperCase() === 'USA' ? 'US' : shippingAddress.country,
                    postCode: String(shippingAddress.postcode),
                    email: email,
                    phone: guest_phone
                },
                items: [{
                    itemReferenceId: `ITEM-${orderReferenceId}`,
                    productUid: INVITATION_PRODUCT_UID,
                    quantity: 1,
                    files: [{
                        type: "default",
                        url: imageUrl,
                        fileName: originalFilename
                    }],
                }],
            };

            // 4. EXECUTE GELATO API CALL
            let gelatoOrderId: string | null = null;
            try {
                const gelatoResponse = await axios.post(
                    GELATO_ORDER_ENDPOINT,
                    gelatoPayload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-KEY': GELATO_API_KEY,
                        },
                    }
                );
                gelatoOrderId = gelatoResponse.data.id;
                console.log(`Order successfully sent to Gelato. Gelato ID: ${gelatoOrderId}`);
            } catch (gelatoError) {
                if (axios.isAxiosError(gelatoError) && gelatoError.response) {
                    console.error('Gelato API Order Failed:', gelatoError.response.data);
                } else {
                    console.error('Unknown Gelato API Error:', gelatoError.message);
                }
            }

            // 5. PREPARE AND SEND EMAIL
            // Use the invitationToken for the confirmation link
            const confirmationLink = `${process.env.CLIENT_URL}/invitations/confirm?token=${invitationToken}`;

            const htmlContent = await this.mailTemplatesService.getInvitationTemplate(
                `cid:${fileCid}`,
                confirmationLink
            );

            // 6. RUN DATABASE UPDATES AND EMAIL SEND
            const dbUpdates = [
                this.prisma.user.update({
                    where: { id: userId },
                    data: { 
                        confirmation_token: confirmationToken,
                        invitation_send: { increment: 1 } 
                    },
                }),
                this.prisma.partyPlan.update({
                    where: { id: party_id },
                    data: { totalInvitation: { increment: 1 } },
                }),
                this.mailService.sendMail({
                    to: email,
                    subject: 'Please Confirm Your Invitation',
                    html: htmlContent,
                    attachments: [{
                        filename: originalFilename,
                        content: fileContent,
                        cid: fileCid,
                    }],
                }),
            ];

            // Update Invitation with Gelato Order ID
            const invitationUpdateData: any = {};
            if (gelatoOrderId) {
                invitationUpdateData.confirmation_token = gelatoOrderId;
            } else {
               
            }
            
            dbUpdates.push(
                this.prisma.invitation.update({
                    where: { id: newInvitation.id }, 
                    data: invitationUpdateData,
                })
             );
            
            await Promise.all(dbUpdates);
            return this.prisma.invitation.findUnique({
                where: { id: newInvitation.id },
                include: {
                    shippingAddress: true,
                },
            });

        } catch (error) {
            console.error('Error in createAndSendInvitation:', error);

            if (error.code === 'P2002') {
                throw new HttpException('An invitation with this email already exists.', HttpStatus.CONFLICT);
            }
            throw new HttpException('Failed to create, process, and send invitation.', HttpStatus.INTERNAL_SERVER_ERROR);
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
      }),
      this.prisma.partyPlan.update({
        where: {
          id: invitation.party_id as string
        },
        data: {
          totalInvitationConfirm: {
            increment: 1
          },
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
      }),
      this.prisma.partyPlan.update({
        where: {
          id: invitation.party_id as string
        },
        data: {
          totalInvitationCancel: {
            increment: 1
          },
        }
      })
    ])
   
    return { message: 'Invitation confirmed successfully.' };
  }

  findAll() {
    return this.prisma.invitation.findMany();
  }

  find_by_party(id: string, userId: string) {
    return this.prisma.invitation.findMany({ where: {
      party_id: id,
      userId: userId
    } });
  }



  remove(id: string) {
    return this.prisma.invitation.delete({ where: { id } });
  }

  
}