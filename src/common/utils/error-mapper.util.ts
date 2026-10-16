import {
  InvalidDocumentTypeError,
  InvalidTypeImageError,
  InvalidLargeImageError,
  InvalidReceiptFieldsError,
} from '../../modules/ocr/errors/ocr.error';
import { DuplicateReceiptError } from '../../modules/receipts/errors/receipt.error';
import {
  AudioConversionError,
  NoMatchError,
  InsufficientAudioError,
  SpeechToTextError,
} from '../../modules/speech-to-text/errors/speech-to-text.error';
import { LineMessages } from '../constants/line-messages.constant';

export class ErrorMapperUtil {
  static mapOcrError(error: unknown): string {
    if (error instanceof InvalidDocumentTypeError) {
      return LineMessages.INVALID_INVOICE_IMAGE;
    }
    if (error instanceof InvalidTypeImageError) {
      return LineMessages.INVALID_TYPE_IMAGE;
    }
    if (error instanceof InvalidLargeImageError) {
      return LineMessages.INVALID_LARGE_IMAGE;
    }
    if (error instanceof InvalidReceiptFieldsError) {
      return LineMessages.ERROR_RECEIPT;
    }
    if (error instanceof DuplicateReceiptError) {
      return LineMessages.DUPLICATE_RECEIPT;
    }
    return LineMessages.ERROR_OCCURRED;
  }

  static mapAudioError(error: unknown): string {
    if (error instanceof AudioConversionError) {
      return LineMessages.AUDIO_CONVERSION_FAILED;
    }
    if (error instanceof NoMatchError) {
      return LineMessages.AUDIO_NOT_RECOGNIZED;
    }
    if (error instanceof InsufficientAudioError) {
      return LineMessages.AUDIO_QUALITY_POOR;
    }
    if (error instanceof SpeechToTextError) {
      return LineMessages.SPEECH_TO_TEXT_ERROR;
    }
    return LineMessages.ERROR_OCCURRED;
  }

  static getErrorDetails(error: unknown): {
    type: string;
    message: string;
    stack?: string;
  } {
    const errorType =
      error instanceof Error ? error.constructor.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    return {
      type: errorType,
      message: errorMessage,
      stack: stackTrace,
    };
  }
}
