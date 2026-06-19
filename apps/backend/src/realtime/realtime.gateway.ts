import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RedisService } from "../common/redis/redis.service";
import { PrismaService } from "../common/prisma/prisma.service";

@WebSocketGateway({
  namespace: "/realtime",
  cors: { origin: true, credentials: true },
  transports: ["websocket"],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  afterInit() {
    this.redis.subscribe("notifications", (payload) => this.onRedisNotification(payload));
    this.redis.subscribe("feed", (payload) => this.onRedisFeed(payload));
    this.logger.log("📡 Realtime gateway listening on Redis pub/sub channels");
  }

  private onRedisNotification(payload: any) {
    if (!payload?.userId) return;
    this.server.to(`user:${payload.userId}`).emit("notification", payload);
  }

  private onRedisFeed(payload: any) {
    this.server.emit("feed:new", payload);
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        (client.handshake.headers?.authorization as string)?.replace("Bearer ", "");
      if (!token) throw new Error("No token");
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>("JWT_SECRET")!,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new Error("Invalid user");
      client.data.userId = user.id;
      client.data.role = user.role;
      client.join(`user:${user.id}`);
      this.logger.log(`✅ Client connected: ${user.email} (${client.id})`);
    } catch (err) {
      this.logger.warn(`❌ Connection rejected: ${(err as Error).message}`);
      client.emit("error", { message: "Unauthorized" });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("notifications:markRead")
  async onMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { ids: string[] }) {
    if (!client.data.userId || !data?.ids?.length) return;
    await this.prisma.notification.updateMany({
      where: { id: { in: data.ids }, userId: client.data.userId },
      data: { read: true },
    });
    client.emit("notifications:updated", { readIds: data.ids });
  }

  @SubscribeMessage("feed:like")
  async onLike(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { activityId: string }
  ) {
    if (!client.data.userId) return;
    const existing = await this.prisma.like.findUnique({
      where: { activityId_userId: { activityId: data.activityId, userId: client.data.userId } },
    });
    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      this.server.emit("feed:likeRemoved", { activityId: data.activityId, userId: client.data.userId });
    } else {
      await this.prisma.like.create({
        data: { activityId: data.activityId, userId: client.data.userId },
      });
      this.server.emit("feed:likeAdded", { activityId: data.activityId, userId: client.data.userId });
    }
  }
}
