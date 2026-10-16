import { Module } from '@nestjs/common';
import { SecretController } from './secret.controller';
import { SecretService } from './secret.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  controllers: [SecretController],
  providers: [SecretService, EncryptionService],
})
export class SecretModule {}
