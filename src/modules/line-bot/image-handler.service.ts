import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { ReceiptProcessingService } from '../receipts/receipt-processing.service';
import { LineMessages } from '../../common/constants/line-messages.constant';
import { ErrorMapperUtil } from '../../common/utils/error-mapper.util';

@Injectable()
export class ImageHandlerService {
  private readonly logger = new Logger(ImageHandlerService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly lineApiService: LineApiService,
    private readonly receiptProcessingService: ReceiptProcessingService,
  ) {}

  async handle(
    lineUserId: string,
    messageId: string,
    replyToken: string,
  ): Promise<void> {
    this.logger.log(`Image from user: ${lineUserId}, messageId: ${messageId}`);

    const user = await this.usersService.findByLineUserId(lineUserId);
    if (!user) {
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.NOT_REGISTERED,
      );
      return;
    }

    try {
      const content = await this.lineApiService.getMessageContent(messageId);
      const imageToBase64 = content.toString('base64');

      const result = await this.receiptProcessingService.processReceipt(
        user.userId,
        lineUserId,
        imageToBase64,
      );

      await this.lineApiService.replyWithMessages(replyToken, [
        result.flexMessage,
      ]);
    } catch (error) {
      const errorDetails = ErrorMapperUtil.getErrorDetails(error);
      this.logger.error(
        `Failed to handle image: [${errorDetails.type}] ${errorDetails.message}`,
        errorDetails.stack,
      );

      const errorMessage = ErrorMapperUtil.mapOcrError(error);
      await this.lineApiService.replyMessage(replyToken, errorMessage);
    }
  }
}
