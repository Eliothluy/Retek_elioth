import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { FeedService } from "./feed.service";
import { CreateCommentDto } from "./dto/comment.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("feed")
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  findFeed(@Query("cursor") cursor?: string, @Query("limit") limit?: string) {
    return this.feed.findFeed(cursor, limit ? parseInt(limit, 10) : 20);
  }

  @Post("like/:activityId")
  toggleLike(@CurrentUser("sub") userId: string, @Param("activityId") activityId: string) {
    return this.feed.toggleLike(userId, activityId);
  }

  @Post("comment")
  comment(@CurrentUser("sub") userId: string, @Body() dto: CreateCommentDto) {
    return this.feed.comment(userId, dto);
  }

  @Get("comment/:activityId")
  comments(@Param("activityId") activityId: string) {
    return this.feed.comments(activityId);
  }
}
