import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  IsOptional,
  validateSync,
} from "class-validator";

enum NodeEnv {
  development = "development",
  production = "production",
  test = "test",
}

class EnvVariables {
  @IsEnum(NodeEnv) NODE_ENV: NodeEnv = NodeEnv.development;
  @IsNumber() PORT: number = 4000;
  @IsString() FRONTEND_URL = "http://localhost:3000";
  @IsString() DATABASE_URL!: string;
  @IsString() REDIS_URL!: string;
  @IsString() JWT_SECRET!: string;
  @IsString() JWT_REFRESH_SECRET!: string;
  @IsString() JWT_EXPIRES_IN = "15m";
  @IsString() JWT_REFRESH_EXPIRES_IN = "7d";
  @IsOptional() @IsString() GOOGLE_CLIENT_ID?: string;
  @IsOptional() @IsString() GOOGLE_CLIENT_SECRET?: string;
  @IsOptional() @IsString() GITHUB_CLIENT_ID?: string;
  @IsOptional() @IsString() GITHUB_CLIENT_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const normalized: Record<string, unknown> = { ...config };
  if (typeof normalized.PORT === "string") {
    normalized.PORT = parseInt(normalized.PORT, 10);
  }
  const validated = plainToInstance(EnvVariables, normalized, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(", ")}`)
        .join("\n")}`
    );
  }
  return validated;
}
