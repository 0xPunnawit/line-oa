import { Donation } from '../entities/donation.entity';

export class ConfirmDonationResult {
  donation: Donation;
  externalTransactionId: string | null;

  constructor(donation: Donation, externalTransactionId: string | null) {
    this.donation = donation;
    this.externalTransactionId = externalTransactionId;
  }
}
