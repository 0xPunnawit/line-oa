import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SecretService } from './secret.service';
import { EncryptRequestDto } from './dto/encrypt-request.dto';
import { EncryptResponseDto } from './dto/encrypt-response.dto';
import { WhoAreYouGuard } from './guards/who-are-you.guard';

@Controller('secret')
@UseGuards(WhoAreYouGuard)
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Post('encrypt')
  encrypt(@Body() dto: EncryptRequestDto): EncryptResponseDto {
    const encrypted = this.secretService.encrypt(dto.text);
    return new EncryptResponseDto(encrypted);
  }
}
