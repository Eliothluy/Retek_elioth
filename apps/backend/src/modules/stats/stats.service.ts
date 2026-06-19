import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { TaskStatus } from "@prisma/client";

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [tasksByStatus, tasksByDay, pointsByDay, completionTrend] = await Promise.all([
      this.tasksByStatus(),
      this.tasksCompletedByDay(),
      this.pointsByDay(),
      this.completionTrend(),
    ]);

    return { tasksByStatus, tasksByDay, pointsByDay, completionTrend };
  }

  private async tasksByStatus() {
    const grouped = await this.prisma.task.groupBy({
      by: ["status"],
      _count: true,
    });
    return grouped.map((g) => ({ name: g.status, value: g._count }));
  }

  private async tasksCompletedByDay() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const tasks = await this.prisma.task.findMany({
      where: { status: "COMPLETED", completedAt: { gte: sevenDaysAgo } },
      select: { completedAt: true },
    });
    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    tasks.forEach((t) => {
      if (t.completedAt) {
        const key = t.completedAt.toISOString().slice(0, 10);
        if (key in byDay) byDay[key] = (byDay[key] ?? 0) + 1;
      }
    });
    return Object.entries(byDay).map(([date, count]) => ({ date: date.slice(5), count }));
  }

  private async pointsByDay() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activities = await this.prisma.activityFeed.findMany({
      where: { type: "TASK_COMPLETED", createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, metadata: true },
    });
    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    activities.forEach((a) => {
      const key = a.createdAt.toISOString().slice(0, 10);
      const pts = (a.metadata as Record<string, unknown>)?.points as number | undefined;
      if (key in byDay && typeof pts === "number") byDay[key] = (byDay[key] ?? 0) + pts;
    });
    return Object.entries(byDay).map(([date, points]) => ({ date: date.slice(5), points }));
  }

  private async completionTrend() {
    const total = await this.prisma.task.count();
    const completed = await this.prisma.task.count({ where: { status: "COMPLETED" } });
    const pending = await this.prisma.task.count({ where: { status: "PENDING" } });
    const inProgress = await this.prisma.task.count({ where: { status: "IN_PROGRESS" } });
    const late = await this.prisma.task.count({ where: { status: "LATE" } });
    return { total, completed, pending, inProgress, late, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }
}
