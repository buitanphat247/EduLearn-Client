"use client";

import { useParams, useRouter } from "next/navigation";
import { Empty, Button } from "antd";
import { useUserId } from "@/hooks/useUserId";
import { useExamController } from "@/hooks/useExamController";
import { ExamMain } from "@/components/exams/session/ExamMain";
import { ExamSidebar } from "@/components/exams/session/ExamSidebar";
import DataLoadingSplash from "@/components/common/DataLoadingSplash";
import RouteErrorBoundary from "@/components/common/RouteErrorBoundary";
import { type RagTestDetail } from "@/lib/services/rag-exams";

// Component: Màn hình hướng dẫn & Bắt đầu
const ExamStartScreen = ({ test, onStart }: { test: RagTestDetail; onStart: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Nội quy & Hướng dẫn thi</h1>
          <p className="opacity-90 text-lg font-medium">{test.title}</p>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-indigo-50 p-6 rounded-xl text-center border border-indigo-100">
              <span className="block text-indigo-600 mb-2 font-medium">Thời gian làm bài</span>
              <span className="font-bold text-gray-800 text-2xl">{test.duration_minutes} phút</span>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-100">
              <span className="block text-purple-600 mb-2 font-medium">Số lượng câu hỏi</span>
              <span className="font-bold text-gray-800 text-2xl">{test.num_questions || test.questions?.length || 0} câu</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-xl border-b pb-2">
              🚫 Quy định phòng thi:
            </h3>
            <ul className="space-y-3 text-gray-600 text-base list-disc pl-6 leading-relaxed">
              <li>Hệ thống yêu cầu chế độ <b>Toàn màn hình (Full Screen)</b> trong suốt quá trình thi.</li>
              <li>Tuyệt đối <span className="text-red-600 font-bold">không rời khỏi tab thi</span> hoặc mở cửa sổ khác.</li>
              <li>Không sử dụng các phím tắt hệ thống (Alt+Tab, F12, Ctrl+C/V...).</li>
              <li>Vi phạm quá <b>{test.max_violations || 5} lần</b> sẽ bị <span className="text-red-600 font-bold">hủy bài thi</span> ngay lập tức.</li>
            </ul>
          </div>

          <div className="pt-6">
            <Button
              type="primary"
              size="large"
              onClick={onStart}
              className="w-full h-16 text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-200 transition-all rounded-xl border-none"
            >
              Tôi đã hiểu và Bắt đầu làm bài thi
            </Button>
            <p className="text-center text-gray-400 text-sm mt-4">
              Nhấn nút trên để vào chế độ toàn màn hình và bắt đầu tính giờ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ExamSessionPage() {
  const params = useParams();
  const classId = params.id as string;
  const examId = params.examId as string;
  const router = useRouter();

  const { userId, loading: userLoading } = useUserId();

  const {
    test,
    loading: examLoading,
    remainingSeconds,
    socketConnected,
    isSubmitted,
    hasStarted,
    startExam,
    currentQuestion,
    totalQuestions,
    currentPage,
    userAnswers,
    flaggedQuestions,
    violations,
    showSplash,
    systemAlert,
    isDevToolsBlocked,
    // Actions
    setCurrentPage,
    handleSelectOption,
    toggleFlag,
    handleSubmit,
    handleReconnect,
    // Helpers
    progressPercent,
    timeProgressPercent
  } = useExamController(examId, classId, userId ? Number(userId) : null);

  // 1. DevTools Blocked Overlay
  if (isDevToolsBlocked) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-4xl animate-pulse">⚠️</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Phát hiện DevTools!</h2>
            <p className="text-gray-600">Hệ thống phát hiện bạn đang mở công cụ lập trình. Vui lòng đóng nó để tiếp tục.</p>
          </div>
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            className="w-full h-12 bg-indigo-600 font-bold rounded-xl"
          >
            Tôi đã đóng, tải lại trang
          </Button>
          <Button onClick={() => router.push(`/user/classes/${classId}`)} className="w-full h-12 rounded-xl">
            Quay lại lớp học
          </Button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (showSplash || userLoading || (examLoading && !test)) {
    return <DataLoadingSplash tip="Đang khởi tạo môi trường thi..." />;
  }

  // 3. System Alert
  if (systemAlert) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full flex flex-col items-center text-center gap-4">
          <Empty imageStyle={{ height: 120 }} description={null} />
          <h2 className="text-xl font-bold text-gray-800">Thông báo hệ thống</h2>
          <p className="text-gray-600 bg-red-50 p-4 rounded-lg border border-red-100 w-full font-medium">{systemAlert}</p>
          <Button type="primary" onClick={() => router.push(`/user/classes/${classId}`)} className="bg-indigo-600">
            Quay lại lớp học
          </Button>
        </div>
      </div>
    );
  }

  // 4. Start Screen / Rules (NEW)
  if (!hasStarted && test) {
    return <ExamStartScreen test={test} onStart={startExam} />;
  }

  // 5. Empty State
  if (!test || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <Empty description="Không tìm thấy bài thi hoặc dữ liệu bị lỗi" />
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = flaggedQuestions.size;

  return (
    <RouteErrorBoundary routeName="exam">
      <div className="h-screen bg-slate-50 select-none grid grid-cols-1 lg:grid-cols-3 overflow-hidden" id="exam-fullscreen-root">
        <ExamMain
          test={test}
          currentPage={currentPage}
          totalQuestions={totalQuestions}
          currentQuestion={currentQuestion}
          userAnswers={userAnswers}
          isSubmitted={isSubmitted}
          onSelectOption={handleSelectOption}
          onToggleFlag={toggleFlag}
          onClearAnswer={() => handleSelectOption(currentQuestion.id, "")}
          onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(totalQuestions - 1, p + 1))}
          canPrev={currentPage > 0}
          canNext={currentPage < totalQuestions - 1}
          isFlagged={flaggedQuestions.has(currentQuestion.id)}
        />
        <ExamSidebar
          test={test}
          currentPage={currentPage}
          remainingSeconds={remainingSeconds}
          progressPercent={progressPercent}
          timeProgressPercent={timeProgressPercent}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          violationCount={violations.length}
          userAnswers={userAnswers}
          flaggedQuestions={flaggedQuestions}
          isSubmitted={isSubmitted}
          socketConnected={socketConnected}
          onReconnect={handleReconnect}
          onSelectQuestion={setCurrentPage}
          onSubmit={handleSubmit}
        />
      </div>
    </RouteErrorBoundary>
  );
}
