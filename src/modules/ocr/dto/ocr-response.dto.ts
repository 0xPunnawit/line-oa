import { IsNumber, IsOptional, IsString } from 'class-validator';
import { InvalidReceiptFieldsError } from '../errors/ocr.error';

export class OcrResponseDto {
  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  seller: string | null;

  @IsString()
  receiptDate: string;

  @IsString()
  receiptNo: string;

  constructor(
    total: number,
    receiptDate: string,
    receiptNo: string,
    seller: string | null = null,
  ) {
    this.total = total;
    this.receiptDate = receiptDate;
    this.receiptNo = receiptNo;
    this.seller = seller;
  }

  static fromApiResponse(data: unknown): OcrResponseDto {
    const record = data as Record<string, unknown>;
    const total = Number(record.total);

    if (isNaN(total)) {
      throw new Error('OCR API returned invalid total value');
    }

    const receiptDate =
      typeof record.date === 'string'
        ? record.date
        : typeof record.receiptDate === 'string'
          ? record.receiptDate
          : '';

    let receiptNo = '';
    if (typeof record.receiptNo === 'string') {
      receiptNo = record.receiptNo;
    } else if (Array.isArray(record.data) && record.data.length > 0) {
      const firstData = record.data[0] as Record<string, unknown>;
      if (typeof firstData.receiptNo === 'string') {
        receiptNo = firstData.receiptNo;
      }
    }

    const seller = typeof record.seller === 'string' ? record.seller : null;

    if (!receiptDate || !receiptNo) {
      const missing: string[] = [];
      if (!receiptDate) missing.push('receiptDate');
      if (!receiptNo) missing.push('receiptNo');
      throw new InvalidReceiptFieldsError(missing);
    }

    return new OcrResponseDto(total, receiptDate, receiptNo, seller);
  }
}
