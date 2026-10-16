import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Logs every request with method, URL, status code, duration, and traceId.
 * Attaches to all routes globally.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /** Intercepts request/response cycle to log method, URL, status, and duration */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const method = request.method;
    const url = request.url;
    const traceId = request.traceId;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<FastifyReply>();
        const statusCode = response.statusCode;
        const duration = Date.now() - now;

        this.logger.log(
          `[TraceID: ${traceId}] ${method} ${url} ${statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
