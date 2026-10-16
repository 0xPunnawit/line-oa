/**
 * Base error class for OCR API failures.
 * Subclasses map to specific error patterns (invalid doc type, invalid file type, file too large).
 */
export class OcrError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly ocrMessage: string,
  ) {
    super(message);
    this.name = 'OcrError';
  }

  private static readonly ERROR_REGISTRY: Array<{
    pattern: RegExp;
    createError: (message: string) => OcrError;
  }> = [
    {
      pattern: /This Document is not INVOICE type/i,
      createError: (message) => new InvalidDocumentTypeError(message),
    },
    {
      pattern: /Only PDF and JPG\/JPEG files are allowed/i,
      createError: (message) => new InvalidTypeImageError(message),
    },
    {
      pattern: /413 Request Entity Too Large/i,
      createError: (message) => new InvalidLargeImageError(message),
    },
  ];

  /**
   * Factory: matches OCR error message against known patterns.
   * Returns specific OcrError subclass, or generic OcrError if no match.
   */
  static fromApiResponse(statusCode: number, ocrMessage: string): OcrError {
    const matchedError = this.ERROR_REGISTRY.find(({ pattern }) =>
      pattern.test(ocrMessage),
    );

    if (matchedError) {
      return matchedError.createError(ocrMessage);
    }

    return new OcrError(`OCR API Error: ${statusCode}`, statusCode, ocrMessage);
  }
}

/** Thrown when OCR detects the document is not an invoice/receipt */
export class InvalidDocumentTypeError extends OcrError {
  constructor(ocrMessage: string) {
    super('Invalid document type', 400, ocrMessage);
    this.name = 'InvalidDocumentTypeError';
  }
}

/** Thrown when the uploaded file is not PDF or JPG/JPEG */
export class InvalidTypeImageError extends OcrError {
  constructor(ocrMessage: string) {
    super('Invalid image type', 400, ocrMessage);
    this.name = 'InvalidTypeImageError';
  }
}

/** Thrown when the uploaded file exceeds the size limit (413) */
export class InvalidLargeImageError extends OcrError {
  constructor(ocrMessage: string) {
    super('Image too large', 400, ocrMessage);
    this.name = 'InvalidLargeImageError';
  }
}

/** Thrown when OCR response is missing required receipt fields (receiptDate, receiptNo) */
export class InvalidReceiptFieldsError extends OcrError {
  constructor(missingFields: string[]) {
    super(
      `Missing receipt fields: ${missingFields.join(', ')}`,
      400,
      `OCR response missing: ${missingFields.join(', ')}`,
    );
    this.name = 'InvalidReceiptFieldsError';
  }
}
