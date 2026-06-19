import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { FeedModule } from "./modules/feed/feed.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { RankingModule } from "./modules/ranking/ranking.module";
import { BadgesModule } from "./modules/badges/badges.module";
import { TaskCommentsModule } from "./modules/task-comments/task-comments.module";
import { StatsModule } from "./modules/stats/stats.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { validateEnv } from "./config/env.validation";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: [".env", "../../.env"],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    FeedModule,
    NotificationsModule,
    RankingModule,
    BadgesModule,
    TaskCommentsModule,
    StatsModule,
    MessagesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
