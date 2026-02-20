import apiClient from "@/app/config/api";

export interface Lesson {
  id: number;
  original_id: number;
  name: string;
  level: string;
  language: string;
  challengeCount: number;
  practiceCount: number | null;
  lastPracticeAt: string | null;
  audioSrc: string;
  challenges?: Challenge[];
  progressInfo?: {
    currentChallengeIndex: number;
    percent: number;
    isCompleted: boolean;
  };
}

export interface Challenge {
  id_challenges: number;
  lesson_id: number;
  position_challenges: number;
  content_challenges: string;
  audioSrc_challenges: string;
  timeStart: number;
  timeEnd: number;
  solution_challenges: {
    answer: string;
    options: string[];
  };
  translateText_challenges: string;
}

export interface SaveProgressPayload {
  lessonId: number;
  currentChallengeIndex: number;
  currentTime: number;
  isCompleted?: boolean;
}

export interface GetLessonsParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  language?: string;
}

export interface GetLessonsResult {
  data: Lesson[];
  total: number;
  page: number;
  limit: number;
}

export interface GetLessonsResponse {
  status: boolean;
  message: string;
  data: GetLessonsResult;
  statusCode: number;
  timestamp: string;
}

/**
 * Lấy danh sách lessons với pagination, search, và filter
 */
export async function getLessons(params?: GetLessonsParams): Promise<GetLessonsResult> {
  try {
    const requestParams: Record<string, any> = {};

    // Chỉ thêm các params nếu có giá trị
    if (params?.page) {
      requestParams.page = params.page;
    }
    if (params?.limit) {
      requestParams.limit = params.limit;
    }
    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }
    if (params?.level && params.level.trim()) {
      requestParams.level = params.level.trim();
    }
    if (params?.language && params.language.trim()) {
      requestParams.language = params.language.trim();
    }

    const response = await apiClient.get<GetLessonsResponse>("/lessons", {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể lấy danh sách lessons");
  } catch (error: any) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}

export async function saveListeningProgress(payload: SaveProgressPayload) {
  try {
    const response = await apiClient.post("/listen/progress", payload);
    return response.data;
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}

export async function getListeningProgress(lessonId: number) {
  try {
    const response = await apiClient.get(`/listen/progress/${lessonId}`);
    // API returns wrapped: { status, data: { id, currentChallengeIndex, ... } }
    // Return the actual progress entity, not the wrapper
    return response.data?.data ?? response.data ?? null;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
}

export async function resetListeningProgress() {
  try {
    const response = await apiClient.post("/listen/progress/reset", {});
    return response.data;
  } catch (error) {
    console.error("Error resetting progress:", error);
    return null;
  }
}
