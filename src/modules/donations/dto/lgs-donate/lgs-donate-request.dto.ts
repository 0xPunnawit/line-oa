export class LgsDonateRequestDto {
  encrypted_data: string;

  constructor(encryptedData: string) {
    this.encrypted_data = encryptedData;
  }
}
