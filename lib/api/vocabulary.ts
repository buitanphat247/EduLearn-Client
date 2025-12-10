import apiClient from "@/app/config/api";

export interface FolderResponse {
  folderId: number;
  folderName: string;
}

export interface GetFoldersParams {
  page?: number;
  limit?: number;
  search?: string;
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
export async function getFolders(
  params?: GetFoldersParams
): Promise<GetFoldersResult> {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
    
    // Chỉ thêm search nếu có giá trị
    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }
    
    const response = await apiClient.get<GetFoldersResponse>("/folders", {
      params: requestParams,
    });
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Không thể lấy danh sách folders");
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy danh sách folders");
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
  example: string;
  variations: string[];
  otherForms: string;
  audioUrl: Array<{
    url: string;
    priority: string;
    pronunciation_name: string;
  }>;
  avatarUrl: string;
  family: Array<{
    pos: string;
    word: string;
    meaning: string;
  }>;
  synonyms: string;
  status: string;
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
    parentGroupId: number;
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
export async function getVocabulariesByFolder(
  folderId: number
): Promise<VocabularyResponse[]> {
  try {
    const response = await apiClient.get<GetVocabulariesByFolderResponse>(
      `/vocabularies/by-folder/${folderId}`
    );
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Không thể lấy danh sách từ vựng");
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error?.message || "Không thể lấy danh sách từ vựng");
  }
}

