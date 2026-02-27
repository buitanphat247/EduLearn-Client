import apiClient from "@/config/api";

export interface StatsResponse {
  documents: number;
  users: number;
  news: number;
  events: number;
}

interface StatsApiResponse {
  status: boolean;
  message: string;
  data: StatsResponse;
  statusCode: number;
  timestamp: string;
}

export const getStats = async (): Promise<StatsResponse> => {
  try {
    const response = await apiClient.get<StatsApiResponse>("/stats");
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    return response.data as any;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thống kê";
    throw new Error(errorMessage);
  }
};

