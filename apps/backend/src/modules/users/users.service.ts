import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  findAll() {
    return this.redis.cache("users:all", 60, () =>
      this.prisma.user.findMany({
        select: this.publicSelect(),
        orderBy: { name: "asc" },
      })
    );
  }

  findOne(id: string) {
    return this.redis.cache(`users:${id}`, 60, async () => {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          ...this.publicSelect(),
          _count: {
            select: { assignedTasks: true, createdTasks: true, likes: true, comments: true },
          },
        },
      });
      if (!user) throw new NotFoundException("User not found");
      return user;
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({ where: { id }, data: dto, select: this.publicSelect() });
    await this.redis.invalidate(`users:${id}`, "users:all");
    return user;
  }

  async awardPoints(userId: string, points: number, reason: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
      select: { id: true, points: true, name: true },
    });
    await this.redis.invalidate(`users:${userId}`, "users:all");
    return { user, reason, awarded: points };
  }

  private publicSelect() {
    return {
      id: true,
      email: true,
      name: true,
      title: true,
      bio: true,
      avatarUrl: true,
      role: true,
      points: true,
      badges: true,
      createdAt: true,
    } as const;
  }
}
