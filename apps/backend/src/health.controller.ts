import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: "ok",
      service: "retekgpt-backend",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
