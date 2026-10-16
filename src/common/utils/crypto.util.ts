import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class CryptoUtil {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns base64 string containing: IV (16B) + AuthTag (16B) + ciphertext.
   */
  static encrypt(plaintext: string, key: string): string {
    const iv = randomBytes(CryptoUtil.IV_LENGTH);
    const cipher = createCipheriv(
      CryptoUtil.ALGORITHM,
      Buffer.from(key, 'base64'),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  /**
   * Decrypts base64-encoded ciphertext produced by encrypt().
   * Extracts IV, AuthTag, and decrypts using AES-256-GCM.
   */
  static decrypt(encryptedData: string, key: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');

    const iv = buffer.subarray(0, 16);
    const authTag = buffer.subarray(16, 32);
    const encrypted = buffer.subarray(32);

    const decipher = createDecipheriv(
      CryptoUtil.ALGORITHM,
      Buffer.from(key, 'base64'),
      iv,
    );
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  static decryptLGS(encryptedDataStr: string, key: string): string {
    const secretKey = Buffer.from(key, 'base64');

    const parts = encryptedDataStr.split('$$');

    const iv = Buffer.from(parts[0], 'base64');
    const ciphertext = Buffer.from(parts[1], 'base64');
    const authTag = Buffer.from(parts[2], 'base64');

    const decipher = createDecipheriv(CryptoUtil.ALGORITHM, secretKey, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  // Encrypt LGS Lead
  static encryptGCM256(plaintext: string, key: string): string {
    const secretKey = Buffer.from(key, 'base64');

    const iv = randomBytes(12);
    const cipher = createCipheriv(CryptoUtil.ALGORITHM, secretKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return (
      iv.toString('base64') +
      '$$' +
      encrypted.toString('base64') +
      '$$' +
      authTag.toString('base64')
    );
  }
}
