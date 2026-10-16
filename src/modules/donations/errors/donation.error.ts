export class DonationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'DonationError';
  }

  private static readonly ERROR_REGISTRY: Array<{
    pattern: RegExp;
    createError: (message: string) => DonationError;
  }> = [
    {
      pattern: /Insufficient points/i,
      createError: (message) => new InsufficientPointsError(message),
    },
    {
      pattern: /User not found/i,
      createError: (message) => new UserNotFoundError(message),
    },
    {
      pattern: /Donation not found/i,
      createError: (message) => new DonationNotFoundError(message),
    },
    {
      pattern: /already processed/i,
      createError: (message) => new DonationAlreadyProcessedError(message),
    },
  ];

  static fromMessage(message: string): DonationError {
    const matchedError = this.ERROR_REGISTRY.find(({ pattern }) =>
      pattern.test(message),
    );

    if (matchedError) {
      return matchedError.createError(message);
    }

    return new DonationError(message, 400);
  }
}

export class InsufficientPointsError extends DonationError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'InsufficientPointsError';
  }
}

export class UserNotFoundError extends DonationError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'UserNotFoundError';
  }
}

export class DonationNotFoundError extends DonationError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'DonationNotFoundError';
  }
}

export class DonationAlreadyProcessedError extends DonationError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'DonationAlreadyProcessedError';
  }
}
