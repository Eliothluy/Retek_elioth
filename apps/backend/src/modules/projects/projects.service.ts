import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  create(ownerId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...dto,
        ownerId,
        members: { create: { userId: ownerId } },
      },
      include: { members: true, owner: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  findAll() {
    return this.redis.cache("projects:all", 60, () =>
      this.prisma.project.findMany({
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    );
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        tasks: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    const project = await this.prisma.project.update({ where: { id }, data: dto });
    await this.redis.invalidate("projects:all");
    return project;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
    await this.redis.invalidate("projects:all");
    return { success: true };
  }

  async addMember(projectId: string, userId: string) {
    await this.ensureExists(projectId);
    return this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId },
      update: {},
    });
  }

  async removeMember(projectId: string, userId: string) {
    try {
      await this.prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId } },
      });
    } catch {
      throw new NotFoundException("Membership not found");
    }
    return { success: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException("Project not found");
  }
}
