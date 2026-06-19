import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { RealtimeService } from "../../realtime/realtime.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateCommentDto } from "./dto/comment.dto";
import { NotificationType } from "@prisma/client";

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService
  ) {}

  findFeed(cursor?: string, limit = 20) {
    return this.prisma.activityFeed.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true, title: true } },
        task: { select: { id: true, title: true, status: true, priority: true } },
        project: { select: { id: true, name: true, color: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
  }

  async toggleLike(userId: string, activityId: string) {
    const activity = await this.prisma.activityFeed.findUnique({ where: { id: activityId } });
    if (!activity) throw new NotFoundException("Activity not found");

    const existing = await this.prisma.like.findUnique({
      where: { activityId_userId: { activityId, userId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      this.realtime.broadcastFeedItem({ type: "LIKE_REMOVED", activityId, userId });
      return { liked: false };
    }

    await this.prisma.like.create({ data: { activityId, userId } });
    this.realtime.broadcastFeedItem({ type: "LIKE_ADDED", activityId, userId });

    if (activity.actorId !== userId) {
      await this.notifications.create({
        userId: activity.actorId,
        type: NotificationType.FEED_INTERACTION,
        title: "Nova curtida",
        message: "Sua publicação recebeu uma curtida",
        link: `/feed`,
        metadata: { activityId },
      });
    }
    return { liked: true };
  }

  async comment(userId: string, dto: CreateCommentDto) {
    const activity = await this.prisma.activityFeed.findUnique({ where: { id: dto.activityId } });
    if (!activity) throw new NotFoundException("Activity not found");

    const comment = await this.prisma.comment.create({
      data: { activityId: dto.activityId, userId, content: dto.content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    this.realtime.broadcastFeedItem({ type: "COMMENT_ADDED", activityId: dto.activityId, comment });

    if (activity.actorId !== userId) {
      await this.notifications.create({
        userId: activity.actorId,
        type: NotificationType.FEED_INTERACTION,
        title: "Novo comentário",
        message: "Sua publicação recebeu um comentário",
        link: `/feed`,
        metadata: { activityId: dto.activityId },
      });
    }
    return comment;
  }

  comments(activityId: string) {
    return this.prisma.comment.findMany({
      where: { activityId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }
}
