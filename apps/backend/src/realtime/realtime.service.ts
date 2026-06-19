import { Injectable } from "@nestjs/common";
import { RedisService } from "../common/redis/redis.service";

export interface RealtimeNotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class RealtimeService {
  constructor(private readonly redis: RedisService) {}

  pushNotification(payload: RealtimeNotificationPayload) {
    this.redis.publish("notifications", payload);
  }

  broadcastFeedItem(payload: unknown) {
    this.redis.publish("feed", payload);
  }
}
