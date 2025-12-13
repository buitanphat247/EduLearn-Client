import apiClient from "@/app/config/api";

export interface ClassResponse {
  class_id: number | string;
  name: string;
  code: string;
  student_count: number;
  status: "active" | "inactive";
  created_by?: number;
  creator: {
    user_id: number | string;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  created_at: string;
}

export interface ClassStudent {
  id?: number | string; // ID của bản ghi class-student
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  status?: string; // Status từ class-students API: "online" | "banned"
}

export interface ClassDetailResponse extends ClassResponse {
  students: ClassStudent[];
}

export interface GetClassesParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface GetClassesResult {
  classes: ClassResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetClassesApiResponse {
  status: boolean;
  message: string;
  data: ClassResponse[] | GetClassesResult;
  statusCode: number;
  timestamp: string;
}

// Get classes by user ID
export interface GetClassesByUserParams {
  userId: number | string;
  page?: number;
  limit?: number;
  name?: string;
}

export interface GetClassesByUserApiResponse {
  status: boolean;
  message: string;
  data: {
    data: ClassResponse[];
    total: number;
    page: number;
    limit: number;
  };
  statusCode: number;
  timestamp: string;
}

export const getClassesByUser = async (params: GetClassesByUserParams): Promise<GetClassesResult> => {
  try {
    const userId = typeof params.userId === "string" ? Number(params.userId) : params.userId;
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.name && params.name.trim()) {
      requestParams.name = params.name.trim();
    }

    const response = await apiClient.get<GetClassesByUserApiResponse>(
      `/classes/by-user/${userId}`,
      {
        params: requestParams,
      }
    );

    const apiResponse = response.data;

    // Handle API response with nested data structure
    // Response format: { status: true, message: "Success", data: { data: [...], total: 1, page: 1, limit: 10 } }
    if (apiResponse.status && apiResponse.data) {
      const responseData = apiResponse.data;
      
      // Check if data is nested (data.data)
      if (typeof responseData === "object" && "data" in responseData && Array.isArray(responseData.data)) {
        return {
          classes: responseData.data,
          total: responseData.total || responseData.data.length,
          page: responseData.page || params?.page || 1,
          limit: responseData.limit || params?.limit || 10,
        };
      }
      
      // If data is directly an array
      if (Array.isArray(responseData)) {
        return {
          classes: responseData,
          total: responseData.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
        };
      }
    }

    throw new Error(apiResponse.message || "Không thể lấy danh sách lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách lớp học";
    throw new Error(errorMessage);
  }
};

export const getClasses = async (params?: GetClassesParams): Promise<GetClassesResult> => {
  try {
    const requestParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
    };

    if (params?.name && params.name.trim()) {
      requestParams.name = params.name.trim();
    }

    const response = await apiClient.get<GetClassesApiResponse | ClassResponse[]>("/classes", {
      params: requestParams,
    });

    const data = response.data;

    // Handle array response (direct array)
    if (Array.isArray(data)) {
      return {
        classes: data,
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
    }

    // Handle API response with status wrapper
    const apiResponse = data as GetClassesApiResponse;
    if (apiResponse.status && apiResponse.data) {
      const responseData = apiResponse.data;
      
      // If data is array
      if (Array.isArray(responseData)) {
        return {
          classes: responseData,
          total: responseData.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
        };
      }

      // If data is paginated result
      const paginatedData = responseData as any;
      return {
        classes: paginatedData.data || paginatedData.classes || [],
        total: paginatedData.total || paginatedData.totalCount || 0,
        page: paginatedData.page || params?.page || 1,
        limit: paginatedData.limit || params?.limit || 10,
      };
    }

    throw new Error(apiResponse.message || "Không thể lấy danh sách lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách lớp học";
    throw new Error(errorMessage);
  }
};

export interface CreateClassParams {
  name: string;
  code: string;
  student_count?: number;
  status?: "active" | "inactive";
  created_by: number;
}

export interface CreateClassApiResponse {
  status: boolean;
  message: string;
  data: ClassResponse;
  statusCode: number;
  timestamp: string;
}

export const createClass = async (params: CreateClassParams): Promise<ClassResponse> => {
  try {
    // Đảm bảo student_count luôn được gửi lên với giá trị mặc định 0
    const requestBody = {
      name: params.name,
      code: params.code,
      student_count: params.student_count ?? 0,
      status: params.status ?? "active",
      created_by: params.created_by,
    };

    const response = await apiClient.post<CreateClassApiResponse>("/classes", requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể tạo lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể tạo lớp học";
    throw new Error(errorMessage);
  }
};

export interface GetClassByIdApiResponse {
  status: boolean;
  message: string;
  data: ClassDetailResponse;
  statusCode: number;
  timestamp: string;
}

export const getClassById = async (classId: number | string): Promise<ClassDetailResponse> => {
  try {
    const id = typeof classId === "string" ? classId : String(classId);
    
    const response = await apiClient.get<GetClassByIdApiResponse>(`/classes/${id}`);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || "Không thể lấy thông tin lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin lớp học";
    throw new Error(errorMessage);
  }
};

export interface UpdateClassParams {
  name: string;
  code: string;
  student_count?: number;
  status?: "active" | "inactive";
  created_by?: number;
}

export interface UpdateClassApiResponse {
  status: boolean;
  message: string;
  data: ClassDetailResponse;
  statusCode: number;
  timestamp: string;
}

export const updateClass = async (classId: number | string, params: UpdateClassParams): Promise<ClassDetailResponse> => {
  try {
    const id = typeof classId === "string" ? classId : String(classId);
    
    const response = await apiClient.patch<UpdateClassApiResponse>(`/classes/${id}`, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể cập nhật lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật lớp học";
    throw new Error(errorMessage);
  }
};

export interface AddStudentToClassParams {
  class_id: number | string;
  user_id: number | string;
}

export interface AddStudentToClassResponse {
  id: number;
  class_id: number;
  user_id: number;
  class: {
    class_id: number;
    name: string;
    code: string;
    student_count: number;
    status: string;
  };
  student: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string | null;
  };
  added_at: string;
}

export interface AddStudentToClassApiResponse {
  status: boolean;
  message: string;
  data: AddStudentToClassResponse;
  statusCode: number;
  timestamp: string;
}

export const addStudentToClass = async (params: AddStudentToClassParams): Promise<AddStudentToClassResponse> => {
  try {
    const requestBody = {
      class_id: typeof params.class_id === "string" ? Number(params.class_id) : params.class_id,
      user_id: typeof params.user_id === "string" ? Number(params.user_id) : params.user_id,
    };

    const response = await apiClient.post<AddStudentToClassApiResponse>("/class-students", requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể thêm học sinh vào lớp học");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể thêm học sinh vào lớp học";
    throw new Error(errorMessage);
  }
};

export interface RemoveStudentFromClassParams {
  classId: number | string;
  userId: number | string;
}

export const removeStudentFromClass = async (params: RemoveStudentFromClassParams): Promise<void> => {
  try {
    const classId = typeof params.classId === "string" ? Number(params.classId) : params.classId;
    const userId = typeof params.userId === "string" ? Number(params.userId) : params.userId;

    await apiClient.delete(`/class-students/by-class/${classId}/by-user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa học sinh khỏi lớp học";
    throw new Error(errorMessage);
  }
};

export const deleteClass = async (classId: number | string): Promise<void> => {
  try {
    const id = typeof classId === "string" ? Number(classId) : classId;

    await apiClient.delete(`/classes/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa lớp học";
    throw new Error(errorMessage);
  }
};

export interface UpdateClassStudentStatusParams {
  id: number | string; // ID của bản ghi class-student
  status: "online" | "banned";
}

export interface UpdateClassStudentStatusResponse {
  id: number;
  class_id: number;
  user_id: number;
  status: string;
  class: {
    class_id: number;
    name: string;
    code: string;
    student_count: number;
    status: string;
  };
  student: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string | null;
  };
  added_at: string;
}

export interface UpdateClassStudentStatusApiResponse {
  status: boolean;
  message: string;
  data: UpdateClassStudentStatusResponse;
  statusCode: number;
  timestamp: string;
}

export interface GetClassStudentsParams {
  page?: number;
  limit?: number;
  classId?: number | string;
  userId?: number | string;
}

export interface ClassStudentRecord {
  id: number | string;
  class_id: number | string;
  user_id: number | string;
  status: string;
  added_at: string;
  class?: {
    class_id: number;
    name: string;
    code: string;
    student_count: number;
    status: string;
  };
  student?: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string | null;
  };
}

export interface GetClassStudentsApiResponse {
  status: boolean;
  message: string;
  data: ClassStudentRecord[];
  statusCode: number;
  timestamp: string;
}

export const getClassStudentId = async (classId: number | string, userId: number | string): Promise<number | string | null> => {
  try {
    const response = await apiClient.get<GetClassStudentsApiResponse>("/class-students", {
      params: {
        page: 1,
        limit: 1000, // Lấy tất cả để tìm
      },
    });

    if (response.data.status && response.data.data) {
      const classStudentId = typeof classId === "string" ? Number(classId) : classId;
      const studentUserId = typeof userId === "string" ? Number(userId) : userId;

      // Tìm record có class_id và user_id khớp
      const record = response.data.data.find(
        (item) => Number(item.class_id) === classStudentId && Number(item.user_id) === studentUserId
      );

      return record ? record.id : null;
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching class-student id:", error);
    return null;
  }
};

export const updateClassStudentStatus = async (params: UpdateClassStudentStatusParams): Promise<UpdateClassStudentStatusResponse> => {
  try {
    const id = typeof params.id === "string" ? Number(params.id) : params.id;

    const response = await apiClient.patch<UpdateClassStudentStatusApiResponse>(
      `/class-students/${id}/status`,
      { status: params.status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Không thể cập nhật trạng thái học sinh");
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái học sinh";
    throw new Error(errorMessage);
  }
};

// Get banned students by class
export interface GetBannedStudentsParams {
  classId: number | string;
  page?: number;
  limit?: number;
}

export interface GetBannedStudentsApiResponse {
  status: boolean;
  message: string;
  data: ClassStudentRecord[];
  statusCode: number;
  timestamp: string;
}

export const getBannedStudents = async (params: GetBannedStudentsParams): Promise<ClassStudentRecord[]> => {
  try {
    const classId = typeof params.classId === "string" ? Number(params.classId) : params.classId;

    const response = await apiClient.get<GetBannedStudentsApiResponse>(
      `/class-students/banned/by-class/${classId}`,
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
        },
      }
    );

    if (response.data.status && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy danh sách học sinh bị cấm";
    throw new Error(errorMessage);
  }
};

