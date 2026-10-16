import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '../utils/crypto.util';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    this.encryptionKey =
      this.configService.getOrThrow<string>('ENCRYPTION_KEY');
  }

  /** Encrypts plaintext using ENCRYPTION_KEY from env */
  encrypt(plaintext: string): string {
    return CryptoUtil.encrypt(plaintext, this.encryptionKey);
  }

  /** Decrypts ciphertext using ENCRYPTION_KEY from env */
  decrypt(encryptedData: string): string {
    return CryptoUtil.decrypt(encryptedData, this.encryptionKey);
  }
}
