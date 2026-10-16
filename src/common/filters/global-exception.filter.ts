import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Catches all unhandled exceptions and returns a structured JSON error response.
 * Handles: SyntaxError (bad JSON), HttpException, and unknown errors.
 */
@Catch()
export class GlobalExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Handle JSON parse errors
    if (exception instanceof SyntaxError) {
      this.logger.warn(`SyntaxError: ${exception.message}`);
      const errorResponse = ErrorResponseDto.badRequest(
        'Invalid JSON body',
        request.url,
      );
      response.status(400).send(errorResponse);
      return;
    }

    // Handle HttpException (includes UnauthorizedException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as Record<
        string,
        unknown
      >;
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse.message as string) || exception.message;

      this.logger.warn(`HttpException: ${status} - ${message}`);

      const errorResponse = new ErrorResponseDto(
        status,
        message,
        request.url,
        exception.name,
      );
      response.status(status).send(errorResponse);
      return;
    }

    // Handle other errors
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    this.logger.error(
      `GlobalException: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    const errorResponse = ErrorResponseDto.internal(
      'Internal server error',
      request.url,
    );
    response.status(500).send(errorResponse);
  }
}
