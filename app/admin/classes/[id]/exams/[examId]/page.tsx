"use client";

import { useParams, useRouter } from "next/navigation";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";
import { useExamDetail } from "./hooks/useExamDetail";
import ExamInfoCard from "./components/ExamInfoCard";
import ExamDetailHeader from "./components/ExamDetailHeader";
import ExamAttemptsTable from "./components/ExamAttemptsTable";
import SecurityLogModal from "./components/SecurityLogModal";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const examId = params.examId as string;

  const {
    loading,
    refreshing,
    recalculating,
    test,
    attempts,
    selectedLogs,
    isLogModalOpen,
    averageScore,
    completionRate,
    handleRefresh,
    handleRecalculate,
    handleShowLogs,
    handleCloseLogs,
  } = useExamDetail(examId);

  const handleBack = () => router.push(`/admin/classes/${classId}`);

  return (
    <div className="p-0 h-full">
      <RouteErrorBoundary routeName="admin">
        <div className="flex flex-col gap-6">
          <ExamDetailHeader
            classId={classId}
            examId={examId}
            loading={loading}
            attemptsCount={attempts.length}
            onBack={handleBack}
            onRecalculate={handleRecalculate}
            onRefresh={handleRefresh}
            recalculating={recalculating}
            refreshing={refreshing}
          />

          <ExamInfoCard
            test={test}
            averageScore={averageScore}
            attemptsCount={attempts.length}
            completionRate={completionRate}
          />

          <ExamAttemptsTable
            attempts={attempts}
            test={test}
            loading={loading}
            classId={classId}
            examId={examId}
            onShowLogs={handleShowLogs}
          />
        </div>

        <SecurityLogModal open={isLogModalOpen} onClose={handleCloseLogs} selectedLogs={selectedLogs} />
      </RouteErrorBoundary>
    </div>
  );
}
