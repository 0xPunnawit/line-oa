import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
  ) {}

  async findAll(): Promise<Reward[]> {
    return this.rewardRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(rewardId: number): Promise<Reward | null> {
    return this.rewardRepository.findOne({ where: { rewardId } });
  }
}
