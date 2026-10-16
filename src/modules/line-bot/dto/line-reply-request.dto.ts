import { LineReplyMessageDto } from './line-reply-message.dto';

export class LineReplyRequestDto {
  replyToken: string;
  messages: LineReplyMessageDto[];

  constructor(replyToken: string, messages: LineReplyMessageDto[]) {
    this.replyToken = replyToken;
    this.messages = messages;
  }
}
