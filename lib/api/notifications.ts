import apiClient from "@/app/config/api";

export interface CreateNotificationParams {
  title: string;
  message: string;
  scope: "all" | "user" | "class";
  scope_id?: number;
  created_by?: number;
}

export interface NotificationCreator {
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

export interface NotificationResponse {
  notification_id: number | string;
  title: string;
  message: string;
  scope: "all" | "user" | "class";
  scope_id: number | string | null;
  created_by?: number | string;
  created_at: string;
  updated_at: string;
  creator?: NotificationCreator;
}

export interface UpdateNotificationParams {
  title?: string;
  message?: string;
  scope?: "all" | "user" | "class";
  scope_id?: number | null;
  created_by?: number;
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

export interface GetNotificationsByCreatedByParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetNotificationsByCreatedByResponse {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const getNotificationsByScope = async (
  scope: "all" | "user" | "class",
  scopeId?: number
): Promise<NotificationResponse[]> => {
  try {
    const response = await apiClient.get(`/notifications/by-scope/${scope}`, {
      params: scope !== "all" ? { scope_id: scopeId } : undefined,
    });

    const data = response.data?.data ?? [];
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách thông báo";
    throw new Error(errorMessage);
  }
};

export const getNotificationsByCreatedBy = async (
  userId: number | string,
  params?: GetNotificationsByCreatedByParams
): Promise<GetNotificationsByCreatedByResponse> => {
  try {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (Number.isNaN(numericId)) {
      throw new Error("User ID không hợp lệ");
    }

    const requestParams: Record<string, any> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };

    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get(`/notifications/by-created-by/${numericId}`, {
      params: requestParams,
    });

    const data = response.data?.data || {};
    const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];

