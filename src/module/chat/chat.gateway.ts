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
    origin: '*', // restrict to frontend domain in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /** When a user sends a message */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: SendMessageDto) {
    let fileUrl: string | null = null;

    // Handle Base64 file
    if (payload.fileUrl && payload.fileUrl.startsWith('data:')) {
      const matches = payload.fileUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1].split('/')[1]; // jpg/png/gif
        const data = Buffer.from(matches[2], 'base64');
        const fileName = `msg-${Date.now()}.${ext}`;

        // Ensure uploads folder exists at project root
        const uploadsDir = join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = join(uploadsDir, fileName);
        fs.writeFileSync(filePath, data);

        // Set accessible file URL
        fileUrl = `/uploads/${fileName}`;
      }
    }

    // Save message in DB
    const message = await this.chatService.sendMessage({
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      content: payload.content,
      fileUrl, // either saved URL or null
    });

    // Emit message to everyone in the room
    this.server.to(payload.conversationId).emit('newMessage', message);
  }

  /** Join a conversation room */
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(client: Socket, conversationId: string) {
    client.join(conversationId);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }
}
