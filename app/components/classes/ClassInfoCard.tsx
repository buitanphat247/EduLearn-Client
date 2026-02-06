"use client";

import { memo } from "react";
import { Descriptions, Tag, Avatar, Button } from "antd";
import { UserOutlined, InfoCircleOutlined, CopyOutlined } from "@ant-design/icons";
import CustomCard from "@/app/components/common/CustomCard";

interface CreatorInfo {
  user_id: number | string;
  username: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

interface ClassInfo {
  name: string;
  code: string;
  students: number;
  status: string;
  creator?: CreatorInfo | null;
  created_at?: string;
}

interface ClassInfoCardProps {
  classInfo: ClassInfo;
  onCopyCode?: () => void;
}

function ClassInfoCard({ classInfo, onCopyCode }: ClassInfoCardProps) {

  const handleCopyCode = () => {
    if (onCopyCode) {
      onCopyCode();
    } else {
      navigator.clipboard.writeText(classInfo.code);
    }
  };

  return (
    <CustomCard
      title={
        <div className="flex items-center gap-2">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Thông tin lớp học</span>
        </div>
      }
      bodyClassName="py-6"
    >
      <Descriptions column={2} bordered layout="horizontal">
        <Descriptions.Item label="Tên lớp" span={1}>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{classInfo.name}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Mã lớp" span={1}>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded">{classInfo.code}</span>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyCode}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            />
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Số lượng học sinh" span={1}>
          <span className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span className="font-medium dark:text-gray-200">{classInfo.students} học sinh</span>
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={1}>
          <Tag color={classInfo.status === "Đang hoạt động" ? "success" : "default"}>
            {classInfo.status}
          </Tag>
        </Descriptions.Item>
        {classInfo.creator && (
          <Descriptions.Item label="Giáo viên chủ nhiệm" span={2}>
            <div className="flex items-center gap-3">
              <Avatar
                src={classInfo.creator.avatar}
                icon={<UserOutlined />}
                size="default"
                className="bg-blue-500"
              >
                {classInfo.creator.fullname?.charAt(0) || "GV"}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-gray-100">{classInfo.creator.fullname}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">email: {classInfo.creator.email}</span>
              </div>
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>
    </CustomCard>
  );
}

export default memo(ClassInfoCard);
