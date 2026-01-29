import * as crypto from 'crypto';

/**
 * Giải mã cookie ở server-side (Next.js)
 * Sử dụng cùng algorithm và key như backend NestJS
 */
export function decryptCookie(encryptedText: string): string {
  try {
    const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY || 'default-32-char-key-for-dev-only!!';
    
    // Đảm bảo key có đúng 32 bytes (256 bits) cho AES-256
    let key: Buffer;
    if (ENCRYPTION_KEY.length < 32) {
      key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0'));
    } else if (ENCRYPTION_KEY.length > 32) {
      key = Buffer.from(ENCRYPTION_KEY.substring(0, 32));
    } else {
      key = Buffer.from(ENCRYPTION_KEY);
    }

    const algorithm = 'aes-256-cbc';
    
    // Tách IV và encrypted data (format: iv:encryptedData)
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Tạo decipher
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    
    // Giải mã
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
