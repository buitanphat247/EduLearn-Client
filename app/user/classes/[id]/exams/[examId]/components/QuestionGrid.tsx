"use client";

import { LeftOutlined, RightOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Tooltip, Button } from "antd";
import { type RagQuestion } from "@/lib/api/rag-exams";
import { type Violation } from "@/app/hooks/useAntiCheat";

interface QuestionGridProps {
  questions: RagQuestion[];
  userAnswers: Record<string, string>;
  flaggedQuestions: Set<string>;
  activeQuestionId?: string | null;
  currentPage: number;
  totalPages: number;
  questionsPerPage: number;
  onPageChange: (page: number) => void;
  onSelectQuestion?: (questionId: string) => void;
  onSubmit: () => void;
  violations: Violation[];
  isSubmitted?: boolean;
}

export default function QuestionGrid({
  questions,
  userAnswers,
  flaggedQuestions,
  activeQuestionId,
  currentPage,
  totalPages,
  questionsPerPage,
  onPageChange,
  onSelectQuestion,
  onSubmit,
  violations,
  isSubmitted = false,
}: QuestionGridProps) {
  return (
    <aside className="hidden lg:block w-[26%] shrink-0 space-y-4">
      {/* Question Grid */}
      <div className="bg-white rounded-md border border-gray-200 p-3">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Danh sách câu hỏi</h3>
          <p className="text-xs text-gray-500">
            Trang {currentPage + 1}/{totalPages}
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id];
            const questionPage = Math.floor(idx / questionsPerPage);
            const isOnCurrentPage = questionPage === currentPage;
            const isActive = activeQuestionId ? activeQuestionId === q.id : isOnCurrentPage;
            const isFlagged = flaggedQuestions.has(q.id);

            return (
              <Tooltip
                key={q.id}
                title={isFlagged ? "Đã gắn cờ" : isAnswered ? "Đã trả lời" : "Chưa trả lời"}
              >
                <button
                  onClick={() => {
                    onPageChange(questionPage);
                    if (onSelectQuestion) onSelectQuestion(q.id);
                  }}
                  className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all shadow-sm ${
                    isActive ? "ring-2 ring-indigo-500 ring-offset-2 z-10" : ""
                  } ${
                    isAnswered
                      ? "bg-blue-600 text-white border border-blue-700 hover:bg-blue-700"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {idx + 1}
                  {isAnswered && (
                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center shadow-sm">
                        <CheckCircleFilled style={{ fontSize: '8px', color: 'white' }} />
                     </div>
                  )}
                  {isFlagged && !isAnswered && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-white" />
                  )}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded bg-blue-600 border border-blue-700" />
            <span>Đã trả lời</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded bg-white border border-gray-200" />
            <span>Chưa trả lời</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <Button
            icon={<LeftOutlined />}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            size="small"
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {currentPage + 1}/{totalPages}
          </span>
          <Button
            icon={<RightOutlined />}
            type="primary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            size="small"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-md border border-amber-200 p-3">
        <p className="text-xs font-bold text-amber-700 mb-1">💡 Mẹo</p>
        <p className="text-xs text-amber-800">Gắn cờ các câu hỏi cần xem lại sau.</p>
      </div>



      {/* Submit/Exit button */}
      <button
        onClick={onSubmit}
        className={`w-full py-2.5 rounded-lg text-white text-sm font-semibold shadow-md transition-all active:scale-95 ${
           isSubmitted ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        }`}
      >
        {isSubmitted ? "Thoát hệ thống" : "Nộp bài thi"}
      </button>
    </aside>
  );
}
