import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { EncryptionService } from '../../common/services/encryption.service';

jest.mock('undici', () => ({
  fetch: jest.fn(),
  FormData: jest.fn(),
}));

jest.mock('uuidv7', () => ({
  uuidv7: jest.fn().mockReturnValue('mock-uuid-1234'),
}));

import { fetch } from 'undici';

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OcrService', () => {
  let service: OcrService;
  let configService: jest.Mocked<ConfigService>;
  let encryptionService: jest.Mocked<EncryptionService>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockConfigService: Partial<jest.Mocked<ConfigService>> = {
      getOrThrow: jest.fn((key: string) => {
        const config: Record<string, string> = {
          HOST: 'https://ocr.example.com',
          ENDPOINT: '/api/v1/analyze',
          X_API_KEY: 'encrypted-api-key',
          CHANNEL: 'test-channel',
        };
        return config[key];
      }),
    };

    const mockEncryptionService: Partial<jest.Mocked<EncryptionService>> = {
      decrypt: jest.fn((text: string) => 'decrypted-api-key'),
      encrypt: jest.fn((text: string) => 'encrypted-text'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
    configService = module.get(ConfigService);
    encryptionService = module.get(EncryptionService);

    mockedFetch.mockClear();
  });

  describe('analyzeOcr', () => {
    it('should send POST request with correct headers and payload', async () => {
      const mockJson = {
        total: 250.5,
        date: '2024-01-15',
        seller: 'Test Store',
        data: [{ receiptNo: 'REC001' }],
      };
      mockedFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJson),
      } as any);

      await service.analyzeOcr('base64image');

      expect(mockedFetch).toHaveBeenCalledWith(
        'https://ocr.example.com/api/v1/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'decrypted-api-key',
            channel: 'test-channel',
            'transaction-id': 'mock-uuid-1234',
          },
          body: JSON.stringify({ file: 'base64image' }),
        }),
      );
    });

    it('should return OcrResponseDto instance', async () => {
      const mockJson = {
        total: 100,
        date: '2024-01-15',
        seller: 'Test Store',
        data: [{ receiptNo: 'REC002' }],
      };
      mockedFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJson),
      } as any);

      const result = await service.analyzeOcr('base64image');

      expect(result).toBeInstanceOf(OcrResponseDto);
      expect(result.total).toBe(100);
      expect(result.receiptDate).toBe('2024-01-15');
      expect(result.receiptNo).toBe('REC002');
      expect(result.seller).toBe('Test Store');
    });

    it('should throw when response is not ok', async () => {
      mockedFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      } as any);

      await expect(service.analyzeOcr('base64image')).rejects.toThrow(
        'OCR API Error: 500',
      );
    });

    it('should call encryptionService.decrypt to decrypt API key', async () => {
      const mockJson = {
        total: 100,
        date: '2024-01-15',
        data: [{ receiptNo: 'REC003' }],
      };
      mockedFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJson),
      } as any);

      await service.analyzeOcr('base64image');

      expect(encryptionService.decrypt).toHaveBeenCalledWith(
        'encrypted-api-key',
      );
    });

    it('should handle receiptNo at root level', async () => {
      const mockJson = {
        total: 100,
        date: '2024-01-15',
        receiptNo: 'REC004',
      };
      mockedFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJson),
      } as any);

      const result = await service.analyzeOcr('base64image');

      expect(result.receiptNo).toBe('REC004');
    });
  });
});
