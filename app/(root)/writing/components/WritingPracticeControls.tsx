"use client";

import { memo } from "react";
import { Typography, Tag, Spin } from "antd";
import { BookOutlined, ReadOutlined, LoadingOutlined } from "@ant-design/icons";

interface HintData {
  vocabulary: Array<{ word: string; meaning: string }>;
  structure: string;
}

interface MaskedTextProps {
  text: string;
  revealedWordIndices?: Set<number>;
}

const MaskedText = memo(({ text, revealedWordIndices = new Set<number>() }: MaskedTextProps) => {
  const words = text.split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        if (revealedWordIndices.has(idx)) {
          return <span key={idx}>{word} </span>;
        }
        return (
          <span key={idx} className="font-mono tracking-widest text-blue-400">
            {word.replace(/[\p{L}\p{N}]/gu, "*")}{" "}
          </span>
        );
      })}
    </span>
  );
}, (prevProps, nextProps) => {
  if (prevProps.text !== nextProps.text) return false;

  const prevIndices = prevProps.revealedWordIndices || new Set<number>();
  const nextIndices = nextProps.revealedWordIndices || new Set<number>();

  if (prevIndices.size !== nextIndices.size) return false;

  for (const idx of prevIndices) {
    if (!nextIndices.has(idx)) return false;
  }
  for (const idx of nextIndices) {
    if (!prevIndices.has(idx)) return false;
  }

  return true;
});

MaskedText.displayName = "MaskedText";

interface WritingPracticeControlsProps {
  englishSentences: string[];
  currentSentenceIndex: number;
  completedSentences: Set<number>;
  revealedWordIndices: Set<number>;

  // Hint props
  showHint: boolean;
  hintData: HintData | null;
  hintLoading: boolean;
  onToggleHint: () => void;
  /** Limit theo gói: còn bao nhiêu lượt gợi ý, có được phép dùng không */
  hintUsage?: { allowed: boolean; currentCount: number; limit: number } | null;
}

export default function WritingPracticeControls({
  englishSentences,
  currentSentenceIndex,
  completedSentences,
  revealedWordIndices,
  showHint,
  hintData,
  hintLoading,
  onToggleHint,
  hintUsage,
}: WritingPracticeControlsProps) {
  const isRevealed = completedSentences.has(currentSentenceIndex);
  const sentence = englishSentences[currentSentenceIndex] || "";

  const hintDisabled = hintUsage != null && !hintUsage.allowed;
  const hintLabel =
    hintUsage == null
      ? null
      : hintUsage.limit === -1
        ? "Không giới hạn"
        : hintUsage.limit === 0
          ? "Tính năng chưa bật"
          : `Còn ${Math.max(0, hintUsage.limit - hintUsage.currentCount)} lượt gợi ý`;

  let speakerName = "";
  let content = sentence;
  const parts = sentence.split(":");

  if (parts.length > 1 && parts[0].trim().split(" ").length <= 3) {
    speakerName = parts[0].trim();
    content = parts.slice(1).join(":").trim();
  } else {
    content = sentence.trim();
  }

  return (
    <div className="lg:col-span-5 relative">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-[500px] flex flex-col transition-colors duration-300 xl:sticky xl:top-24">

        {/* Header - Hint Title */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#1e293b] gap-3 transition-colors">
          <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-500">
            <span className="text-amber-500 text-xl">💡</span> Gợi ý dịch
            {hintLabel != null && (
              <Typography.Text type="secondary" className="text-xs font-normal ml-1">
                ({hintLabel})
              </Typography.Text>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={showHint || hintDisabled ? undefined : onToggleHint}
              disabled={showHint || hintDisabled}
              className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all border ${showHint
                ? "bg-amber-100 border-amber-200 text-amber-500 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-500 cursor-default"
                : hintDisabled
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-800/50 shadow-sm cursor-pointer"
                }`}
            >
              {showHint ? "Đã hiển thị gợi ý" : hintDisabled ? "Hết lượt gợi ý" : "Hiển thị Gợi ý"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4 flex-1 h-full overflow-y-auto custom-scrollbar">

          {/* Always show the Target masked sentence box to give context */}
          {sentence && (
            <div className={`p-4 rounded-xl border transition-all relative overflow-hidden ${isRevealed ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]" : "border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#243146]"}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${isRevealed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}></div>
              <div className="text-base font-medium leading-relaxed font-sans wrap-break-word text-slate-700 dark:text-slate-300">
                {speakerName && (
                  <span className="text-sm font-bold mr-2 text-slate-600 dark:text-slate-400">
                    {speakerName}:
                  </span>
                )}
                {isRevealed ? (
                  <span>{content}</span>
                ) : (
                  <MaskedText text={content} revealedWordIndices={revealedWordIndices} />
                )}
              </div>
            </div>
          )}

          {/* Hint Context Area */}
          {showHint && (
            <div className="mt-4 border-t border-slate-100 dark:border-slate-700/50 pt-4 animate-fadeIn">
              {hintLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                  <Typography.Text className="text-slate-500 dark:text-slate-400 text-sm">
                    AI đang phân tích câu...
                  </Typography.Text>
                </div>
              ) : hintData ? (
                <div className="space-y-4">
                  {/* Vocabulary Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOutlined className="text-blue-500" />
                      <Typography.Text strong className="text-slate-700 dark:text-slate-200 text-sm">
                        Chẻ nhỏ từ vựng
                      </Typography.Text>
                      <Tag color="blue" className="ml-auto text-[10px] m-0">{hintData.vocabulary.length} cụm</Tag>
                    </div>
                    <div className="space-y-1.5 pr-1">
                      {hintData.vocabulary.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-1 py-1.5 px-3 rounded bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800/30 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/25 transition-colors"
                        >
                          <span className="font-semibold text-blue-700 dark:text-blue-300">
                            {item.word}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-xs hidden lg:inline">—</span>
                          <span className="text-slate-500 dark:text-slate-300">
                            {item.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grammar Structure Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ReadOutlined className="text-emerald-500" />
                      <Typography.Text strong className="text-slate-700 dark:text-slate-200 text-sm">
                        Cấu trúc ngữ pháp
                      </Typography.Text>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/15 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                      <Typography.Text className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                        {hintData.structure}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4 text-sm">
                  Chưa có dữ liệu gợi ý cho câu này.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
