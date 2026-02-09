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
 */
export async function getWritingTopics(category?: "general" | "ielts" | "work"): Promise<WritingTopicsResponse> {
  try {
    const params = category ? { category } : {};
    const response = await apiClient.get<WritingTopicsResponse>("/writing-chat-bot/topics", {
      params,
    });

    // Normalize status: true -> 200 for UI compatibility
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tải danh sách chủ đề");
  }
}

export interface WritingGenerateConfig {
  contentType: "DIALOGUE";
  customTopic: boolean;
  customTopicText?: string;
  difficulty: number;
  language: "English";
  learningPurpose: "COMMUNICATION" | "IELTS" | "WORK";
  mode: "AI_GENERATED" | "CUSTOM";
  topic: string;
  user_id: number;
}

export interface WritingGenerateResponse {
  contentType: "DIALOGUE";
  difficulty: number;
  englishSentences: string[];
  id: string;
  language: "English";
  practiceType: string | null;
  topic: string;
  totalSentences: number;
  userPoints: number;
  vietnameseSentences: string[];
}

/**
 * Tạo nội dung luyện writing (dialogue) bằng AI
 */
export async function generateWritingContent(config: WritingGenerateConfig): Promise<WritingGenerateResponse> {
  try {
    const response = await apiClient.post<WritingGenerateResponse & { status?: any }>("/writing-chat-bot/generate", config);

    // Normalize status if present in the wrapped response
    if (response.data && (response.data as any).status === true) {
      (response.data as any).status = 200;
    }

    return response.data;
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
 */
export async function getWritingHistory(params: {
  user_id: number;
  limit?: number;
  page?: number;
  order_by?: "created_at" | "updated_at";
  order_desc?: boolean;
}): Promise<WritingHistoryResponse> {
  try {
    const response = await apiClient.get<WritingHistoryResponse>("/writing-chat-bot/history", {
      params: {
        user_id: params.user_id,
        limit: params.limit || 10,
        page: params.page || 1,
        order_by: params.order_by || "created_at",
        order_desc: params.order_desc !== undefined ? params.order_desc : true,
      },
    });

    // Normalize status: true -> 200
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
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
 */
export async function getWritingHistoryById(historyId: number): Promise<WritingHistoryByIdResponse> {
  try {
    const response = await apiClient.get<WritingHistoryByIdResponse>(`/writing-chat-bot/history/${historyId}`);

    // Normalize status: true -> 200
    if (response.data && response.data.status === true) {
      response.data.status = 200;
    }

    return response.data;
  } catch (error: any) {
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
