import { Module } from "@nestjs/common";
import { TaskCommentsService } from "./task-comments.service";
import { TaskCommentsController } from "./task-comments.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsService],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}
