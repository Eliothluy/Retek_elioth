import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;
  readonly pub: Redis;
  readonly sub: Redis;

  constructor(private readonly config: ConfigService) {
    const url = config.get<string>("REDIS_URL", "redis://localhost:6379");
    const factory = () => new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: false });
    this.client = factory();
    this.pub = factory();
    this.sub = factory();
  }

  async onModuleInit() {
    this.client.on("error", (e) => this.logger.error(`Redis client error: ${e.message}`));
    this.pub.on("error", (e) => this.logger.error(`Redis pub error: ${e.message}`));
    this.sub.on("error", (e) => this.logger.error(`Redis sub error: ${e.message}`));
    await Promise.all([this.client.ping(), this.pub.ping(), this.sub.ping()]);
    this.logger.log("✅ Redis connected");
  }

  async onModuleDestroy() {
    await Promise.all([this.client.quit(), this.pub.quit(), this.sub.quit()]);
  }

  async cache<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.client.get(key);
    if (cached) return JSON.parse(cached) as T;
    const value = await factory();
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return value;
  }

  async invalidate(...keys: string[]) {
    if (keys.length) await this.client.del(keys);
  }

  publish(channel: string, payload: unknown) {
    this.pub.publish(channel, JSON.stringify(payload));
  }

  subscribe(channel: string, handler: (payload: unknown) => void) {
    this.sub.subscribe(channel);
    this.sub.on("message", (chan, message) => {
      if (chan === channel) handler(JSON.parse(message));
    });
  }
}
