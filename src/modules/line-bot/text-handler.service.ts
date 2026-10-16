import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { LineMessages } from '../../common/constants/line-messages.constant';
import { TextCommandService } from './text-command.service';

@Injectable()
export class TextHandlerService {
  private readonly logger = new Logger(TextHandlerService.name);
  private readonly VALID_COMMANDS = ['register', 'point'];

  constructor(
    private readonly usersService: UsersService,
    private readonly lineApiService: LineApiService,
    private readonly textCommandService: TextCommandService,
  ) {}

  async handle(
    lineUserId: string,
    text: string,
    replyToken: string,
  ): Promise<void> {
    let command = text.toLowerCase().trim();

    if (!this.VALID_COMMANDS.includes(command)) {
      const resolvedCommand =
        await this.textCommandService.resolveCommand(text);
      if (resolvedCommand && this.VALID_COMMANDS.includes(resolvedCommand)) {
        command = resolvedCommand;
        this.logger.log(`Resolved command from API: "${command}"`);
      } else {
        await this.lineApiService.replyMessage(
          replyToken,
          LineMessages.COMMAND_NOT_FOUND,
        );
        return;
      }
    }

    let reply: string;

    switch (command) {
      case 'register':
        reply = await this.handleRegister(lineUserId);
        break;
      case 'point':
        reply = await this.handlePoint(lineUserId);
        break;
      default:
        reply = LineMessages.COMMAND_NOT_FOUND;
    }

    await this.lineApiService.replyMessage(replyToken, reply);
  }

  /** Registers the user; replies success or "already registered" */
  private async handleRegister(lineUserId: string): Promise<string> {
    const result = await this.usersService.register(lineUserId);
    this.logger.log(`Register: ${lineUserId}, isNew: ${result.isNew}`);
    return result.isNew
      ? LineMessages.REGISTER_SUCCESS
      : LineMessages.ALREADY_REGISTERED;
  }

  /** Looks up user's current points; replies "not registered" if not found */
  private async handlePoint(lineUserId: string): Promise<string> {
    const user = await this.usersService.findByLineUserId(lineUserId);
    if (!user) {
      return LineMessages.NOT_REGISTERED;
    }
    return LineMessages.points(user.point);
  }
}
