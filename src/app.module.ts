import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DatabaseConfig } from './config/database.config';
import { HealthModule } from './modules/health/health.module';
import { LineBotModule } from './modules/line-bot/line-bot.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { RedemptionsModule } from './modules/redemptions/redemptions.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { SecretModule } from './modules/secret/secret.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        ...DatabaseConfig.getOptions(),
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    LineBotModule,
    ReceiptsModule,
    RewardsModule,
    RedemptionsModule,
    SecretModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
