export interface DonateInfo {
  phoneNumber?: string;
  points?: number;
}

export class DonateMessageParser {
  static parse(message: string): DonateInfo {
    const result: DonateInfo = {};

    const phoneMatch = message.match(/0\d{9}/);
    if (phoneMatch) {
      result.phoneNumber = phoneMatch[0];
    }

    const pointsMatch = message.match(
      /(\d+)\s*(?:พ้อยท์|point|แต้ม|ไพรซ์|price|คะแนน)/i,
    );
    if (pointsMatch) {
      result.points = parseInt(pointsMatch[1], 10);
    } else {
      const amountMatch = message.match(/(?:จำนวน|จํานวน)\s*(\d+)/);
      if (amountMatch) {
        result.points = parseInt(amountMatch[1], 10);
      }
    }

    return result;
  }
}
