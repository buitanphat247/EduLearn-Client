/**
 * Utility functions for working with cookies
 */

// Cache cookie string để tránh đọc document.cookie nhiều lần
let cachedCookieString: string | null = null;
let cachedCookieTimestamp: number = 0;
const COOKIE_CACHE_DURATION = 100; // 100ms cache

// Cache parsed cookies để tránh parse lại nhiều lần
let parsedCookiesCache: Map<string, string | null> = new Map();
let parsedCookiesTimestamp: number = 0;
const PARSED_COOKIES_CACHE_DURATION = 50; // 50ms cache cho parsed cookies

/**
 * Get a cookie value by name (optimized with double cache)
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  
  const now = Date.now();
  
  // Check parsed cookies cache first (fastest)
  if (now - parsedCookiesTimestamp < PARSED_COOKIES_CACHE_DURATION) {
    const cached = parsedCookiesCache.get(name);
    if (cached !== undefined) {
      return cached;
    }
  }
  
  // Cache cookie string trong 100ms để tránh đọc document.cookie nhiều lần
  if (!cachedCookieString || now - cachedCookieTimestamp > COOKIE_CACHE_DURATION) {
    cachedCookieString = document.cookie;
    cachedCookieTimestamp = now;
    // Clear parsed cache khi cookie string thay đổi
    parsedCookiesCache.clear();
  }
  
  // Parse cookie string
  const value = `; ${cachedCookieString}`;
  const parts = value.split(`; ${name}=`);
  
  let result: string | null = null;
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift() || null;
    if (cookieValue) {
      try {
        result = decodeURIComponent(cookieValue);
      } catch {
        result = cookieValue;
      }
    }
  }
  
  // Cache parsed result
  parsedCookiesCache.set(name, result);
  parsedCookiesTimestamp = now;
  
  return result;
};

/**
 * Clear cookie cache (dùng khi cookie thay đổi)
 */
export const clearCookieCache = (): void => {
  cachedCookieString = null;
  cachedCookieTimestamp = 0;
  parsedCookiesCache.clear();
  parsedCookiesTimestamp = 0;
};

// Cache để lưu user data đã giải mã (tránh gọi API nhiều lần)
let cachedUserData: { user_id: number | string; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
// Flag để tránh gọi async nhiều lần cùng lúc
let isDecrypting = false;
// Promise cache để tránh gọi API decrypt nhiều lần cùng lúc
let decryptPromise: Promise<number | string | null> | null = null;

/**
 * Get user ID from cookie (sync version - giải mã cookie "_u" đã mã hóa)
 * Tự động trigger async decrypt nếu cần và cache kết quả cho lần sau
 */
export const getUserIdFromCookie = (): number | string | null => {
  if (typeof window === "undefined") return null;

  // 1. Kiểm tra cache (nếu còn valid)
  if (cachedUserData && Date.now() - cachedUserData.timestamp < CACHE_DURATION) {
    return cachedUserData.user_id;
  }

  // 2. Thử lấy từ cookie "_u" (đã mã hóa) - giải mã qua API
  const encryptedUserCookie = getCookie("_u");
  if (encryptedUserCookie && !isDecrypting && !decryptPromise) {
    isDecrypting = true;
    // Sử dụng promise cache để tránh gọi API nhiều lần cùng lúc
    decryptPromise = getUserIdFromCookieAsync()
      .then((userId) => {
        isDecrypting = false;
        decryptPromise = null;
        // Trigger event để các component biết đã có user_id
        if (typeof window !== "undefined" && userId) {
          window.dispatchEvent(new CustomEvent("user_id_cached"));
        }
        return userId;
      })
      .catch((error) => {
        isDecrypting = false;
        decryptPromise = null;
        throw error;
      });
  }

  // Trả về từ cache nếu có (có thể null lần đầu nếu chưa giải mã xong)
  return cachedUserData?.user_id || null;
};

/**
 * Get user ID from encrypted cookie (async version - giải mã cookie "_u")
 * Ưu tiên cache, nếu không có thì gọi API để giải mã
 */
export const getUserIdFromCookieAsync = async (): Promise<number | string | null> => {
  if (typeof window === "undefined") return null;

  // 1. Kiểm tra cache (nếu còn valid)
  if (cachedUserData && Date.now() - cachedUserData.timestamp < CACHE_DURATION) {
    return cachedUserData.user_id;
  }

  // 2. Thử lấy từ cookie "_u" (đã mã hóa) - giải mã qua API
  const encryptedUserCookie = getCookie("_u");
  if (encryptedUserCookie) {
    try {
      const response = await fetch("/api-proxy/auth/decrypt-user");
      const data = await response.json();
      
      if (data.status && data.data && data.data.user_id) {
        const parsed = Number(data.data.user_id);
        const userId = isNaN(parsed) ? data.data.user_id : parsed;
        // Cache lại
        cachedUserData = { user_id: userId, timestamp: Date.now() };
        return userId;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error decrypting user cookie:", error);
      }
    }
  }

  return null;
};

/**
 * Clear cache (dùng khi logout hoặc user data thay đổi)
 */
export const clearUserCache = (): void => {
  cachedUserData = null;
  isDecrypting = false;
  decryptPromise = null;
  clearCookieCache();
};
