"use client";

import { ClockCircleOutlined, TrophyOutlined, FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

interface ExamHeaderProps {
  onExit: () => void;
  progressPercent: number;
  elapsedTime: string;
  score: number;
  totalQuestions: number;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export default function ExamHeader({
  onExit,
  progressPercent,
  elapsedTime,
  score,
  totalQuestions,
  isFullScreen,
  onToggleFullScreen,
}: ExamHeaderProps) {
  return (
    <header className="mb-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between gap-6">
      {/* Progress Bar Area - Restored and Optmized */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Tiến độ</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-bold text-indigo-600 w-9 text-right">{progressPercent}%</span>
      </div>

      {/* Stats Area */}
      <div className="flex items-center gap-3 shrink-0">
        {!isFullScreen && (
          <Tooltip title="Bắt buộc chế độ toàn màn hình">
             <Button 
               type="primary"
               icon={<FullscreenOutlined />}
               onClick={onToggleFullScreen}
               className="flex items-center justify-center border-indigo-200"
             >
                Toàn màn hình
             </Button>
          </Tooltip>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-50 border border-gray-100 text-xs">
          <ClockCircleOutlined className="text-gray-400" />
          <span className="font-mono font-semibold text-gray-700">{elapsedTime}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-xs">
          <TrophyOutlined className="text-indigo-500" />
          <span className="font-bold text-indigo-700">
            {score}/{totalQuestions}
          </span>
        </div>
      </div>
    </header>
  );
}
