import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  providers: [OcrService, EncryptionService],
  exports: [OcrService],
})
export class OcrModule {}
