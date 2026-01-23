"use client";

import React from "react";
import { Result, Button, Empty } from "antd";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  type: "noTestId" | "notFound";
  classId: string;
}

export default function ErrorState({ type, classId }: ErrorStateProps) {
  const router = useRouter();

  if (type === "noTestId") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <Result
          status="warning"
          title={<span className="dark:text-gray-200">Thiếu mã bộ đề</span>}
          subTitle={<span className="dark:text-gray-400">Vui lòng quay lại trang tạo đề AI.</span>}
          extra={
            <Button type="primary" onClick={() => router.push(`/admin/classes/${classId}/examinate`)}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
      <Empty description={<span className="dark:text-gray-400">Không tìm thấy bộ đề</span>} />
    </div>
  );
}
