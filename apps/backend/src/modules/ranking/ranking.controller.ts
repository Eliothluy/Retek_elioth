import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { RankingService } from "./ranking.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RankingCategory } from "@prisma/client";

@UseGuards(JwtAuthGuard)
@Controller("ranking")
export class RankingController {
  constructor(private readonly ranking: RankingService) {}

  @Get(":category")
  leaderboard(
    @Param("category") category: RankingCategory,
    @Query("limit") limit?: string
  ) {
    return this.ranking.leaderboard(category, limit ? parseInt(limit, 10) : 10);
  }

  @Get()
  all() {
    return Promise.all(
      Object.values(RankingCategory).map((c) => this.ranking.leaderboard(c, 10))
    );
  }
}
