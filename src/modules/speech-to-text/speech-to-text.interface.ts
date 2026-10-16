export interface IAudioCommandService {
  resolveCommand(audioBuffer: Buffer): Promise<AudioCommandResult>;
}

export interface AudioCommandResult {
  command: string | null;
  message?: string;
}

export class AudioCommandServiceToken {
  static readonly KEY = 'AUDIO_COMMAND_SERVICE';
}
