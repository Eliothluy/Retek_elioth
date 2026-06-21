import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Transform } from "class-transformer";

/** Empty/whitespace strings (e.g. an unselected <select>) count as "no value". */
const EmptyToUndefined = () =>
  Transform(({ value }) => (typeof value === "string" && value.trim() === "" ? undefined : value));

export class CreateTaskDto {
  @IsString() @MaxLength(160) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @IsString() @EmptyToUndefined() projectId?: string;
  @IsOptional() @IsString() @EmptyToUndefined() assigneeId?: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @IsOptional() @IsBoolean() alert?: boolean;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @IsString() @EmptyToUndefined() projectId?: string;
  @IsOptional() @IsString() @EmptyToUndefined() assigneeId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @IsOptional() @IsBoolean() alert?: boolean;
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus) status!: TaskStatus;
}
