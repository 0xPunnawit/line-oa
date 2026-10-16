import { Donation } from '../entities/donation.entity';

export class DonationResponseDto {
  donateId: number;
  points: number;
  status: string;
  createdAt: Date;

  constructor(donation: Donation) {
    this.donateId = donation.donateId;
    this.points = donation.points;
    this.status = donation.status;
    this.createdAt = donation.createdAt;
  }
}
