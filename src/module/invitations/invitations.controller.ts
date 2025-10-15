// src/invitations/invitations.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Req,
  Res,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import sendResponse from '../utils/sendResponse';


@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

@Post('send')

 async sendInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: any, // Use proper typing for Req if possible
    @Res() res: Response, // Use proper typing for Res if possible
  ) {
    // Assuming req.user is populated by a middleware (e.g., AuthGuard)
    const user = req.user; 

    // 1. ✅ Input Validation Check (as in original code)
    if (!createInvitationDto.imageUrl) {
      throw new HttpException(
        'The invitation image URL is required.',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // 2. ✅ Call the service with the extracted DTO data
    // Use the DTO fields directly. You don't need to manually create the
    // shippingAddress object as it already exists in the DTO due to validation.
    const invitation = await this.invitationsService.createAndSendInvitation(
      createInvitationDto.email,
      createInvitationDto.imageUrl,
      user.id,
      createInvitationDto.guest_name,
      // 💡 Corrected to use createInvitationDto.guest_phone (based on your DTO)
      createInvitationDto.guest_phone, 
      // 💡 Corrected to ensure party_id is passed correctly (it's non-optional in the DTO now)
      createInvitationDto.party_id, 
      // 💡 Pass the full, validated nested object directly
      createInvitationDto.shippingAddress, 
    );

    // 3. ✅ Send Response
    return sendResponse(res, {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Invitation sent successfully',
      data: invitation,
    });
  }
  @Get('confirm')
  async confirmInvitation(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new HttpException('Token not provided.', HttpStatus.BAD_REQUEST);
    }
    const confirmedInvitation = await this.invitationsService.confirmInvitation(token);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Invitation confirmed successfully',
      data: confirmedInvitation,
    });
  }

  @Post('cancel')
  async cancelInvitation(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new HttpException('Token not provided.', HttpStatus.BAD_REQUEST);
    }
    const confirmedInvitation = await this.invitationsService.cancel_invitation(token);
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Invitation cancel successfully',
      data: confirmedInvitation,
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const invitations = await this.invitationsService.findAll();
    
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Invitations retrieved successfully',
      data: invitations,
    });
  }

  @Get('party')
  async find_by_party(@Param('id') id: string, @Res() res: Response,@Req() req:any) {
    const userId=req.user?.id;
    const invitation = await this.invitationsService.find_by_party(id,userId);

    if (!invitation) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }
    return sendResponse(res, {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Invitation retrieved successfully',
      data: invitation,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    await this.invitationsService.remove(id);
    
    return sendResponse(res, {
      statusCode: HttpStatus.NO_CONTENT,
      success: true,
      message: 'Invitation removed successfully',
      data: null,
    });
  }

  
}