"use client";

import { Table, Tag, Button, Space, App, Input } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import CreateNotificationModal from "@/components/super-admin/CreateNotificationModal";
import EditNotificationModal from "@/components/super-admin/EditNotificationModal";
import NotificationDetailModal from "@/components/super-admin/NotificationDetailModal";
import { getNotificationsByCreatedBy, deleteNotification } from "@/lib/services/notifications";
import { useUserId } from "@/hooks/useUserId";
import { useDebounce } from "@/hooks/useDebounce";

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
  const { userId, loading: userLoading } = useUserId();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedNotificationId, setSelectedNotificationId] = useState<number | string | null>(null);
  const [editingNotification, setEditingNotification] = useState<NotificationType | null>(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Reset to page 1 on search
  useEffect(() => {
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [debouncedSearchQuery]);

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

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['admin_notifications', userId, pagination.current, pagination.pageSize, debouncedSearchQuery],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await getNotificationsByCreatedBy(userId!, {
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery.trim() || undefined,
      });

      const mappedNotifications: NotificationType[] = (result.data || []).map((notif: any) => ({
        key: String(notif.notification_id),
        id: String(notif.notification_id),
        title: notif.title,
        message: notif.message,
        scope: notif.scope,
        scope_id: notif.scope_id === null ? null : (typeof notif.scope_id === "string" ? Number(notif.scope_id) : notif.scope_id),
        createdAt: formatDate(notif.created_at),
      }));

      return {
        data: mappedNotifications,
        total: result.total || mappedNotifications.length,
      };
    },
    enabled: !!userId && !userLoading,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s - admin needs fresh data
  });

  if (isError) {
    message.error((error as Error)?.message || "Không thể tải danh sách thông báo");
  }

  // Listen for refresh event from sidebar
  useEffect(() => {
    const handleRefreshEvent = () => {
      if (userId && !userLoading) {
        queryClient.invalidateQueries({ queryKey: ['admin_notifications', userId] });
      }
    };
    window.addEventListener("refresh-notifications", handleRefreshEvent);
    return () => {
      window.removeEventListener("refresh-notifications", handleRefreshEvent);
    };
  }, [userId, userLoading, queryClient]);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['admin_notifications', userId] });
    message.success("Tạo thông báo thành công");
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingNotification(null);
    queryClient.invalidateQueries({ queryKey: ['admin_notifications', userId] });
    message.success("Cập nhật thông báo thành công");
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Không tìm thấy thông tin người dùng");
      return deleteNotification(id, userId);
    },
    onMutate: async (deletedId) => {
      const qk = ['admin_notifications', userId];
      await queryClient.cancelQueries({ queryKey: qk });
      const previousData = queryClient.getQueriesData({ queryKey: qk });
      queryClient.setQueriesData({ queryKey: qk }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications?.filter((n: any) => n.id !== deletedId),
          total: (old.total || 1) - 1,
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      message.success("Đã xóa thông báo thành công");
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      message.error(error.message || "Không thể xóa thông báo");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_notifications', userId] });
    },
  });

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
            onOk: () => {
              deleteMutation.mutate(record.id);
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
              loading={deleteMutation.isPending}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ], [pagination.current, pagination.pageSize, modal, deleteMutation]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Input
          prefix={isFetching ? <LoadingOutlined spin /> : <SearchOutlined />}
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
        onSuccess={handleEditSuccess}
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
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading || isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} thông báo`,
            size: "small",
            onChange: handleTableChange,
          }}
          className="news-table"
          rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
        />
      </div>
    </div>
  );
}
