import apiClient from "@/app/config/api";

export interface CreateNotificationParams {
  title: string;
  message: string;
  scope: "all" | "user" | "class";
  scope_id?: number;
}

export interface NotificationResponse {
  notification_id: number;
  title: string;
  message: string;
  scope: "all" | "user" | "class";
  scope_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationApiResponse {
  status: boolean;
  message: string;
  data: NotificationResponse;
  statusCode: number;
  timestamp: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetNotificationsResult {
  notifications: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const getNotifications = async (params?: GetNotificationsParams): Promise<GetNotificationsResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get("/notifications", {
      params: requestParams,
    });

    const data = response.data.data || response.data;

    // Handle array response
    if (Array.isArray(data)) {
      return {
        notifications: data,
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
    }

    // Handle paginated response
    return {
      notifications: data.data || data.notifications || [],
      total: data.total || data.totalCount || data.pagination?.total || 0,
      page: data.page || data.pagination?.page || params?.page || 1,
      limit: data.limit || data.pagination?.limit || params?.limit || 10,
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách thông báo";
    throw new Error(errorMessage);
  }
};

export const getNotificationById = async (notificationId: number | string): Promise<NotificationResponse> => {
  try {
    const id = typeof notificationId === "string" ? parseInt(notificationId, 10) : notificationId;
    
    if (isNaN(id)) {
      throw new Error("ID thông báo không hợp lệ");
    }

    const response = await apiClient.get(`/notifications/${id}`);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    return response.data as any;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin thông báo";
    throw new Error(errorMessage);
  }
};

export const createNotification = async (params: CreateNotificationParams): Promise<NotificationResponse> => {
  try {
    const response = await apiClient.post<CreateNotificationApiResponse>("/notifications", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể tạo thông báo");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo thông báo";
    throw new Error(errorMessage);
  }
};

