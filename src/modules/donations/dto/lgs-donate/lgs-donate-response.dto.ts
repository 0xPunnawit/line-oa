export class LgsDonateResponseDto {
  encrypted_data: string;

  constructor(encryptedData: string) {
    this.encrypted_data = encryptedData;
  }
}
