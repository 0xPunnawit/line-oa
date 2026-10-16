import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entities/receipt.entity';
import { User } from '../users/entities/user.entity';
import { ReceiptsService } from './receipts.service';
import { ReceiptProcessingService } from './receipt-processing.service';
import { OcrModule } from '../ocr/ocr.module';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt, User]), OcrModule],
  providers: [ReceiptsService, ReceiptProcessingService],
  exports: [ReceiptsService, ReceiptProcessingService],
})
export class ReceiptsModule {}
