import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService, private readonly auth: AuthService) {
    super({
      clientID: config.get<string>("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: config.get<string>("GOOGLE_CLIENT_SECRET") ?? "",
      callbackURL: "/api/auth/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    if (!profile) throw new UnauthorizedException("No Google profile");
    const email = profile.emails?.[0]?.value;
    if (!email) throw new UnauthorizedException("No email from Google");
    return this.auth.validateOAuthUser({
      provider: "google",
      id: profile.id,
      email,
      name: profile.displayName ?? email,
      avatar: profile.photos?.[0]?.value,
    });
  }
}
