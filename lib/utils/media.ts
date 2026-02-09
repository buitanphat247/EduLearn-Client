/**
 * Media utility functions
 */

export const R2_PUBLIC_URL = "https://pub-3aaf3c9cd7694383ab5e47980be6dc67.r2.dev";

/** Base path cho API proxy ảnh (tránh CORS khi load từ r2.dev) */
const PROXY_IMAGE_PATH = "/api/proxy-image";

/**
 * Bật proxy ảnh R2 qua same-origin (mặc định true để tránh CORS).
 * Đặt NEXT_PUBLIC_USE_IMAGE_PROXY=false nếu đã cấu hình CORS trên bucket R2
 * (Cloudflare R2 → bucket → Settings → CORS policy cho phép origin của bạn).
 */
const USE_IMAGE_PROXY = process.env.NEXT_PUBLIC_USE_IMAGE_PROXY !== "false";

/**
 * Trả về URL tuyệt đối từ R2 (dùng nội bộ hoặc khi cần URL gốc).
 */
function getAbsoluteR2Url(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${R2_PUBLIC_URL}${path}`;
  }
  return `${R2_PUBLIC_URL}/${path}`;
}

/**
 * Trả về URL ảnh (R2). Mặc định qua proxy để tránh CORS; có thể dùng trực tiếp R2 nếu đã cấu hình CORS.
 *
 * @param path - Đường dẫn ảnh (relative hoặc absolute URL từ R2)
 * @param useProxy - undefined = theo env NEXT_PUBLIC_USE_IMAGE_PROXY (mặc định true); true/false = ghi đè
 * @returns URL dùng trong src của img
 */
export const getMediaUrl = (
  path: string | null | undefined,
  useProxy?: boolean
): string => {
  if (!path) return "";

  const absoluteUrl = getAbsoluteR2Url(path);
  const shouldProxy = useProxy ?? USE_IMAGE_PROXY;

  if (!shouldProxy) {
    return absoluteUrl;
  }

  return `${PROXY_IMAGE_PATH}?url=${encodeURIComponent(absoluteUrl)}`;
};
