import { useState } from "react";
import { App } from "antd";
import { updateRagQuestion, RagTestDetail } from "@/lib/services/rag-exams";
import { transactionQueue } from "../utils/transactionQueue";

interface UseQuestionActionsProps {
  testId: string | null;
  test: RagTestDetail | null;
  setTest: (test: RagTestDetail | null) => void;
  refetch: () => Promise<void>;
}

export function useQuestionActions({ testId, test, setTest, refetch }: UseQuestionActionsProps) {
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);

  const changeCorrectAnswer = async (questionId: string, newAnswer: string) => {
    if (!test) return;

    const previousTest = test;

    // Optimistically update UI first
    const updatedQuestions = test.questions.map((q) => (q.id === questionId ? { ...q, correct_answer: newAnswer } : q));
    setTest({ ...test, questions: updatedQuestions });

    setSaving(true);
    try {
      await transactionQueue.enqueue(async () => {
        if (testId === "demo") {
          await new Promise((resolve) => setTimeout(resolve, 100));
        } else {
          const success = await updateRagQuestion(questionId, { correct_answer: newAnswer });
          if (!success) {
            throw new Error("Cập nhật thất bại");
          }
        }
      });
      message.success("Đã cập nhật đáp án");
    } catch {
      // Single revert point — no duplication
      setTest(previousTest);
      message.error("Lỗi khi cập nhật đáp án");
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    changeCorrectAnswer,
  };
}
