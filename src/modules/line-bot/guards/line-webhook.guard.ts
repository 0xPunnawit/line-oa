import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Validates incoming LINE webhook requests:
 * 1. Checks X-Line-Signature header exists
 * 2. Verifies User-Agent is LineBotWebhook/2.0
 * 3. Validates HMAC-SHA256 signature against channelSecret
 */
@Injectable()
export class LineWebhookGuard implements CanActivate {
  private readonly logger = new Logger(LineWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

  /** Validates signature, user-agent, and body; throws 401 if any check fails */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const signature = request.headers['x-line-signature'];
    const userAgent = request.headers['user-agent'];

    if (!signature) {
      this.logger.warn('Missing X-Line-Signature');
      throw new UnauthorizedException('Missing X-Line-Signature');
    }

    if (!userAgent) {
      this.logger.warn('Missing User-Agent');
      throw new UnauthorizedException('Missing User-Agent');
    }

    if (!userAgent.toString().includes('LineBotWebhook/2.0')) {
      this.logger.warn(`Invalid User-Agent: ${userAgent}`);
      throw new UnauthorizedException('Invalid User-Agent');
    }

    const rawBody = request.rawBody;
    if (!rawBody || rawBody.length === 0) {
      this.logger.warn('Missing raw body for signature validation');
      throw new UnauthorizedException('Invalid request body');
    }

    const channelSecret =
      this.configService.getOrThrow<string>('channelSecret');
    const expectedSignature = createHmac('SHA256', channelSecret)
      .update(rawBody)
      .digest('base64');

    const signatureBuffer = Buffer.from(signature as string, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn('Invalid X-Line-Signature');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
