export class LgsAuthResponseDto {
  access_token: string;
  token_type: string;

  constructor(accessToken: string, tokenType: string) {
    this.access_token = accessToken;
    this.token_type = tokenType;
  }
}
