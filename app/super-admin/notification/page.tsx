"use client";

import { Table, Tag, Button, Space, Select, App, Input, Spin } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import CreateNotificationModal from "@/app/components/super-admin/CreateNotificationModal";
import NotificationDetailModal from "@/app/components/super-admin/NotificationDetailModal";
import { getNotifications, type NotificationResponse } from "@/lib/api/notifications";

const { Option } = Select;

interface NotificationType {
  key: string;
  id: string;
  title: string;
  message: string;
  scope: "all" | "user" | "class";
  scope_id: number | null;
  createdAt: string;
}

export default function SuperAdminNotifications() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Format date từ ISO string sang định dạng Việt Nam
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    const startTime = Date.now();
    try {
      setLoading(true);
      const result = await getNotifications({
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery || undefined,
      });

      // Map API response to component format
      const mappedNotifications: NotificationType[] = result.notifications.map((notif) => ({
        key: String(notif.notification_id),
        id: String(notif.notification_id),
        title: notif.title,
        message: notif.message,
        scope: notif.scope,
        scope_id: notif.scope_id,
        createdAt: formatDate(notif.created_at),
      }));

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setNotifications(mappedNotifications);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } catch (error: any) {
      // Ensure minimum loading time even on error
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      message.error(error?.message || "Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, debouncedSearchQuery, message]);

  // Fetch notifications on mount and when dependencies change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const columns: ColumnsType<NotificationType> = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (_: any, __: NotificationType, index: number) => {
        const currentPage = pagination.current;
        const pageSize = pagination.pageSize;
        const stt = (currentPage - 1) * pageSize + index + 1;
        return (
          <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{stt}</span>
        );
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: "60%",
      render: (text: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
          {text}
        </span>
      ),
    },
    {
      title: "Phạm vi",
      dataIndex: "scope",
      key: "scope",
      render: (scope: string) => {
        const scopeMap: Record<string, { color: string; text: string }> = {
          all: { color: "orange", text: "Tất cả" },
          user: { color: "cyan", text: "Người dùng" },
          class: { color: "geekblue", text: "Lớp học" },
        };
        const scopeInfo = scopeMap[scope] || { color: "default", text: scope };
        return (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={scopeInfo.color}>
            {scopeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: NotificationType) => {
        const handleEdit = (e: React.MouseEvent) => {
          e.stopPropagation();
          message.warning("Tính năng sửa đang được phát triển");
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa thông báo "${record.title}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
              message.warning("Tính năng xóa đang được phát triển");
            },
          });
        };

        return (
          <Space size={4}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNotificationId(record.id);
                setIsDetailModalOpen(true);
              }}
            >
              Xem
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 transition-all duration-200"
              onClick={handleEdit}
            >
              Sửa
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              className="hover:bg-red-50 hover:border-red-400 transition-all duration-200"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Input
          prefix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="flex-1 min-w-[200px]"
          size="middle"
        />
        <Button
          type="default"
          icon={<PlusOutlined />}
          size="middle"
          className="bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm thông báo
        </Button>
      </div>

      <CreateNotificationModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchNotifications();
        }}
      />

      <NotificationDetailModal
        open={isDetailModalOpen}
        notificationId={selectedNotificationId}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedNotificationId(null);
        }}
      />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={notifications}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            position: ["bottomRight"],
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} thông báo`,
            size: "small",
            onChange: handleTableChange,
          }}
          className="news-table"
          rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
        />
      </Spin>
    </div>
  );
}

