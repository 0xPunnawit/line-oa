import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ImageHandlerService } from './image-handler.service';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { ReceiptProcessingService } from '../receipts/receipt-processing.service';
import { User } from '../users/entities/user.entity';

describe('ImageHandlerService', () => {
  let service: ImageHandlerService;
  let usersService: jest.Mocked<UsersService>;
  let lineApiService: jest.Mocked<LineApiService>;
  let receiptProcessingService: jest.Mocked<ReceiptProcessingService>;

  const mockUser: User = {
    userId: 1,
    lineUserId: 'U123',
    point: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockUsersService: Partial<jest.Mocked<UsersService>> = {
      findByLineUserId: jest.fn(),
    };
    const mockLineApiService: Partial<jest.Mocked<LineApiService>> = {
      replyMessage: jest.fn(),
      replyWithMessages: jest.fn(),
      getMessageContent: jest.fn(),
    };
    const mockReceiptProcessingService: Partial<
      jest.Mocked<ReceiptProcessingService>
    > = {
      processReceipt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageHandlerService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: LineApiService, useValue: mockLineApiService },
        {
          provide: ReceiptProcessingService,
          useValue: mockReceiptProcessingService,
        },
      ],
    }).compile();

    service = module.get<ImageHandlerService>(ImageHandlerService);
    usersService = module.get(UsersService);
    lineApiService = module.get(LineApiService);
    receiptProcessingService = module.get(ReceiptProcessingService);
  });

  describe('handle', () => {
    it('should reply not registered when user not found', async () => {
      usersService.findByLineUserId.mockResolvedValue(null);

      await service.handle('U999', 'msg123', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'ยังไม่ได้สมัครสมาชิก กรุณา "register" ก่อน',
      );
      expect(lineApiService.getMessageContent).not.toHaveBeenCalled();
    });

    it('should process image and reply with flex message', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const processingResult = {
        flexMessage: { type: 'flex', altText: 'test', contents: {} },
        points: 15,
      };

      usersService.findByLineUserId.mockResolvedValue(mockUser);
      lineApiService.getMessageContent.mockResolvedValue(imageBuffer);
      receiptProcessingService.processReceipt.mockResolvedValue(
        processingResult,
      );

      await service.handle('U123', 'msg123', 'token123');

      expect(lineApiService.getMessageContent).toHaveBeenCalledWith('msg123');
      expect(receiptProcessingService.processReceipt).toHaveBeenCalledWith(
        1,
        'U123',
        imageBuffer.toString('base64'),
      );
      expect(lineApiService.replyWithMessages).toHaveBeenCalledWith(
        'token123',
        [processingResult.flexMessage],
      );
    });

    it('should reply error when processing fails', async () => {
      usersService.findByLineUserId.mockResolvedValue(mockUser);
      lineApiService.getMessageContent.mockResolvedValue(
        Buffer.from('fake-image'),
      );
      receiptProcessingService.processReceipt.mockRejectedValue(
        new Error('Processing failed'),
      );

      await service.handle('U123', 'msg123', 'token123');

      expect(lineApiService.replyMessage).toHaveBeenCalledWith(
        'token123',
        'เกิดข้อผิดพลาด ฝั่ง server',
      );
    });
  });
});
