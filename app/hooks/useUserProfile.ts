import { useEffect, useCallback } from "react";
import { message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserInfo, type UserInfoResponse } from "@/lib/api/users";
import { useUserId } from "@/app/hooks/useUserId";

interface UseUserProfileOptions {
  showError?: boolean;
}

/**
 * Custom hook to fetch user profile and handle common auth errors.
 * Re-written to use TanStack Query for optimal caching and state management.
 */
export function useUserProfile(options: UseUserProfileOptions = { showError: false }) {
  const { userId, loading: userIdLoading } = useUserId();
  const queryClient = useQueryClient();

  const {
    data: userInfo,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<UserInfoResponse, Error>({
    queryKey: ["userProfile", userId],
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    queryFn: () => getUserInfo(userId!),
    enabled: !!userId && !userIdLoading,
    staleTime: 30 * 1000, // 30s
  });

  // Handle error showing logic
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const authCodes = ["TOKEN_REVOKED", "REFRESH_TOKEN_EXPIRED", "INVALID_REFRESH_TOKEN", "USER_BANNED"];
      const isAuthRedirect = authCodes.includes(err?.code ?? "") || err?.message === "Phiên đăng nhập đã bị đăng xuất khỏi hệ thống";

      const errorMessage = err?.message || "Không thể tải thông tin người dùng";

      if (options.showError && !isAuthRedirect) {
        message.error(errorMessage);
      }

      if (!isAuthRedirect) {
        console.error("Error fetching user info:", err);
      }
    }
  }, [error, options.showError]);

  const fetchUserInfo = useCallback(async () => {
    if (!userId) {
      if (options.showError && !userIdLoading) {
        message.error("Không tìm thấy thông tin người dùng");
      }
      return;
    }

    // We can force refetch if needed
    await refetch();
  }, [userId, userIdLoading, options.showError, refetch]);

  // Listen for user updates to invalidate query
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    };
    window.addEventListener("user-updated", handleUpdate);
    return () => window.removeEventListener("user-updated", handleUpdate);
  }, [queryClient, userId]);

  const setUserInfo = useCallback(
    (newInfo: UserInfoResponse | null) => {
      queryClient.setQueryData(["userProfile", userId], newInfo);
    },
    [queryClient, userId],
  );

  return {
    userInfo: userInfo || null,
    loading: loading || userIdLoading,
    error,
    fetchUserInfo,
    setUserInfo,
  };
}
