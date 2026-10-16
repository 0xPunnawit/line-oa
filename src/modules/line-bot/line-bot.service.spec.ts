import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LineBotService } from './line-bot.service';
import { TextHandlerService } from './text-handler.service';
import { ImageHandlerService } from './image-handler.service';
import { AudioHandlerService } from './audio-handler.service';
import { LineWebhookEventDto } from './dto/line-webhook.dto';
import { LineSourceDto } from './dto/line-webhook.dto';
import { LineMessageDto } from './dto/line-webhook.dto';

describe('LineBotService', () => {
  let service: LineBotService;
  let textHandler: jest.Mocked<TextHandlerService>;
  let imageHandler: jest.Mocked<ImageHandlerService>;
  let audioHandler: jest.Mocked<AudioHandlerService>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const mockTextHandler: Partial<jest.Mocked<TextHandlerService>> = {
      handle: jest.fn(),
    };
    const mockImageHandler: Partial<jest.Mocked<ImageHandlerService>> = {
      handle: jest.fn(),
    };
    const mockAudioHandler: Partial<jest.Mocked<AudioHandlerService>> = {
      handle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineBotService,
        { provide: TextHandlerService, useValue: mockTextHandler },
        { provide: ImageHandlerService, useValue: mockImageHandler },
        { provide: AudioHandlerService, useValue: mockAudioHandler },
      ],
    }).compile();

    service = module.get<LineBotService>(LineBotService);
    textHandler = module.get(TextHandlerService);
    imageHandler = module.get(ImageHandlerService);
    audioHandler = module.get(AudioHandlerService);
  });

  describe('handleEvent', () => {
    it('should call textHandler for text message events', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        new LineMessageDto('text', 'register'),
        'token123',
      );

      await service.handleEvent(event);

      expect(textHandler.handle).toHaveBeenCalledWith(
        'U123',
        'register',
        'token123',
      );
      expect(imageHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });

    it('should call imageHandler for image message events', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        new LineMessageDto('image', undefined, 'img456'),
        'token123',
      );

      await service.handleEvent(event);

      expect(imageHandler.handle).toHaveBeenCalledWith(
        'U123',
        'img456',
        'token123',
      );
      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });

    it('should call imageHandler for file message events', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        new LineMessageDto('file', undefined, 'file789'),
        'token123',
      );

      await service.handleEvent(event);

      expect(imageHandler.handle).toHaveBeenCalledWith(
        'U123',
        'file789',
        'token123',
      );
      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });

    it('should call audioHandler for audio message events', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        new LineMessageDto('audio', undefined, 'audio123'),
        'token123',
      );

      await service.handleEvent(event);

      expect(audioHandler.handle).toHaveBeenCalledWith(
        'U123',
        'audio123',
        'token123',
      );
      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(imageHandler.handle).not.toHaveBeenCalled();
    });

    it('should not call handler when message is missing', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        undefined,
        'token123',
      );

      await service.handleEvent(event);

      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(imageHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });

    it('should not call handler when replyToken is missing', async () => {
      const event = new LineWebhookEventDto(
        'message',
        new LineSourceDto('U123'),
        new LineMessageDto('text', 'hello'),
        undefined,
      );

      await service.handleEvent(event);

      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(imageHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });

    it('should ignore unhandled event types', async () => {
      const event = new LineWebhookEventDto(
        'follow',
        new LineSourceDto('U123'),
      );

      await service.handleEvent(event);

      expect(textHandler.handle).not.toHaveBeenCalled();
      expect(imageHandler.handle).not.toHaveBeenCalled();
      expect(audioHandler.handle).not.toHaveBeenCalled();
    });
  });
});
