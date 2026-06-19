import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateProjectDto {
  @IsString() @MaxLength(80) name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() color?: string;
}

export class UpdateProjectDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() color?: string;
}
