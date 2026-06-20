import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 4000);
  const frontendUrl = config.get<string>("FRONTEND_URL", "http://localhost:3000");

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cookieParser());

  app.enableCors({
    origin: [frontendUrl, "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://192.168.15.111:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.setGlobalPrefix("api", { exclude: ["health"] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableShutdownHooks();

  await app.listen(port);
  Logger.log(`🚀 Retek API ready on http://localhost:${port}/api`, "Bootstrap");
  Logger.log(`🔌 Realtime (Socket.io) mounted at /realtime`, "Bootstrap");
}

bootstrap();
