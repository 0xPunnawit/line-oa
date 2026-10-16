import { DonationResult } from '../dto/donation-result.dto';
import { ConfirmDonationResult } from '../dto/confirm-donation-result.dto';
import { CreateDonationDto } from '../dto/create-donation.dto';

export interface IDonationsService {
  createDonation(dto: CreateDonationDto): Promise<DonationResult>;
  confirmDonate(donateId: number, phoneNumber: string): Promise<ConfirmDonationResult>;
  cancelDonate(donateId: number): Promise<void>;
}

export class DonationsServiceToken {
  static readonly KEY = 'DONATIONS_SERVICE';
}
