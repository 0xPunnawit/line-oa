import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { Logger } from '@nestjs/common';

export class DatabaseConfig {
  private static readonly logger = new Logger(DatabaseConfig.name);

  /**
   * Returns TypeORM DataSourceOptions for better-sqlite3.
   * Auto-runs migrations; disables synchronize in production.
   */
  static getOptions(): DataSourceOptions {
    const database =
      process.env.DB_DATABASE ?? join(process.cwd(), 'data', 'app.sqlite');

    const isProduction = process.env.NODE_ENV === 'prod';
    const synchronize = process.env.DB_SYNCHRONIZE === 'true';

    if (isProduction && synchronize) {
      this.logger.warn(
        'DB_SYNCHRONIZE is enabled in production. This may cause data loss.',
      );
    }

    return {
      type: 'better-sqlite3',
      database,
      entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
      migrationsRun: true,
      synchronize: !isProduction && synchronize,
      logging: process.env.DB_LOGGING === 'true',
    };
  }
}
