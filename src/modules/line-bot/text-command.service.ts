import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch, Response } from 'undici';
import { uuidv7 } from 'uuidv7';
import { EncryptionService } from '../../common/services/encryption.service';

export interface TextCommandResponse {
  message: string;
  command: string;
}

@Injectable()
export class TextCommandService {
  private readonly logger = new Logger(TextCommandService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async resolveCommand(message: string): Promise<string | null> {
    const transactionId = uuidv7();
    const response = await this.callApi(message, transactionId);

    if (!response.ok) {
      await this.handleErrorResponse(response, transactionId);
      return null;
    }

    const data = (await response.json()) as TextCommandResponse;
    this.logger.log(
      `Text command resolved: "${data.command}" from message: "${message}", transactionId: ${transactionId}`,
    );

    return data.command;
  }

  private async callApi(message: string, transactionId: string) {
    const host = this.configService.getOrThrow<string>('HOST');
    const endpoint = this.configService.getOrThrow<string>(
      'TEXT_COMMAND_ENDPOINT',
    );
    const encryptApiKey = this.configService.getOrThrow<string>('X_API_KEY');
    const channel = this.configService.getOrThrow<string>('CHANNEL');

    const apiKey = this.encryptionService.decrypt(encryptApiKey);
    const url = `${host}${endpoint}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        channel: channel,
        'transaction-id': transactionId,
      },
      body: JSON.stringify({ message }),
    });
  }

  private async handleErrorResponse(
    response: Response,
    transactionId: string,
  ): Promise<void> {
    const errorText = await response.text();
    this.logger.error(
      `Text command API error: ${response.status} - ${errorText}, transactionId: ${transactionId}`,
    );
  }
}
