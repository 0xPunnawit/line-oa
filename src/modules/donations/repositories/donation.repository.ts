import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus } from '../entities/donation.entity';
import { IDonationRepository } from '../interfaces/donation-repository.interface';

@Injectable()
export class DonationRepository implements IDonationRepository {
  constructor(
    @InjectRepository(Donation)
    private readonly repository: Repository<Donation>,
  ) {}

  async findById(donateId: number): Promise<Donation | null> {
    return this.repository.findOne({ where: { donateId } });
  }

  async create(donation: Partial<Donation>): Promise<Donation> {
    const newDonation = this.repository.create(donation);
    return this.repository.save(newDonation);
  }

  async save(donation: Donation): Promise<Donation> {
    return this.repository.save(donation);
  }

  async updateStatus(donateId: number, status: DonationStatus): Promise<void> {
    await this.repository.update({ donateId }, { status });
  }
}
