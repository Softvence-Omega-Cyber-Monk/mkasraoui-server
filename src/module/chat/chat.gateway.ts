import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import * as fs from 'fs';
import { join } from 'path';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(userId); // personal room for notifications
      console.log(`Client ${client.id} joined personal room ${userId}`);
    }
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /** When a user sends a message */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: SendMessageDto) {
    let fileUrl: string | null = null;

    // Handle Base64 file upload
    if (payload.fileUrl && payload.fileUrl.startsWith('data:')) {
      const matches = payload.fileUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].split('/')[1];
        const data = Buffer.from(matches[2], 'base64');
        const fileName = `msg-${Date.now()}.${ext}`;

        const uploadsDir = join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = join(uploadsDir, fileName);
        fs.writeFileSync(filePath, data);

        fileUrl = `/uploads/${fileName}`;
      }
    }

    // Save message
    const message = await this.chatService.sendMessage({
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.content,
      fileUrl,
    });

    // Emit message to conversation room (all participants inside)
    this.server.to(payload.conversationId).emit('newMessage', message);

    // Find recipient
    const conversation = await this.chatService.getConversationById(
      message.conversationId,
    );
if (!conversation) {
  console.warn(`Conversation ${payload.conversationId} not found`);
  return;
}
    const recipientId =
      message.senderId === conversation.userId
        ? conversation.providerId
        : conversation.userId;

    // Notify BOTH sender & recipient to update conversation list
    this.server.to(message.senderId).emit('conversationUpdated', {
      conversationId: message.conversationId,
      lastMessage: message,
    });

    this.server.to(recipientId).emit('conversationUpdated', {
      conversationId: message.conversationId,
      lastMessage: message,
    });
  }

  /** Join a conversation room */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  /** Mark conversation as read */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    client: Socket,
    payload: { conversationId: string; userId: string },
  ) {
    await this.chatService.markMessagesAsRead(
      payload.conversationId,
      payload.userId,
    );

    // Tell this user their unread is cleared
    this.server.to(payload.userId).emit('unreadCleared', {
      conversationId: payload.conversationId,
    });

    // Tell the *other participant* that their messages were read
    const conv = await this.chatService.getConversationById(
      payload.conversationId,
    );
    if (conv) {
      const otherUserId =
        conv.userId === payload.userId ? conv.providerId : conv.userId;

      this.server.to(otherUserId).emit('messagesRead', {
        conversationId: payload.conversationId,
        readerId: payload.userId,
      });
    }
  }
}
