"use client";

import { Button, Space } from "antd";
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface ClassHeaderProps {
  className: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ClassHeader({ className, onEdit, onDelete }: ClassHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/classes")} className="cursor-pointer">
          Quay lại
        </Button>
      </div>
      <Space>
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
