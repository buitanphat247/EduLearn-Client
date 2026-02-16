"use client";

import { FlagFilled, FlagOutlined, CheckCircleFilled } from "@ant-design/icons";
import { type RagQuestion } from "@/lib/api/rag-exams";

interface QuestionCardProps {
  question: RagQuestion;
  questionNumber: number;
  selectedAnswer?: string;
  isFlagged: boolean;
  onSelectOption: (questionId: string, option: string) => void;
  onToggleFlag: (questionId: string) => void;
  readOnly?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswer,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  readOnly = false,
}: QuestionCardProps) {
  const isAnswered = !!selectedAnswer;

  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* ... Question Header ... */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
            {/* Same header content... */}
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">
            Câu {questionNumber}
          </span>
          {isAnswered && (
            <span className="text-green-600 text-xs flex items-center gap-1">
              <CheckCircleFilled /> Đã trả lời
            </span>
          )}
        </div>
        <button
          disabled={readOnly}
          onClick={() => onToggleFlag(question.id)}
          className={`p-1.5 rounded-lg transition-all ${
            isFlagged ? "bg-amber-100 text-amber-500" : "hover:bg-gray-200 text-gray-400"
          } ${readOnly ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isFlagged ? <FlagFilled /> : <FlagOutlined />}
        </button>
      </div>

      {/* Question Content */}
      <div className="p-4">
        <p className="font-medium text-gray-900 mb-3 text-sm">{question.content}</p>

        {/* Options - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          {question.options.map((opt: string, optIdx: number) => {
            const optionLabel = ["A", "B", "C", "D"][optIdx];
            const isSelected = selectedAnswer === optionLabel;

            return (
              <button
                key={optIdx}
                disabled={readOnly}
                onClick={() => !readOnly && onSelectOption(question.id, optionLabel)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left text-sm transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${readOnly ? 'cursor-not-allowed' : ''}`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {optionLabel}
                </span>
                <span className={`truncate ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
