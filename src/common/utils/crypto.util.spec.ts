import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  const testKey = 'V1pzF6LT+wlZGMJZUC8jTwwrREO5cm/HDj0WnkeEHtY=';

  describe('encrypt', () => {
    it('should encrypt plaintext to base64 string', () => {
      const plaintext = 'hello world';
      const encrypted = CryptoUtil.encrypt(plaintext, testKey);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'hello world';
      const encrypted1 = CryptoUtil.encrypt(plaintext, testKey);
      const encrypted2 = CryptoUtil.encrypt(plaintext, testKey);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decrypt', () => {
    it('should decrypt ciphertext back to original plaintext', () => {
      const plaintext = 'hello world';
      const encrypted = CryptoUtil.encrypt(plaintext, testKey);
      const decrypted = CryptoUtil.decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt complex text correctly', () => {
      const plaintext =
        'สวัสดีครับ! This is a test with emoji 🎉 and special chars: @#$%';
      const encrypted = CryptoUtil.encrypt(plaintext, testKey);
      const decrypted = CryptoUtil.decrypt(encrypted, testKey);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error with invalid key', () => {
      const plaintext = 'hello world';
      const encrypted = CryptoUtil.encrypt(plaintext, testKey);
      const wrongKey = 'd3JvbmdrZXl3cm9uZ2tleXdyb25na2V5d3JvbmdrZXk=';

      expect(() => CryptoUtil.decrypt(encrypted, wrongKey)).toThrow();
    });
  });
});
