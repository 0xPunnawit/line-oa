import { Donation, DonationStatus } from '../entities/donation.entity';

export interface IDonationRepository {
  findById(donateId: number): Promise<Donation | null>;
  create(donation: Partial<Donation>): Promise<Donation>;
  save(donation: Donation): Promise<Donation>;
  updateStatus(donateId: number, status: DonationStatus): Promise<void>;
}

export class DonationRepositoryToken {
  static readonly KEY = 'DONATION_REPOSITORY';
}
