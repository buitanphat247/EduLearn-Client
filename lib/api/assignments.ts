import apiClient from "@/app/config/api";

export interface AssignmentCreator {
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

export interface AssignmentClass {
  class_id: number | string;
  name: string;
  code: string;
}

export interface AssignmentAttachment {
  attachment_id: number | string;
  assignment_id: number | string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: string;
  uploaded_by: number | string;
  created_at: string;
}

export interface AssignmentResponse {
  assignment_id: number | string;
  class_id: number | string;
  title: string;
  description: string;
  due_at: string | null;
  created_by?: number | string;
  created_at: string;
  creator?: AssignmentCreator;
  class?: AssignmentClass;
  attachments?: AssignmentAttachment[];
}

export interface AssignmentDetailResponse extends AssignmentResponse {
  attachments: AssignmentAttachment[];
}

export interface GetAssignmentByIdApiResponse {
  status: boolean;
  message: string;
  data: AssignmentDetailResponse;
  statusCode: number;
  timestamp: string;
}

export interface GetAssignmentsByClassParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetAssignmentsByClassResult {
  data: AssignmentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAssignmentsByClassApiResponse {
  status: boolean;
  message: string;
  data: GetAssignmentsByClassResult;
  statusCode: number;
  timestamp: string;
}

export const getAssignmentsByClass = async (
  classId: number | string,
  params?: GetAssignmentsByClassParams
): Promise<GetAssignmentsByClassResult> => {
  try {
    const numericClassId = typeof classId === "string" ? Number(classId) : classId;
    
    if (isNaN(numericClassId)) {
      throw new Error("ID lớp học không hợp lệ");
    }

    const response = await apiClient.get<GetAssignmentsByClassApiResponse>(
      `/assignments/by-class/${numericClassId}`,
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        },
      }
    );

    const result = response.data?.data;
    
    if (!result) {
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
    }

    return {
      data: result.data || [],
      total: result.total || 0,
      page: result.page || params?.page || 1,
      limit: result.limit || params?.limit || 10,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách bài tập";
    throw new Error(errorMessage);
  }
};

export const getAssignmentById = async (assignmentId: number | string): Promise<AssignmentDetailResponse> => {
  try {
    const numericAssignmentId = typeof assignmentId === "string" ? Number(assignmentId) : assignmentId;

    if (isNaN(numericAssignmentId)) {
      throw new Error("ID bài tập không hợp lệ");
    }

    const response = await apiClient.get<GetAssignmentByIdApiResponse>(`/assignments/${numericAssignmentId}`);

    const result = response.data?.data;

    if (!result) {
      throw new Error("Không tìm thấy bài tập");
    }

    return result;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể lấy thông tin bài tập";
    throw new Error(errorMessage);
  }
};

export interface UpdateAssignmentParams {
  title?: string;
  description?: string;
  due_at?: string | null;
}

export const updateAssignment = async (
  assignmentId: number | string,
  params: UpdateAssignmentParams
): Promise<AssignmentDetailResponse> => {
  try {
    const numericAssignmentId = typeof assignmentId === "string" ? Number(assignmentId) : assignmentId;

    if (isNaN(numericAssignmentId)) {
      throw new Error("ID bài tập không hợp lệ");
    }

    const response = await apiClient.patch(`/assignments/${numericAssignmentId}`, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data?.data || response.data;
    return data as AssignmentDetailResponse;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error("Không tìm thấy bài tập");
    }
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật bài tập";
    throw new Error(errorMessage);
  }
};

export const deleteAssignment = async (assignmentId: number | string): Promise<void> => {
  try {
    const numericAssignmentId = typeof assignmentId === "string" ? Number(assignmentId) : assignmentId;

    if (isNaN(numericAssignmentId)) {
      throw new Error("ID bài tập không hợp lệ");
    }

    await apiClient.delete(`/assignments/${numericAssignmentId}`);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error("Không tìm thấy bài tập");
    }
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể xóa bài tập";
    throw new Error(errorMessage);
  }
};

