"use client";

import { Button } from "antd";
import { BulbOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";

interface WritingPracticeInputProps {
  userTranslation: string;
  currentEnglishSentence: string;
  onTranslationChange: (value: string) => void;
  onCheck: () => void;
}

export default function WritingPracticeInput({
  userTranslation,
  onTranslationChange,
  onCheck,
}: WritingPracticeInputProps) {
  return (
    <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4">
      {/* Center Input */}
      <div className="relative flex-1 order-1 bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-600 rounded-lg transition-colors duration-200 focus-within:border-blue-500 dark:focus-within:border-blue-400">
        <textarea
          placeholder="Nhập bản dịch của bạn..."
          value={userTranslation}
          onChange={(e) => onTranslationChange(e.target.value)}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onCheck();
            }
          }}
          className="w-full h-full bg-transparent border-none px-4 py-3 pb-8 text-base text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none font-medium focus:outline-none focus:ring-0 custom-scrollbar"
        />
        <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide pointer-events-none select-none hidden sm:block">
          Shift + Enter
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex-none order-2 flex justify-center">
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={onCheck}
          icon={<CheckOutlined className="text-xl" />}
          className="bg-blue-600 hover:bg-blue-500 border-0 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all w-12 h-12 flex items-center justify-center p-0"
        />
      </div>
    </div>
  );
}
