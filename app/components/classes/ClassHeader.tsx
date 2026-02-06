"use client";

import { memo } from "react";
import { Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface ClassHeaderProps {
  className: string;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

function ClassHeader({ className, onEdit, onDelete, onRefresh, refreshing = false }: ClassHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/classes")} className="cursor-pointer">
          Quay lại
        </Button>
      </div>
      <Space>
        {onRefresh && (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onRefresh} 
            loading={refreshing}
            className="cursor-pointer"
          >
            Làm mới
          </Button>
        )}
        <Button icon={<EditOutlined />} onClick={onEdit} className="cursor-pointer">
          Chỉnh sửa
        </Button>
        <Button icon={<DeleteOutlined />} danger onClick={onDelete} className="cursor-pointer">
          Xóa lớp học
        </Button>
      </Space>
    </div>
  );
}

export default memo(ClassHeader);
