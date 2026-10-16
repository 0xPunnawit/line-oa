import { Injectable, BadRequestException } from '@nestjs/common';
import { PhoneValidator } from '../../../common/utils/phone-validator.util';

@Injectable()
export class DonationValidator {
  validatePhoneNumber(phoneNumber: string): void {
    if (!PhoneValidator.isValid(phoneNumber)) {
      throw new BadRequestException(`Invalid phone number: ${phoneNumber}`);
    }
  }

  validatePoints(userPoints: number, requiredPoints: number): void {
    if (userPoints < requiredPoints) {
      throw new BadRequestException(
        `Insufficient points. Current: ${userPoints}, Required: ${requiredPoints}`,
      );
    }
  }
}
