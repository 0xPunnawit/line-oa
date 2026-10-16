export class SpeechToTextError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly speechMessage: string,
  ) {
    super(message);
    this.name = 'SpeechToTextError';
  }

  private static readonly ERROR_REGISTRY: Array<{
    pattern: RegExp;
    createError: (message: string) => SpeechToTextError;
  }> = [
    {
      pattern: /No match/i,
      createError: (message) => new NoMatchError(message),
    },
    {
      pattern: /Insufficient audio/i,
      createError: (message) => new InsufficientAudioError(message),
    },
  ];

  static fromApiResponse(
    statusCode: number,
    speechMessage: string,
  ): SpeechToTextError {
    const matchedError = this.ERROR_REGISTRY.find(({ pattern }) =>
      pattern.test(speechMessage),
    );

    if (matchedError) {
      return matchedError.createError(speechMessage);
    }

    return new SpeechToTextError(
      `Speech-to-Text API Error: ${statusCode}`,
      statusCode,
      speechMessage,
    );
  }
}

export class NoMatchError extends SpeechToTextError {
  constructor(speechMessage: string) {
    super('No speech match found', 400, speechMessage);
    this.name = 'NoMatchError';
  }
}

export class InsufficientAudioError extends SpeechToTextError {
  constructor(speechMessage: string) {
    super('Insufficient audio quality', 400, speechMessage);
    this.name = 'InsufficientAudioError';
  }
}

export class AudioConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioConversionError';
  }
}
