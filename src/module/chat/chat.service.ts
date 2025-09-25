import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMessageDto } from './dto/sendMessage.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /** Start or get existing conversation */
  async startConversation(userId: string, providerId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: { userId, providerId },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userId, providerId },
      });
    }

    return conversation;
  }

/** Get all conversations for logged in user (with unread count + pagination) */
async getConversationsWithUnread(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [conversations, total] = await this.prisma.$transaction([
    this.prisma.conversation.findMany({
      where: { OR: [{ userId }, { providerId: userId }] },
      include: {
        user: true,
        provider: {
          include:{
            providerProfile:true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }, // last message
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.conversation.count({
      where: { OR: [{ userId }, { providerId: userId }] },
    }),
  ]);

  // Attach unread counts
  const data = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await this.prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });
      return { ...conv, unreadCount };
    }),
  );

  return {
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    data,
  };
}

async getConversationById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user: true,
        provider: true,
      },
    });
  }

/** Get messages in a conversation (paginated) and mark unread as read */
async getMessages(conversationId: string, userId: string, page = 1, limit = 20) {
  const conversation = await this.prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) throw new NotFoundException('Conversation not found');
  if (conversation.userId !== userId && conversation.providerId !== userId) {
    throw new NotFoundException('Access denied');
  }

  // Mark unread messages as read
  await this.prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  const skip = (page - 1) * limit;

  const [messages, total] = await this.prisma.$transaction([
    this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    this.prisma.message.count({ where: { conversationId } }),
  ]);

  return {
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    data: messages,
  };
}


  /** Send a new message */
 async sendMessage({ conversationId, senderId, content, fileUrl }:SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Message must have either text or file
    if (!content && !fileUrl) {
      throw new BadRequestException('Message must have text or file');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content || null,
        fileUrl: fileUrl || null, // single file for now
      },
    });

    // Update conversation timestamp so latest one goes to top
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }


async markMessagesAsRead(conversationId: string, userId: string) {
  await this.prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}



}
