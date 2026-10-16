import { Module } from '@nestjs/common';
import { LineApiService } from './line-api.service';

@Module({
  providers: [LineApiService],
  exports: [LineApiService],
})
export class LineApiModule {}
