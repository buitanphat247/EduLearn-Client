"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { Button, Skeleton, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAttemptDetail } from "./hooks/useAttemptDetail";
import AttemptStatsCard from "./components/AttemptStatsCard";
import QuestionsListCard from "./components/QuestionsListCard";

export default function AttemptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;
  const examId = params?.examId as string;
  const attemptId = params?.attemptId as string;

  const { loading, data, error } = useAttemptDetail(attemptId);

  const handleBack = useCallback(() => {
    router.push(`/admin/classes/${classId}/exams/${examId}`);
  }, [router, classId, examId]);

  if (loading) {
    return (
      <div className="p-0 min-h-screen">
        <RouteErrorBoundary routeName="admin">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Skeleton.Button active size="default" style={{ width: 120 }} />
            </div>
            <Skeleton active paragraph={{ rows: 6 }} />
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </RouteErrorBoundary>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-0 min-h-screen">
        <RouteErrorBoundary routeName="admin">
          <div className="flex flex-col gap-6">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Quay lại
            </Button>
            <Alert type="error" message={error || "Không tìm thấy bài làm"} />
          </div>
        </RouteErrorBoundary>
      </div>
    );
  }

  const { attempt, test, questions, security } = data;
  const correctCount = questions.filter((q) => q.is_correct).length;

  return (
    <div className="h-full">
      <RouteErrorBoundary routeName="admin">
        <div className="flex flex-col gap-6 pb-6">
          <div className="flex items-center justify-between">
            <Button
              icon={<ArrowLeftOutlined />}
              className="rounded-lg font-medium border-gray-200"
              onClick={handleBack}
            >
              Quay lại danh sách bài làm
            </Button>
          </div>

          <AttemptStatsCard
            attempt={attempt}
            test={test}
            correctCount={correctCount}
            questionsLength={questions.length}
          />

          <QuestionsListCard
            questions={questions}
            security={security}
            studentName={attempt.student_name}
          />
        </div>
      </RouteErrorBoundary>
    </div>
  );
}
