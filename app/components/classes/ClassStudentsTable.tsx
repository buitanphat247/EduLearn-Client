"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { Button, Space, Tag, Table, Select } from "antd";
import { DeleteOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import CustomCard from "@/app/components/common/CustomCard";
import type { StudentItem } from "@/interface/students";

type StatusFilter = "all" | "online" | "banned";

interface ClassStudentsTableProps {
  students: StudentItem[];
  onViewStudent: (student: StudentItem) => void;
  onRemoveStudent: (student: StudentItem) => void;
  onBanStudent?: (student: StudentItem) => void;
  onUnbanStudent?: (student: StudentItem) => Promise<void>;
}

function ClassStudentsTable({ students, onViewStudent, onRemoveStudent, onBanStudent, onUnbanStudent }: ClassStudentsTableProps) {
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Filter students based on status - memoized
  const filteredStudents = useMemo(() => {
    if (statusFilter === "all") return students;
    return students.filter((s) => s.apiStatus === statusFilter || (statusFilter === "online" && !s.apiStatus));
  }, [students, statusFilter]);

  // Count for filter badges - memoized
  const counts = useMemo(() => ({
    all: students.length,
    online: students.filter((s) => s.apiStatus === "online" || !s.apiStatus).length,
    banned: students.filter((s) => s.apiStatus === "banned").length,
  }), [students]);

  // Filter options - memoized
  const filterOptions = useMemo(() => [
    { label: `Tất cả (${counts.all})`, value: "all" },
    { label: `Đang học (${counts.online})`, value: "online" },
    { label: `Bị cấm (${counts.banned})`, value: "banned" },
  ], [counts]);

  // Stable handler for unbanning
  const handleUnban = useCallback(async (student: StudentItem) => {
    if (!onUnbanStudent) return;
    setLoadingStudentId(String(student.userId));
    try {
      await onUnbanStudent(student);
    } finally {
      setLoadingStudentId(null);
    }
  }, [onUnbanStudent]);

  // Stable handler for filter change
  const handleFilterChange = useCallback((value: string) => {
    setStatusFilter(value as StatusFilter);
  }, []);

  // Memoized columns to prevent re-renders
  const studentColumns: ColumnsType<StudentItem> = useMemo(() => [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
      render: (text: string) => (
        <span className="font-mono text-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
          {text}
        </span>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 dark:text-gray-100">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => (
        <span className="text-gray-600 dark:text-gray-400">{text}</span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_: any, record: StudentItem) => {
        const isBanned = record.apiStatus === "banned";
        return isBanned ? (
          <Tag icon={<StopOutlined />} color="error">Bị cấm</Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">Đang học</Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 220,
      render: (_: any, record: StudentItem) => {
        const isBanned = record.apiStatus === "banned";
        const isLoading = loadingStudentId === String(record.userId);
        
        return (
          <Space size="small">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => onViewStudent(record)} 
              className="cursor-pointer"
            >
              Xem
            </Button>
            {isBanned ? (
              onUnbanStudent && (
                <Button 
                  icon={isLoading ? <LoadingOutlined /> : <CheckCircleOutlined />} 
                  size="small" 
                  type="primary"
                  onClick={() => handleUnban(record)} 
                  className="cursor-pointer"
                  loading={isLoading}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Gỡ cấm
                </Button>
              )
            ) : (
              onBanStudent && (
                <Button 
                  icon={<StopOutlined />} 
                  size="small" 
                  danger
                  onClick={() => onBanStudent(record)} 
                  className="cursor-pointer"
                >
                  Cấm
                </Button>
              )
            )}
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => onRemoveStudent(record)} 
              className="cursor-pointer"
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ], [loadingStudentId, onViewStudent, onBanStudent, onUnbanStudent, handleUnban, onRemoveStudent]);

  // Memoized empty text
  const emptyText = useMemo(() => {
    if (statusFilter === "banned") return "Không có học sinh bị cấm";
    if (statusFilter === "online") return "Không có học sinh đang học";
    return "Không có học sinh";
  }, [statusFilter]);

  // Memoized extra component
  const cardExtra = useMemo(() => (
    <Select
      value={statusFilter}
      onChange={handleFilterChange}
      style={{ width: 180 }}
      options={filterOptions}
      size="middle"
    />
  ), [statusFilter, handleFilterChange, filterOptions]);

  return (
    <CustomCard 
      title="Danh sách học sinh" 
      bodyClassName="py-6"
      extra={cardExtra}
    >
      <Table 
        columns={studentColumns} 
        dataSource={filteredStudents} 
        pagination={false} 
        rowClassName="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800"
        locale={{ emptyText }}
      />
    </CustomCard>
  );
}

export default memo(ClassStudentsTable);
