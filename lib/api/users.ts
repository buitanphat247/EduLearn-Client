import apiClient from "@/app/config/api";
import type { SignUpUser } from "@/interface/auth";
import { getUserDataFromSession } from "@/lib/utils/cookies";

export interface UserInfoResponse {
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  phone: string;
  avatar: string;
  role_id?: number;
  role: {
    role_id: number;
    role_name: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

interface UserInfoApiResponse {
  status: boolean;
  message: string;
  data: UserInfoResponse;
  statusCode: number;
  timestamp: string;
}

export const getUserInfo = async (userId: number | string): Promise<UserInfoResponse> => {
  try {
    const response = await apiClient.get<UserInfoApiResponse>(`/users/${userId}`);

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data as any;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin user";
    throw new Error(errorMessage);
  }
};

export const getCurrentUser = (): SignUpUser | null => {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try LocalStorage (Legacy)
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }

    // 2. Try SessionStorage (New Auth Flow)
    const sessionUser = getUserDataFromSession();
    if (sessionUser) {
      return sessionUser;
    }
  } catch (error) {
    console.error("Error parsing user from storage:", error);
  }

  return null;
};

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetUsersResponse {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status?: string;
  role_id: number;
  role: {
    role_id: number;
    role_name: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

// ✅ Type-safe response structure
interface ApiResponseStructure {
  data?:
    | GetUsersResponse[]
    | {
        users?: GetUsersResponse[];
        items?: GetUsersResponse[];
        list?: GetUsersResponse[];
        results?: GetUsersResponse[];
        data?: GetUsersResponse[];
      };
  users?: GetUsersResponse[];
  items?: GetUsersResponse[];
  list?: GetUsersResponse[];
  results?: GetUsersResponse[];
}

// ✅ Type-safe extraction with proper type guards
const extractArrayFromResponse = (data: unknown): GetUsersResponse[] | null => {
  if (!data || typeof data !== "object") {
    return null;
  }

  // Direct array
  if (Array.isArray(data)) {
    return data;
  }

  const response = data as ApiResponseStructure;

  // Nested data structure
  if (response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (typeof response.data === "object") {
      const nestedKeys = ["users", "items", "list", "results", "data"] as const;
      for (const key of nestedKeys) {
        if (Array.isArray(response.data[key])) {
          return response.data[key];
        }
      }
    }
  }

  // Direct keys
  const directKeys = ["users", "items", "list", "results"] as const;
  for (const key of directKeys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  return null;
};

export interface GetUsersResult {
  users: GetUsersResponse[];
  total?: number;
  page?: number;
  limit?: number;
}

export const getUsers = async (params?: GetUsersParams): Promise<GetUsersResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get("/users", {
      params: requestParams,
    });

    const users = extractArrayFromResponse(response.data);

    // Extract pagination info from response.data.data (nested structure)
    const responseData = response.data;
    let total = 0;
    let page = params?.page || 1;
    let limit = params?.limit || 10;

    if (responseData?.data && typeof responseData.data === "object") {
      // Check nested data.data structure
      total = responseData.data.total || responseData.data.totalCount || 0;
      page = responseData.data.page || params?.page || 1;
      limit = responseData.data.limit || params?.limit || 10;
    } else if (responseData && typeof responseData === "object") {
      // Check direct structure
      total = responseData.total || responseData.totalCount || responseData.pagination?.total || responseData.meta?.total || 0;
      page = responseData.page || responseData.pagination?.page || params?.page || 1;
      limit = responseData.limit || responseData.pagination?.limit || params?.limit || 10;
    }

    // If total is 0 but we have users, use users length as fallback
    if (total === 0 && users && users.length > 0) {
      total = users.length;
    }

    return {
      users: users || [],
      total: typeof total === "number" ? total : parseInt(String(total), 10),
      page: typeof page === "number" ? page : parseInt(String(page), 10),
      limit: typeof limit === "number" ? limit : parseInt(String(limit), 10),
    };
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách users";
    throw new Error(errorMessage);
  }
};

export interface CreateUserParams {
  username: string;
  fullname: string;
  email: string;
  phone: string;
  password: string;
  role_id: number;
}

export interface CreateUserResponse {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  phone: string;
  avatar: string | null;
  role_id: number;
  role: {
    role_id: number;
    role_name: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

export const createUser = async (params: CreateUserParams): Promise<CreateUserResponse> => {
  try {
    const response = await apiClient.post<CreateUserResponse>("/users", {
      username: params.username,
      fullname: params.fullname,
      email: params.email,
      phone: params.phone,
      password: params.password,
      role_id: params.role_id,
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo user";
    throw new Error(errorMessage);
  }
};

export interface UpdateUserStatusResponse {
  user_id: number;
  status: string;
  updated_at: string;
}

export interface UpdateUserStatusApiResponse {
  status: boolean;
  message: string;
  data: UpdateUserStatusResponse;
  statusCode: number;
  timestamp: string;
}

export const updateUserStatus = async (userId: string | number, status: string): Promise<UpdateUserStatusResponse> => {
  try {
    // Convert userId to number if it's a string
    const id = typeof userId === "string" ? parseInt(userId, 10) : userId;

    if (isNaN(id)) {
      throw new Error("ID người dùng không hợp lệ");
    }

    const response = await apiClient.patch<UpdateUserStatusApiResponse>(
      `/users/${id}/status`,
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

export interface StudentResponse {
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  role: {
    role_id: number;
    role_name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface GetStudentsParams {
  classId: number | string; // Required: ID của lớp học
  page?: number;
  limit?: number;
  search?: string; // Tìm kiếm theo tên hoặc email
}

export interface GetStudentsResult {
  students: StudentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetStudentsApiResponse {
  status: boolean;
  message: string;
  data: {
    data: StudentResponse[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
  timestamp: string;
}

export const getStudents = async (params: GetStudentsParams): Promise<GetStudentsResult> => {
  try {
    const requestParams: Record<string, any> = {
      classId: params.classId,
      page: params.page || 1,
      limit: params.limit || 10,
    };

    // Thêm search parameter nếu có
    if (params.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get<GetStudentsApiResponse>("/users/students", {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      const data = response.data.data;
      return {
        students: data.data || [],
        total: data.total || 0,
        page: data.page || params.page || 1,
        limit: data.limit || params.limit || 10,
      };
    }

    throw new Error(response.data.message || "Không thể lấy danh sách học sinh");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách học sinh";
    throw new Error(errorMessage);
  }
};

export interface GetStudentsByUserIdParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetStudentsByUserIdResult {
  data: StudentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetStudentsByUserIdApiResponse {
  status: boolean;
  message: string;
  data: {
    data: StudentResponse[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
  timestamp: string;
}

export const getStudentsByUserId = async (userId: number | string, params?: GetStudentsByUserIdParams): Promise<GetStudentsByUserIdResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.search && params.search.trim()) {
      requestParams.search = params.search.trim();
    }

    const response = await apiClient.get<GetStudentsByUserIdApiResponse>(`/users/${userId}/students`, {
      params: requestParams,
    });

    if (response.data.status && response.data.data) {
      const data = response.data.data;
      return {
        data: data.data || [],
        total: data.total || 0,
        page: data.page || params?.page || 1,
        limit: data.limit || params?.limit || 10,
      };
    }

    throw new Error(response.data.message || "Không thể lấy danh sách học sinh");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách học sinh";
    throw new Error(errorMessage);
  }
};

export interface ChangePasswordParams {
  userId?: number | string; // Optional: endpoint mới không cần userId, lấy từ JWT token
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const changePassword = async (params: ChangePasswordParams): Promise<ChangePasswordResponse> => {
  try {
    // Sử dụng endpoint mới không cần userId trong URL, lấy từ JWT token
    const response = await apiClient.patch<ChangePasswordResponse>(`/users/password`, {
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể đổi mật khẩu";
    throw new Error(errorMessage);
  }
};

export interface UpdateUserParams {
  fullname?: string;
  phone?: string;
  avatar?: string;
  username?: string;
  role_id?: number;
  status?: string;
}

export const updateUser = async (userId: number | string, params: UpdateUserParams): Promise<UserInfoResponse> => {
  try {
    const response = await apiClient.patch(`/users/${userId}`, params);

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    return response.data as any;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật thông tin user";
    throw new Error(errorMessage);
  }
};
