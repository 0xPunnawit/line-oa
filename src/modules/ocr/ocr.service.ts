import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch, Response } from 'undici';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { uuidv7 } from 'uuidv7';
import { EncryptionService } from '../../common/services/encryption.service';
import { OcrError } from './errors/ocr.error';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Sends base64-encoded file to OCR API and returns parsed result.
   * Generates a UUIDv7 transactionId for request tracing.
   * Throws OcrError subclass on non-OK response.
   */
  async analyzeOcr(file: string): Promise<OcrResponseDto> {
    const transactionId = uuidv7();
    const response = await this.callOcrApi(file, transactionId);

    if (!response.ok) {
      await this.handleErrorResponse(response, transactionId);
    }

    const data = await response.json();
    this.logger.log(
      `OCR API Response received, transactionId: ${transactionId}`,
    );
    this.logger.log(`OCR API Response data: ${JSON.stringify(data)}`);

    return OcrResponseDto.fromApiResponse(data);
  }

  /** Builds and sends the POST request to the external OCR API */
  private async callOcrApi(file: string, transactionId: string) {
    const host = this.configService.getOrThrow<string>('HOST');
    const endpoint = this.configService.getOrThrow<string>('ENDPOINT');
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
      body: JSON.stringify({ file }),
    });
  }

  /** Reads error response body, logs it, and throws appropriate OcrError */
  private async handleErrorResponse(
    response: Response,
    transactionId: string,
  ): Promise<never> {
    const errorText = await response.text();
    this.logger.error(
      `OCR API Error: ${response.status} - ${errorText}, transactionId: ${transactionId}`,
    );

    const errorMessage = this.parseErrorMessage(errorText);
    throw OcrError.fromApiResponse(response.status, errorMessage);
  }

  /** Parses JSON error body; falls back to raw text if not valid JSON */
  private parseErrorMessage(errorText: string): string {
    try {
      const errorData = JSON.parse(errorText) as Record<string, unknown>;
      return String(errorData.message || errorText);
    } catch {
      return errorText;
    }
  }
}
