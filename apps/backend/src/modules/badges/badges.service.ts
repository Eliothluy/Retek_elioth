import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RealtimeService } from "../../realtime/realtime.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BadgeType, Prisma } from "@prisma/client";

interface BadgeMeta {
  type: BadgeType;
  emoji: string;
  title: string;
  description: string;
}

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  FIRST_TASK: { type: BadgeType.FIRST_TASK, emoji: "🚀", title: "Primeira Tarefa", description: "Concluiu sua primeira tarefa" },
  STREAK_7: { type: BadgeType.STREAK_7, emoji: "🔥", title: "Sequência de 7 Dias", description: "Concluiu tarefas 7 dias seguidos" },
  POMODORO_MASTER: { type: BadgeType.POMODORO_MASTER, emoji: "🍅", title: "Pomodoro Master", description: "Completou 10 sessões Pomodoro" },
  TOP_3: { type: BadgeType.TOP_3, emoji: "🏆", title: "Top 3", description: "Entrou no pódio do ranking de Performance" },
  CENTURY: { type: BadgeType.CENTURY, emoji: "💯", title: "Centenário", description: "Concluiu 100 tarefas" },
};

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly notifications: NotificationsService
  ) {}

  async checkAndAward(userId: string): Promise<BadgeMeta[]> {
    const awarded: BadgeMeta[] = [];
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        assignedTasks: { select: { status: true, completedAt: true, pomodoroSessions: true } },
      },
    });
    if (!user) return awarded;

    const completed = user.assignedTasks.filter((t) => t.status === "COMPLETED");
    const totalPomodoros = user.assignedTasks.reduce((sum, t) => sum + t.pomodoroSessions, 0);

    const checks: { type: BadgeType; condition: boolean }[] = [
      { type: BadgeType.FIRST_TASK, condition: completed.length >= 1 },
      { type: BadgeType.POMODORO_MASTER, condition: totalPomodoros >= 10 },
      { type: BadgeType.CENTURY, condition: completed.length >= 100 },
    ];

    const streak7 = this.checkStreak7(completed.map((t) => t.completedAt).filter(Boolean) as Date[]);
    checks.push({ type: BadgeType.STREAK_7, condition: streak7 });

    const top3 = await this.checkTop3(userId);
    checks.push({ type: BadgeType.TOP_3, condition: top3 });

    for (const { type, condition } of checks) {
      if (!condition) continue;
      const alreadyHas = await this.prisma.badge.findUnique({
        where: { userId_type: { userId, type } },
      });
      if (alreadyHas) continue;

      await this.prisma.badge.create({ data: { userId, type } });
      const meta = BADGE_META[type];
      awarded.push(meta);

      await this.notifications.create({
        userId,
        type: "SYSTEM",
        title: `Nova badge: ${meta.emoji} ${meta.title}!`,
        message: meta.description,
        link: "/profile",
        metadata: { badgeType: type } as Prisma.InputJsonValue,
      });

      this.realtime.broadcastFeedItem({
        type: "BADGE_EARNED",
        actorId: userId,
        badge: meta,
      });

      this.logger.log(`Badge ${type} awarded to user ${userId}`);
    }

    return awarded;
  }

  findAll(userId: string) {
    return this.prisma.badge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });
  }

  private checkStreak7(completedDates: Date[]): boolean {
    if (completedDates.length === 0) return false;
    const days = new Set(completedDates.map((d) => d.toISOString().slice(0, 10)));
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (!days.has(d.toISOString().slice(0, 10))) return false;
    }
    return true;
  }

  private async checkTop3(userId: string): Promise<boolean> {
    const topPerformers = await this.prisma.ranking.findMany({
      where: { category: "PERFORMANCE" },
      orderBy: { score: "desc" },
      take: 3,
      select: { userId: true },
    });
    return topPerformers.some((r) => r.userId === userId);
  }
}
