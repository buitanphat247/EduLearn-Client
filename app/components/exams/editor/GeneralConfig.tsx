"use client";

import { memo, useMemo } from "react";
import { InputNumber, Select } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import CustomCard from "@/app/components/common/CustomCard";
import { GeneralConfigProps } from "./types";

// Memoized General Config Component
export const GeneralConfig = memo<GeneralConfigProps>(
  ({ timeMinutes, maxScore, totalQuestions, status, onTimeChange, onMaxScoreChange, onTotalQuestionsChange, onStatusChange }) => {
    const statusOptions = useMemo(
      () => [
        { value: "draft", label: "Bản nháp" },
        { value: "published", label: "Xuất bản" },
      ],
      []
    );

    return (
      <CustomCard
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-gray-600" />
            <span className="font-semibold">Cấu hình chung</span>
          </div>
        }
        padding="md"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
            <InputNumber value={timeMinutes} onChange={onTimeChange} min={1} className="w-full" size="middle" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối đa</label>
            <InputNumber value={maxScore} onChange={onMaxScoreChange} min={0} step={0.5} className="w-full" size="middle" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng câu hỏi</label>
            <InputNumber value={totalQuestions} onChange={onTotalQuestionsChange} min={1} className="w-full" size="middle" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <Select value={status} onChange={onStatusChange} className="w-full" size="middle" options={statusOptions} />
          </div>
        </div>
      </CustomCard>
    );
  }
);

GeneralConfig.displayName = "GeneralConfig";

