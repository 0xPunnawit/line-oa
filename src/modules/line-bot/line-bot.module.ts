import { Module } from '@nestjs/common';
import { LineBotController } from './line-bot.controller';
import { LineBotService } from './line-bot.service';
import { TextHandlerService } from './text-handler.service';
import { ImageHandlerService } from './image-handler.service';
import { AudioHandlerService } from './audio-handler.service';
import { TextCommandService } from './text-command.service';
import { UsersModule } from '../users/users.module';
import { OcrModule } from '../ocr/ocr.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { DonationsModule } from '../donations/donations.module';
import { SpeechToTextModule } from '../speech-to-text/speech-to-text.module';
import { LineApiServiceToken } from '../../common/interfaces/line-api.interface';
import { LineApiModule } from '../line-api/line-api.module';
import { LineApiService } from '../line-api/line-api.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  imports: [
    UsersModule,
    OcrModule,
    ReceiptsModule,
    DonationsModule,
    SpeechToTextModule,
    LineApiModule,
  ],
  controllers: [LineBotController],
  providers: [
    LineBotService,
    TextHandlerService,
    ImageHandlerService,
    AudioHandlerService,
    TextCommandService,
    EncryptionService,
    {
      provide: LineApiServiceToken.KEY,
      useExisting: LineApiService,
    },
  ],
  exports: [LineApiModule, LineApiServiceToken.KEY],
})
export class LineBotModule {}
