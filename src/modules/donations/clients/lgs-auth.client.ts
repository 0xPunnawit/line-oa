import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';
import { LgsAuthResponseDto } from '../dto/lgs-auth/lgs-auth-response.dto';
import { ILgsAuthClient } from '../interfaces/lgs-auth-client.interface';

@Injectable()
export class LgsAuthClient implements ILgsAuthClient {
  private readonly logger = new Logger(LgsAuthClient.name);

  constructor(private readonly configService: ConfigService) {}

  async getToken(): Promise<LgsAuthResponseDto> {
    const baseUrl = this.configService.getOrThrow<string>('URL_LGS_AUTH');
    const grantType = this.configService.getOrThrow<string>('GRANT_TYPE');
    const clientId = this.configService.getOrThrow<string>('CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>('CLIENT_SECRET');

    const url = `${baseUrl}?grant_type=${encodeURIComponent(grantType)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;

    this.logger.log(`Requesting LGS auth token from: ${baseUrl}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`LGS Auth API Error: ${response.status} - ${error}`);
      throw new Error(`LGS Auth API Error: ${response.status}`);
    }

    const data = (await response.json()) as LgsAuthResponseDto;
    this.logger.log(`LGS auth token obtained, token_type: ${data.token_type}`);

    return data;
  }
}
