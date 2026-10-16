import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TextHandlerService } from './text-handler.service';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { TextCommandService } from './text-command.service';
import { User } from '../users/entities/user.entity';
import { RegistrationResult } from '../users/dto/registration-result.dto';

describe('TextHandlerService', () => {
  let service: TextHandlerService;
  let usersService: jest.Mocked<UsersService>;
  let lineApiService: jest.Mocked<LineApiService>;
  let textCommandService: jest.Mocked<TextCommandService>;

  const mockUser: User = {
    userId: 1,
    lineUserId: 'U123',
    point: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockUsersService: Partial<jest.Mocked<UsersService>> = {
      register: jest.fn(),
      findByLineUserId: jest.fn(),
    };
    const mockLineApiService: Partial<jest.Mocked<LineApiService>> = {
      replyMessage: jest.fn(),
      replyWithMessages: jest.fn(),
    };
    const mockTextCommandService: Partial<jest.Mocked<TextCommandService>> = {
      resolveCommand: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextHandlerService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: LineApiService, useValue: mockLineApiService },
        { provide: TextCommandService, useValue: mockTextCommandService },
      ],
    }).compile();

    service = module.get<TextHandlerService>(TextHandlerService);
    usersService = module.get(UsersService);
    lineApiService = module.get(LineApiService);
    textCommandService = module.get(TextCommandService);
  });

  describe('handle', () => {
    it('should call register and reply success for new user', async () => {
      usersService.register.mockResolvedValue(
        new RegistrationResult(mockUser, true),
      );

      await service.handle('U123', 'register', 'token123');

      expect(usersService.register).toHaveBeenCalledWith('U123');
      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'ลงทะเบียนสำเร็จ! ยินดีต้อนรับ',
      );
    });

    it('should call register and reply already registered for existing user', async () => {
      usersService.register.mockResolvedValue(
        new RegistrationResult(mockUser, false),
      );

      await service.handle('U123', 'register', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'คุณลงทะเบียนไปแล้ว',
      );
    });

    it('should reply with point balance', async () => {
      usersService.findByLineUserId.mockResolvedValue(mockUser);

      await service.handle('U123', 'point', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'คะแนนของคุณคือ: 50 แต้ม',
      );
    });

    it('should reply not registered when user not found for point', async () => {
      usersService.findByLineUserId.mockResolvedValue(null);

      await service.handle('U123', 'point', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'ยังไม่ได้สมัครสมาชิก กรุณา "register" ก่อน',
      );
    });

    it('should reply unknown command for unrecognized input', async () => {
      await service.handle('U123', 'unknown', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'unknow',
      );
    });

    it('should trim and lowercase command input', async () => {
      usersService.register.mockResolvedValue(
        new RegistrationResult(mockUser, true),
      );

      await service.handle('U123', '  REGISTER  ', 'token123');

      expect(usersService.register).toHaveBeenCalledWith('U123');
    });
  });
});
