import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../../common/services/encryption.service';

@Injectable()
export class SecretService {
  constructor(private readonly encryptionService: EncryptionService) {}

  encrypt(text: string): string {
    return this.encryptionService.encrypt(text);
  }
}
