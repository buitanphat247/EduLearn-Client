/**
 * Utility to cache image data (Base64) in localStorage for faster loading
 */

const CACHE_PREFIX = "img_cache_";
const MAX_CACHE_ITEMS = 20;

/**
 * Cache an image URL's data
 */
export const cacheImage = async (url: string): Promise<void> => {
  if (typeof window === "undefined" || !url) return;

  // Don't cache if already cached
  if (localStorage.getItem(CACHE_PREFIX + url)) return;

  // Prevent CORS errors: Only cache local/relative or same-origin URLs
  // If url is external (http/https) and not same origin, skip.
  if (url.startsWith("http")) {
    const origin = window.location.origin;
    if (!url.startsWith(origin)) return;
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Only cache small images (e.g. avatars < 200KB)
    if (blob.size > 200 * 1024) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;

      // Cleanup old entries if we exceed limit
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      if (keys.length >= MAX_CACHE_ITEMS) {
        localStorage.removeItem(keys[0]);
      }

      try {
        localStorage.setItem(CACHE_PREFIX + url, base64data);
      } catch (e) {
        // LocalStorage full
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    // Ignore fetch errors
  }
};

/**
 * Get cached image data or the original URL
 */
export const getCachedImageUrl = (url: string): string => {
  if (typeof window === "undefined" || !url) return url;

  const cached = localStorage.getItem(CACHE_PREFIX + url);
  if (cached) return cached;

  // If not cached, trigger background cache for next time
  cacheImage(url);
  return url;
};
