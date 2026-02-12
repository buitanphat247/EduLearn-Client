import apiClient from "@/app/config/api";

// ✅ Use NestJS proxy instead of direct Python server calls
// This ensures JWT authentication is handled automatically via apiClient interceptors
// All AI exam endpoints are proxied through NestJS at /ai-exam/*

export interface RagTestOverview {
  id: string;
  title: string;
  description: string;
  num_questions: number;
  duration_minutes: number;
  total_score: number;
  created_at: string;
  is_published: boolean;
  mode: string;
  max_attempts: number;
  end_at: string;
  max_violations: number;
  user_attempt_count: number;
}

export interface RagQuestion {
  id: string;
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  score: number;
  order: number;
  /** Ảnh đính kèm câu hỏi; nếu không có thì hiển thị ảnh mặc định */
  imageUrl?: string;
}

export interface RagTestDetail extends RagTestOverview {
  questions: RagQuestion[];
}

export const getRagTestsByClass = async (classId: string | number, studentId?: number, isTeacher: boolean = false): Promise<RagTestOverview[]> => {
  try {
    const ts = new Date().getTime();
    const params = studentId ? `student_id=${studentId}` : "";
    const endpoint = isTeacher ? "teacher" : "published";

    // ✅ Call through NestJS proxy with JWT auth
    const response = await apiClient.get(`/ai-exam/tests/class/${classId}/${endpoint}?${params}${params ? "&" : ""}_ts=${ts}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching RAG tests:", error);
    return [];
  }
};

export const getRagTestDetail = async (testId: string, studentId?: number): Promise<RagTestDetail | null> => {
  try {
    const params = studentId ? `?student_id=${studentId}` : "";
    const response = await apiClient.get(`/ai-exam/test/${testId}${params}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Re-throw so the UI can catch it (already logic for this in Exam Page)
      throw new Error(error.response.data.message || "Bạn đã hết lượt làm bài");
    }
    console.error("Error fetching RAG test detail:", error);
    return null;
  }
};

export const deleteRagTest = async (testId: string): Promise<boolean> => {
  try {
    const response = await apiClient.delete(`/ai-exam/test/${testId}`);
    return response.status === 200 || response.data.status === "success";
  } catch (error) {
    console.error("Error deleting RAG test:", error);
    return false;
  }
};

export const deleteRagTestsByClass = async (classId: string | number): Promise<boolean> => {
  try {
    const response = await apiClient.delete(`/ai-exam/tests/class/${classId}`);
    return response.status === 200 || response.data.status === "success";
  } catch (error) {
    console.error("Error deleting class RAG tests:", error);
    return false;
  }
};

export interface UpdateTestData {
  title?: string;
  description?: string;
  duration_minutes?: number;
  total_score?: number;
  max_attempts?: number;
  is_published?: boolean;
  end_at?: string;
  max_violations?: number;
}

export const updateRagTest = async (testId: string, data: UpdateTestData): Promise<boolean> => {
  try {
    const response = await apiClient.put(`/ai-exam/test/${testId}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (response.status === 200 || response.status === 201) && (response.data?.status === "success" || !response.data?.status || true);
  } catch (error) {
    console.error("Error updating RAG test:", error);
    return false;
  }
};

export const publishRagTest = async (testId: string, isPublished: boolean): Promise<boolean> => {
  try {
    const response = await apiClient.post(
      `/ai-exam/test/${testId}/publish`,
      { is_published: isPublished },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return (response.status === 200 || response.status === 201) && (response.data?.status === "success" || !response.data?.status || true);
  } catch (error) {
    console.error("Error publishing/unpublishing RAG test:", error);
    return false;
  }
};

export interface UpdateQuestionData {
  content?: string;
  answer_a?: string;
  answer_b?: string;
  answer_c?: string;
  answer_d?: string;
  correct_answer?: string;
  explanation?: string;
}

export const updateRagQuestion = async (questionId: string, data: UpdateQuestionData): Promise<boolean> => {
  try {
    const response = await apiClient.put(`/ai-exam/question/${questionId}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return (response.status === 200 || response.status === 201) && (response.data?.status === "success" || !response.data?.status || true);
  } catch (error) {
    console.error("Error updating RAG question:", error);
    return false;
  }
};
