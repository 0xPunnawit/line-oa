import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptRequestDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}
