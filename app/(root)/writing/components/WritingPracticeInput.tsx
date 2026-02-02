"use client";

import { Button, Input } from "antd";
import { BulbOutlined, CheckOutlined } from "@ant-design/icons";

interface WritingPracticeInputProps {
  userTranslation: string;
  showHint: boolean;
  currentEnglishSentence: string;
  onTranslationChange: (value: string) => void;
  onToggleHint: () => void;
  onCheck: () => void;
}

export default function WritingPracticeInput({
  userTranslation,
  showHint,
  currentEnglishSentence,
  onTranslationChange,
  onToggleHint,
  onCheck,
}: WritingPracticeInputProps) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {/* Hint Button (Outside Left) */}
      <div className="relative pb-1">
        <Button
          shape="circle"
          icon={<BulbOutlined />}
          onClick={onToggleHint}
          className={`flex items-center justify-center border-0 shadow-lg transition-all hover:scale-105 active:scale-95 ${showHint
            ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20"
            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          title="Gợi ý"
        />

        {/* Hint Tooltip */}
        {showHint && currentEnglishSentence && (
          <div className="absolute bottom-full left-0 mb-4 w-[300px] max-w-[80vw] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold mb-3 text-xs uppercase tracking-widest">
              <BulbOutlined /> Gợi ý dịch
            </div>
            <div className="text-slate-700 dark:text-slate-200 text-base leading-relaxed font-medium font-serif italic border-l-2 border-amber-500/50 pl-4 py-1">
              "{currentEnglishSentence}"
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-amber-200 dark:border-amber-500/30 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Center Input */}
      <div className="relative flex-1 bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-xl transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-blue-500/10">
        <Input.TextArea
          placeholder="Nhập bản dịch..."
          value={userTranslation}
          onChange={(e) => onTranslationChange(e.target.value)}
          autoSize={{ minRows: 1, maxRows: 5 }}
          className="w-full bg-transparent! border-none! shadow-none! px-5! py-3.5! text-base! md:text-lg! text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none! font-medium "
          onPressEnter={(e) => {
            if (e.shiftKey) return;
            e.preventDefault();
            onCheck();
          }}
        />
        <div className="absolute bottom-1 right-5 text-[10px] text-slate-400 dark:text-slate-600 font-bold tracking-wider opacity-60 pointer-events-none select-none hidden sm:block">
          SHIFT + ENTER
        </div>
      </div>

      {/* Submit Button (Outside Right) */}
      <div className="pb-1">
        <Button
          type="primary"
          shape="circle"
          onClick={onCheck}
          icon={<CheckOutlined className="text-xl" />}
          className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-110 active:scale-95 transition-all w-12 h-12 flex items-center justify-center p-0"
        />
      </div>
    </div>
  );
}
