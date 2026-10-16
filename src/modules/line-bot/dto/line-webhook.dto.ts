import { Type } from 'class-transformer';
import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';

export class LineMessageDto {
  @IsString()
  type!: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  id?: string;

  constructor(type?: string, text?: string, id?: string) {
    if (type) this.type = type;
    this.text = text;
    this.id = id;
  }
}

export class LinePostbackDto {
  @IsString()
  data!: string;

  constructor(data?: string) {
    if (data) this.data = data;
  }
}

export class LineSourceDto {
  @IsString()
  userId!: string;

  constructor(userId?: string) {
    if (userId) this.userId = userId;
  }
}

export class LineWebhookEventDto {
  @IsString()
  type!: string;

  @ValidateNested()
  @Type(() => LineSourceDto)
  source!: LineSourceDto;

  @ValidateNested()
  @Type(() => LineMessageDto)
  @IsOptional()
  message?: LineMessageDto;

  @ValidateNested()
  @Type(() => LinePostbackDto)
  @IsOptional()
  postback?: LinePostbackDto;

  @IsString()
  @IsOptional()
  replyToken?: string;

  constructor(
    type?: string,
    source?: LineSourceDto,
    message?: LineMessageDto,
    replyToken?: string,
    postback?: LinePostbackDto,
  ) {
    if (type) this.type = type;
    if (source) this.source = source;
    this.message = message;
    this.replyToken = replyToken;
    this.postback = postback;
  }
}

export class LineWebhookPayloadDto {
  @IsString()
  @IsOptional()
  destination?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineWebhookEventDto)
  events!: LineWebhookEventDto[];

  constructor(destination?: string, events?: LineWebhookEventDto[]) {
    this.destination = destination;
    if (events) this.events = events;
  }
}
