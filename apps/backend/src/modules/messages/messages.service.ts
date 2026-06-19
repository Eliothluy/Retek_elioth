import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RealtimeService } from "../../realtime/realtime.service";

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService
  ) {}

  async findConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true, title: true } },
        userB: { select: { id: true, name: true, avatarUrl: true, title: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, content: true, senderId: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return conversations.map((c) => {
      const other = c.userAId === userId ? c.userB : c.userA;
      const lastMessage = c.messages[0];
      const unreadCount = 0;
      return {
        id: c.id,
        other,
        lastMessage: lastMessage?.content ?? null,
        lastMessageAt: lastMessage?.createdAt ?? c.updatedAt,
        lastSenderId: lastMessage?.senderId ?? null,
      };
    });
  }

  async findMessages(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) throw new NotFoundException("Conversation not found");
    if (conv.userAId !== userId && conv.userBId !== userId) {
      throw new NotFoundException("Conversation not found");
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await this.prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });

    return messages;
  }

  async sendMessage(senderId: string, recipientId: string, content: string) {
    const [userAId, userBId] = [senderId, recipientId].sort() as [string, string];
    let conversation = await this.prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userAId, userBId },
      });
    }

    const message = await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId, content },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    this.realtime.pushNotification({
      userId: recipientId,
      type: "FEED_INTERACTION",
      title: `Nova mensagem de ${message.sender.name}`,
      message: content.slice(0, 80),
      link: `/messages`,
      metadata: { conversationId: conversation.id, messageId: message.id },
    });

    this.realtime.broadcastFeedItem({
      type: "MESSAGE_RECEIVED",
      conversationId: conversation.id,
      message,
    });

    return { conversationId: conversation.id, message };
  }

  async startConversation(userAId: string, userBId: string) {
    const [sortedA, sortedB] = [userAId, userBId].sort() as [string, string];
    let conversation = await this.prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId: sortedA, userBId: sortedB } },
    });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { userAId: sortedA, userBId: sortedB },
      });
    }
    return { id: conversation.id };
  }
}
