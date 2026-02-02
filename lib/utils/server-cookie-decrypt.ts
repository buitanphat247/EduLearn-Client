import * as crypto from 'crypto';

/**
 * Giải mã cookie ở server-side (Next.js)
 * Sử dụng cùng algorithm và key như backend NestJS
 */
export function decryptCookie(encryptedText: string): string {
  const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY;
    
  // ✅ Validate encryption key
  if (!ENCRYPTION_KEY) {
    throw new Error('COOKIE_ENCRYPTION_KEY environment variable is required');
  }

    if (ENCRYPTION_KEY.length < 32) {
    throw new Error('COOKIE_ENCRYPTION_KEY must be at least 32 characters');
    }

    const algorithm = 'aes-256-cbc';
    
    // Tách IV và encrypted data (format: iv:encryptedData)
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
  // ✅ Try new method first (scryptSync - more secure)
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (scryptError: any) {
    // ✅ Fallback to old method for backward compatibility
    // This handles cookies encrypted with the old key derivation method
    try {
      // Old method: direct key with padding/substring (matching backend behavior)
      let key: Buffer;
      if (ENCRYPTION_KEY.length < 32) {
        key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0'));
      } else if (ENCRYPTION_KEY.length > 32) {
        key = Buffer.from(ENCRYPTION_KEY.substring(0, 32));
      } else {
        key = Buffer.from(ENCRYPTION_KEY);
      }
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (fallbackError: any) {
      // If both methods fail, throw error with both messages
      throw new Error(
        `Decryption failed with both methods. ScryptSync error: ${scryptError.message}. Fallback error: ${fallbackError.message}`
      );
    }
  }
}
