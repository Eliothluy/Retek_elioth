import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from "./dto/task.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TaskStatus } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@CurrentUser("sub") userId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId, dto);
  }

  @Get()
  findAll(
    @Query("status") status?: TaskStatus,
    @Query("assigneeId") assigneeId?: string,
    @Query("projectId") projectId?: string
  ) {
    return this.tasks.findAll({
      status,
      assigneeId,
      projectId,
    });
  }

  @Get("late")
  findLate() {
    return this.tasks.findAll({ status: TaskStatus.LATE });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tasks.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto, @CurrentUser("sub") userId: string) {
    return this.tasks.update(id, dto, userId);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateTaskStatusDto,
    @CurrentUser("sub") userId: string
  ) {
    return this.tasks.updateStatus(id, dto.status, userId);
  }

  @Post(":id/pomodoro")
  recordPomodoro(
    @Param("id") id: string,
    @Body() body: { minutes: number },
    @CurrentUser("sub") userId: string
  ) {
    return this.tasks.recordPomodoroSession(id, body.minutes ?? 25, userId);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tasks.remove(id);
  }
}
