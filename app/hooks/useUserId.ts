import { useState, useEffect } from "react";
import { getUserIdFromCookieAsync, getUserIdFromSession } from "@/lib/utils/cookies";

/**
 * Hook để lấy user_id từ cookie (đợi decrypt hoàn thành)
 * Sử dụng sessionStorage để tối ưu, tránh gọi API decrypt nhiều lần
 * SessionStorage tự động xóa khi đóng trình duyệt
 */
export function useUserId() {
  // Kiểm tra sessionStorage ngay lập tức (sync, không cần đợi)
  const [userId, setUserId] = useState<number | string | null>(() => {
    if (typeof window !== "undefined") {
      return getUserIdFromSession();
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    // Nếu đã có trong sessionStorage thì không cần loading
    if (typeof window !== "undefined") {
      return !getUserIdFromSession();
    }
    return true;
  });

  useEffect(() => {
    let mounted = true;

    // Nếu đã có trong sessionStorage thì không cần fetch
    if (userId) {
      setLoading(false);
      return;
    }

    const fetchUserId = async () => {
      try {
        const id = await getUserIdFromCookieAsync();
        if (mounted) {
          setUserId(id);
          setLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error getting user ID:", error);
        }
        if (mounted) {
          setUserId(null);
          setLoading(false);
        }
      }
    };

    fetchUserId();

    // Listen for cache events (khi decrypt xong từ component khác)
    const handleCacheEvent = () => {
      if (mounted) {
        const sessionId = getUserIdFromSession();
        if (sessionId) {
          setUserId(sessionId);
          setLoading(false);
        } else {
          getUserIdFromCookieAsync().then((id) => {
            if (mounted) {
              setUserId(id);
              setLoading(false);
            }
          });
        }
      }
    };

    window.addEventListener("user_id_cached", handleCacheEvent);

    return () => {
      mounted = false;
      window.removeEventListener("user_id_cached", handleCacheEvent);
    };
  }, []); // Chỉ chạy 1 lần khi mount

  return { userId, loading };
}
