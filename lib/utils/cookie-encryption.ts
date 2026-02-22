/**
 * Utility để giải mã cookie đã được mã hóa bởi backend
 * Sử dụng API endpoint để giải mã (vì Web Crypto API không hỗ trợ AES-CBC)
 */

import { getApiBaseUrl } from "@/app/config/api-base-url";

/**
 * Giải mã dữ liệu đã được mã hóa bằng cách gọi API endpoint
 * @param encryptedText - Chuỗi đã mã hóa (format: iv:encryptedData)
 * @returns Dữ liệu đã giải mã
 */
export async function decryptCookie(encryptedText: string): Promise<string> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/decrypt-cookie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptedText }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Decryption API failed: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend wraps response: { data: { decrypted } } hoặc trả thẳng { decrypted }
    return data.data?.decrypted ?? data.decrypted;
  } catch (error: any) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Lấy và giải mã accessToken từ cookie
 */
export async function getDecryptedAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    // Lấy cookie (tên cookie đã đổi thành _at để khó đoán)
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_at' && value) {
        // Giải mã qua API
        const decrypted = await decryptCookie(decodeURIComponent(value));
        return decrypted;
      }
    }
  } catch (error) {
    console.error('Error decrypting accessToken:', error);
  }
  
  return null;
}

/**
 * Lấy và giải mã user info từ cookie
 */
export async function getDecryptedUser(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    // Lấy cookie (tên cookie đã đổi thành _u để khó đoán)
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_u' && value) {
        // Giải mã qua API
        const decrypted = await decryptCookie(decodeURIComponent(value));
        return JSON.parse(decrypted);
      }
    }
  } catch (error) {
    console.error('Error decrypting user cookie:', error);
  }
  
  return null;
}
