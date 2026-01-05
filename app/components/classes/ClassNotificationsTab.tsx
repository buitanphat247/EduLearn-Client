"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { App, Spin, Input, Button, Tag, Dropdown, Pagination, Modal, Empty } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined, CalendarOutlined } from "@ant-design/icons";
import { deleteNotification, getNotificationsByScopeId, getNotificationById, type NotificationResponse } from "@/lib/api/notifications";
import CreateClassNotificationModal from "./CreateClassNotificationModal";
import EditClassNotificationModal from "./EditClassNotificationModal";
import type { ClassNotificationsTabProps, Notification } from "./types";

const ClassNotificationsTab = memo(function ClassNotificationsTab({
  classId,
  searchQuery,
  onSearchChange,
  currentPage,
  pageSize,
  onPageChange,
  onNotificationCreated,
  readOnly = false,
}: ClassNotificationsTabProps) {
  const { message, modal } = App.useApp();
  const messageRef = useRef(message);
  const modalRef = useRef(modal);

  // Update refs when they change
  useEffect(() => {
    messageRef.current = message;
    modalRef.current = modal;
  }, [message, modal]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
  const [editNotification, setEditNotification] = useState<NotificationResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      const prevSearch = debouncedSearchQuery;
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when search actually changes
      if (searchQuery !== prevSearch && currentPage !== 1) {
        onPageChange(1);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to prevent rerender loop

  // Fetch notifications - optimized with numeric classId
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const numericClassId = typeof classId === "string" ? Number(classId) : classId;
      if (isNaN(numericClassId)) {
        messageRef.current.error("ID lớp học không hợp lệ");
        setNotifications([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const result = await getNotificationsByScopeId(numericClassId, {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
      });

      // Update data first, then remove loading to prevent flicker
      setNotifications(result.data);
      setTotal(result.total);

      // Use requestAnimationFrame to ensure smooth transition without delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLoading(false);
        });
      });
    } catch (error: any) {
      messageRef.current.error(error?.message || "Không thể tải danh sách thông báo");
      setNotifications([]);
      setTotal(0);
      setLoading(false);
    }
  }, [classId, currentPage, pageSize, debouncedSearchQuery]); // Removed message from dependencies to prevent rerender

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Map API response to display format - memoized
  const mapNotificationToDisplay = useCallback((notification: NotificationResponse): Notification => {
    const date = new Date(notification.created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    let dateStr = "";
    let timeStr = "";

    if (isToday) {
      dateStr = "Hôm nay";
      timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } else {
      dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    return {
      id: String(notification.notification_id),
      title: notification.title,
      content: notification.message,
      author: notification.creator?.fullname || "Không xác định",
      date: dateStr,
      time: timeStr || undefined,
      scope: notification.scope === "class" ? "Lớp học" : "Tất cả",
    };
  }, []);

  const displayNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];
    return notifications.map(mapNotificationToDisplay);
  }, [notifications, mapNotificationToDisplay]);

  const handleCreateNotification = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchNotifications(); // Refresh list after creating
    if (onNotificationCreated) {
      onNotificationCreated();
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditNotification(null);
    fetchNotifications(); // Refresh list after editing
  };

  const handleEditNotification = useCallback(async (notification: Notification) => {
    try {
      setLoadingEdit(true);
      const notificationId = typeof notification.id === "string" ? Number(notification.id) : notification.id;

      if (isNaN(notificationId)) {
        messageRef.current.error("ID thông báo không hợp lệ");
        return;
      }

      const notificationDetail = await getNotificationById(notificationId);
      setEditNotification(notificationDetail);
      setIsEditModalOpen(true);
    } catch (error: any) {
      messageRef.current.error(error?.message || "Không thể tải thông tin thông báo");
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  const getMenuItems = useCallback(
    (notification: Notification): MenuProps["items"] => {
      const items: MenuProps["items"] = [
        {
          key: "view",
          label: "Xem chi tiết",
        },
      ];

      // Only show edit/delete actions if not readOnly
      if (!readOnly) {
        items.push(
          {
            key: "edit",
            label: "Chỉnh sửa",
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Xóa",
            danger: true,
          }
        );
      }

      return items;
    },
    [readOnly]
  );

  const handleMenuClick = (key: string, notification: Notification) => {
    switch (key) {
      case "view":
        // Find the full notification data from API response
        const fullNotification = notifications.find((n) => String(n.notification_id) === notification.id);
        if (fullNotification) {
          setSelectedNotification(fullNotification);
          setIsDetailModalOpen(true);
        }
        break;
      case "edit":
        handleEditNotification(notification);
        break;
      case "delete":
        // Find the full notification data from API response
        const fullNotificationForDelete = notifications.find((n) => String(n.notification_id) === notification.id);
        if (fullNotificationForDelete) {
          modalRef.current.confirm({
            title: "Xác nhận xóa thông báo",
            content: `Bạn có chắc chắn muốn xóa thông báo "${notification.title}"? Hành động này không thể hoàn tác.`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
              try {
                const notificationId =
                  typeof fullNotificationForDelete.notification_id === "string"
                    ? Number(fullNotificationForDelete.notification_id)
                    : fullNotificationForDelete.notification_id;

                if (isNaN(notificationId)) {
                  messageRef.current.error("ID thông báo không hợp lệ");
                  return;
                }

                await deleteNotification(notificationId);
                messageRef.current.success("Đã xóa thông báo thành công");
                fetchNotifications(); // Refresh list after deleting
              } catch (error: any) {
                messageRef.current.error(error?.message || "Không thể xóa thông báo");
              }
            },
          });
        }
        break;
    }
  };

  const formatDate = useCallback((dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getScopeInfo = useCallback((scope: string) => {
    const scopeMap: Record<string, { color: string; text: string }> = {
      all: { color: "orange", text: "Tất cả" },
      user: { color: "cyan", text: "Người dùng" },
      class: { color: "geekblue", text: "Lớp học" },
    };
    return scopeMap[scope] || { color: "default", text: scope };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          size="middle"
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          className="flex-1"
          allowClear
        />
        {!readOnly && (
          <Button size="middle" icon={<PlusOutlined />} onClick={handleCreateNotification} className="bg-blue-600 hover:bg-blue-700">
            Tạo thông báo mới
          </Button>
        )}
      </div>

      <div className="relative min-h-[200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg border-l-4 border-blue-500 border-t border-r border-b p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">
                      {notification.time ? `${notification.time} - ${notification.date}` : notification.date}
                    </span>
                    <Tag color="orange" className="text-xs">
                      {notification.scope}
                    </Tag>
                  </div>
                  {(() => {
                    const menuItems = getMenuItems(notification) || [];
                    return menuItems.length > 1 ? (
                      <Dropdown
                        menu={{
                          items: menuItems,
                          onClick: ({ key }) => handleMenuClick(key, notification),
                        }}
                        trigger={["click"]}
                      >
                        <Button type="text" icon={<MoreOutlined />} className="shrink-0" />
                      </Dropdown>
                    ) : (
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="shrink-0"
                        onClick={() => {
                          const fullNotification = notifications.find((n) => String(n.notification_id) === notification.id);
                          if (fullNotification) {
                            setSelectedNotification(fullNotification);
                            setIsDetailModalOpen(true);
                          }
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">{notification.title}</h3>
                  <span className="text-xs text-gray-500">{notification.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, total)} của {total} kết quả
          </div>
          <Pagination current={currentPage} total={total} pageSize={pageSize} onChange={onPageChange} showSizeChanger={false} />
        </div>
      )}

      {/* Create Notification Modal */}
      <CreateClassNotificationModal
        open={isCreateModalOpen}
        classId={classId}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Notification Modal */}
      <EditClassNotificationModal
        open={isEditModalOpen}
        notification={editNotification}
        classId={classId}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditNotification(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Detail Notification Modal */}
      <Modal
        title="Chi tiết thông báo"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedNotification(null);
        }}
        footer={null}
        width={700}
        destroyOnClose={true}
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Tiêu đề</label>
              <div className="mt-1 text-base font-semibold text-gray-800">{selectedNotification.title}</div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Nội dung</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                {selectedNotification.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Phạm vi</label>
                <div className="mt-1">
                  <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={getScopeInfo(selectedNotification.scope).color}>
                    {getScopeInfo(selectedNotification.scope).text}
                  </Tag>
                </div>
              </div>

              {selectedNotification.scope_id && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">{selectedNotification.scope === "user" ? "Mã người dùng" : "Mã lớp"}</label>
                  <div className="mt-1 text-gray-700">{selectedNotification.scope_id}</div>
                </div>
              )}
            </div>

            {selectedNotification.creator && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Người tạo</label>
                <div className="mt-1 text-gray-700">{selectedNotification.creator.fullname}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                  <CalendarOutlined />
                  Ngày tạo
                </label>
                <div className="mt-1 text-gray-700">{formatDate(selectedNotification.created_at)}</div>
              </div>

              {selectedNotification.updated_at && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                    <CalendarOutlined />
                    Ngày cập nhật
                  </label>
                  <div className="mt-1 text-gray-700">{formatDate(selectedNotification.updated_at)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

export default ClassNotificationsTab;
