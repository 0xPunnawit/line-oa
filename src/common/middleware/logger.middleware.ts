import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { uuidv7 } from 'uuidv7';

/**
 * Assigns a unique traceId (UUIDv7) to every incoming request.
 * Logs method, URL, IP, and traceId for request tracing.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  /** Middleware entry point: generates traceId, attaches to request, and logs */
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const { method, url } = req;
    const traceId = uuidv7();
    req.traceId = traceId;

    this.logger.log(`[TraceID: ${traceId}] ${method} ${url}`);

    next();
  }
}
