import { Controller, Get, UseGuards } from "@nestjs/common";
import { BadgesService } from "./badges.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@UseGuards(JwtAuthGuard)
@Controller("badges")
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get()
  findAll(@CurrentUser("sub") userId: string) {
    return this.badges.findAll(userId);
  }
}
