import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from './entities/donation.entity';
import { DonationsService } from './donations.service';
import { UsersModule } from '../users/users.module';
import { LineApiModule } from '../line-api/line-api.module';
import { DonationsServiceToken } from './interfaces/donations.interface';
import { LgsAuthClientToken } from './interfaces/lgs-auth-client.interface';
import { LgsDonateClientToken } from './interfaces/lgs-donate-client.interface';
import { DonationRepositoryToken } from './interfaces/donation-repository.interface';
import { LgsAuthClient } from './clients/lgs-auth.client';
import { LgsDonateClient } from './clients/lgs-donate.client';
import { DonationRepository } from './repositories/donation.repository';
import { DonationValidator } from './services/donation-validator.service';
import { DonationEncryptor } from './services/donation-encryptor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), UsersModule, LineApiModule],
  providers: [
    DonationsService,
    DonationValidator,
    DonationEncryptor,
    {
      provide: LgsAuthClientToken.KEY,
      useExisting: LgsAuthClient,
    },
    {
      provide: LgsDonateClientToken.KEY,
      useExisting: LgsDonateClient,
    },
    {
      provide: DonationRepositoryToken.KEY,
      useExisting: DonationRepository,
    },
    {
      provide: DonationsServiceToken.KEY,
      useExisting: DonationsService,
    },
    LgsAuthClient,
    LgsDonateClient,
    DonationRepository,
  ],
  exports: [DonationsService, DonationsServiceToken.KEY],
})
export class DonationsModule {}
