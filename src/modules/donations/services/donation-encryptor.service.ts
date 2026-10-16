import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from '../../../common/utils/crypto.util';
import { LgsDonatePayloadDto } from '../dto/lgs-donate/lgs-donate-payload.dto';
import { LgsDonateDecryptedResponseDto } from '../dto/lgs-donate/lgs-donate-decrypted-response.dto';

@Injectable()
export class DonationEncryptor {
  private static readonly DONATION_REMARK = 'พี่อิ่ม น้องอิ่ม ด้วยกันนะ';

  constructor(private readonly configService: ConfigService) {}

  encryptDonationPayload(
    displayName: string,
    lineUserId: string,
    phoneNumber: string,
    points: number,
  ): string {
    const productRequest = this.configService.getOrThrow<string>(
      'LGS_PRODUCT_REQUEST',
    );
    const key = this.configService.getOrThrow<string>('LGS_KEY');

    const payload = new LgsDonatePayloadDto(
      productRequest,
      displayName,
      lineUserId,
      phoneNumber,
      String(points),
      DonationEncryptor.DONATION_REMARK,
    );

    return CryptoUtil.encryptGCM256(JSON.stringify(payload), key);
  }

  decryptDonateResponse(
    encryptedData: string,
  ): LgsDonateDecryptedResponseDto {
    const key = this.configService.getOrThrow<string>('LGS_KEY');
    const decryptedJson = CryptoUtil.decryptLGS(encryptedData, key);
    return JSON.parse(decryptedJson) as LgsDonateDecryptedResponseDto;
  }
}
