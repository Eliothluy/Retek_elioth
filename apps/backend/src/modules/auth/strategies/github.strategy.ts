import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(config: ConfigService, private readonly auth: AuthService) {
    super({
      clientID: config.get<string>("GITHUB_CLIENT_ID") ?? "",
      clientSecret: config.get<string>("GITHUB_CLIENT_SECRET") ?? "",
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    if (!profile) throw new UnauthorizedException("No GitHub profile");
    const email = profile.emails?.[0]?.value;
    if (!email) throw new UnauthorizedException("No email from GitHub");
    return this.auth.validateOAuthUser({
      provider: "github",
      id: profile.id,
      email,
      name: profile.displayName ?? profile.username ?? email,
      avatar: profile.photos?.[0]?.value,
    });
  }
}
