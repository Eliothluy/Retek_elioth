import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IsString, IsArray } from "class-validator";

class MarkReadDto {
  @IsArray() @IsString({ each: true }) ids!: string[];
}

@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(@CurrentUser("sub") userId: string) {
    return this.notifications.findAll(userId);
  }

  @Get("unread-count")
  unreadCount(@CurrentUser("sub") userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Patch("read")
  markRead(@CurrentUser("sub") userId: string, @Body() dto: MarkReadDto) {
    return this.notifications.markRead(userId, dto.ids);
  }

  @Post("read-all")
  markAllRead(@CurrentUser("sub") userId: string) {
    return this.notifications.markAllRead(userId);
  }
}
