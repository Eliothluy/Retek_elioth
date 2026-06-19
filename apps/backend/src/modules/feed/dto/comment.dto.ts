import { IsString, IsUUID, MaxLength } from "class-validator";

export class CreateCommentDto {
  @IsUUID() activityId!: string;
  @IsString() @MaxLength(500) content!: string;
}
