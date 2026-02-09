import apiClient from "@/app/config/api";

// ✅ Use NestJS proxy for exam attempts with JWT authentication
// Lưu ý: apiClient baseURL đã là `${API_ORIGIN}/api`, nên các endpoint ở đây CHỈ cần `/exams/...`

export interface AttemptLog {
  attempt_id: string;
  started_at: string;
  expires_at: string;
  status: string;
  resumed?: boolean;
  answers?: Record<string, string>;
  violation_count?: number;
}

export const startExamAttempt = async (
  ragTestId: string,
  classId: number | string,
  studentId: number | string,
  mode: "practice" | "official" = "practice",
): Promise<AttemptLog> => {
  try {
    // apiClient base is /api -> gọi tới /api/exams/attempt/start đúng với Swagger
    const response = await apiClient.post("/exams/attempt/start", {
      rag_test_id: ragTestId,
      class_id: Number(classId),
      student_id: Number(studentId),
      mode,
    });
    // Backend (Nest) luôn wrap: { status, message, data, ... }
    return response.data.data as AttemptLog;
  } catch (error: any) {
    // Return backend error message
    throw new Error(error?.response?.data?.error || error?.message || "Lỗi khởi tạo bài thi");
  }
};

export const submitExamAttempt = async (
  attemptId: string,
  studentId: number | string,
  answers: Record<string, string>,
): Promise<{ score: number; max_score: number } | null> => {
  try {
    const response = await apiClient.post("/exams/attempt/submit", {
      attempt_id: attemptId,
      student_id: Number(studentId),
      answers,
    });
    // Unwrap lớp data bên ngoài
    return response.data.data;
  } catch (error) {
    console.error("Error submitting exam:", error);
    return null;
  }
};

export const logSecurityEvent = async (attemptId: string, eventType: string, details?: string): Promise<boolean> => {
  try {
    await apiClient.post("/exams/security/log", {
      attempt_id: attemptId,
      event_type: eventType,
      details,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export interface StudentAttempt {
  id: string;
  student_id: number;
  student_name: string;
  status: "in_progress" | "submitted" | "expired";
  score: number;
  started_at: string;
  submitted_at: string | null;
  answered_count: number;
  attempt_count: number; // Added
  security: {
    reload: number;
    tab_hidden: number;
    disconnect: number;
    logs: {
      type: string;
      timestamp: string;
      details: string | null;
    }[];
  };
}

export const getTestAttempts = async (testId: string): Promise<StudentAttempt[]> => {
  try {
    const response = await apiClient.get(`/exams/test/${testId}/attempts`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching test attempts:", error);
    return [];
  }
};
