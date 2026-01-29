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

// SessionStorage keys
const SESSION_USER_ID_KEY = "edulearn_user_id";
const SESSION_USER_DATA_KEY = "edulearn_user_data";

// Flag để tránh gọi async nhiều lần cùng lúc
let isDecrypting = false;
// Promise cache để tránh gọi API decrypt nhiều lần cùng lúc
let decryptPromise: Promise<number | string | null> | null = null;

/**
 * Get user ID from sessionStorage (nhanh nhất, không cần decrypt)
 */
export const getUserIdFromSession = (): number | string | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const userIdStr = sessionStorage.getItem(SESSION_USER_ID_KEY);
    if (userIdStr) {
      const parsed = Number(userIdStr);
      return isNaN(parsed) ? userIdStr : parsed;
    }
  } catch (error) {
    // sessionStorage có thể bị block trong một số trường hợp
    if (process.env.NODE_ENV === 'development') {
      console.warn("Cannot access sessionStorage:", error);
    }
  }
  
  return null;
};

/**
 * Save user ID to sessionStorage
 */
const saveUserIdToSession = (userId: number | string): void => {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.setItem(SESSION_USER_ID_KEY, String(userId));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Cannot save to sessionStorage:", error);
    }
  }
};

/**
 * Get full user data from sessionStorage
 */
export const getUserDataFromSession = (): any | null => {
  if (typeof window === "undefined") return null;
  
  try {
    const userDataStr = sessionStorage.getItem(SESSION_USER_DATA_KEY);
    if (userDataStr) {
      return JSON.parse(userDataStr);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Cannot read user data from sessionStorage:", error);
    }
  }
  
  return null;
};

/**
 * Save full user data to sessionStorage
 */
export const saveUserDataToSession = (userData: any): void => {
  if (typeof window === "undefined") return;
  
  try {
    sessionStorage.setItem(SESSION_USER_DATA_KEY, JSON.stringify(userData));
    if (userData.user_id) {
      saveUserIdToSession(userData.user_id);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Cannot save user data to sessionStorage:", error);
    }
  }
};

/**
 * Get user ID from cookie (sync version - giải mã cookie "_u" đã mã hóa)
 * Ưu tiên sessionStorage, nếu không có thì trigger async decrypt
 */
export const getUserIdFromCookie = (): number | string | null => {
  if (typeof window === "undefined") return null;

  // 1. Kiểm tra sessionStorage trước (nhanh nhất)
  const sessionUserId = getUserIdFromSession();
  if (sessionUserId) {
    return sessionUserId;
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

  return null;
};

/**
 * Get user ID from encrypted cookie (async version - giải mã cookie "_u")
 * Ưu tiên sessionStorage, nếu không có thì gọi API để giải mã và lưu vào sessionStorage
 */
export const getUserIdFromCookieAsync = async (): Promise<number | string | null> => {
  if (typeof window === "undefined") return null;

  // 1. Kiểm tra sessionStorage trước (nhanh nhất, không cần decrypt)
  const sessionUserId = getUserIdFromSession();
  if (sessionUserId) {
    return sessionUserId;
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
        
        // Lưu vào sessionStorage để tránh decrypt lại lần sau
        saveUserIdToSession(userId);
        
        // Lưu toàn bộ user data nếu có
        if (data.data) {
          saveUserDataToSession(data.data);
        }
        
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
  isDecrypting = false;
  decryptPromise = null;
  clearCookieCache();
  
  // Clear sessionStorage
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(SESSION_USER_ID_KEY);
      sessionStorage.removeItem(SESSION_USER_DATA_KEY);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Cannot clear sessionStorage:", error);
      }
    }
  }
};
