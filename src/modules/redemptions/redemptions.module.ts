import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Redemption } from './entities/redemption.entity';
import { RedemptionsService } from './redemptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Redemption])],
  providers: [RedemptionsService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
