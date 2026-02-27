/**
 * Bật/tắt module theo môi trường.
 * Prod: chỉ chạy super-admin; admin và user ẩn khỏi header và không truy cập được.
 * Set trong .env / .env.production:
 *   NEXT_PUBLIC_ENABLE_ADMIN=false
 *   NEXT_PUBLIC_ENABLE_USER=false
 *   NEXT_PUBLIC_ENABLE_SUPER_ADMIN=true
 */

const parseBool = (v: string | undefined, defaultVal: boolean): boolean => {
  if (v === undefined || v === "") return defaultVal;
  return v === "true" || v === "1";
};

const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

/** Mặc định prod: tắt admin & user, bật super-admin. Dev: bật hết. */
export const FEATURES = {
  /** Module Admin (portal Giảng viên) */
  admin: parseBool(
    process.env.NEXT_PUBLIC_ENABLE_ADMIN,
    !isProd
  ),
  /** Module User (portal Học sinh) */
  user: parseBool(
    process.env.NEXT_PUBLIC_ENABLE_USER,
    !isProd
  ),
  /** Module Super Admin */
  superAdmin: parseBool(
    process.env.NEXT_PUBLIC_ENABLE_SUPER_ADMIN,
    true
  ),
} as const;

export type Features = typeof FEATURES;

export function isModuleEnabled(module: keyof Features): boolean {
  return FEATURES[module];
}
