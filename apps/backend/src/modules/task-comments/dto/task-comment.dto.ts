import { IsString, IsUUID, MaxLength } from "class-validator";

export class CreateTaskCommentDto {
  @IsString() @MaxLength(1000) content!: string;
}

export class UpdateTaskCommentDto {
  @IsString() @MaxLength(1000) content!: string;
}
