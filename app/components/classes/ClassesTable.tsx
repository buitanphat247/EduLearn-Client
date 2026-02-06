"use client";

import { memo, useMemo, useRef, useEffect } from "react";
import { Table, Button, Space, App } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import type { ClassItem } from "@/interface/classes";

interface ClassesTableProps {
  data: ClassItem[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onEdit?: (classItem: ClassItem) => void;
  onDelete?: (classItem: ClassItem) => void;
}

function ClassesTable({ data, loading, pagination, onEdit, onDelete }: ClassesTableProps) {
  const router = useRouter();
  const { modal, message } = App.useApp();
  
  // Stable refs to avoid re-renders
  const modalRef = useRef(modal);
  const messageRef = useRef(message);
  const onEditRef = useRef(onEdit);
  const onDeleteRef = useRef(onDelete);
  
  useEffect(() => {
    modalRef.current = modal;
    messageRef.current = message;
    onEditRef.current = onEdit;
    onDeleteRef.current = onDelete;
  }, [modal, message, onEdit, onDelete]);

  // Memoize columns to prevent re-render
  const columns: ColumnsType<ClassItem> = useMemo(() => [
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {text}
        </span>
      ),
    },
    {
      title: "Mã lớp",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="text-gray-600 dark:text-gray-300 font-mono text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{code}</span>
      ),
    },
    {
      title: "Số học sinh",
      dataIndex: "students",
      key: "students",
      render: (count: number) => (
        <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
          <UserOutlined className="text-blue-500 dark:text-blue-400" />
          <span className="font-medium">{count}</span>
        </span>
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher: string) => <span className="text-gray-600 dark:text-gray-400">{teacher}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (_: any, record: ClassItem) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (onEditRef.current) {
            onEditRef.current(record);
          } else {
            messageRef.current.warning("Tính năng sửa đang được phát triển");
          }
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (onDeleteRef.current) {
            onDeleteRef.current(record);
          } else {
            modalRef.current.confirm({
              title: "Xác nhận xóa",
              content: `Bạn có chắc chắn muốn xóa lớp học "${record.name}"?`,
              okText: "Xóa",
              okType: "danger",
              cancelText: "Hủy",
              onOk() {
                messageRef.current.warning("Tính năng xóa đang được phát triển");
              },
            });
          }
        };

        const handleView = (e: React.MouseEvent) => {
          e.stopPropagation();
          router.push(`/admin/classes/${record.key}`);
        };

        return (
          <Space size={4}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
              onClick={handleView}
            >
              Xem
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              className="hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
              onClick={handleEdit}
            >
              Sửa
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-700 transition-all duration-200"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ], [router]);

  // Memoize pagination config
  const paginationConfig = useMemo(() => {
    if (!pagination) {
      return {
        showSizeChanger: false,
        showTotal: (total: number) => <span className="text-gray-600 dark:text-gray-400">Tổng {total} lớp học</span>,
        size: "small" as const,
      };
    }
    return {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: false,
      showTotal: (total: number) => <span className="text-gray-600 dark:text-gray-400">Tổng {total} lớp học</span>,
      size: "small" as const,
      onChange: pagination.onChange,
    };
  }, [pagination]);

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={paginationConfig}
      className="[&_.ant-pagination]:px-6 [&_.ant-pagination]:pb-4"
      rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-800"
      size="small"
      rowKey="key"
    />
  );
}

export default memo(ClassesTable);
