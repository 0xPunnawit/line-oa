import { LgsAuthResponseDto } from '../dto/lgs-auth/lgs-auth-response.dto';

export interface ILgsAuthClient {
  getToken(): Promise<LgsAuthResponseDto>;
}

export class LgsAuthClientToken {
  static readonly KEY = 'LGS_AUTH_CLIENT';
}
