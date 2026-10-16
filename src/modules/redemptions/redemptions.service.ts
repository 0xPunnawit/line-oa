import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redemption } from './entities/redemption.entity';

@Injectable()
export class RedemptionsService {
  constructor(
    @InjectRepository(Redemption)
    private readonly redemptionRepository: Repository<Redemption>,
  ) {}

  async findByUserId(userId: number): Promise<Redemption[]> {
    return this.redemptionRepository.find({
      where: { userId },
      relations: { reward: true },
      order: { createdAt: 'DESC' },
    });
  }
}
