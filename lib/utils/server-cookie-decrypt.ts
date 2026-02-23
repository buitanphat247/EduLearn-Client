import * as crypto from "crypto";

/**
 * Giải mã cookie ở server-side (Next.js)
 * Sử dụng cùng algorithm và key derivation như backend NestJS (EncryptionService)
 *
 * Backend dùng: direct key with pad/truncate to 32 bytes
 * → Server-side decrypt PHẢI dùng cùng phương pháp để SSR không bị fail
 */
export function decryptCookie(encryptedText: string): string {
  const ENCRYPTION_KEY = process.env.COOKIE_ENCRYPTION_KEY;

  if (!ENCRYPTION_KEY) {
    throw new Error("COOKIE_ENCRYPTION_KEY environment variable is required");
  }

  const algorithm = "aes-256-cbc";

  // Tách IV và encrypted data (format: iv:encryptedData)
  const parts = encryptedText.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  // ✅ Primary method: Direct key (MUST match backend EncryptionService exactly)
  // Backend uses: key = Buffer.from(key.padEnd(32,'0')) or substring(0,32)
  let key: Buffer;
  if (ENCRYPTION_KEY.length < 32) {
    key = Buffer.from(ENCRYPTION_KEY.padEnd(32, "0"));
  } else if (ENCRYPTION_KEY.length > 32) {
    key = Buffer.from(ENCRYPTION_KEY.substring(0, 32));
  } else {
    key = Buffer.from(ENCRYPTION_KEY);
  }

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (primaryError: any) {
    // Fallback: scryptSync (in case future backend upgrades to this method)
    try {
      const scryptKey = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
      const decipher = crypto.createDecipheriv(algorithm, scryptKey, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (fallbackError: any) {
      throw new Error(`Cookie decryption failed. Primary: ${primaryError.message}. Fallback: ${fallbackError.message}`);
    }
  }
}
