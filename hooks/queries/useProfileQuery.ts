import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/lib/services/auth";
import { useUserId } from "@/hooks/useUserId";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

/**
 * React Query hook for user profile data.
 * Replaces duplicated getProfile() calls across pages.
 *
 * Features:
 * - Cached: Navigate between pages → no re-fetch if data is fresh
 * - Deduplicated: Multiple components calling this → single API request
 * - Auto-refetch on window focus
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading } = useProfileQuery();
 * if (isLoading) return <Skeleton />;
 * const userId = profile?.user_id;
 * ```
 */
export function useProfileQuery() {
  const { userId, loading: userIdLoading } = useUserId();

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
    enabled: !!userId && !userIdLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes — profile rarely changes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
