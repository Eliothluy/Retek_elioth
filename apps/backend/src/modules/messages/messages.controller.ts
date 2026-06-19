import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

class SendMessageDto {
  @IsString() @IsNotEmpty() @MaxLength(2000) content!: string;
}

@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get("conversations")
  conversations(@CurrentUser("sub") userId: string) {
    return this.messages.findConversations(userId);
  }

  @Get(":conversationId")
  findMessages(@Param("conversationId") conversationId: string, @CurrentUser("sub") userId: string) {
    return this.messages.findMessages(conversationId, userId);
  }

  @Post(":recipientId")
  send(
    @Param("recipientId") recipientId: string,
    @CurrentUser("sub") senderId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.messages.sendMessage(senderId, recipientId, dto.content);
  }
}
