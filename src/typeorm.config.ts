import { DataSource } from 'typeorm';
import { DatabaseConfig } from './config/database.config';

export const AppDataSource = new DataSource(DatabaseConfig.getOptions());

export class TypeOrmDataSource {
  private static instance: DataSource;

  static getInstance(): DataSource {
    if (!TypeOrmDataSource.instance) {
      TypeOrmDataSource.instance = new DataSource(DatabaseConfig.getOptions());
    }
    return TypeOrmDataSource.instance;
  }
}
