import apiClient from "@/app/config/api";

export interface WritingTopic {
  label: string;
  value: string;
}

export interface WritingTopicsResponse {
  status: number | boolean;
  category: string;
  data: Record<string, WritingTopic[]>;
  message?: string;
}

/**
 * Lấy danh sách topics theo category
 * @param category - Category name (general, ielts, work). Nếu không có thì trả về tất cả
 * @param signal - AbortSignal for request cancellation
 */
export async function getWritingTopics(category?: "general" | "ielts" | "work", signal?: AbortSignal): Promise<WritingTopicsResponse> {
  try {
    const params = category ? { category } : {};
    const response = await apiClient.get<WritingTopicsResponse>("/writing-chat-bot/topics", {
      params,
      signal,
    });

    // Normalize status: true -> 200 for UI compatibility
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") throw error;
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tải danh sách chủ đề");
  }
}

export interface WritingGenerateConfig {
  difficulty: number;
  learningPurpose: "COMMUNICATION" | "IELTS" | "WORK";
  topic: string;
  user_id: number;
  targetLanguage?: string;
}

export interface WritingGenerateResponse {
  contentType: "DIALOGUE" | "PARAGRAPH";
  difficulty: number;
  englishSentences: string[];
  id: string;
  language: "English";
  practiceType: string | null;
  topic: string;
  totalSentences: number;
  userPoints: number;
  vietnameseSentences: string[];
  createdAt?: string;
}

/**
 * Tạo nội dung luyện writing (dialogue) bằng AI
 */
export async function generateWritingContent(config: WritingGenerateConfig): Promise<WritingGenerateResponse> {
  try {
    const response = await apiClient.post<WritingGenerateResponse & { status?: any; data?: any }>("/writing-chat-bot/generate", config);

    // Handle nested response structure: {status, message, data: {...}}
    // ResponseInterceptor wraps responses, so we need to unwrap if needed
    let data = response.data;

    // If response is wrapped in {status, message, data}, unwrap it
    if (data && typeof data === "object" && "data" in data && data.status !== undefined) {
      data = data.data;
    }

    if (!data) {
      throw new Error("Không nhận được dữ liệu từ server");
    }

    // Ensure id is present and is a string
    if (!data.id) {
      console.error("Response missing id field:", data);
      throw new Error("Không nhận được ID từ server. Vui lòng thử lại.");
    }

    // Convert id to string if it's a number
    const normalizedData = {
      ...data,
      id: String(data.id),
    };

    return normalizedData;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tạo nội dung luyện viết");
  }
}

export interface WritingHistoryItem {
  id: number; // history_id from database
  user_id?: number;
  language: "English";
  topic: string;
  difficulty: number;
  vietnameseSentences: string[];
  englishSentences: string[];
  totalSentences: number;
  practiceType: string | null;
  contentType: "DIALOGUE";
  userPoints: number;
  current_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface WritingHistoryResponse {
  status: number | boolean;
  message: string;
  data: {
    histories: WritingHistoryItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

/**
 * Lấy danh sách writing histories của user
 * @param params - API params
 * @param signal - AbortSignal for request cancellation
 */
export async function getWritingHistory(
  params: {
    user_id: number;
    limit?: number;
    page?: number;
    order_by?: "created_at" | "updated_at";
    order_desc?: boolean;
  },
  signal?: AbortSignal,
): Promise<WritingHistoryResponse> {
  try {
    const response = await apiClient.get<WritingHistoryResponse>("/writing-chat-bot/history", {
      params: {
        user_id: params.user_id,
        limit: params.limit || 10,
        page: params.page || 1,
        order_by: params.order_by || "created_at",
        order_desc: params.order_desc !== undefined ? params.order_desc : true,
      },
      signal,
    });

    // Normalize status: true -> 200
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") throw error;
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tải lịch sử luyện tập");
  }
}

export interface WritingHistoryByIdResponse {
  status: number | boolean;
  message: string;
  data: {
    id: number;
    user_id: number;
    current_index: number;
    created_at: string;
    updated_at: string;
    data: WritingGenerateResponse;
  } | null;
}

/**
 * Lấy writing history theo ID
 * @param historyId - ID of history record
 * @param signal - AbortSignal for request cancellation
 */
export async function getWritingHistoryById(historyId: number, signal?: AbortSignal): Promise<WritingHistoryByIdResponse> {
  try {
    const response = await apiClient.get<WritingHistoryByIdResponse>(`/writing-chat-bot/history/${historyId}`, {
      signal,
    });

    // Normalize status: true -> 200
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") throw error;
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tải thông tin lịch sử luyện tập");
  }
}

export interface UpdateWritingHistoryIndexResponse {
  status: number | boolean;
  message: string;
  data: {
    current_index: number;
    history_id: number;
  } | null;
}

/**
 * Cập nhật current_index của writing history
 */
export async function updateWritingHistoryIndex(historyId: number, currentIndex: number): Promise<UpdateWritingHistoryIndexResponse> {
  try {
    const response = await apiClient.put<UpdateWritingHistoryIndexResponse>(`/writing-chat-bot/history/${historyId}/index`, {
      current_index: currentIndex,
    });

    // Normalize status: true -> 200
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể cập nhật tiến độ bài luyện tập");
  }
}

export interface WritingHintResponse {
  vocabulary: Array<{ word: string; meaning: string }>;
  structure: string;
  practiceId: string;
  sentenceIndex: number;
}

/**
 * Gọi AI phân tích từ vựng & ngữ pháp cho 1 câu (Hint)
 */
export async function getWritingHint(
  params: {
    practiceId: string;
    sentenceIndex: number;
    originalSentence: string;
    targetSentence?: string;
    targetLanguage?: string;
  },
  signal?: AbortSignal,
): Promise<WritingHintResponse> {
  try {
    const response = await apiClient.post<WritingHintResponse & { status?: any; data?: any }>(
      "/writing-chat-bot/hint",
      {
        practiceId: params.practiceId,
        sentenceIndex: params.sentenceIndex,
        originalSentence: params.originalSentence,
        targetSentence: params.targetSentence,
        targetLanguage: params.targetLanguage || "English",
      },
      { signal },
    );

    // Handle NestJS ResponseInterceptor wrapping: { status, message, data: { vocabulary, structure, ... } }
    let data = response.data;
    if (data && typeof data === "object" && "data" in data && data.status !== undefined) {
      data = data.data;
    }

    if (!data || !data.vocabulary) {
      throw new Error("Không nhận được dữ liệu gợi ý từ server");
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.code === "ERR_CANCELED") throw error;
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tạo gợi ý");
  }
}
