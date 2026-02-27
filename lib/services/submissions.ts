import apiClient from "@/config/api";

export interface StudentSubmissionAttachment {
  id: number;
  submission_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface StudentSubmission {
  submission_id: number;
  assignment_id: number;
  class_id: number;
  student_id: number;
  attempt_no: number;
  note?: string;
  teacher_feedback?: string;
  grade?: number;
  status: "submitted" | "late" | "graded" | "resubmitted";
  submitted_at: string;
  attachments?: StudentSubmissionAttachment[];
}

export interface CreateSubmissionParams {
  assignment_id: number;
  class_id: number;
  student_id: number;
  note?: string;
}

export interface UpdateSubmissionParams {
  note?: string;
}

export const createSubmission = async (params: CreateSubmissionParams): Promise<StudentSubmission> => {
  try {
    const response = await apiClient.post<any>("/student-submissions", params);
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể nộp bài";
    throw new Error(errorMessage);
  }
};

export const updateSubmission = async (id: number, params: UpdateSubmissionParams): Promise<StudentSubmission> => {
  try {
    const response = await apiClient.patch<any>(`/student-submissions/${id}`, params);
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật bài nộp";
    throw new Error(errorMessage);
  }
};

export interface GetSubmissionsParams {
  assignmentId?: number;
  studentId?: number;
  classId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export const getSubmissions = async (params: GetSubmissionsParams): Promise<{ data: StudentSubmission[]; total: number }> => {
  try {
    const response = await apiClient.get<any>("/student-submissions", { params });
    // Backend returns structure wrapped in { data: ... } via ResponseInterceptor
    // So response.data is the wrapper, response.data.data is the service result { data: [], total: ... }
    const result = response.data?.data;
    
    if (!result) {
      return { data: [], total: 0 };
    }

    return {
      data: result.data || [],
      total: result.total || 0,
    };
  } catch (error: any) {
    // Handle error
    return { data: [], total: 0 };
  }
};

export const getSubmissionById = async (id: number): Promise<StudentSubmission> => {
  try {
    const response = await apiClient.get<any>(`/student-submissions/${id}`);
    return response.data?.data;
  } catch (error: any) {
    throw new Error(error?.message || "Không thể lấy thông tin bài nộp");
  }
};

export const createSubmissionAttachment = async (submissionId: number, file: File): Promise<StudentSubmissionAttachment> => {
  try {
    const formData = new FormData();
    formData.append("submission_id", String(submissionId));
    formData.append("file", file);

    const response = await apiClient.post<any>("/student-submission-attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải lên file";
    throw new Error(errorMessage);
  }
};

export const deleteSubmissionAttachment = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/student-submission-attachments/${id}`);
  } catch (error: any) {
    throw new Error(error?.message || "Không thể xóa file");
  }
};

export const getAttachmentsBySubmission = async (submissionId: number): Promise<StudentSubmissionAttachment[]> => {
  try {
    const response = await apiClient.get<any>(`/student-submission-attachments/by-submission/${submissionId}`);
    return response.data?.data || [];
  } catch (error: any) {
    return [];
  }
};
