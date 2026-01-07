import apiClient from "@/app/config/api";

export enum ChatRoomType {
  DIRECT = "direct",
  GROUP = "group",
}

export interface ChatRoomResponse {
  room_id: number;
  room_type: ChatRoomType;
  name?: string;
  created_by?: number;
  created_at: string;
  unread_count?: number;
  last_message?: any;
  members?: any[];
}

export interface GetChatRoomsParams {
  userId: number | string;
  page?: number;
  limit?: number;
}

export interface GetChatRoomsResult {
  data: ChatRoomResponse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get chat rooms for current user
 */
export const getChatRooms = async (params: GetChatRoomsParams): Promise<GetChatRoomsResult> => {
  try {
    if (!params.userId) {
      throw new Error("userId is required");
    }

    const requestParams: Record<string, any> = {
      userId: params.userId,
    };

    if (params.page) requestParams.page = params.page;
    if (params.limit) requestParams.limit = params.limit;

    console.log("Fetching chat rooms with params:", requestParams);

    const response = await apiClient.get<any>("/chat-rooms", {
      params: requestParams,
    });

    console.log("Chat rooms response:", response.data);

    // Handle paginated response structure if present
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.total || response.data.data.length,
        page: response.data.page || params.page || 1,
        limit: response.data.limit || params.limit || 10,
      };
    }

    // Handle direct array response
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: params.page || 1,
        limit: params.limit || response.data.length,
      };
    }

    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error("Error fetching chat rooms:", error);
    throw new Error(error?.message || "Không thể lấy danh sách phòng chat");
  }
};
