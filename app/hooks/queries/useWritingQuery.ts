import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getWritingTopics,
  getWritingHistory,
  getWritingHistoryById,
  updateWritingHistoryIndex,
  generateWritingContent,
  type WritingGenerateConfig,
  type WritingGenerateResponse,
  type WritingHistoryItem,
} from "@/lib/api/writing";
import { getUsageStatusForFeature } from "@/lib/api/subscription";
import { getUserIdFromCookie } from "@/lib/utils/cookies";

// ─── Query Keys ──────────────────────────────────────────────────
export const writingKeys = {
  all: ["writing"] as const,
  topics: (category?: string) => [...writingKeys.all, "topics", category] as const,
  history: () => [...writingKeys.all, "history"] as const,
  historyList: (params: { page: number; limit: number }) => [...writingKeys.history(), "list", params] as const,
  historyById: (id: number) => [...writingKeys.history(), "detail", id] as const,
  usage: () => [...writingKeys.all, "usage"] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────

/** Fetch writing topics by category (general, ielts, work) */
export function useWritingTopicsQuery(category?: "general" | "ielts" | "work") {
  return useQuery({
    queryKey: writingKeys.topics(category),
    queryFn: () => getWritingTopics(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // Topics rarely change
    gcTime: 10 * 60 * 1000,
    select: (data) => {
      if (data.status === 200 && data.data) return data.data;
      return {} as Record<string, { label: string; value: string }[]>;
    },
  });
}

/** Fetch paginated writing history for current user */
export function useWritingHistoryQuery(page: number = 1, limit: number = 10) {
  const userId = getUserIdFromCookie();
  const userIdNumber = userId ? (typeof userId === "string" ? parseInt(userId, 10) : userId) : null;
  const isValid = userIdNumber !== null && !isNaN(userIdNumber) && userIdNumber > 0;

  return useQuery({
    queryKey: writingKeys.historyList({ page, limit }),
    queryFn: async () => {
      if (!isValid) return { histories: [] as WritingHistoryItem[], total: 0, page: 1, limit, total_pages: 0 };
      const res = await getWritingHistory({
        user_id: userIdNumber!,
        limit,
        page,
        order_by: "created_at",
        order_desc: true,
      });
      if (res.status === 200 && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: WritingHistoryItem[] = res.data.histories.map((item: any) => {
          const content = item.data || {};
          return {
            id: item.id,
            user_id: item.user_id,
            current_index: item.current_index ?? 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
            language: (content.language || "English") as "English",
            topic: content.topic || "",
            difficulty: content.difficulty || 2,
            vietnameseSentences: content.vietnameseSentences || [],
            englishSentences: content.englishSentences || [],
            totalSentences: content.totalSentences || 0,
            practiceType: content.practiceType || null,
            contentType: (content.contentType || "DIALOGUE") as "DIALOGUE",
            userPoints: content.userPoints || 0,
          };
        });
        return {
          histories: mapped,
          total: res.data.total || 0,
          page: res.data.page || page,
          limit: res.data.limit || limit,
          total_pages: res.data.total_pages || 0,
        };
      }
      return { histories: [] as WritingHistoryItem[], total: 0, page: 1, limit, total_pages: 0 };
    },
    enabled: isValid,
    staleTime: 30 * 1000, // 30s — history changes after each practice
    placeholderData: keepPreviousData,
  });
}

/** Fetch single writing history by ID (for practice page) */
export function useWritingHistoryByIdQuery(historyId: number | null) {
  return useQuery({
    queryKey: writingKeys.historyById(historyId!),
    queryFn: async () => {
      const response = await getWritingHistoryById(historyId!);
      if (response.status === 200 && response.data) {
        const historyData = response.data;
        const contentData = historyData.data;
        const mapped: WritingGenerateResponse = {
          id: contentData.id || String(historyId),
          language: contentData.language || "English",
          contentType: contentData.contentType || "DIALOGUE",
          difficulty: contentData.difficulty || 2,
          englishSentences: contentData.englishSentences || [],
          vietnameseSentences: contentData.vietnameseSentences || [],
          totalSentences: contentData.totalSentences || 0,
          userPoints: contentData.userPoints || 0,
          practiceType: contentData.practiceType || null,
          topic: contentData.topic || "",
          createdAt: historyData.created_at || contentData.createdAt,
        };
        return { data: mapped, currentIndex: historyData.current_index ?? 0 };
      }
      throw new Error("Không tìm thấy dữ liệu bài luyện");
    },
    enabled: !!historyId && historyId > 0,
    staleTime: 60 * 1000, // Data doesn't change while viewing
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Fetch AI writing usage status (daily limits) */
export function useWritingUsageQuery() {
  return useQuery({
    queryKey: writingKeys.usage(),
    queryFn: () =>
      getUsageStatusForFeature("ai_writing").catch(() => ({
        allowed: false,
        currentCount: 0,
        limit: 0,
      })),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────

/** Mutation: Generate new writing content via AI */
export function useGenerateWritingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: WritingGenerateConfig) => generateWritingContent(config),
    onSuccess: () => {
      // Invalidate history list so it refreshes
      queryClient.invalidateQueries({ queryKey: writingKeys.history() });
      // Refresh usage count
      queryClient.invalidateQueries({ queryKey: writingKeys.usage() });
    },
  });
}

/** Mutation: Update writing progress (current_index) */
export function useUpdateWritingProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ historyId, currentIndex }: { historyId: number; currentIndex: number }) => updateWritingHistoryIndex(historyId, currentIndex),
    onSuccess: (_data, variables) => {
      // Update the cached history detail with new index
      queryClient.setQueryData(
        writingKeys.historyById(variables.historyId),
        (old: { data: WritingGenerateResponse; currentIndex: number } | undefined) => {
          if (!old) return old;
          return { ...old, currentIndex: variables.currentIndex };
        },
      );
    },
  });
}
