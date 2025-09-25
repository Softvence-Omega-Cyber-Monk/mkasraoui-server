export interface SendMessageDto {
  conversationId: string;
  senderId: string;
  content?: string|null;
  fileUrl?: string|null;
}
