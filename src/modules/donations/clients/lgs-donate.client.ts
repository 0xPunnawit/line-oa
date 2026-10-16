import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';
import { uuidv4 } from 'uuidv7';
import { LgsDonateRequestDto } from '../dto/lgs-donate/lgs-donate-request.dto';
import { LgsDonateResponseDto } from '../dto/lgs-donate/lgs-donate-response.dto';
import { ILgsDonateClient } from '../interfaces/lgs-donate-client.interface';

@Injectable()
export class LgsDonateClient implements ILgsDonateClient {
  private readonly logger = new Logger(LgsDonateClient.name);

  constructor(private readonly configService: ConfigService) {}

  async donate(
    accessToken: string,
    encryptedData: string,
  ): Promise<LgsDonateResponseDto> {
    const url = this.configService.getOrThrow<string>('URL_LGS_DONATE');
    const reqId = uuidv4();

    const payload = new LgsDonateRequestDto(encryptedData);

    this.logger.log(`Requesting LGS donate to: ${url}, req_id: ${reqId}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'req_id': reqId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`LGS Donate API Error: ${response.status} - ${error}`);
      throw new Error(`LGS Donate API Error: ${response.status}`);
    }

    const data = (await response.json()) as LgsDonateResponseDto;
    this.logger.log(`LGS donate success, response: ${JSON.stringify(data)}`);

    return data;
  }
}
