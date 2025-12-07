import apiClient from "@/app/config/api";

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
}

export interface GetDocumentAttachmentsCrawlResult {
  documents: DocumentAttachmentCrawl[];
  total: number;
  page: number;
  limit: number;
}

export const getDocumentAttachmentsCrawl = async (
  params?: GetDocumentAttachmentsCrawlParams
): Promise<GetDocumentAttachmentsCrawlResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

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
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách tài liệu crawl";
    throw new Error(errorMessage);
  }
};

