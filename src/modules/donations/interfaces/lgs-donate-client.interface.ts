import { LgsDonateResponseDto } from '../dto/lgs-donate/lgs-donate-response.dto';

export interface ILgsDonateClient {
  donate(accessToken: string, encryptedData: string): Promise<LgsDonateResponseDto>;
}

export class LgsDonateClientToken {
  static readonly KEY = 'LGS_DONATE_CLIENT';
}
