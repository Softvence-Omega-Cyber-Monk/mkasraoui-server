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
  @Req() req: any,
  @Res() res: Response,
) {
  const user = req.user;
  
  if (!createInvitationDto.imageUrl) {
    throw new HttpException('The invitation image URL is required.', HttpStatus.BAD_REQUEST);
  }
  
  // 2. ✅ Call the service with the URL
  const invitation = await this.invitationsService.createAndSendInvitation(
    createInvitationDto.email,
    createInvitationDto.imageUrl as string, // Pass the image URL instead of the file object
    user.id,
  );
  
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

  @Get('user')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const invitation = await this.invitationsService.findOne(id);

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