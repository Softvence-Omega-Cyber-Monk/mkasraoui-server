import { Body, Controller, Get, Param, Patch, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import sendResponse from '../utils/sendResponse';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { buildFileUrl } from 'src/helper/urlBuilder';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /** Start conversation */
  @Post('start')
  @ApiOperation({ summary: 'Start a conversation with a provider' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { providerId: { type: 'string' } },
    },
  })
  async startConversation(
    @Req() req: Request,
    @Body('providerId') providerId: string,
    @Res() res: Response,
  ) {
    const conversation = await this.chatService.startConversation(
      req.user!.id,
      providerId,
    );
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Conversation started',
      data: conversation,
    });
  }

 /** Get user’s conversations (with pagination + unread count) */
@Get('conversations')
@ApiOperation({ summary: 'Get all conversations for logged-in user (with pagination + unread count)' })
async getConversations(
  @Req() req: Request,
  @Res() res: Response,
) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const conversations = await this.chatService.getConversationsWithUnread(
    req.user!.id,
    page,
    limit,
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Conversations fetched successfully',
    data: conversations,
  });
}

/** Get messages in a conversation (with pagination) */
@Get(':conversationId/messages')
@ApiOperation({ summary: 'Get messages of a conversation (paginated, marks unread as read)' })
async getMessages(
  @Req() req: Request,
  @Param('conversationId') conversationId: string,
  @Res() res: Response,
) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const messages = await this.chatService.getMessages(
    conversationId,
    req.user!.id,
    page,
    limit,
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Messages fetched successfully',
    data: messages,
  });
}

  /** Send message */
 @Post('conversations/:id/messages')
@Roles(Role.USER, Role.PROVIDER)
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      content: { type: 'string', example: 'Hello, I want a quote' },
      file: { type: 'string', format: 'binary' }, // single file
    },
  },
})
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }),
)
async sendMessage(
  @Req() req: Request,
  @Param('id') conversationId: string,
  @Body('content') content: string ,
  @UploadedFile() file: Express.Multer.File, // single file
  @Res() res: any,
) {
  const fileUrl = file ? buildFileUrl(file.filename) : null;

  const message = await this.chatService.sendMessage({
    conversationId,
    senderId: req.user!.id,
    content,
    fileUrl, // single file URL
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Message sent',
    data: message,
  });
}







}
