"use client";

import { RagQuestion } from "@/lib/api/rag-exams";
import Image from "next/image";
import { QuestionOptionItem } from "./QuestionOptionItem";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

type UserAnswers = Record<string, string>;

interface ExamQuestionBodyProps {
  question: RagQuestion;
  questionIndex: number;
  userAnswers: UserAnswers;
  isSubmitted: boolean;
  onSelectOption: (questionId: string, option: string) => void;
}

export function ExamQuestionBody({
  question,
  questionIndex,
  userAnswers,
  isSubmitted,
  onSelectOption,
}: ExamQuestionBodyProps) {
  const selectedValue = userAnswers[question.id];
  const name = `q-${question.id}`;
  const defaultImageUrl =
    "https://hoc24.vn/source/KHTN%207-%20Quy%C3%AAn/Ch%C6%B0%C6%A1ng%20III/D3.png";
  const imageSrc = question.imageUrl ?? defaultImageUrl;
  const hasQuestionImage = !!question.imageUrl;

  const openFancybox = () => {
    Fancybox.show([{ src: imageSrc }]);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10">
      <div className="mx-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Câu {questionIndex + 1}
        </p>
        <h2 className="text-xl lg:text-2xl font-semibold text-slate-800 leading-relaxed mb-4">
          {question.content}
        </h2>

        {/* Có ảnh câu hỏi: preview vừa + bấm mở modal; không có: chỉ thumbnail nhỏ */}
        <div
          className={
            hasQuestionImage
              ? "mb-8"
              : "mb-6 flex justify-start"
          }
        >
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
            onClick={openFancybox}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-indigo-600 border border-indigo-100">
              i
            </span>
            <span>
              {hasQuestionImage ? "Xem hình minh hoạ" : "Xem ảnh gợi ý"}
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const label = String.fromCharCode(65 + i);
            const selected = selectedValue === opt;
            return (
              <QuestionOptionItem
                key={i}
                name={name}
                label={label}
                optionText={opt}
                selected={selected}
                disabled={isSubmitted}
                onSelect={() =>
                  !isSubmitted && onSelectOption(question.id, opt)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
