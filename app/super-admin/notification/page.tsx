"use client";

import { Table, Tag, Button, Space, App, Input, Spin } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import CreateNotificationModal from "@/app/components/super-admin/CreateNotificationModal";
import EditNotificationModal from "@/app/components/super-admin/EditNotificationModal";
import NotificationDetailModal from "@/app/components/super-admin/NotificationDetailModal";
import { getNotificationsByCreatedBy, deleteNotification, type NotificationResponse } from "@/lib/api/notifications";
import { useUserId } from "@/app/hooks/useUserId";

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
  const { modal, message } = App.useApp();
  const { userId, loading: userLoading } = useUserId(); // Use hook
  const [allNotifications, setAllNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | string | null>(null);
  const [editingNotification, setEditingNotification] = useState<NotificationType | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Format date từ ISO string sang định dạng Việt Nam
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number = 1, limit: number = 10, search?: string) => {
    if (!userId) {
      // Wait for user id
      if (!userLoading) {
        message.error("Không tìm thấy thông tin người dùng");
      }
      return;
    }

    const startTime = Date.now();
    try {
      setLoading(true);
      const result = await getNotificationsByCreatedBy(userId, {
        page,
        limit,
        search: search?.trim() || undefined,
      });

      const mappedNotifications: NotificationType[] = (result.data || []).map((notif) => ({
        key: String(notif.notification_id),
        id: String(notif.notification_id),
        title: notif.title,
        message: notif.message,
        scope: notif.scope,
        scope_id: notif.scope_id === null ? null : (typeof notif.scope_id === "string" ? Number(notif.scope_id) : notif.scope_id),
        createdAt: formatDate(notif.created_at),
      }));

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const minLoadingTime = 250;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setAllNotifications(mappedNotifications);
      setPagination((prev) => ({
        ...prev,
        current: result.page || page,
        pageSize: result.limit || limit,
        total: result.total || mappedNotifications.length,
      }));
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
  }, [message, userId, userLoading, formatDate]);

  // Fetch notifications on mount and when dependencies change
  useEffect(() => {
    if (userId && !userLoading) {
      fetchNotifications(pagination.current, pagination.pageSize, debouncedSearchQuery);
    }
  }, [fetchNotifications, pagination.current, pagination.pageSize, debouncedSearchQuery, userId, userLoading]);

  // Listen for refresh event from sidebar
  useEffect(() => {
    const handleRefreshEvent = () => {
      if (userId && !userLoading) {
        fetchNotifications(pagination.current, pagination.pageSize, debouncedSearchQuery);
      }
    };

    window.addEventListener("refresh-notifications", handleRefreshEvent);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefreshEvent);
    };
  }, [fetchNotifications, pagination.current, pagination.pageSize, debouncedSearchQuery, userId, userLoading]);

  const handleTableChange = useCallback((page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  }, []);

  const handleCreateSuccess = useCallback((created: NotificationResponse) => {
    const mapped: NotificationType = {
      key: String(created.notification_id),
      id: String(created.notification_id),
      title: created.title,
      message: created.message,
      scope: created.scope,
      scope_id: created.scope_id === null ? null : (typeof created.scope_id === "string" ? Number(created.scope_id) : created.scope_id),
      createdAt: formatDate(created.created_at),
    };

    setAllNotifications((prev) => [mapped, ...prev]);
    setIsCreateModalOpen(false);
  }, [formatDate]);

  const columns: ColumnsType<NotificationType> = useMemo(() => [
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
          setEditingNotification(record);
          setIsEditModalOpen(true);
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa thông báo "${record.title}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            async onOk() {
              if (!userId) {
                message.error("Không tìm thấy thông tin người dùng để thực hiện xóa");
                return;
              }
              try {
                await deleteNotification(record.id, userId);
                setAllNotifications((prev) => prev.filter((item) => item.id !== record.id));
                setPagination((prev) => ({
                  ...prev,
                  total: Math.max(0, prev.total - 1),
                }));
                message.success("Đã xóa thông báo thành công");
              } catch (error: any) {
                message.error(error?.message || "Không thể xóa thông báo");
              }
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
  ], [pagination.current, pagination.pageSize, message, modal]);

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
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
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
        onSuccess={handleCreateSuccess}
      />

      <EditNotificationModal
        open={isEditModalOpen}
        notification={
          editingNotification
            ? {
              id: editingNotification.id,
              title: editingNotification.title,
              message: editingNotification.message,
            }
            : null
        }
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingNotification(null);
        }}
        onSuccess={(updated) => {
          setAllNotifications((prev) =>
            prev.map((item) => (item.id === String(updated.notification_id) ? {
              ...item,
              title: updated.title,
              message: updated.message,
              createdAt: formatDate(updated.created_at),
            } : item))
          );
          setIsEditModalOpen(false);
          setEditingNotification(null);
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

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={allNotifications}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
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
    </div>
  );
}

