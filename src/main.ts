import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

export class ApplicationBootstrap {
  private static readonly logger = new Logger(ApplicationBootstrap.name);

  /**
   * Bootstraps the NestJS app with Fastify adapter.
   * Sets up global pipes, filters, interceptors, and starts listening.
   */
  static async start(): Promise<void> {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
      { rawBody: true },
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    app.useGlobalInterceptors(new LoggingInterceptor());

    app.enableShutdownHooks();

    const configService = app.get(ConfigService);
    const port = configService.get<string>('PORT');
    await app.listen(String(port), '0.0.0.0');
    this.logger.log(`Application is running on: ${await app.getUrl()}`);
  }
}

void ApplicationBootstrap.start();
