import { useState, useEffect } from "react";
import { getUserIdFromCookieAsync, getUserIdFromSession } from "@/lib/utils/cookies";

/**
 * Hook to get user ID from cookie (waits for decrypt to complete)
 * @description Uses sessionStorage for optimization to avoid calling decrypt API multiple times.
 * SessionStorage is automatically cleared when browser is closed.
 * 
 * @returns {Object} Object containing userId and loading state
 * @returns {number | string | null} returns.userId - User ID or null if not available
 * @returns {boolean} returns.loading - Loading state (true while fetching/decrypting)
 * 
 * @example
 * ```typescript
 * const { userId, loading } = useUserId();
 * 
 * if (loading) return <Spinner />;
 * if (!userId) return <LoginPrompt />;
 * return <Dashboard userId={userId} />;
 * ```
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

    // ✅ Listen for cache events (khi decrypt xong từ component khác)
    // ✅ Fix: Define handleCacheEvent inside useEffect để có stable reference
    const handleCacheEvent = () => {
      if (!mounted) return;
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
    };

    window.addEventListener("user_id_cached", handleCacheEvent);

    return () => {
      mounted = false;
      window.removeEventListener("user_id_cached", handleCacheEvent);
    };
  }, []); // ✅ Stable dependencies - handleCacheEvent defined inside

  return { userId, loading };
}