// --- Assignment Student Progress APIs ---

export interface AssignmentStudentResponse {
  id: number;
  assignment_id: number;
  class_id: number;
  student_id: number;
  status: "assigned" | "viewed" | "submitted" | "graded" | "late" | "resubmitted";
  score: number | null;
  submitted_at: string | null;
  student?: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string | null;
  };
}

export interface GetAssignmentStudentsParams {
  page?: number;
  limit?: number;
  assignmentId?: number | string;
  classId?: number | string;
  status?: string;
  search?: string;
}

export interface GetAssignmentStudentsResult {
  data: AssignmentStudentResponse[];
  total: number;
  page: number;
  limit: number;
  search?: string;
}

export const getAssignmentStudents = async (
  params: GetAssignmentStudentsParams
): Promise<GetAssignmentStudentsResult> => {
// ... (code omitted, keep existing implementation)
  try {
    const response = await apiClient.get<any>(
      `/assignment-students`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          assignmentId: params.assignmentId,
          classId: params.classId,
          status: params.status,
          search: params.search,
        },
      }
    );

    // Handle NestJS response structure (often wrapped in data or directly returned)
    const apiResponse = response.data; // This is the full body
    
    // Case 1: Wrapped response { status: true, data: { data: [...], total: ... } }
    if (apiResponse && apiResponse.data && typeof apiResponse.data === 'object' && 'data' in apiResponse.data) {
        const innerData = apiResponse.data;
        return {
            data: Array.isArray(innerData.data) ? innerData.data : [],
            total: innerData.total || 0,
            page: innerData.page || params.page || 1,
            limit: innerData.limit || params.limit || 10,
        };
    }

    // Case 2: Direct pagination response { data: [...], total: ... }
    if (apiResponse && Array.isArray(apiResponse.data)) {
        return {
            data: apiResponse.data,
            total: apiResponse.total || 0,
            page: apiResponse.page || params.page || 1,
            limit: apiResponse.limit || params.limit || 10,
        };
    }
    
    // Case 3: Just an array (unlikely for paginated, but safeguard)
    if (Array.isArray(apiResponse)) {
        return {
            data: apiResponse,
            total: apiResponse.length,
            page: params.page || 1,
            limit: params.limit || 10,
        };
    }

    return {
      data: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
    };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Không thể lấy danh sách bài làm";
    throw new Error(errorMessage);
  }
};


export interface UpdateAssignmentStudentParams {
  status?: "assigned" | "viewed" | "submitted" | "graded" | "late" | "resubmitted";
  score?: number;
}

export const updateAssignmentStudent = async (
  assignmentStudentId: number | string,
  params: UpdateAssignmentStudentParams
): Promise<AssignmentStudentResponse> => {
  try {
    const numericId = typeof assignmentStudentId === "string" ? Number(assignmentStudentId) : assignmentStudentId;
    if (isNaN(numericId)) throw new Error("ID không hợp lệ");

    const response = await apiClient.patch(
      `/assignment-students/${numericId}`,
      params
    );
    
    // NestJS response commonly wrapped in data
    const data = response.data?.data || response.data;
    return data as AssignmentStudentResponse;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái bài tập";
    throw new Error(errorMessage);
  }
};

export const ungradeAssignmentStudent = async (
  assignmentStudentId: number | string
): Promise<AssignmentStudentResponse> => {
  try {
    const numericId = typeof assignmentStudentId === "string" ? Number(assignmentStudentId) : assignmentStudentId;
    if (isNaN(numericId)) throw new Error("ID không hợp lệ");

    const response = await apiClient.post(
      `/assignment-students/${numericId}/ungrade`
    );
    
    // NestJS response commonly wrapped in data
    const data = response.data?.data || response.data;
    return data as AssignmentStudentResponse;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể gỡ điểm bài tập";
    throw new Error(errorMessage);
  }
};