import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService
  ) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser("sub") userId: string) {
    return this.auth.me(userId);
  }

  // --- OAuth Google ---
  @Public()
  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {}

  @Public()
  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthSuccess(req, res);
  }

  // --- OAuth GitHub ---
  @Public()
  @Get("github")
  @UseGuards(AuthGuard("github"))
  githubAuth() {}

  @Public()
  @Get("github/callback")
  @UseGuards(AuthGuard("github"))
  githubCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthSuccess(req, res);
  }

  private handleOAuthSuccess(req: Request, res: Response) {
    const result = (req.user as unknown) as { accessToken: string; refreshToken: string };
    const frontendUrl = this.config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/login?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    res.redirect(redirectUrl);
  }
}
