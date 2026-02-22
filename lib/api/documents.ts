import apiClient from "@/app/config/api";

export interface DocumentResponse {
  document_id: string;
  title: string;
  file_url: string;
  download_count: number;
  status?: string;
  created_at: string;
  updated_at: string;
  uploader: {
    user_id: string;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
}

export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetDocumentsResult {
  data: DocumentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetDocumentsByUserParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetDocumentsByUserResult {
  data: DocumentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface DocumentsApiResponse {
  status: boolean;
  message: string;
  data: {
    data: DocumentResponse[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
  timestamp: string;
}

export const getDocuments = async (params?: GetDocumentsParams): Promise<GetDocumentsResult> => {
  try {
    const requestParams: Record<string, any> = {};

    if (params?.page) {
      requestParams.page = params.page;
    }
    if (params?.limit) {
      requestParams.limit = params.limit;
    }
    if (params?.search) {
      requestParams.search = params.search;
    }

    const response = await apiClient.get<DocumentsApiResponse>("/documents", {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      return {
        data: response.data.data.data || [],
        total: response.data.data.total || 0,
        page: response.data.data.page || 1,
        limit: response.data.data.limit || 10,
      };
    }

    throw new Error(response.data.message || "Không thể lấy danh sách tài liệu");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách tài liệu";
    throw new Error(errorMessage);
  }
};

export const getDocumentsByUser = async (userId: number | string, params?: GetDocumentsByUserParams): Promise<GetDocumentsByUserResult> => {
  try {
    const requestParams: Record<string, any> = {};

    if (params?.page) {
      requestParams.page = params.page;
    }
    if (params?.limit) {
      requestParams.limit = params.limit;
    }
    if (params?.search) {
      requestParams.search = params.search;
    }

    const response = await apiClient.get<DocumentsApiResponse>(`/documents/by-user/${userId}`, {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      return {
        data: response.data.data.data || [],
        total: response.data.data.total || 0,
        page: response.data.data.page || 1,
        limit: response.data.data.limit || 10,
      };
    }

    throw new Error(response.data.message || "Không thể lấy danh sách tài liệu");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách tài liệu";
    throw new Error(errorMessage);
  }
};

export interface CreateDocumentParams {
  title: string;
  file: File;
  uploaded_by: number;
  status?: string;
}

export interface CreateDocumentResponse {
  document_id: number;
  title: string;
  file_url: string;
  uploader: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentApiResponse {
  status: boolean;
  message: string;
  data: CreateDocumentResponse;
  statusCode: number;
  timestamp: string;
}

export const createDocument = async (params: CreateDocumentParams): Promise<CreateDocumentResponse> => {
  try {
    const formData = new FormData();
    formData.append("title", params.title);
    formData.append("file", params.file);
    formData.append("uploaded_by", params.uploaded_by.toString());
    if (params.status) {
      formData.append("status", params.status);
    }

    const response = await apiClient.post<CreateDocumentApiResponse>("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể tạo tài liệu");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo tài liệu";
    throw new Error(errorMessage);
  }
};

export interface DocumentAttachmentCrawl {
  id: number;
  attachment_id: number;
  fileName: string;
  link: string;
  fileType: string;
  mimeType: string;
  fileSize: string;
  createdAt: string;
  created_at: string;
  document: {
    id: number;
    ten_tai_lieu: string;
    doc_name: string;
    khoi: string;
    mon_hoc: string;
    hash_id: string;
    link: string;
  };
}

export interface GetDocumentAttachmentsCrawlParams {
  page?: number;
  limit?: number;
  fileName?: string;
  fileType?: string;
}

export interface GetDocumentAttachmentsCrawlResult {
  documents: DocumentAttachmentCrawl[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateDocumentStatusParams {
  documentId: string;
  status: string;
}

export interface UpdateDocumentStatusResponse {
  document_id: string;
  status: string;
  updated_at: string;
}

export interface UpdateDocumentStatusApiResponse {
  status: boolean;
  message: string;
  data: UpdateDocumentStatusResponse;
  statusCode: number;
  timestamp: string;
}

export const updateDocumentStatus = async (documentId: string | number, status: string): Promise<UpdateDocumentStatusResponse> => {
  try {
    // Convert documentId to number if it's a string
    const id = typeof documentId === "string" ? parseInt(documentId, 10) : documentId;

    if (isNaN(id)) {
      throw new Error("ID tài liệu không hợp lệ");
    }

    const response = await apiClient.patch<UpdateDocumentStatusApiResponse>(
      `/documents/${id}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể cập nhật trạng thái");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái";
    throw new Error(errorMessage);
  }
};

export const getDocumentAttachmentsCrawl = async (params?: GetDocumentAttachmentsCrawlParams): Promise<GetDocumentAttachmentsCrawlResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.fileName && params.fileName.trim()) {
      requestParams.fileName = params.fileName.trim();
    }

    if (params?.fileType && params.fileType.trim()) {
      requestParams.fileType = params.fileType.trim();
    }

    const response = await apiClient.get("/document-attachments-crawl", {
      params: requestParams,
    });

    const responseData = response.data;
    let documents: DocumentAttachmentCrawl[] = [];
    let total = 0;
    let page = params?.page || 1;
    let limit = params?.limit || 10;

    if (responseData?.data && typeof responseData.data === "object") {
      if (Array.isArray(responseData.data.data)) {
        documents = responseData.data.data;
      } else if (Array.isArray(responseData.data)) {
        documents = responseData.data;
      }

      total = responseData.data.total || responseData.data.totalCount || 0;
      page = responseData.data.page || params?.page || 1;
      limit = responseData.data.limit || params?.limit || 10;
    } else if (Array.isArray(responseData)) {
      documents = responseData;
      total = responseData.length;
    }

    if (total === 0 && documents.length > 0) {
      total = documents.length;
    }

    return {
      documents: documents || [],
      total: typeof total === "number" ? total : parseInt(String(total), 10),
      page: typeof page === "number" ? page : parseInt(String(page), 10),
      limit: typeof limit === "number" ? limit : parseInt(String(limit), 10),
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách tài liệu crawl";
    throw new Error(errorMessage);
  }
};

export const deleteDocument = async (id: string | number): Promise<void> => {
  try {
    const documentId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(documentId)) throw new Error("ID tài liệu không hợp lệ");

    const response = await apiClient.delete(`/documents/${documentId}`);

    if (response.status === 204 || response.data.status) {
      return;
    }

    throw new Error(response.data.message || "Không thể xóa tài liệu");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa tài liệu";
    throw new Error(errorMessage);
  }
};
