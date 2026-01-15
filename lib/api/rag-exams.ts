import axios from "axios";

// AI Python Tool URL
const AI_API_URL = (process.env.NEXT_PUBLIC_FLASK_API_URL || "http://localhost:5000") + "/ai-exam";

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
}

export interface RagTestDetail extends RagTestOverview {
  questions: RagQuestion[];
}

export const getRagTestsByClass = async (classId: string | number, studentId?: number): Promise<RagTestOverview[]> => {
  try {
    const params = studentId ? `?student_id=${studentId}` : "";
    const ts = new Date().getTime();
    const separator = params ? "&" : "?";
    const response = await axios.get(`${AI_API_URL}/tests/class/${classId}${params}${separator}_ts=${ts}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching RAG tests:", error);
    return [];
  }
};

export const getRagTestDetail = async (testId: string, studentId?: number): Promise<RagTestDetail | null> => {
  try {
    const params = studentId ? `?student_id=${studentId}` : "";
    const response = await axios.get(`${AI_API_URL}/test/${testId}${params}`);
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
    const response = await axios.delete(`${AI_API_URL}/test/${testId}`);
    return response.data.status === "success";
  } catch (error) {
    console.error("Error deleting RAG test:", error);
    return false;
  }
};

export const updateRagTest = async (testId: string, data: any): Promise<boolean> => {
  try {
    const response = await axios.put(`${AI_API_URL}/test/${testId}`, data);
    return response.data.status === "success";
  } catch (error) {
    console.error("Error updating RAG test:", error);
    return false;
  }
};

export const updateRagQuestion = async (questionId: string, data: any): Promise<boolean> => {
  try {
    const response = await axios.put(`${AI_API_URL}/question/${questionId}`, data);
    return response.data.status === "success";
  } catch (error) {
    console.error("Error updating RAG question:", error);
    return false;
  }
};
