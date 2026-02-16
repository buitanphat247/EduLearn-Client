"use client";

import { useState, useCallback, useRef } from "react";
import { Button, Dropdown, App, type MenuProps } from "antd";
import { DownloadOutlined, TrophyOutlined, BarChartOutlined } from "@ant-design/icons";
import { exportScoresExcel, type ExportMode } from "@/lib/api/exam-export";

interface ExamExportButtonProps {
  classId: string;
  examId: string;
  disabled?: boolean;
}

export default function ExamExportButton({ classId, examId, disabled }: ExamExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const exportingRef = useRef(false);
  const { message } = App.useApp();

  const handleExport = useCallback(
    async (mode: ExportMode) => {
      if (exportingRef.current) return;
      exportingRef.current = true;
      setLoading(true);
      try {
        await exportScoresExcel(Number(classId), examId, mode);
        message.success({
          content: mode === "highest" ? "Đã xuất điểm cao nhất (Excel)" : "Đã xuất điểm trung bình (Excel)",
          key: "exam_export",
        });
      } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: { error?: string } } };
        const errMsg = err?.response?.data?.error ?? err?.message ?? "Không thể xuất file";
        message.error({ content: errMsg, key: "exam_export" });
      } finally {
        exportingRef.current = false;
        setLoading(false);
      }
    },
    [classId, examId, message]
  );

  const items: MenuProps["items"] = [
    {
      key: "highest",
      icon: <TrophyOutlined />,
      label: "Điểm cao nhất (mỗi học sinh)",
      onClick: () => handleExport("highest"),
    },
    {
      key: "average",
      icon: <BarChartOutlined />,
      label: "Điểm trung bình (các lượt làm)",
      onClick: () => handleExport("average"),
    },
  ];

  return (
    <Dropdown menu={{ items, disabled: loading }} trigger={["click"]} placement="bottomRight">
      <Button
        icon={<DownloadOutlined />}
        loading={loading}
        disabled={disabled || loading}
        className="rounded-lg font-medium border-gray-200"
        title="Xuất điểm ra Excel"
      >
        Xuất Excel
      </Button>
    </Dropdown>
  );
}
