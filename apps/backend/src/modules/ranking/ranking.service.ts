import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { RealtimeService } from "../../realtime/realtime.service";
import { RankingCategory } from "@prisma/client";

@Injectable()
export class RankingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly realtime: RealtimeService
  ) {}

  async leaderboard(category: RankingCategory, limit = 10) {
    return this.redis.cache(`ranking:${category}`, 120, () => this.compute(category, limit));
  }

  private async compute(category: RankingCategory, limit: number) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        title: true,
        points: true,
        assignedTasks: { select: { id: true, status: true, isLate: true, startDate: true, endDate: true, completedAt: true } },
        activities: { select: { id: true, type: true } },
      },
    });

    const scored = users.map((u) => {
      const completed = u.assignedTasks.filter((t) => t.status === "COMPLETED").length;
      const late = u.assignedTasks.filter((t) => t.isLate).length;
      const onTimeCompleted = u.assignedTasks.filter(
        (t) => t.status === "COMPLETED" && t.completedAt && t.completedAt <= t.endDate
      ).length;
      const activityCount = u.activities.length;

      const score = this.score(category, {
        points: u.points,
        completed,
        late,
        onTimeCompleted,
        activityCount,
      });

      return {
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        title: u.title,
        score,
        stats: { completed, late, activityCount, onTimeCompleted, points: u.points },
      };
    });

    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, limit);
    return sorted.map((entry, index) => ({ ...entry, rank: index + 1, category }));
  }

  private score(
    category: RankingCategory,
    s: { points: number; completed: number; late: number; onTimeCompleted: number; activityCount: number }
  ): number {
    switch (category) {
      case RankingCategory.PERFORMANCE:
        return s.points + s.onTimeCompleted * 5 - s.late * 3;
      case RankingCategory.COMPLETED:
        return s.completed;
      case RankingCategory.LATE:
        return s.late;
      case RankingCategory.ACTIVITY:
        return s.activityCount;
      default:
        return s.points;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async snapshot() {
    for (const category of Object.values(RankingCategory)) {
      const board = await this.compute(category, 50);
      for (const entry of board) {
        await this.prisma.ranking.upsert({
          where: {
            userId_category_period: { userId: entry.userId, category, period: "all-time" },
          },
          create: {
            userId: entry.userId,
            category,
            score: entry.score,
            rank: entry.rank,
            period: "all-time",
          },
          update: { score: entry.score, rank: entry.rank },
        });
      }
    }
    await this.redis.invalidate(
      "ranking:PERFORMANCE",
      "ranking:COMPLETED",
      "ranking:LATE",
      "ranking:ACTIVITY"
    );
    this.realtime.broadcastFeedItem({ type: "RANKING_UPDATED" });
  }
}
