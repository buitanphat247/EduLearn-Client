import { useQuery } from "@tanstack/react-query";
import {
  getFolders,
  getVocabularyGroups,
  getVocabulariesByFolder,
  getDueWords,
  getVocabularyBatch,
  type GetFoldersParams,
} from "@/lib/services/vocabulary";
import { getSubscriptionStatus } from "@/lib/services/subscription";
import { useUserId } from "@/hooks/useUserId";

export const vocabularyKeys = {
  all: ["vocabulary"] as const,
  groups: () => [...vocabularyKeys.all, "groups"] as const,
  folders: (filters: GetFoldersParams) => [...vocabularyKeys.all, "folders", filters] as const,
  vocabulariesByFolder: (folderId: number) => [...vocabularyKeys.all, "folder-vocab", folderId] as const,
};

export function useVocabularyGroupsQuery() {
  return useQuery({
    queryKey: vocabularyKeys.groups(),
    queryFn: getVocabularyGroups,
    staleTime: 30 * 1000, // 30s
  });
}

export function useVocabularyFoldersQuery(filters: GetFoldersParams) {
  const { userId, loading: userIdLoading } = useUserId();

  return useQuery({
    queryKey: vocabularyKeys.folders(filters),
    queryFn: () => getFolders(filters),
    // Wait until userId finishes loading
    enabled: !userIdLoading,
    staleTime: 30 * 1000, // 30s // Cache for 1 minute
  });
}

export function useVocabulariesByFolderQuery(folderId: number) {
  const { userId, loading: userIdLoading } = useUserId();

  return useQuery({
    queryKey: vocabularyKeys.vocabulariesByFolder(folderId),
    queryFn: () => getVocabulariesByFolder(folderId),
    enabled: !!folderId && !userIdLoading,
    staleTime: 30 * 1000, // 30s
  });
}

export const useVocabularyReviewQuery = (userId: string | number | null) => {
  return useQuery({
    queryKey: [...vocabularyKeys.all, "review-due", userId] as const,
    queryFn: async () => {
      if (!userId) return [];
      const [sub, res] = await Promise.all([getSubscriptionStatus().catch(() => ({ isPro: false })), getDueWords(Number(userId), { limit: 20 })]);
      const allowed = sub?.isPro ? res.data : (res.data || []).filter((x: any) => !x.folder_pro);

      if (allowed.length > 0) {
        const sourceWordIds = allowed.map((item: any) => item.sourceWordId);
        const details = await getVocabularyBatch(sourceWordIds);

        return allowed.map((item: any) => {
          const detail = details.find((d: any) => d.sourceWordId === item.sourceWordId);
          return {
            ...(detail || item.vocabulary),
            sourceWordId: item.sourceWordId,
            nextReviewAt: item.next_review_at,
            last_grade: item.last_grade,
            repetition: item.repetition,
          };
        });
      }
      return [];
    },
    enabled: !!userId,
    // Do not cache review session content too long to avoid seeing stale reviews
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
};

export const reviewStatsKeys = {
  all: ["vocabulary", "review-stats"] as const,
  stats: (userId: string | number) => [...reviewStatsKeys.all, "stats", userId] as const,
  activity: (userId: string | number) => [...reviewStatsKeys.all, "activity", userId] as const,
  dueWords: (userId: string | number, limit: number) => [...reviewStatsKeys.all, "dueWords", userId, limit] as const,
  dueWordsPagination: (userId: string | number, page: number, limit: number) =>
    [...reviewStatsKeys.all, "dueWords-pagination", userId, page, limit] as const,
  learned: (userId: string | number, page: number, limit: number) => [...reviewStatsKeys.all, "learned", userId, page, limit] as const,
};

import { getUserVocabularyStats, getUserActivityStats, getUserVocabularyByUser } from "@/lib/services/vocabulary";

export function useUserVocabularyStatsQuery(userId: string | number | null) {
  return useQuery({
    queryKey: reviewStatsKeys.stats(userId || ""),
    queryFn: () => getUserVocabularyStats(Number(userId)),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30s
  });
}

export function useUserActivityStatsQuery(userId: string | number | null) {
  return useQuery({
    queryKey: reviewStatsKeys.activity(userId || ""),
    queryFn: () => getUserActivityStats(Number(userId)),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30s
  });
}

export function useDueWordsQuery(userId: string | number | null, limit: number = 20) {
  return useQuery({
    queryKey: reviewStatsKeys.dueWords(userId || "", limit),
    queryFn: () => getDueWords(Number(userId), { limit }),
    enabled: !!userId,
    staleTime: 0,
  });
}

export function useDueWordsPaginationQuery(userId: string | number | null, page: number, limit: number = 50) {
  return useQuery({
    queryKey: reviewStatsKeys.dueWordsPagination(userId || "", page, limit),
    queryFn: () => getDueWords(Number(userId), { page, limit }),
    enabled: !!userId,
    staleTime: 0,
  });
}

import { keepPreviousData } from "@tanstack/react-query";

export function useLearnedVocabularyQuery(userId: string | number | null, page: number, limit: number = 50) {
  return useQuery({
    queryKey: reviewStatsKeys.learned(userId || "", page, limit),
    queryFn: () => getUserVocabularyByUser(Number(userId), { page, limit }),
    enabled: !!userId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s
  });
}
