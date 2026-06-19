import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RealtimeService } from "../../realtime/realtime.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateTaskCommentDto } from "./dto/task-comment.dto";
import { NotificationType, Prisma } from "@prisma/client";

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService
  ) {}

  async findAll(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, title: true } },
      },
    });
  }

  async create(taskId: string, userId: string, dto: CreateTaskCommentDto) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId }, select: { id: true, title: true, assigneeId: true, createdById: true } });
    if (!task) throw new NotFoundException("Task not found");

    const comment = await this.prisma.taskComment.create({
      data: { taskId, userId, content: dto.content },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, title: true } },
      },
    });

    this.realtime.broadcastFeedItem({ type: "TASK_COMMENT", taskId, comment });

    const mentions = this.extractMentions(dto.content);
    for (const mentionedId of mentions) {
      if (mentionedId !== userId) {
        await this.notifications.create({
          userId: mentionedId,
          type: NotificationType.FEED_INTERACTION,
          title: "Você foi mencionado 💬",
          message: `Comentário na tarefa "${task.title}"`,
          link: `/tasks/${taskId}`,
          metadata: { taskId, commentId: comment.id } as Prisma.InputJsonValue,
        });
      }
    }

    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notifications.create({
        userId: task.assigneeId,
        type: NotificationType.FEED_INTERACTION,
        title: "Novo comentário na tarefa",
        message: `Comentário em "${task.title}"`,
        link: `/tasks/${taskId}`,
        metadata: { taskId } as Prisma.InputJsonValue,
      });
    }

    return comment;
  }

  async update(commentId: string, userId: string, content: string) {
    const comment = await this.prisma.taskComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.userId !== userId) throw new ForbiddenException("Cannot edit another user's comment");
    return this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.taskComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.userId !== userId) throw new ForbiddenException("Cannot delete another user's comment");
    await this.prisma.taskComment.delete({ where: { id: commentId } });
    return { success: true };
  }

  private extractMentions(content: string): string[] {
    const regex = /@([a-f0-9-]{36})/g;
    const matches = content.match(regex) ?? [];
    return matches.map((m) => m.slice(1));
  }
}
