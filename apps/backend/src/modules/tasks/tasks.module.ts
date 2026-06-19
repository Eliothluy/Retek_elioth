import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { BadgesModule } from "../badges/badges.module";

@Module({
  imports: [NotificationsModule, BadgesModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
