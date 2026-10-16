import { Controller, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { LineBotService } from './line-bot.service';
import { LineWebhookPayloadDto } from './dto/line-webhook.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { LineWebhookGuard } from './guards/line-webhook.guard';
import { WebhookProcessResult } from './dto/webhook-process-result.dto';

@Controller('webhook')
export class LineBotController {
  constructor(private readonly lineBotService: LineBotService) {}

  /**
   * POST /webhook — receives LINE webhook events.
   * Protected by LineWebhookGuard (HMAC signature check).
   * Always returns 200 to LINE even if processing fails.
   */
  @Post()
  @UseGuards(LineWebhookGuard)
  @HttpCode(200)
  async handleWebhook(
    @Body() payload: LineWebhookPayloadDto,
  ): Promise<ApiResponseDto<WebhookProcessResult>> {
    const processed = await this.lineBotService.handleEvents(payload.events);

    return ApiResponseDto.success(
      new WebhookProcessResult(processed),
      'Webhook processed successfully',
    );
  }
}
