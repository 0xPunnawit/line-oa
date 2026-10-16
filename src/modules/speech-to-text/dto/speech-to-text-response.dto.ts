import { IsString } from 'class-validator';

export class SpeechToTextResponseDto {
  @IsString()
  recognitionStatus!: string;

  @IsString()
  displayText!: string;

  static fromApiResponse(data: unknown): SpeechToTextResponseDto {
    const record = data as Record<string, unknown>;
    const dto = new SpeechToTextResponseDto();

    const status = record.RecognitionStatus;
    dto.recognitionStatus = typeof status === 'string' ? status : 'Unknown';
    dto.displayText =
      typeof record.DisplayText === 'string' ? record.DisplayText : '';

    return dto;
  }
}
