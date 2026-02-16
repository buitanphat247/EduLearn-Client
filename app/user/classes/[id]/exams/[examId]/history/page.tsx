"use client";

import { useParams, useRouter } from "next/navigation";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { Button, Empty, Skeleton } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useExamHistory } from "./hooks/useExamHistory";
import ExamHistoryInfoCard from "./components/ExamHistoryInfoCard";
import ExamHistoryTable from "./components/ExamHistoryTable";

export default function ExamHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;
  const examId = params?.examId as string;

  const { loading, test, attempts } = useExamHistory(examId);
  const totalScore = test?.total_score || 100;

  return (
    <RouteErrorBoundary routeName="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/user/classes/${classId}`)}
            className="rounded-lg font-medium"
          >
            Quay lại
          </Button>
        </div>
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            {/* Thông tin đề thi & Thống kê (gộp chung 1 table) */}
            <ExamHistoryInfoCard test={test} attempts={attempts} />

            {/* Bảng chi tiết từng lượt làm */}
            {attempts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
                <Empty description="Chưa có bài làm nào" />
              </div>
            ) : (
              <ExamHistoryTable attempts={attempts} totalScore={totalScore} />
            )}
          </>
        )}
      </div>
    </RouteErrorBoundary>
  );
}
