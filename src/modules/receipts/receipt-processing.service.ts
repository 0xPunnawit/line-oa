import { Injectable, Logger } from '@nestjs/common';
import { OcrService } from '../ocr/ocr.service';
import { ReceiptsService } from './receipts.service';
import { PointsCalculatorUtil } from '../../common/utils/points-calculator.util';
import { LineFlexMessageUtil } from '../../common/utils/line-flex-message.util';

export interface ReceiptProcessingResult {
  flexMessage: Record<string, unknown>;
  points: number;
}

@Injectable()
export class ReceiptProcessingService {
  private readonly logger = new Logger(ReceiptProcessingService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  async processReceipt(
    userId: number,
    lineUserId: string,
    imageBase64: string,
  ): Promise<ReceiptProcessingResult> {
    const ocrResult = await this.ocrService.analyzeOcr(imageBase64);

    const pointsToAdd = PointsCalculatorUtil.calculateFromAmount(
      ocrResult.total,
    );

    await this.receiptsService.createWithPoints(
      {
        userId,
        seller: ocrResult.seller,
        receiptDate: ocrResult.receiptDate,
        receiptNo: ocrResult.receiptNo,
        amount: ocrResult.total,
      },
      pointsToAdd,
    );

    this.logger.log(
      `Receipt processed: userId=${userId}, points=${pointsToAdd}`,
    );

    const flexMessage = LineFlexMessageUtil.createReceiptSuccess(
      pointsToAdd,
      ocrResult.total,
    );

    return {
      flexMessage,
      points: pointsToAdd,
    };
  }
}
