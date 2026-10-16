import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const testKey = '7i032abyT9CK3LaTURIMjPuQQzi+RiAyYdtCFvFDDPY=';

  beforeEach(async () => {
    const mockConfigService: Partial<jest.Mocked<ConfigService>> = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'ENCRYPTION_KEY') return testKey;
        if (key === 'LGS_KEY') return testKey;
        throw new Error(`Config key not found: ${key}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  describe('encrypt', () => {
    it('should encrypt plaintext', () => {
      const plaintext = 'secret data';
      const encrypted = service.encrypt(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
    });
  });

  describe('decrypt', () => {
    it('should decrypt ciphertext', () => {
      const plaintext = 'secret data';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('encrypt and decrypt round trip', () => {
    it('should correctly encrypt and decrypt various data types', () => {
      const testCases = [
        'simple text',
        '12345',
        'special chars: !@#$%^&*()',
        'unicode: สวัสดี 🎉',
        'long text: ' + 'a'.repeat(1000),
      ];

      testCases.forEach((plaintext) => {
        const encrypted = service.encrypt(plaintext);
        const decrypted = service.decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      });
    });
  });
});
