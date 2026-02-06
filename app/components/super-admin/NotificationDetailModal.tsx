"use client";

import { Modal, Tag, Spin, App } from "antd";
import { useState, useEffect } from "react";
import { getNotificationById, type NotificationResponse } from "@/lib/api/notifications";
import { ClockCircleOutlined } from "@ant-design/icons";

interface NotificationDetailModalProps {
  open: boolean;
  notificationId: number | string | null;
  onCancel: () => void;
}

export default function NotificationDetailModal({ open, notificationId, onCancel }: NotificationDetailModalProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationResponse | null>(null);

  useEffect(() => {
    if (open && notificationId) {
      fetchNotification();
    } else {
      setNotification(null);
    }
  }, [open, notificationId]);

  const fetchNotification = async () => {
    if (!notificationId) return;

    setLoading(true);
    try {
      const data = await getNotificationById(notificationId);
      setNotification(data);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải thông tin thông báo");
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScopeInfo = (scope: string) => {
    const scopeMap: Record<string, { color: string; text: string }> = {
      all: { color: "orange", text: "Tất cả" },
      user: { color: "cyan", text: "Người dùng" },
      class: { color: "geekblue", text: "Lớp học" },
    };
    return scopeMap[scope] || { color: "default", text: scope };
  };

  return (
    <Modal
      title="Chi tiết thông báo"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnHidden={true}
    >
      <Spin spinning={loading}>
        {notification && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tiêu đề</label>
              <div className="mt-1 text-base font-semibold text-gray-800 dark:text-gray-100">{notification.title}</div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Nội dung</label>
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {notification.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phạm vi</label>
                <div className="mt-1">
                  <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={getScopeInfo(notification.scope).color}>
                    {getScopeInfo(notification.scope).text}
                  </Tag>
                </div>
              </div>

              {notification.scope_id && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {notification.scope === "user" ? "Mã người dùng" : "Mã lớp"}
                  </label>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">{notification.scope_id}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <ClockCircleOutlined />
                  Ngày tạo
                </label>
                <div className="mt-1 text-gray-700 dark:text-gray-300">{formatDate(notification.created_at)}</div>
              </div>

              {notification.updated_at && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <ClockCircleOutlined />
                    Ngày cập nhật
                  </label>
                  <div className="mt-1 text-gray-700 dark:text-gray-300">{formatDate(notification.updated_at)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
}




