"use client";

import { memo } from "react";
import { Button, Space } from "antd";
import { ArrowLeftOutlined, ReloadOutlined, CalculatorOutlined } from "@ant-design/icons";
import ExamExportButton from "./ExamExportButton";

interface ExamDetailHeaderProps {
  classId: string;
  examId: string;
  loading: boolean;
  attemptsCount: number;
  onBack: () => void;
  onRecalculate: () => void;
  onRefresh: () => void;
  recalculating: boolean;
  refreshing: boolean;
}

export default memo(function ExamDetailHeader({
  classId,
  examId,
  loading,
  attemptsCount,
  onBack,
  onRecalculate,
  onRefresh,
  recalculating,
  refreshing,
}: ExamDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        icon={<ArrowLeftOutlined />}
        className="rounded-lg font-medium border-gray-200"
        onClick={onBack}
      >
        Quay lại
      </Button>
      <Space>
        <ExamExportButton classId={classId} examId={examId} disabled={loading || attemptsCount === 0} />
        <Button
          icon={<CalculatorOutlined />}
          onClick={onRecalculate}
          loading={recalculating}
          className="rounded-lg font-medium border-gray-200"
          title="Tính lại điểm khi đã sửa đáp án đúng"
        >
          Cập nhật điểm số
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={refreshing}
          className="rounded-lg font-medium border-gray-200"
          title="Cập nhật dữ liệu mới nhất"
        >
          Làm mới
        </Button>
      </Space>
    </div>
  );
});
