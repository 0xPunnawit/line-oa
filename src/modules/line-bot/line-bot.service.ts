import { Injectable, Logger } from '@nestjs/common';
import { TextHandlerService } from './text-handler.service';
import { ImageHandlerService } from './image-handler.service';
import { AudioHandlerService } from './audio-handler.service';
import { DonationsService } from '../donations/donations.service';
import { LineApiService } from '../line-api/line-api.service';
import { LineMessages } from '../../common/constants/line-messages.constant';
import {
  LineWebhookEventDto,
  LineWebhookPayloadDto,
} from './dto/line-webhook.dto';

@Injectable()
export class LineBotService {
  private readonly logger = new Logger(LineBotService.name);

  constructor(
    private readonly textHandler: TextHandlerService,
    private readonly imageHandler: ImageHandlerService,
    private readonly audioHandler: AudioHandlerService,
    private readonly donationsService: DonationsService,
    private readonly lineApiService: LineApiService,
  ) {}

  async handleEvents(events: LineWebhookPayloadDto['events']): Promise<number> {
    let processed = 0;

    for (const event of events) {
      if (!event.source?.userId) continue;

      if (event.type === 'postback' && event.postback && event.replyToken) {
        await this.handlePostback(event);
        processed++;
      } else if (event.type === 'message' && event.message) {
        await this.handleEvent(event);
        processed++;
      }
    }

    return processed;
  }

  async handleEvent(event: LineWebhookEventDto): Promise<void> {
    const { userId } = event.source;
    const { type, message, replyToken } = event;

    this.logger.log(`Event: type=${type}, userId=${userId}`);

    switch (type) {
      case 'message':
        if (!message || !replyToken) {
          this.logger.warn('Message event missing message or replyToken');
          return;
        }
        if (message.type === 'text' && message.text) {
          await this.textHandler.handle(userId, message.text, replyToken);
        } else if (
          (message.type === 'image' || message.type === 'file') &&
          message.id
        ) {
          await this.imageHandler.handle(userId, message.id, replyToken);
        } else if (message.type === 'audio' && message.id) {
          await this.audioHandler.handle(userId, message.id, replyToken);
        }
        break;
      default:
        this.logger.warn(`Unhandled event type: ${type}`);
    }
  }

  private async handlePostback(event: LineWebhookEventDto): Promise<void> {
    const { userId } = event.source;
    const { replyToken, postback } = event;

    if (!replyToken || !postback?.data) return;

    this.logger.log(`Postback: userId=${userId}, data=${postback.data}`);

    try {
      const data = JSON.parse(postback.data) as {
        action?: string;
        donateId?: number;
        phoneNumber?: string;
        points?: number;
      };

      if (data.action === 'confirm_donate') {
        await this.handleConfirmDonate(userId, data, replyToken);
      } else if (data.action === 'cancel_donate') {
        await this.handleCancelDonate(userId, data, replyToken);
      }
    } catch (error) {
      this.logger.error(`Failed to handle postback: ${error}`);
    }
  }

  private async handleConfirmDonate(
    lineUserId: string,
    data: { donateId?: number; phoneNumber?: string; points?: number },
    replyToken: string,
  ): Promise<void> {
    if (!data.donateId || !data.phoneNumber) {
      this.logger.warn('Missing donateId or phoneNumber in postback data');
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
      return;
    }

    this.logger.log(
      `Confirm donate: userId=${lineUserId}, donateId=${data.donateId}, phoneNumber=${data.phoneNumber}`,
    );

    try {
      const result = await this.donationsService.confirmDonate(
        data.donateId,
        data.phoneNumber,
      );

      if (result.externalTransactionId) {
        this.logger.log(
          `Donation confirmed: donateId=${data.donateId}, externalTxId=${result.externalTransactionId}`,
        );
      }

      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_CONFIRMED,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to confirm donation: ${error.message}`);

        if (error.message.includes('already processed')) {
          await this.lineApiService.replyMessage(
            replyToken,
            LineMessages.DONATION_ALREADY_PROCESSED,
          );
          return;
        }
      }
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
    }
  }

  private async handleCancelDonate(
    lineUserId: string,
    data: { donateId?: number },
    replyToken: string,
  ): Promise<void> {
    if (!data.donateId) {
      this.logger.warn('Missing donateId in cancel postback data');
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
      return;
    }

    this.logger.log(
      `Cancel donate: userId=${lineUserId}, donateId=${data.donateId}`,
    );

    try {
      await this.donationsService.cancelDonate(data.donateId);
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_CANCELLED,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to cancel donation: ${error.message}`);

        if (error.message.includes('already processed')) {
          await this.lineApiService.replyMessage(
            replyToken,
            LineMessages.DONATION_ALREADY_PROCESSED,
          );
          return;
        }
      }
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
    }
  }
}