    return {
      data: list,
      total: data.total ?? data.pagination?.total ?? list.length ?? 0,
      page: data.page ?? params?.page ?? 1,
      limit: data.limit ?? params?.limit ?? 10,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách thông báo";
    throw new Error(errorMessage);
  }
};

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

export const updateNotification = async (
  notificationId: number | string,
  params: UpdateNotificationParams
): Promise<NotificationResponse> => {
  try {
    const id = typeof notificationId === "string" ? parseInt(notificationId, 10) : notificationId;
    if (Number.isNaN(id)) {
      throw new Error("ID thông báo không hợp lệ");
    }

    const response = await apiClient.patch(`/notifications/${id}`, params, {
      params: { userId: params.created_by }, // Use created_by as the acting user
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data?.data || response.data;
    return data as NotificationResponse;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể cập nhật thông báo";
    throw new Error(errorMessage);
  }
};

export const deleteNotification = async (
  notificationId: number | string, 
  userId: number | string
): Promise<void> => {
  try {
    const id = typeof notificationId === "string" ? parseInt(notificationId, 10) : notificationId;
    if (Number.isNaN(id)) {
      throw new Error("ID thông báo không hợp lệ");
    }

    await apiClient.delete(`/notifications/${id}`, {
      params: { userId },
    });
    // API trả về 204, không cần xử lý body
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể xóa thông báo";
    throw new Error(errorMessage);
  }
};

export interface GetNotificationsByScopeIdParams {
  userId: number | string; // Required for security
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetNotificationsByScopeIdResult {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const getNotificationsByScopeId = async (
  scopeId: number | string,
  params?: GetNotificationsByScopeIdParams
): Promise<GetNotificationsByScopeIdResult> => {
  try {
    const numericId = typeof scopeId === "string" ? parseInt(scopeId, 10) : scopeId;
    if (Number.isNaN(numericId)) {
      throw new Error("Scope ID không hợp lệ");
    }

    const requestParams: Record<string, any> = {
      userId: params?.userId,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };

    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get(`/notifications/by-scope-id/${numericId}`, {
      params: requestParams,
    });

    const responseData = response.data?.data || response.data || {};
    const list = Array.isArray(responseData.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    return {
      data: list,
      total: responseData.total ?? 0,
      page: responseData.page ?? params?.page ?? 1,
      limit: responseData.limit ?? params?.limit ?? 10,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách thông báo";
    throw new Error(errorMessage);
  }
};

export interface GetNotificationsByUserIdParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
}

export interface GetNotificationsByUserIdResult {
  data: NotificationResponse[];
  total: number;
  page: number;
  limit: number;
}

export const getNotificationsByUserId = async (
  userId: number | string,
  params?: GetNotificationsByUserIdParams
): Promise<GetNotificationsByUserIdResult> => {
  try {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (Number.isNaN(numericId)) {
      throw new Error("User ID không hợp lệ");
    }

    const requestParams: Record<string, any> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };

    if (params?.is_read !== undefined) {
      requestParams.is_read = params.is_read;
    }

    const response = await apiClient.get(`/notifications/by-user/${numericId}`, {
      params: requestParams,
    });

    const responseData = response.data?.data || response.data || {};
    const list = Array.isArray(responseData.data) ? responseData.data : Array.isArray(responseData) ? responseData : [];

    return {
      data: list,
      total: responseData.total ?? 0,
      page: responseData.page ?? params?.page ?? 1,
      limit: responseData.limit ?? params?.limit ?? 20,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách thông báo";
    throw new Error(errorMessage);
  }
};

export interface MarkNotificationReadParams {
  notification_id: number;
  user_id: number;
}

export const markNotificationAsRead = async (
  notificationId: number | string,
  userId: number | string
): Promise<void> => {
  try {
    const notifId = typeof notificationId === "string" ? parseInt(notificationId, 10) : notificationId;
    const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
    
    if (isNaN(notifId) || isNaN(userIdNum)) {
      throw new Error("ID không hợp lệ");
    }

    // Get all recipients for this notification
    const recipientsResponse = await apiClient.get(`/notification-recipients/by-notification/${notifId}`);
    const recipients = recipientsResponse.data?.data || recipientsResponse.data || [];
    
    // Find the recipient with matching user_id
    const recipient = Array.isArray(recipients) 
      ? recipients.find((r: any) => {
          // Check both direct user_id and nested user.user_id
          const rUserId = r.user_id || r.user?.user_id;
          return rUserId === userIdNum || rUserId === String(userIdNum);
        })
      : null;

    if (!recipient) {
      throw new Error("Không tìm thấy thông báo cho user này");
    }

    // Update the recipient
    const recipientId = recipient.id || recipient.recipient_id;
    if (!recipientId) {
      throw new Error("Không tìm thấy ID của recipient");
    }

    await apiClient.patch(`/notification-recipients/${recipientId}`, {
      is_read: true,
    });
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể đánh dấu đã đọc";
    throw new Error(errorMessage);
  }
};

export const markMultipleNotificationsAsRead = async (
  notificationIds: (number | string)[],
  userId: number | string
): Promise<void> => {
  try {
    const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
    
    if (isNaN(userIdNum)) {
      throw new Error("User ID không hợp lệ");
    }

    // Mark each notification as read
    await Promise.all(
      notificationIds.map((id) => {
        const notifId = typeof id === "string" ? parseInt(id, 10) : id;
        if (isNaN(notifId)) return Promise.resolve();
        return markNotificationAsRead(notifId, userIdNum);
      })
    );
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể đánh dấu đã đọc";
    throw new Error(errorMessage);
  }
};

export interface NotificationRecipientResponse {
  id: number;
  notification_id: number;
  user_id: number;
  is_read: boolean;
  read_at: string | null;
  delivered_at: string | null;
  notification?: NotificationResponse;
}

export const getNotificationRecipientsByUserId = async (
  userId: number | string
): Promise<NotificationRecipientResponse[]> => {
  try {
    const userIdNum = typeof userId === "string" ? parseInt(userId, 10) : userId;
    if (Number.isNaN(userIdNum)) {
      throw new Error("User ID không hợp lệ");
    }

    const response = await apiClient.get(`/notification-recipients/by-user/${userIdNum}`);
    const data = response.data?.data || response.data || [];
    
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách recipients";
    throw new Error(errorMessage);
  }
};


