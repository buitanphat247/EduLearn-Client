import { useEffect, useRef } from "react";
import { saveListeningProgress, getListeningProgress } from "@/lib/api/lessons";
import { message } from "antd";

interface UseListeningProgressProps {
  lessonId: number | null;
  currentIdx: number;
  currentTime: number;
  setCurrentIdx: (idx: number) => void;
  setCurrentTime: (time: number) => void;
  totalChallenges: number;
}

export function useListeningProgress({
  lessonId,
  currentIdx,
  currentTime,
  setCurrentIdx,
  setCurrentTime,
  totalChallenges,
}: UseListeningProgressProps) {
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredRef = useRef(false);
  const isSavingRef = useRef(false);

  // Stable refs for callbacks
  const setCurrentIdxRef = useRef(setCurrentIdx);
  const setCurrentTimeRef = useRef(setCurrentTime);
  setCurrentIdxRef.current = setCurrentIdx;
  setCurrentTimeRef.current = setCurrentTime;

  // Latest values refs for save
  const currentIdxRef = useRef(currentIdx);
  const currentTimeRef = useRef(currentTime);
  const totalChallengesRef = useRef(totalChallenges);
  currentIdxRef.current = currentIdx;
  currentTimeRef.current = currentTime;
  totalChallengesRef.current = totalChallenges;

  // Load progress on mount - only depends on lessonId
  useEffect(() => {
    if (!lessonId || hasRestoredRef.current) return;

    let cancelled = false;

    const loadProgress = async () => {
      try {
        const response = await getListeningProgress(lessonId);

        if (cancelled) return;

        // Check if we actually have valid progress data
        // Backend returns the entity directly or null
        if (response && typeof response === "object" && "currentChallengeIndex" in response) {
          const progress = response as {
            currentChallengeIndex: number;
            currentTime: number;
            isCompleted: boolean;
          };

          // Only restore if there's actual progress (not default 0/0)
          const hasProgress = progress.currentChallengeIndex > 0 || progress.currentTime > 0;

          if (hasProgress) {
            if (progress.currentChallengeIndex >= 0) {
              setCurrentIdxRef.current(progress.currentChallengeIndex);
            }
            if (progress.currentTime >= 0) {
              setCurrentTimeRef.current(progress.currentTime);
            }
            message.success("Đã khôi phục tiến trình học tập");
          }
        }
        // If response is null/undefined or doesn't have the fields,
        // this is a new lesson - no message needed
      } catch (error) {
        console.error("Failed to load progress:", error);
      } finally {
        isInitialLoad.current = false;
        hasRestoredRef.current = true;
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // Save progress immediately (no debounce for index changes)
  useEffect(() => {
    if (!lessonId || isInitialLoad.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    // Save with a very short delay to batch rapid changes
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        const totalChals = totalChallengesRef.current;
        const idx = currentIdxRef.current;
        const time = currentTimeRef.current;

        await saveListeningProgress({
          lessonId,
          currentChallengeIndex: idx,
          currentTime: time,
          isCompleted: totalChals > 0 && idx >= totalChals - 1 && time > 0,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, 500); // 500ms - fast enough to feel immediate, slow enough to batch

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [lessonId, currentIdx]);

  // Save on unmount (capture final state)
  useEffect(() => {
    return () => {
      if (!lessonId || isInitialLoad.current) return;

      // Fire-and-forget save on unmount
      const idx = currentIdxRef.current;
      const time = currentTimeRef.current;
      const totalChals = totalChallengesRef.current;

      saveListeningProgress({
        lessonId,
        currentChallengeIndex: idx,
        currentTime: time,
        isCompleted: totalChals > 0 && idx >= totalChals - 1 && time > 0,
      }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);
}
