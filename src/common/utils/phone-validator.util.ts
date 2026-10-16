export class PhoneValidator {
  static isValid(phone: string): boolean {
    return /^0\d{9}$/.test(phone);
  }

  static normalize(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }
}
