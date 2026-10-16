import { Donation } from '../entities/donation.entity';

export class DonationResult {
  donation: Donation;

  constructor(donation: Donation) {
    this.donation = donation;
  }
}
