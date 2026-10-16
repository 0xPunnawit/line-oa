import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch, Response, FormData } from 'undici';
import { uuidv7 } from 'uuidv7';
import { EncryptionService } from '../../common/services/encryption.service';
import {
  IAudioCommandService,
  AudioCommandResult,
} from './speech-to-text.interface';

@Injectable()
export class AudioCommandService implements IAudioCommandService {
  private readonly logger = new Logger(AudioCommandService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async resolveCommand(audioBuffer: Buffer): Promise<AudioCommandResult> {
    const transactionId = uuidv7();
    const response = await this.callApi(audioBuffer, transactionId);

    if (!response.ok) {
      await this.handleErrorResponse(response, transactionId);
      return { command: null };
    }

    const data = (await response.json()) as {
      command: string;
      message?: string;
    };
    this.logger.log(
      `Audio command resolved: "${data.command}", transactionId: ${transactionId}`,
    );

    return {
      command: data.command,
      message: data.message,
    };
  }

  private async callApi(audioBuffer: Buffer, transactionId: string) {
    const host = this.configService.getOrThrow<string>('HOST');
    const endpoint = this.configService.getOrThrow<string>(
      'AUDIO_COMMAND_ENDPOINT',
    );
    const encryptApiKey = this.configService.getOrThrow<string>('X_API_KEY');
    const channel = this.configService.getOrThrow<string>('CHANNEL');

    const apiKey = this.encryptionService.decrypt(encryptApiKey);
    const url = `${host}${endpoint}`;

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mp4' });
    formData.append('file', blob, 'audio.m4a');

    return fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        channel: channel,
        'transaction-id': transactionId,
      },
      body: formData,
    });
  }

  private async handleErrorResponse(
    response: Response,
    transactionId: string,
  ): Promise<void> {
    const errorText = await response.text();
    this.logger.error(
      `Audio command API error: ${response.status} - ${errorText}, transactionId: ${transactionId}`,
    );
  }
}
