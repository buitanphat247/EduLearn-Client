import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDocuments, type DocumentResponse } from "@/lib/services/documents";

export const documentKeys = {
  all: ["documents"] as const,
  list: (filters: { page: number; limit: number; search?: string }) => [...documentKeys.all, "list", filters] as const,
};

interface UseDocumentsQueryParams {
  page: number;
  limit: number;
  search?: string;
  enabled?: boolean;
}

/**
 * React Query hook for paginated documents.
 * Uses `keepPreviousData` for smooth pagination transitions.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useDocumentsQuery({ page: 1, limit: 20, search: debouncedSearch });
 * ```
 */
export function useDocumentsQuery({ page, limit, search, enabled = true }: UseDocumentsQueryParams) {
  return useQuery({
    queryKey: documentKeys.list({ page, limit, search }),
    queryFn: () => getDocuments({ page, limit, search: search || undefined }),
    enabled,
    placeholderData: keepPreviousData, // Keep showing old data during page transitions
    staleTime: 30 * 1000, // 30 seconds
  });
}
