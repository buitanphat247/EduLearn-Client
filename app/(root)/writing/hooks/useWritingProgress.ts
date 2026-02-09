import { useCallback } from "react";
import { updateWritingHistoryIndex } from "@/lib/api/writing";

/**
 * Custom hook for managing writing practice progress
 * Handles both history ID and session storage updates
 * @param id - Writing practice ID
 * @returns Progress update function
 */
export function useWritingProgress(id: string) {
  const isHistoryId = /^\d+$/.test(id);

  const updateProgress = useCallback(
    async (newIndex: number): Promise<void> => {
      if (isHistoryId) {
        // Update via API for history records
        try {
          const historyId = parseInt(id, 10);
          await updateWritingHistoryIndex(historyId, newIndex);
        } catch (error: any) {
          console.error("Error updating current_index:", error);
          throw error;
        }
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
    [id, isHistoryId],
  );

  return { updateProgress };
}
