import apiClient from "@/app/config/api";

export interface FolderResponse {
  folderId: number;
  folderName: string;
  learned_count?: number;
  total_count?: number;
  access_level?: "free" | "pro";
}

export interface GetFoldersParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  vocabularyGroupId?: number;
}

export interface GetFoldersResult {
  data: FolderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetFoldersResponse {
  status: boolean;
  message: string;
  data: GetFoldersResult;
  statusCode: number;
  timestamp: string;
}

/**
 * Lấy danh sách folders với pagination
 */
export async function getFolders(params?: GetFoldersParams): Promise<GetFoldersResult> {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    // Chỉ thêm search nếu có giá trị
    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    if (params?.vocabularyGroupId) {
      requestParams.vocabularyGroupId = params.vocabularyGroupId;
    }

    const response = await apiClient.get<GetFoldersResponse>("/folders", {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể lấy danh sách folders");
  } catch (error: any) {
    // Giữ nguyên error để caller có thể kiểm tra error.response?.status (vd: 403)
    if (error?.response) throw error;
    throw new Error(error?.message || "Không thể lấy danh sách folders");
  }
}

/**
 * Lấy thông tin chi tiết một folder
 */
export async function getFolderDetail(id: number): Promise<FolderResponse> {
  try {
    const response = await apiClient.get<any>(`/folders/${id}`);
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    if (error?.response) throw error;
    throw new Error(error?.message || "Không thể lấy thông tin folder");
  }
}

/**
 * Tạo thư mục mới
 */
export async function createFolder(folderName: string, access_level: string = "free"): Promise<FolderResponse> {
  try {
    const response = await apiClient.post<any>("/folders", { folderName, access_level });
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể tạo thư mục");
  }
}

/**
 * Cập nhật tên thư mục
 */
export async function updateFolder(id: number, folderName?: string, access_level?: string): Promise<FolderResponse> {
  try {
    const response = await apiClient.patch<any>(`/folders/${id}`, { folderName, access_level });
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể cập nhật thư mục");
  }
}

/**
 * Xóa thư mục
 */
export async function deleteFolder(id: number): Promise<void> {
  try {
    await apiClient.delete(`/folders/${id}`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể xóa thư mục");
  }
}

/**
 * Tạo hàng loạt từ vựng (Bulk Create)
 */
export async function bulkCreateVocabulary(folderId: number, vocabularyGroupId: number | null, vocabularies: any[]): Promise<any> {
  try {
    const response = await apiClient.post("/vocabularies/bulk-create", {
      folderId,
      vocabularyGroupId,
      vocabularies,
    });
    return response.data?.data ?? response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể import từ vựng");
  }
}

export interface VocabularyResponse {
  sourceWordId: number;
  vocabularyGroupId: number;
  folderId: number;
  content: string;
  pronunciation: string;
  translation: string;
  pos: string;
  audioUrl: Array<{
    url: string;
    priority: string;
    pronunciation_name: string;
  }>;
  practiceCount: number;
  correctCount: number;
  incorrectCount: number;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
  learning: boolean;
  dueForReview: boolean;
  accuracyPercentage: number;
  createdAt: string | null;
  vocabularyGroup: {
    vocabularyGroupId: number;
    groupName: string;
  };
  folder: {
    folderId: number;
    folderName: string;
  };
}

export interface GetVocabulariesByFolderResponse {
  status: boolean;
  message: string;
  data: VocabularyResponse[];
  statusCode: number;
  timestamp: string;
}

/**
 * Lấy danh sách từ vựng theo folderId
 */
export async function getVocabulariesByFolder(folderId: number): Promise<VocabularyResponse[]> {
  try {
    const response = await apiClient.get<GetVocabulariesByFolderResponse>(`/vocabularies/by-folder/${folderId}`);

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể lấy danh sách từ vựng");
  } catch (error: any) {
    if (error?.response) throw error;
    throw new Error(error?.message || "Không thể lấy danh sách từ vựng");
  }
}

/**
 * Lấy thông tin chi tiết của một từ vựng theo sourceWordId
 */
export async function getVocabularyDetail(id: number): Promise<VocabularyResponse> {
  try {
    const response = await apiClient.get<any>(`/vocabularies/${id}`);
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    if (error?.response) throw error;
    throw new Error(error?.message || "Không thể lấy thông tin chi tiết từ vựng");
  }
}

/**
 * Lấy danh sách thông tin chi tiết của nhiều từ vựng (Batch fetch)
 */
export async function getVocabularyBatch(ids: number[]): Promise<VocabularyResponse[]> {
  if (!ids.length) return [];
  try {
    const response = await apiClient.post<any>("/vocabularies/batch", { ids });
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    if (error?.response) throw error;
    throw new Error(error?.message || "Không thể lấy danh sách chi tiết từ vựng");
  }
}

// --- SM-2 Spaced Repetition Integrations ---

export interface UserVocabularyResponse {
  user_id: number;
  sourceWordId: number;
  is_mastered: boolean;
  practice_count?: number;
  last_reviewed_at?: string | null;
  next_review_at?: string | null;
  interval_days?: number;
  ease_factor?: number;
  repetition?: number;
  last_grade?: number;
  created_at: string;
  /** True nếu từ thuộc folder Pro (cần gói Pro để ôn) */
  folder_pro?: boolean;
  vocabulary?: {
    sourceWordId: number;
    content?: string;
    pronunciation?: string;
    translation?: string;
    pos?: string;
    audioUrl?: Array<{
      url: string;
      priority: string;
      pronunciation_name: string;
    }>;
  };
}

export interface GetDueWordsResult {
  data: UserVocabularyResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewWordParams {
  user_id: number;
  sourceWordId: number;
  grade: number;
}

export async function getDueWords(userId: number, params?: { page?: number; limit?: number }): Promise<GetDueWordsResult> {
  try {
    const response = await apiClient.get<any>(`/user-vocabulary/due/${userId}`, {
      params: { page: params?.page || 1, limit: params?.limit || 20 },
    });
    const raw = response.data;
    const result = raw?.data ?? raw;

    if (result && typeof result === "object" && "data" in result) {
      return result as GetDueWordsResult;
    }

    const data = Array.isArray(result) ? result : [];
    return {
      data,
      total: data.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy danh sách từ cần học");
  }
}

export async function reviewWord(params: ReviewWordParams): Promise<UserVocabularyResponse> {
  try {
    const response = await apiClient.post<any>("/user-vocabulary/review", params);
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể gửi kết quả ôn tập");
  }
}

export interface CreateUserVocabularyParams {
  user_id: number;
  sourceWordId: number;
  is_mastered?: boolean;
}

export async function createUserVocabulary(params: CreateUserVocabularyParams): Promise<UserVocabularyResponse> {
  try {
    const response = await apiClient.post<any>("/user-vocabulary", params);
    const raw = response.data;
    return raw?.data ?? raw;
  } catch (error: any) {
    // Nếu đã tồn tại (409 Conflict), coi như thành công
    if (error?.response?.status === 409) {
      const errData = error.response.data;
      return errData?.data ?? errData;
    }
    throw new Error(error?.response?.data?.message || error?.message || "Không thể đăng ký từ vựng");
  }
}

export interface UserVocabularyStats {
  total: number;
  mastered: number;
  notMastered: number;
  reviewedToday: number;
  dueCount: number;
}

export interface GetUserVocabularyByUserParams {
  page?: number;
  limit?: number;
  isMastered?: boolean;
}

export interface GetUserVocabularyByUserResult {
  data: UserVocabularyResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function getUserVocabularyByUser(userId: number, params?: GetUserVocabularyByUserParams): Promise<GetUserVocabularyByUserResult> {
  try {
    const response = await apiClient.get<GetUserVocabularyByUserResult | { data: GetUserVocabularyByUserResult }>(
      `/user-vocabulary/by-user/${userId}`,
      { params: { page: params?.page ?? 1, limit: params?.limit ?? 10, isMastered: params?.isMastered } },
    );
    const raw = response.data as GetUserVocabularyByUserResult | { data: GetUserVocabularyByUserResult };
    const result: GetUserVocabularyByUserResult =
      "data" in raw && raw.data && typeof raw.data === "object" && "total" in (raw.data as object)
        ? (raw.data as GetUserVocabularyByUserResult)
        : (raw as GetUserVocabularyByUserResult);
    const data = Array.isArray(result.data) ? result.data : [];
    return { data, total: result.total ?? 0, page: result.page ?? 1, limit: result.limit ?? 10 };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(err?.response?.data?.message || err?.message || "Không thể lấy danh sách từ vựng đã học");
  }
}

export async function getUserVocabularyStats(userId: number): Promise<UserVocabularyStats> {
  try {
    const response = await apiClient.get<any>(`/user-vocabulary/stats/${userId}`);
    // Server wraps: { status, data: { total, mastered, notMastered }, ... }
    const raw = response.data;
    const result = raw?.data ?? raw;
    return {
      total: Number(result?.total) || 0,
      mastered: Number(result?.mastered) || 0,
      notMastered: Number(result?.notMastered) || 0,
      reviewedToday: Number(result?.reviewedToday) || 0,
      dueCount: Number(result?.dueCount) || 0,
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy thống kê");
  }
}
export interface ActivityStat {
  date: string;
  count: number;
  level: number;
}

export interface GetActivityStatsResponse {
  status: boolean;
  message: string;
  data: ActivityStat[];
  statusCode: number;
  timestamp: string;
}

export async function getUserActivityStats(userId: number): Promise<ActivityStat[]> {
  try {
    const response = await apiClient.get<GetActivityStatsResponse>(`/user-vocabulary/activity/${userId}`);
    return response.data?.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy thống kê hoạt động");
  }
}

export interface ForgettingCurveDataset {
  label: string;
  data: number[];
}

export interface GetForgettingCurveResponse {
  status: boolean;
  message: string;
  data: ForgettingCurveDataset[];
  statusCode: number;
  timestamp: string;
}

export interface BatchUserVocabularyItem {
  sourceWordId: number;
  last_grade: number | null;
}

export async function getBatchUserVocabulary(userId: number, sourceWordIds: number[]): Promise<BatchUserVocabularyItem[]> {
  if (!sourceWordIds.length) return [];
  try {
    const response = await apiClient.post<any>("/user-vocabulary/batch-by-words", { user_id: userId, sourceWordIds });
    const raw = response.data;
    const result = raw?.data ?? raw;
    return Array.isArray(result) ? result : [];
  } catch (error: unknown) {
    console.warn("Could not fetch batch user vocabulary", error);
    return [];
  }
}

export async function getForgettingCurveData(userId: number): Promise<ForgettingCurveDataset[]> {
  try {
    const response = await apiClient.get<GetForgettingCurveResponse>(`/user-vocabulary/forgetting-curve/${userId}`);
    return response.data?.data || [];
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy dữ liệu đường cong quên lãng");
  }
}

// --- Vocabulary Filters ---

export interface VocabularyGroupItem {
  vocabularyGroupId: number;
  groupName: string;
}

export interface GetVocabulariesParams {
  page?: number;
  limit?: number;
  search?: string;
  vocabularyGroupId?: number;
}

export interface GetVocabulariesResult {
  data: VocabularyResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function getVocabularyGroups(): Promise<VocabularyGroupItem[]> {
  try {
    const response = await apiClient.get<any>("/vocabulary-groups");
    const raw = response.data;
    const result = raw?.data ?? raw;
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.warn("getVocabularyGroups error", error);
    return [];
  }
}

export async function getVocabularies(params?: GetVocabulariesParams): Promise<GetVocabulariesResult> {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
    if (params?.search) requestParams.search = params.search;
    if (params?.vocabularyGroupId) requestParams.vocabularyGroupId = params.vocabularyGroupId;

    const response = await apiClient.get<any>("/vocabularies", { params: requestParams });
    const raw = response.data;
    const inner = raw?.data ?? raw;
    if (inner && typeof inner === "object" && "total" in inner) {
      return inner as GetVocabulariesResult;
    }
    if (Array.isArray(inner)) {
      return { data: inner, total: inner.length, page: 1, limit: inner.length };
    }
    return { data: [], total: 0, page: 1, limit: 10 };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Không thể lấy danh sách từ vựng");
  }
}

/**
 * Reset toàn bộ tiến trình từ vựng của user hiện tại
 */
export async function resetVocabularyProgress() {
  try {
    const response = await apiClient.post("/user-vocabulary/reset-all", {});
    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error("Error resetting vocabulary progress:", error);
    throw new Error(error?.response?.data?.message || "Không thể đặt lại tiến trình từ vựng");
  }
}
