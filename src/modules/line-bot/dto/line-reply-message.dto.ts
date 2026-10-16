export class LineReplyMessageDto {
  type: string;
  text: string;

  constructor(text: string, type: string = 'text') {
    this.type = type;
    this.text = text;
  }
}
