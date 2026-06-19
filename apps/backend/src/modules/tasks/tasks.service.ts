import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { RealtimeService } from "../../realtime/realtime.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BadgesService } from "../badges/badges.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { ActivityType, NotificationType, Prisma, TaskStatus, TaskPriority } from "@prisma/client";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService,
    private readonly badgesService: BadgesService,
  ) {}

  async create(createdById: string, dto: CreateTaskDto) {
    const isLate = new Date(dto.endDate) < new Date();
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        module: dto.module,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
        createdById,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? TaskStatus.PENDING,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        alert: dto.alert ?? false,
        isLate,
      },
      include: this.taskInclude(),
    });

    await this.recordActivity({
      type: ActivityType.TASK_CREATED,
      actorId: createdById,
      taskId: task.id,
      projectId: task.projectId,
      metadata: { title: task.title },
    });

    if (task.assigneeId && task.assigneeId !== createdById) {
      await this.notifications.create({
        userId: task.assigneeId,
        type: NotificationType.TASK_ASSIGNED,
        title: "Nova tarefa atribuída",
        message: `Você recebeu a tarefa "${task.title}"`,
        link: `/tasks/${task.id}`,
        metadata: { taskId: task.id },
      });
    }

    await this.redis.invalidate("tasks:all");
    return task;
  }

  async findAll(filters?: { status?: TaskStatus; assigneeId?: string; projectId?: string }) {
    const where = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters?.projectId && { projectId: filters.projectId }),
    };
    return this.prisma.task.findMany({
      where,
      include: this.taskInclude(),
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: this.taskInclude() });
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actorId: string) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.endDate) data.isLate = new Date(dto.endDate) < new Date() && data.status !== TaskStatus.COMPLETED;

    const task = await this.prisma.task.update({ where: { id }, data, include: this.taskInclude() });
    await this.redis.invalidate("tasks:all");

    await this.recordActivity({
      type: ActivityType.TASK_UPDATED,
      actorId,
      taskId: task.id,
      projectId: task.projectId,
      metadata: { title: task.title, changes: Object.keys(dto) },
    });

    return task;
  }

  async updateStatus(id: string, status: TaskStatus, actorId: string) {
    const task = await this.findOne(id);
    const data: Record<string, unknown> = { status };
    let pointsAwarded = 0;

    if (status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      data.completedAt = new Date();
      data.isLate = false;
      pointsAwarded = this.computeCompletionPoints(task);

      await this.prisma.user.update({
        where: { id: task.assigneeId ?? actorId },
        data: { points: { increment: pointsAwarded } },
      });

      await this.recordActivity({
        type: ActivityType.TASK_COMPLETED,
        actorId,
        taskId: task.id,
        projectId: task.projectId,
        metadata: { title: task.title, points: pointsAwarded },
      });

      if (task.assigneeId) {
        await this.notifications.create({
          userId: task.assigneeId,
          type: NotificationType.FEED_INTERACTION,
          title: "Tarefa concluída",
          message: `Parabéns! Você concluiu "${task.title}" (+${pointsAwarded} pts)`,
          link: `/tasks/${task.id}`,
          metadata: { taskId: task.id, points: pointsAwarded },
        });
        await this.badgesService.checkAndAward(task.assigneeId);
      }
    } else if (status === TaskStatus.LATE && !task.isLate) {
      data.isLate = true;
      await this.recordActivity({
        type: ActivityType.TASK_LATE,
        actorId,
        taskId: task.id,
        projectId: task.projectId,
        metadata: { title: task.title },
      });
      if (task.assigneeId) {
        await this.notifications.create({
          userId: task.assigneeId,
          type: NotificationType.TASK_LATE,
          title: "Tarefa atrasada",
          message: `A tarefa "${task.title}" está atrasada`,
          link: `/tasks/${task.id}`,
          metadata: { taskId: task.id },
        });
      }
    }

    const updated = await this.prisma.task.update({ where: { id }, data, include: this.taskInclude() });
    await this.redis.invalidate("tasks:all", `users:${task.assigneeId ?? actorId}`, "users:all");
    return { ...updated, pointsAwarded };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    await this.redis.invalidate("tasks:all");
    return { success: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async detectLateTasks() {
    const now = new Date();
    const overdue = await this.prisma.task.findMany({
      where: {
        isLate: false,
        status: { notIn: [TaskStatus.COMPLETED] },
        endDate: { lt: now },
      },
    });

    for (const task of overdue) {
      await this.prisma.task.update({
        where: { id: task.id },
        data: { isLate: true, status: TaskStatus.LATE },
      });
      await this.recordActivity({
        type: ActivityType.TASK_LATE,
        actorId: task.createdById,
        taskId: task.id,
        projectId: task.projectId,
        metadata: { title: task.title, auto: true },
      });
      if (task.assigneeId) {
        await this.notifications.create({
          userId: task.assigneeId,
          type: NotificationType.TASK_LATE,
          title: "Tarefa atrasada",
          message: `A tarefa "${task.title}" passou do prazo`,
          link: `/tasks/${task.id}`,
          metadata: { taskId: task.id, auto: true },
        });
      }
    }

    if (overdue.length) {
      this.realtime.broadcastFeedItem({ type: "LATE_DETECTED", count: overdue.length });
    }
    return { detected: overdue.length };
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async deadlineApproachingAlerts() {
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const upcoming = await this.prisma.task.findMany({
      where: {
        status: { notIn: [TaskStatus.COMPLETED] },
        endDate: { gte: new Date(), lte: soon },
        alert: true,
      },
    });
    for (const task of upcoming) {
      if (!task.assigneeId) continue;
      const alreadySent = await this.redis.client.get(`deadline-alert:${task.id}`);
      if (alreadySent) continue;
      await this.notifications.create({
        userId: task.assigneeId,
        type: NotificationType.DEADLINE_APPROACHING,
        title: "Prazo próximo",
        message: `A tarefa "${task.title}" vence em menos de 24h`,
        link: `/tasks/${task.id}`,
        metadata: { taskId: task.id },
      });
      await this.redis.client.set(`deadline-alert:${task.id}`, "1", "EX", 12 * 60 * 60);
    }
    return { alerted: upcoming.length };
  }

  async recordPomodoroSession(taskId: string, minutes: number, actorId: string) {
    const task = await this.findOne(taskId);
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        timeSpentMinutes: { increment: minutes },
        pomodoroSessions: { increment: 1 },
      },
      include: this.taskInclude(),
    });

    if (task.assigneeId) {
      const bonusPoints = Math.round(minutes / 5);
      await this.prisma.user.update({
        where: { id: task.assigneeId },
        data: { points: { increment: bonusPoints } },
      });
      await this.notifications.create({
        userId: task.assigneeId,
        type: NotificationType.FEED_INTERACTION,
        title: "Sessão Pomodoro concluída! 🍅",
        message: `${minutes} min de foco na tarefa "${task.title}" (+${bonusPoints} pts)`,
        link: `/tasks/${task.id}`,
        metadata: { taskId: task.id, minutes, bonusPoints } as Prisma.InputJsonValue,
      });
      await this.badgesService.checkAndAward(task.assigneeId);
    }

    await this.redis.invalidate("tasks:all", `users:${task.assigneeId ?? actorId}`, "users:all");
    return { timeSpentMinutes: updated.timeSpentMinutes, pomodoroSessions: updated.pomodoroSessions, bonusPoints: Math.round(minutes / 5) };
  }

  private computeCompletionPoints(task: { priority: TaskPriority; isLate: boolean; startDate: Date; endDate: Date; completedAt: Date | null }): number {
    const base: Record<TaskPriority, number> = { HIGH: 30, MEDIUM: 20, LOW: 10 };
    let points = base[task.priority] ?? 20;
    if (task.isLate) points = Math.round(points * 0.5);
    const plannedMs = new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
    const actualMs = (task.completedAt ?? new Date()).getTime() - new Date(task.startDate).getTime();
    if (plannedMs > 0 && actualMs <= plannedMs) points += 15;
    return points;
  }

  private async recordActivity(input: {
    type: ActivityType;
    actorId: string;
    taskId: string;
    projectId: string | null;
    metadata: Prisma.InputJsonValue;
  }) {
    const activity = await this.prisma.activityFeed.create({ data: input });
    const enriched = await this.prisma.activityFeed.findUnique({
      where: { id: activity.id },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { id: true, title: true, status: true, priority: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    this.realtime.broadcastFeedItem(enriched);
    return enriched;
  }

  private taskInclude() {
    return {
      assignee: { select: { id: true, name: true, avatarUrl: true, title: true } },
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, color: true } },
    } as const;
  }
}
