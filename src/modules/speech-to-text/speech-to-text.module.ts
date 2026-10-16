import { Module } from '@nestjs/common';
import { AudioCommandService } from './audio-command.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { AudioCommandServiceToken } from './speech-to-text.interface';

@Module({
  providers: [
    AudioCommandService,
    EncryptionService,
    {
      provide: AudioCommandServiceToken.KEY,
      useExisting: AudioCommandService,
    },
  ],
  exports: [AudioCommandServiceToken.KEY],
})
export class SpeechToTextModule {}
