/**
 * Cookie utility functions
 * @module lib/utils/cookies
 * @description Provides optimized cookie operations with caching and session storage support
 *
 * Features:
 * - Double-layer caching (cookie string + parsed cookies)
 * - LRU cache for parsed cookies to prevent memory leaks
 * - Session storage integration for user ID caching
 * - Async cookie decryption with promise caching
 */

// Cache cookie string để tránh đọc document.cookie nhiều lần
let cachedCookieString: string | null = null;
let cachedCookieTimestamp: number = 0;
const COOKIE_CACHE_DURATION = 100; // 100ms cache

// ✅ LRU Cache for parsed cookies to prevent memory leaks
const MAX_CACHE_SIZE = 100; // Max number of cached cookies

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

let parsedCookiesCache: LRUCache<string, string | null> = new LRUCache(MAX_CACHE_SIZE);
let parsedCookiesTimestamp: number = 0;
const PARSED_COOKIES_CACHE_DURATION = 50; // 50ms cache cho parsed cookies

/**
 * Get a cookie value by name (optimized with double cache)
 * @param {string} name - Cookie name to retrieve
 * @returns {string | null} Cookie value or null if not found
 * @description Uses LRU cache and cookie string cache for optimal performance
 * @example
 * ```typescript
 * const userId = getCookie('_u');
 * ```
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

  // ✅ Use regex for efficient cookie parsing
  const match = cachedCookieString.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  let result: string | null = null;
  if (match) {
    try {
      result = decodeURIComponent(match[1]);
    } catch {
      result = match[1];
    }
  }

  // Cache parsed result
  parsedCookiesCache.set(name, result);
  parsedCookiesTimestamp = now;

  return result;
};

/**
 * Clear cookie cache (dùng khi cookie thay đổi)
 * @description Clears both cookie string cache and parsed cookies cache
 * Should be called when cookies are modified to ensure fresh data
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
// ✅ Promise cache với timeout và cleanup
let decryptPromise: Promise<number | string | null> | null = null;
let decryptPromiseTimestamp = 0;
const DECRYPT_PROMISE_TTL = 5000; // 5 seconds timeout for promise cache

// ✅ Clear stale promise
const clearStalePromise = (): void => {
  const now = Date.now();
  if (decryptPromise && now - decryptPromiseTimestamp > DECRYPT_PROMISE_TTL) {
    decryptPromise = null;
    isDecrypting = false;
    decryptPromiseTimestamp = 0;
  }
};

/**
 * Get user ID from sessionStorage (nhanh nhất, không cần decrypt)
 * @returns {number | string | null} User ID from sessionStorage or null if not found
 * @description Fastest method to get user ID, uses sessionStorage cache
 * @example
 * ```typescript
 * const userId = getUserIdFromSession();
 * ```
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
    if (process.env.NODE_ENV === "development") {
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
    if (process.env.NODE_ENV === "development") {
      console.warn("Cannot save to sessionStorage:", error);
    }
  }
};

/**
 * Get full user data from sessionStorage
 * @returns {any | null} User data object or null if not found
 * @description Retrieves complete user data from session storage
 */
export const getUserDataFromSession = (): any | null => {
  if (typeof window === "undefined") return null;

  try {
    const userDataStr = sessionStorage.getItem(SESSION_USER_DATA_KEY);
    if (userDataStr) {
      return JSON.parse(userDataStr);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cannot read user data from sessionStorage:", error);
    }
  }

  return null;
};

/**
 * Save full user data to sessionStorage
 * @param {any} userData - User data object to save
 * @description Saves user data to sessionStorage and automatically caches user ID
 */
export const saveUserDataToSession = (userData: any): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(SESSION_USER_DATA_KEY, JSON.stringify(userData));
    if (userData.user_id) {
      saveUserIdToSession(userData.user_id);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cannot save user data to sessionStorage:", error);
    }
  }
};

/**
 * Get user ID from cookie (sync version - giải mã cookie "_u" đã mã hóa)
 * Ưu tiên sessionStorage, nếu không có thì trigger async decrypt
 * @returns {number | string | null} User ID or null if not found
 * @description Sync version that checks sessionStorage first, then triggers async decrypt if needed
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

  // ✅ Clear stale promise before checking
  clearStalePromise();

  if (encryptedUserCookie) {
    // ✅ Return existing promise if available
    if (decryptPromise) {
      return null; // Return null, but promise is already running
    }

    if (!isDecrypting) {
      isDecrypting = true;
      decryptPromiseTimestamp = Date.now();
      // Sử dụng promise cache để tránh gọi API nhiều lần cùng lúc
      decryptPromise = getUserIdFromCookieAsync()
        .then((userId) => {
          isDecrypting = false;
          decryptPromise = null;
          decryptPromiseTimestamp = 0;
          // Trigger event để các component biết đã có user_id
          if (typeof window !== "undefined" && userId) {
            window.dispatchEvent(new CustomEvent("user_id_cached", { detail: userId }));
          }
          return userId;
        })
        .catch((error) => {
          isDecrypting = false;
          decryptPromise = null;
          decryptPromiseTimestamp = 0;
          throw error;
        });
    }
  }

  return null;
};

/**
 * Get user ID from encrypted cookie (async version - giải mã cookie "_u")
 * Ưu tiên sessionStorage, nếu không có thì gọi API để giải mã và lưu vào sessionStorage
 * @returns {Promise<number | string | null>} Promise resolving to user ID or null
 * @description Async version that decrypts cookie via API and caches result in sessionStorage
 * @example
 * ```typescript
 * const userId = await getUserIdFromCookieAsync();
 * ```
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
      // ✅ Add timeout to prevent stuck promises
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const { getApiBaseUrl } = await import("@/app/config/api-base-url");
      const response = await fetch(`${getApiBaseUrl()}/auth/decrypt-user`, {
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);

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
      // ✅ Clear promise on error to prevent stuck state
      decryptPromise = null;
      isDecrypting = false;
      decryptPromiseTimestamp = 0;

      if (process.env.NODE_ENV === "development") {
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
      if (process.env.NODE_ENV === "development") {
        console.warn("Cannot clear sessionStorage:", error);
      }
    }
  }
};
