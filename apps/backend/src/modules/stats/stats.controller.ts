import { Controller, Get, UseGuards } from "@nestjs/common";
import { StatsService } from "./stats.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("stats")
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get("dashboard")
  dashboard() {
    return this.stats.dashboard();
  }
}
