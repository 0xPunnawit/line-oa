/** All LINE reply message templates (Thai language) used throughout the bot */
export class LineMessages {
  static readonly NOT_REGISTERED = 'ยังไม่ได้สมัครสมาชิก กรุณา "register" ก่อน';
  static readonly REGISTER_SUCCESS = 'ลงทะเบียนสำเร็จ! ยินดีต้อนรับ';
  static readonly ALREADY_REGISTERED = 'คุณลงทะเบียนไปแล้ว';
  static readonly COMMAND_NOT_FOUND = 'unknow';
  static readonly ERROR_OCCURRED = 'เกิดข้อผิดพลาด ฝั่ง server';
  static readonly INVALID_INVOICE_IMAGE =
    'รูปภาพนี้ไม่ใช่ประเภทสลิปหรือใบเสร็จ';
  static readonly INVALID_TYPE_IMAGE = 'รับเฉพาะไฟล์ pdf และ jpg/jpeg เท่านั้น';
  static readonly INVALID_LARGE_IMAGE =
    'ไฟล์มีขนาดใหญ่เกินไป กรุณาลดขนาดไฟล์ ไม่เกิน 2mb';
  static readonly ERROR_RECEIPT = 'กรุณาตรวจสอบใบเสร็จของคุณ';
  static readonly DUPLICATE_RECEIPT = 'ใบเสร็จนี้ถูกบันทึกไปแล้ว';
  static readonly AUDIO_NOT_RECOGNIZED =
    'ไม่สามารถระบุเสียงได้ กรุณาลองใหม่ในสถานที่เงียบๆ';
  static readonly AUDIO_CONVERSION_FAILED =
    'ไม่สามารถแปลงไฟล์เสียงได้ กรุณาลองใหม่อีกครั้ง';
  static readonly AUDIO_QUALITY_POOR =
    'คุณภาพเสียงไม่เพียงพอ กรุณาบันทึกเสียงใหม่ให้ชัดเจน';
  static readonly SPEECH_TO_TEXT_ERROR =
    'เกิดข้อผิดพลาดในการแปลงเสียงเป็นข้อความ';
  static readonly DONATE_ASK_INFO =
    'กรุณาส่งเสียงอีกครั้ง พร้อมบอกเบอร์โทรและจำนวนแต้มที่จะบริจาค';
  static readonly DONATION_CONFIRM_SENT =
    'กรุณายืนยันการบริจาคของคุณ';
  static readonly DONATION_CONFIRMED =
    'ยืนยันการบริจาคสำเร็จ ขอบคุณสำหรับการบริจาค!';
  static readonly DONATION_CANCELLED = 'ยกเลิกการบริจาค';
  static readonly DONATION_ALREADY_PROCESSED =
    'การบริจาคนี้ได้รับการยืนยันแล้ว ไม่สามารถกดยืนยันซ้ำได้';
  static readonly DONATION_FAILED =
    'เกิดข้อผิดพลาดในการบริจาค กรุณาลองใหม่อีกครั้ง';
  static readonly DONATION_INVALID_DATA =
    'ข้อมูลการบริจาคไม่ถูกต้อง กรุณาลองใหม่';
  static points(currentPoints: number): string {
    return `คะแนนของคุณคือ: ${currentPoints} แต้ม`;
  }

  static ocrResult(total: number, pointsEarned: number): string {
    return `ยอดเงินทั้งหมด: ${total} บาท\nคุณได้รับ + ${pointsEarned} คะแนน`;
  }

  static transcriptionResult(text: string): string {
    return `${text}`;
  }
}
