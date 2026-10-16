import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';
import { LineReplyRequestDto } from '../line-bot/dto/line-reply-request.dto';
import { LineReplyMessageDto } from '../line-bot/dto/line-reply-message.dto';
import { ILineApiService } from '../../common/interfaces/line-api.interface';

@Injectable()
export class LineApiService implements ILineApiService {
  private readonly logger = new Logger(LineApiService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Sends a text reply back to the user via LINE Messaging API.
   * Uses replyToken (one-time use) from the webhook event.
   */
  async replyMessage(replyToken: string, text: string): Promise<void> {
    const url = this.configService.getOrThrow<string>('replyApiUrl');
    const token = this.configService.getOrThrow<string>('channelAccessToken');

    const message = new LineReplyMessageDto(text);
    const payload = new LineReplyRequestDto(replyToken, [message]);

    this.logger.log(`Sending reply: ${text}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`LINE API Error: ${response.status} - ${error}`);
    }
  }

  /**
   * Sends messages (text, flex, etc.) back to the user via LINE Messaging API.
   * Supports any message type including Flex Messages.
   */
  async replyWithMessages(
    replyToken: string,
    messages: Record<string, unknown>[],
  ): Promise<void> {
    const url = this.configService.getOrThrow<string>('replyApiUrl');
    const token = this.configService.getOrThrow<string>('channelAccessToken');

    const payload = {
      replyToken,
      messages,
    };

    this.logger.log(`Sending ${messages.length} message(s)`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`LINE API Error: ${response.status} - ${error}`);
    }
  }

  /**
   * Fetches user profile from LINE Messaging API.
   * Returns displayName, pictureUrl, etc.
   */
  async getUserProfile(userId: string): Promise<{
    displayName: string;
    userId: string;
    pictureUrl?: string;
    statusMessage?: string;
  }> {
    const baseUrl = this.configService.getOrThrow<string>('replyApiUrl');
    const url = baseUrl.replace('/message/reply', `/profile/${userId}`);
    const token = this.configService.getOrThrow<string>('channelAccessToken');

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(
          `Failed to get profile: ${response.status} - ${error}`,
        );
        throw new Error(`LINE API Error: ${response.status}`);
      }

      return response.json() as Promise<{
        displayName: string;
        userId: string;
        pictureUrl?: string;
        statusMessage?: string;
      }>;
    } catch (error) {
      this.logger.error(`LINE API fetch failed: ${error}`);
      throw error;
    }
  }

  /**
   * Downloads the binary content of a user-sent message (image/file) from LINE.
   * Returns raw Buffer for further processing (e.g. OCR).
   */
  async getMessageContent(messageId: string): Promise<Buffer> {
    const baseUrl = this.configService.getOrThrow<string>('messageContentUrl');
    const url = baseUrl.replace(':messageId', messageId);
    const token = this.configService.getOrThrow<string>('channelAccessToken');

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(
          `Failed to get message: ${response.status} - ${error}`,
        );
        throw new Error(`LINE API Error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`LINE API fetch failed: ${error}`);
      throw error;
    }
  }
}
