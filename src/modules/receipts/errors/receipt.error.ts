export class DuplicateReceiptError extends Error {
  constructor() {
    super('Duplicate receipt detected');
    this.name = 'DuplicateReceiptError';
  }
}
