import { useCallback } from "react";
import { useUpdateWritingProgressMutation } from "@/hooks/queries/useWritingQuery";

/**
 * Custom hook for managing writing practice progress.
 * - If `id` is a numeric history ID → uses React Query mutation (with cache update)
 * - If `id` is non-numeric → updates sessionStorage directly
 */
export function useWritingProgress(id: string) {
  const isHistoryId = /^\d+$/.test(id);
  const historyIdNum = isHistoryId ? parseInt(id, 10) : 0;
  const mutation = useUpdateWritingProgressMutation();

  const updateProgress = useCallback(
    async (newIndex: number): Promise<void> => {
      if (isHistoryId && historyIdNum > 0) {
        // Use React Query mutation for API updates
        await mutation.mutateAsync({ historyId: historyIdNum, currentIndex: newIndex });
      } else {
        // Update session storage for temporary sessions
        const storedData = sessionStorage.getItem(`writing_${id}`);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            parsed.current_index = newIndex;
            sessionStorage.setItem(`writing_${id}`, JSON.stringify(parsed));
          } catch (e) {
            console.error("Error updating sessionStorage:", e);
            throw e;
          }
        }
      }
    },
    [id, isHistoryId, historyIdNum, mutation],
  );

  return { updateProgress };
}
