import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { useWritingHistoryByIdQuery } from "@/app/hooks/queries/useWritingQuery";
import type { WritingGenerateResponse } from "@/lib/api/writing";

interface UseWritingDataReturn {
  data: WritingGenerateResponse | null;
  loading: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

/**
 * Custom hook for loading writing practice data.
 * - If `id` is numeric → uses React Query to fetch from API (cached & deduplicated)
 * - If `id` is non-numeric → loads from sessionStorage (client-only, no query)
 */
export function useWritingData(id: string): UseWritingDataReturn {
  const router = useRouter();
  const { message } = App.useApp();

  const isHistoryId = /^\d+$/.test(id);
  const historyIdNum = isHistoryId ? parseInt(id, 10) : null;

  // ── React Query path (numeric history ID) ──
  const { data: queryResult, isLoading: queryLoading, isError: queryError, error: queryErrorObj } = useWritingHistoryByIdQuery(historyIdNum);

  // ── Session storage path (non-numeric ID) ──
  const [sessionData, setSessionData] = useState<WritingGenerateResponse | null>(null);
  const [sessionLoading, setSessionLoading] = useState(!isHistoryId);

  // ── Shared state for currentIndex ──
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync currentIndex from React Query result
  useEffect(() => {
    if (isHistoryId && queryResult) {
      setCurrentIndex(queryResult.currentIndex);
    }
  }, [isHistoryId, queryResult]);

  // Load from session storage for non-history IDs
  useEffect(() => {
    if (isHistoryId || !id || id === "undefined" || id === "null") {
      setSessionLoading(false);
      return;
    }

    try {
      const storedData = sessionStorage.getItem(`writing_${id}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const mappedData: WritingGenerateResponse = {
          id: parsed.id || id,
          language: parsed.language || "English",
          contentType: parsed.contentType || "DIALOGUE",
          difficulty: parsed.difficulty || 2,
          englishSentences: parsed.englishSentences || [],
          vietnameseSentences: parsed.vietnameseSentences || [],
          totalSentences: parsed.totalSentences || 0,
          userPoints: parsed.userPoints || 0,
          practiceType: parsed.practiceType || null,
          topic: parsed.topic || "",
        };
        setSessionData(mappedData);
        if (typeof parsed.current_index === "number") {
          setCurrentIndex(parsed.current_index);
        }
      } else {
        message.error("Không tìm thấy dữ liệu bài luyện. Vui lòng chọn lại từ danh sách.");
        router.push("/writing");
      }
    } catch {
      message.error("Không thể tải dữ liệu bài luyện");
      router.push("/writing");
    } finally {
      setSessionLoading(false);
    }
  }, [id, isHistoryId, message, router]);

  // Handle query error — redirect on failure
  useEffect(() => {
    if (queryError && isHistoryId) {
      const errMsg = queryErrorObj instanceof Error ? queryErrorObj.message : "Không thể tải dữ liệu bài luyện";
      message.error(errMsg);
      router.push("/writing");
    }
  }, [queryError, queryErrorObj, isHistoryId, message, router]);

  // ── Return unified interface ──
  const data = isHistoryId ? (queryResult?.data ?? null) : sessionData;
  const loading = isHistoryId ? queryLoading : sessionLoading;

  const handleSetCurrentIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return {
    data,
    loading,
    currentIndex,
    setCurrentIndex: handleSetCurrentIndex,
  };
}
