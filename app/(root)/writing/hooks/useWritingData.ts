import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { getWritingHistoryById, type WritingGenerateResponse } from "@/lib/api/writing";

interface UseWritingDataReturn {
  data: WritingGenerateResponse | null;
  loading: boolean;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

/**
 * Custom hook for loading writing practice data
 * Handles both history ID and session storage
 * @param id - Writing practice ID (history ID or session ID)
 * @returns Writing data and loading state
 */
export function useWritingData(id: string): UseWritingDataReturn {
  const router = useRouter();
  const { message } = App.useApp();

  const [data, setData] = useState<WritingGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadFromHistory = useCallback(
    async (historyId: number) => {
      try {
        const response = await getWritingHistoryById(historyId);

        if (response.status === 200 && response.data) {
          const historyData = response.data;
          const contentData = historyData.data;

          const mappedData: WritingGenerateResponse = {
            id: contentData.id || id.toString(),
            language: contentData.language || "English",
            contentType: contentData.contentType || "DIALOGUE",
            difficulty: contentData.difficulty || 2,
            englishSentences: contentData.englishSentences || [],
            vietnameseSentences: contentData.vietnameseSentences || [],
            totalSentences: contentData.totalSentences || 0,
            userPoints: contentData.userPoints || 0,
            practiceType: contentData.practiceType || null,
            topic: contentData.topic || "",
          };

          setData(mappedData);

          if (historyData.current_index !== undefined && typeof historyData.current_index === "number") {
            setCurrentIndex(historyData.current_index);
          }
        } else {
          message.error(response.message || "Không tìm thấy dữ liệu bài luyện");
          router.push("/writing");
        }
      } catch (error: any) {
        console.error("Error fetching history:", error);
        message.error(error?.message || "Không thể tải dữ liệu bài luyện");
        router.push("/writing");
      }
    },
    [id, message, router],
  );

  const loadFromSession = useCallback(() => {
    const storedData = sessionStorage.getItem(`writing_${id}`);
    if (storedData) {
      try {
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

        setData(mappedData);

        if (parsed.current_index !== undefined && typeof parsed.current_index === "number") {
          setCurrentIndex(parsed.current_index);
        }
      } catch (e) {
        console.error("Error parsing stored data:", e);
        message.error("Không thể tải dữ liệu bài luyện");
        router.push("/writing");
      }
    } else {
      message.error("Không tìm thấy dữ liệu bài luyện. Vui lòng chọn lại từ danh sách.");
      router.push("/writing");
    }
  }, [id, message, router]);

  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy ID bài luyện tập");
      router.push("/writing");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      const isHistoryId = /^\d+$/.test(id);

      if (isHistoryId) {
        await loadFromHistory(parseInt(id, 10));
      } else {
        loadFromSession();
      }

      setLoading(false);
    };

    loadData();
  }, [id, loadFromHistory, loadFromSession, message, router]);

  return {
    data,
    loading,
    currentIndex,
    setCurrentIndex,
  };
}
