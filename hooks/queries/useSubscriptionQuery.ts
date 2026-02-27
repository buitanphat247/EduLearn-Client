import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "@/lib/services/subscription";
import { useUserId } from "@/hooks/useUserId";

export const subscriptionKeys = {
  all: ["subscription"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
};

/**
 * React Query hook for subscription status.
 * Replaces duplicated getSubscriptionStatus() calls across 6+ pages.
 *
 * Features:
 * - Cached: All vocabulary pages share the same cached result
 * - Deduplicated: 3 components mounting at once → 1 API call
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useSubscriptionQuery();
 * const isPro = data?.isPro ?? false;
 * ```
 */
export function useSubscriptionQuery() {
  const { userId, loading: userIdLoading } = useUserId();

  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: getSubscriptionStatus,
    enabled: !!userId && !userIdLoading,
    staleTime: 30 * 1000, // 30s
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  });
}
