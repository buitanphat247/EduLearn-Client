import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getLessons, type GetLessonsParams } from "@/lib/api/lessons";
import apiClient from "@/app/config/api";
import { useUserId } from "@/app/hooks/useUserId";

export const listeningKeys = {
  all: ["listening"] as const,
  lessons: (filters: GetLessonsParams) => [...listeningKeys.all, "lessons", filters] as const,
  lessonDetail: (lessonId: number | string) => [...listeningKeys.all, "detail", lessonId] as const,
};

export function useListeningLessonsQuery(filters: GetLessonsParams) {
  const { userId, loading: userIdLoading } = useUserId();

  return useQuery({
    queryKey: listeningKeys.lessons(filters),
    queryFn: () => getLessons(filters),
    // Query requires auth context to stabilize to prevent duplicate fetches
    enabled: !userIdLoading,
    placeholderData: keepPreviousData, // Keeps previous data during page turn
    staleTime: 30 * 1000, // 30s
  });
}

export function useListeningLessonDetailQuery(lessonId: number | string | null) {
  return useQuery({
    queryKey: listeningKeys.lessonDetail(lessonId || ""),
    queryFn: async () => {
      const response = await apiClient.get(`/challenges/by-lesson/${lessonId}`);
      if (response.data?.status && response.data?.data) {
        return response.data.data.sort((a: any, b: any) => a.position_challenges - b.position_challenges);
      }
      throw new Error("Không thể tải bài học hoặc bài học chưa có nội dung");
    },
    enabled: !!lessonId,
    staleTime: 30 * 1000, // 30s
  });
}
