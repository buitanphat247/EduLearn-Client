import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";

interface UseUserProfileOptions {
  showError?: boolean;
}

/**
 * Custom hook to fetch user profile and handle common auth errors.
 * Used in LayoutClients to reduce code duplication.
 */
export function useUserProfile(options: UseUserProfileOptions = { showError: false }) {
  const { userId, loading: userIdLoading } = useUserId();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref to track if component is mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchUserInfo = useCallback(
    async (showLoading = false) => {
      if (!userId) {
        if (options.showError && !userIdLoading) {
          message.error("Không tìm thấy thông tin người dùng");
        }
        return;
      }

      if (showLoading && isMountedRef.current) setLoading(true);

      try {
        const user = await getUserInfo(userId);
        if (isMountedRef.current) {
          setUserInfo(user);
          setError(null);
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;

        const authCodes = ["TOKEN_REVOKED", "REFRESH_TOKEN_EXPIRED", "INVALID_REFRESH_TOKEN", "USER_BANNED"];
        const isAuthRedirect = authCodes.includes(err?.code ?? "") || err?.message === "Phiên đăng nhập đã bị đăng xuất khỏi hệ thống";

        const errorMessage = err?.message || "Không thể tải thông tin người dùng";

        setError(err);

        if (options.showError && !isAuthRedirect) {
          message.error(errorMessage);
        }

        if (!isAuthRedirect) {
          console.error("Error fetching user info:", err);
        }
      } finally {
        if (isMountedRef.current && showLoading) {
          setLoading(false);
        }
      }
    },
    [userId, userIdLoading, options.showError],
  );

  // Initial fetch when userId changes
  useEffect(() => {
    if (!userId || userIdLoading) return;
    fetchUserInfo(false);
  }, [userId, userIdLoading, fetchUserInfo]);

  // Listen for user updates
  useEffect(() => {
    const handleUpdate = () => {
      fetchUserInfo(false);
    };
    window.addEventListener("user-updated", handleUpdate);
    return () => window.removeEventListener("user-updated", handleUpdate);
  }, [fetchUserInfo]);

  return {
    userInfo,
    loading,
    error,
    fetchUserInfo,
    setUserInfo, // Expose setter just in case manual optimistic updates are needed
  };
}
