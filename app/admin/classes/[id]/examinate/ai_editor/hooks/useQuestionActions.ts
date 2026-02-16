import { useState } from "react";
import { App } from "antd";
import { updateRagQuestion, RagTestDetail } from "@/lib/api/rag-exams";
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

    // Save previous state in case we need to revert
    const previousTest = test;

    // Optimistically update UI first (instant feedback)
    const updatedQuestions = test.questions.map((q) =>
      q.id === questionId ? { ...q, correct_answer: newAnswer } : q
    );
    const updatedTest = {
      ...test,
      questions: updatedQuestions,
    };
    setTest(updatedTest);

    try {
      // Enqueue the transaction to ensure sequential execution
      await transactionQueue.enqueue(async () => {
        try {
          if (testId === "demo") {
            // Demo mode: just simulate delay, no API call
            await new Promise((resolve) => setTimeout(resolve, 100));
            message.success("Đã cập nhật đáp án");
          } else {
            // Non-demo mode: update via API sequentially
            const success = await updateRagQuestion(questionId, { correct_answer: newAnswer });
            if (!success) {
              // Revert on failure
              setTest(previousTest);
              message.error("Cập nhật thất bại");
              throw new Error("Cập nhật thất bại");
            }
            message.success("Đã cập nhật đáp án");
          }
        } catch (error) {
          // Revert on error
          setTest(previousTest);
          message.error("Lỗi khi cập nhật đáp án");
          throw error;
        }
      });
    } catch (error) {
      // Revert on error outside queue
      setTest(previousTest);
    }
  };

  return {
    saving,
    changeCorrectAnswer,
  };
}
