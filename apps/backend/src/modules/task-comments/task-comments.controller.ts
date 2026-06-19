import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TaskCommentsService } from "./task-comments.service";
import { CreateTaskCommentDto } from "./dto/task-comment.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("tasks/:taskId/comments")
export class TaskCommentsController {
  constructor(private readonly comments: TaskCommentsService) {}

  @Get()
  findAll(@Param("taskId") taskId: string) {
    return this.comments.findAll(taskId);
  }

  @Post()
  create(
    @Param("taskId") taskId: string,
    @CurrentUser("sub") userId: string,
    @Body() dto: CreateTaskCommentDto
  ) {
    return this.comments.create(taskId, userId, dto);
  }

  @Patch(":commentId")
  update(
    @Param("commentId") commentId: string,
    @CurrentUser("sub") userId: string,
    @Body() dto: CreateTaskCommentDto
  ) {
    return this.comments.update(commentId, userId, dto.content);
  }

  @Delete(":commentId")
  remove(
    @Param("commentId") commentId: string,
    @CurrentUser("sub") userId: string
  ) {
    return this.comments.remove(commentId, userId);
  }
}
