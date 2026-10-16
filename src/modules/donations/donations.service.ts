import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { Donation, DonationStatus } from './entities/donation.entity';
import { UsersService } from '../users/users.service';
import { LineApiService } from '../line-api/line-api.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationResult } from './dto/donation-result.dto';
import { ConfirmDonationResult } from './dto/confirm-donation-result.dto';
import { IDonationsService } from './interfaces/donations.interface';
import type { ILgsAuthClient } from './interfaces/lgs-auth-client.interface';
import { LgsAuthClientToken } from './interfaces/lgs-auth-client.interface';
import type { ILgsDonateClient } from './interfaces/lgs-donate-client.interface';
import { LgsDonateClientToken } from './interfaces/lgs-donate-client.interface';
import type { IDonationRepository } from './interfaces/donation-repository.interface';
import { DonationRepositoryToken } from './interfaces/donation-repository.interface';
import { DonationValidator } from './services/donation-validator.service';
import { DonationEncryptor } from './services/donation-encryptor.service';

@Injectable()
export class DonationsService implements IDonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @Inject(DonationRepositoryToken.KEY)
    private readonly donationRepository: IDonationRepository,
    private readonly usersService: UsersService,
    private readonly lineApiService: LineApiService,
    @Inject(LgsAuthClientToken.KEY)
    private readonly lgsAuthClient: ILgsAuthClient,
    @Inject(LgsDonateClientToken.KEY)
    private readonly lgsDonateClient: ILgsDonateClient,
    private readonly donationValidator: DonationValidator,
    private readonly donationEncryptor: DonationEncryptor,
  ) {}

  async createDonation(dto: CreateDonationDto): Promise<DonationResult> {
    const user = await this.usersService.findByLineUserId(dto.lineUserId);
    if (!user) {
      throw new BadRequestException('User not registered');
    }

    this.donationValidator.validatePoints(user.point, dto.points);

    const donation = await this.donationRepository.create({
      userId: dto.userId,
      lineUserId: dto.lineUserId,
      points: dto.points,
      status: DonationStatus.PENDING,
    });

    this.logger.log(
      `Donation created: id=${donation.donateId}, points=${dto.points}`,
    );
    return new DonationResult(donation);
  }

  async confirmDonate(
    donateId: number,
    phoneNumber: string,
  ): Promise<ConfirmDonationResult> {
    const donation = await this.donationRepository.findById(donateId);

    if (!donation) {
      throw new BadRequestException(`Donation not found: ${donateId}`);
    }

    this.validateDonationStatus(donation);
    this.donationValidator.validatePhoneNumber(phoneNumber);

    await this.donationRepository.updateStatus(
      donateId,
      DonationStatus.PROCESSING,
    );
    this.logger.log(`Donation ${donateId} status changed to PROCESSING`);

    try {
      const userProfile = await this.lineApiService.getUserProfile(
        donation.lineUserId,
      );

      const authResponse = await this.lgsAuthClient.getToken();
      const accessToken = authResponse.access_token;

      const encryptedData = this.donationEncryptor.encryptDonationPayload(
        userProfile.displayName,
        donation.lineUserId,
        phoneNumber,
        donation.points,
      );

      const donateResponse = await this.lgsDonateClient.donate(
        accessToken,
        encryptedData,
      );

      const decryptedResponse =
        this.donationEncryptor.decryptDonateResponse(
          donateResponse.encrypted_data,
        );

      this.logger.log(
        `Decrypted response: ${JSON.stringify(decryptedResponse)}`,
      );

      if (
        decryptedResponse.status_code !== '0' ||
        decryptedResponse.status_desc !== 'success'
      ) {
        this.logger.error(
          `Donation failed: status_code=${decryptedResponse.status_code}, status_desc=${decryptedResponse.status_desc}`,
        );
        await this.donationRepository.updateStatus(
          donateId,
          DonationStatus.FAILED,
        );
        throw new BadRequestException(
          `Donation failed: ${decryptedResponse.status_desc}`,
        );
      }

      await this.usersService.deductPoints(donation.userId, donation.points);

      donation.status = DonationStatus.COMPLETED;
      donation.externalTransactionId = decryptedResponse.lgs_lead_id;
      await this.donationRepository.save(donation);

      this.logger.log(
        `Donation confirmed: id=${donateId}, lgs_lead_id=${decryptedResponse.lgs_lead_id}`,
      );
      return new ConfirmDonationResult(
        donation,
        decryptedResponse.lgs_lead_id,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      await this.donationRepository.updateStatus(
        donateId,
        DonationStatus.FAILED,
      );
      this.logger.log(`Donation ${donateId} status changed to FAILED`);
      throw error;
    }
  }

  async cancelDonate(donateId: number): Promise<void> {
    const donation = await this.donationRepository.findById(donateId);

    if (!donation) {
      throw new BadRequestException(`Donation not found: ${donateId}`);
    }

    this.validateDonationStatus(donation);

    await this.donationRepository.updateStatus(
      donateId,
      DonationStatus.FAILED,
    );
    this.logger.log(`Donation ${donateId} cancelled, status changed to FAILED`);
  }

  private validateDonationStatus(donation: Donation): void {
    if (donation.status !== DonationStatus.PENDING) {
      throw new BadRequestException(
        `Donation already processed: ${donation.donateId}`,
      );
    }
  }
}
