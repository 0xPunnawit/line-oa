import { Inject, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { TextHandlerService } from './text-handler.service';
import { DonationsService } from '../donations/donations.service';
import { CreateDonationDto } from '../donations/dto/create-donation.dto';
import { LineMessages } from '../../common/constants/line-messages.constant';
import {
  type IAudioCommandService,
  AudioCommandServiceToken,
} from '../speech-to-text/speech-to-text.interface';
import { ErrorMapperUtil } from '../../common/utils/error-mapper.util';
import { LineFlexMessageUtil } from '../../common/utils/line-flex-message.util';
import { DonateMessageParser } from '../../common/utils/donate-message-parser.util';

@Injectable()
export class AudioHandlerService {
  private readonly logger = new Logger(AudioHandlerService.name);

  private readonly COMMANDS = ['register', 'point'];

  constructor(
    private readonly lineApiService: LineApiService,
    private readonly textHandlerService: TextHandlerService,
    private readonly usersService: UsersService,
    private readonly donationsService: DonationsService,
    @Inject(AudioCommandServiceToken.KEY)
    private readonly audioCommandService: IAudioCommandService,
  ) {}

  async handle(
    lineUserId: string,
    messageId: string,
    replyToken: string,
  ): Promise<void> {
    this.logger.log(`Audio from user: ${lineUserId}, messageId: ${messageId}`);

    try {
      const m4aBuffer = await this.lineApiService.getMessageContent(messageId);

      const result = await this.audioCommandService.resolveCommand(m4aBuffer);

      switch (result.command) {
        case 'donate':
        //   await this.handleDonateStart(replyToken);
        //   return;
        case 'phone ':
          await this.handleDonateInfo(lineUserId, result, replyToken);
          return;
      }

      if (result.command && this.COMMANDS.includes(result.command)) {
        this.logger.log(`Audio command resolved: "${result.command}"`);
        await this.textHandlerService.handle(
          lineUserId,
          result.command,
          replyToken,
        );
        return;
      }

      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.COMMAND_NOT_FOUND,
      );
    } catch (error) {
      await this.handleError(error, replyToken);
    }
  }

  private async handleDonateStart(replyToken: string): Promise<void> {
    this.logger.log('Donate flow started, asking for info');
    await this.lineApiService.replyMessage(
      replyToken,
      LineMessages.DONATE_ASK_INFO,
    );
  }

  private async handleDonateInfo(
    lineUserId: string,
    result: {
      command: string | null;
      message?: string;
    },
    replyToken: string,
  ): Promise<void> {
    if (!result.message) {
      this.logger.warn('No message in donate info response');
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
      return;
    }

    const parsed = DonateMessageParser.parse(result.message);
    const phoneNumber = parsed.phoneNumber;
    const points = parsed.points;

    if (!phoneNumber || points == null) {
      this.logger.warn(
        `Could not parse donate info from message: "${result.message}"`,
      );
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
      return;
    }

    const user = await this.usersService.findByLineUserId(lineUserId);
    if (!user) {
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.NOT_REGISTERED,
      );
      return;
    }

    try {
      const dto = new CreateDonationDto(user.userId, lineUserId, points);
      const result = await this.donationsService.createDonation(dto);

      this.logger.log(
        `Donate request: phoneNumber=${phoneNumber}, points=${points}, donateId=${result.donation.donateId}`,
      );

      const flexMessage = LineFlexMessageUtil.createDonationConfirm(
        result.donation.donateId,
        phoneNumber,
        points,
      );

      await this.lineApiService.replyWithMessages(replyToken, [flexMessage]);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Failed to create donation: ${error.message}`);
      }
      await this.lineApiService.replyMessage(
        replyToken,
        LineMessages.DONATION_INVALID_DATA,
      );
    }
  }

  private async handleError(error: unknown, replyToken: string): Promise<void> {
    const errorDetails = ErrorMapperUtil.getErrorDetails(error);
    this.logger.error(
      `Failed to handle audio: [${errorDetails.type}] ${errorDetails.message}`,
      errorDetails.stack,
    );

    const errorMessage = ErrorMapperUtil.mapAudioError(error);
    await this.lineApiService.replyMessage(replyToken, errorMessage);
  }
}
