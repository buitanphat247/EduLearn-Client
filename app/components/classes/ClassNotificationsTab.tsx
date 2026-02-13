"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { App, Input, Button, Dropdown, Pagination, Modal, Empty, Skeleton, Tag } from "antd";
import type { MenuProps } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined, CalendarOutlined } from "@ant-design/icons";
import { deleteNotification, getNotificationsByScopeId, getNotificationById, type NotificationResponse } from "@/lib/api/notifications";
import CreateClassNotificationModal from "./CreateClassNotificationModal";
import EditClassNotificationModal from "./EditClassNotificationModal";
import type { ClassNotificationsTabProps, Notification } from "./types";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import { getClassById, type ClassDetailResponse } from "@/lib/api/classes";

const ClassNotificationsTab = memo(function ClassNotificationsTab({
  classId,
  searchQuery,
  onSearchChange,
  currentPage,
  pageSize,
  onPageChange,
  onNotificationCreated,
  readOnly = false,
  onRefresh,
}: ClassNotificationsTabProps) {
  const { message, modal } = App.useApp();
  const messageRef = useRef(message);
  const modalRef = useRef(modal);

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
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [classDetails, setClassDetails] = useState<ClassDetailResponse | null>(null);

  // Fetch class details to get the name
  useEffect(() => {
    if (classId) {
      getClassById(classId).then(setClassDetails).catch(err => console.error("Error fetching class details for tab:", err));
    }
  }, [classId]);

  useEffect(() => {
    if (!searchQuery) {
      setDebouncedSearchQuery("");
      return;
    }
    const timer = setTimeout(() => {
      const prevSearch = debouncedSearchQuery;
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== prevSearch && currentPage !== 1) {
        onPageChange(1);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery, currentPage, onPageChange]);

  const latestRequestRef = useRef<number>(0);

  const fetchNotifications = useCallback(async (silent = false) => {
    const timestamp = Date.now();
    latestRequestRef.current = timestamp;
    try {
      if (!silent) setLoading(true);
      const numericClassId = typeof classId === "string" ? Number(classId) : classId;
      if (isNaN(numericClassId)) {
        if (latestRequestRef.current === timestamp) {
          messageRef.current.error("ID lớp học không hợp lệ");
          setNotifications([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }
      const userId = getUserIdFromCookie();
      if (!userId) {
        if (latestRequestRef.current === timestamp) {
          setNotifications([]);
          setTotal(0);
          setLoading(false);
        }
        return;
      }
      const result = await getNotificationsByScopeId(numericClassId, {
        userId,
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
      });
      if (latestRequestRef.current === timestamp) {
        setNotifications(result.data);
        setTotal(result.total);
        setLoading(false);
      }
    } catch (error: any) {
      if (latestRequestRef.current === timestamp) {
        messageRef.current.error(error?.message || "Không thể tải danh sách thông báo");
        setNotifications([]);
        setTotal(0);
        setLoading(false);
      }
    }
  }, [classId, currentPage, pageSize, debouncedSearchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const searchRef = useRef(debouncedSearchQuery);
  const pageRef = useRef(currentPage);
  const pageSizeRef = useRef(pageSize);
  const totalRef = useRef(total);
  const fetchNotificationsRef = useRef(fetchNotifications);

  useEffect(() => {
    searchRef.current = debouncedSearchQuery;
    pageRef.current = currentPage;
    pageSizeRef.current = pageSize;
    totalRef.current = total;
    fetchNotificationsRef.current = fetchNotifications;
  }, [debouncedSearchQuery, currentPage, pageSize, total, fetchNotifications]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(() => fetchNotifications(false));
    }
  }, [onRefresh, fetchNotifications]);

  const mapToDisplay = useCallback((n: NotificationResponse): Notification => {
    const date = new Date(n.created_at);
    const isToday = date.toDateString() === new Date().toDateString();
    return {
      id: String(n.notification_id),
      title: n.title,
      content: n.message,
      author: n.creator?.fullname || "Không xác định",
      date: isToday ? "Hôm nay" : date.toLocaleDateString("vi-VN"),
      time: isToday ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : undefined,
      scope: n.scope === "class" ? "Lớp học" : "Tất cả",
    };
  }, []);

  const displayNotifications = useMemo(() => notifications.map(mapToDisplay), [notifications, mapToDisplay]);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchNotifications(true);
    if (onNotificationCreated) onNotificationCreated();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditNotification(null);
    fetchNotifications(true);
  };

  const handleEditNotification = useCallback(async (n: Notification) => {
    try {
      setIsEditModalOpen(true);
      setLoadingEdit(true);
      const id = Number(n.id);
      if (isNaN(id)) return;
      const detail = await getNotificationById(id);
      setEditNotification(detail);
    } catch (error: any) {
      messageRef.current.error(error?.message || "Lỗi tải thông báo");
      setIsEditModalOpen(false);
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  const handleMenuClick = async (key: string, n: Notification) => {
    if (key === "view") {
      try {
        setLoadingDetail(true);
        const id = Number(n.id);
        if (isNaN(id)) return;
        // Gọi API để lấy chi tiết và check membership
        const detail = await getNotificationById(id);
        setSelectedNotification(detail);
        setIsDetailModalOpen(true);
      } catch (error: any) {
        messageRef.current.error(error?.message || "Không thể xem thông báo này. Bạn có thể không còn là thành viên của lớp học này.");
      } finally {
        setLoadingDetail(false);
      }
    } else if (key === "edit") {
      handleEditNotification(n);
    } else if (key === "delete") {
      const full = notifications.find((item) => String(item.notification_id) === n.id);
      if (full) {
        modalRef.current.confirm({
          title: "Xác nhận xóa",
          content: `Xóa thông báo "${n.title}"?`,
          okText: "Xóa",
          okType: "danger",
          onOk: async () => {
            try {
              const userId = getUserIdFromCookie();

              // Optimistic update: remove from list immediately
              setNotifications((prev) => prev.filter((item) => String(item.notification_id) !== n.id));
              setTotal((prev) => Math.max(0, prev - 1));

              // Close detail modal if the deleted notification was selected
              if (selectedNotification && String(selectedNotification.notification_id) === n.id) {
                setIsDetailModalOpen(false);
                setSelectedNotification(null);
              }

              // Delete from server
              if (userId) await deleteNotification(full.notification_id, userId);

              messageRef.current.success("Đã xóa");

              // Refresh list to ensure consistency
              await fetchNotificationsRef.current(true);
            } catch (error: any) {
              // Rollback on error: refresh to get correct state
              messageRef.current.error(error?.message || "Lỗi xóa");
              await fetchNotificationsRef.current(false);
            }
          },
        });
      }
    }
  };

  const menuItems = useCallback((): MenuProps["items"] => {
    const items: MenuProps["items"] = [{ key: "view", label: "Xem chi tiết" }];
    if (!readOnly) {
      items.push({ key: "edit", label: "Chỉnh sửa" }, { type: "divider" }, { key: "delete", label: "Xóa", danger: true });
    }
    return items;
  }, [readOnly]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="flex-1"
        />
        {!readOnly && (
          <Button icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)} type="primary" className="bg-blue-600">
            Tạo thông báo mới
          </Button>
        )}
      </div>

      <div className="relative min-h-[200px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} active className="p-6 bg-white dark:bg-gray-800 rounded-lg" />)}
          </div>
        ) : notifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayNotifications.map((n) => (
              <div
                key={n.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-slate-600 border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleMenuClick("view", n)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">{n.time ? `${n.time} - ${n.date}` : n.date}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Dropdown menu={{ items: menuItems(), onClick: ({ key }) => handleMenuClick(key, n) }} trigger={["click"]}>
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                      </Dropdown>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">{n.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{n.content}</p>
                  <span className="text-xs text-gray-500 mt-auto">{n.author}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-20"><Empty description="Không có thông báo nào" /></div>
        )}
      </div>

      {total > pageSize && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, total)} / {total}</div>
          <Pagination current={currentPage} total={total} pageSize={pageSize} onChange={onPageChange} showSizeChanger={false} />
        </div>
      )}

      <CreateClassNotificationModal open={isCreateModalOpen} classId={classId} onCancel={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
      <EditClassNotificationModal open={isEditModalOpen} notification={editNotification} classId={classId} onCancel={() => { setIsEditModalOpen(false); setEditNotification(null); }} onSuccess={handleEditSuccess} loading={loadingEdit} />

      <Modal
        title={<span className="font-bold text-slate-800 dark:text-white">Chi tiết thông báo</span>}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
        centered
        destroyOnHidden
        styles={{
          mask: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        {loadingDetail ? (
          <div className="py-8 text-center">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : selectedNotification && (
          <div className="space-y-5 pt-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Tiêu đề</label>
              <div className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{selectedNotification.title}</div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Nội dung</label>
              <div className="mt-1 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedNotification.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Phạm vi</label>
                <Tag className="px-3 py-0.5 rounded-md font-bold text-[10px] border-none m-0" color={selectedNotification.scope === 'all' ? 'orange' : 'geekblue'}>
                  {(selectedNotification.scope === 'all' ? 'Hệ thống' : 'Lớp học').toUpperCase()}
                </Tag>
              </div>

              {selectedNotification.scope === 'class' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Tên lớp học</label>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {classDetails?.name || "Đang tải..."}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {selectedNotification.scope === 'class' && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Mã lớp</label>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    #{selectedNotification.scope_id || classId}
                  </div>
                </div>
              )}

              {selectedNotification.creator && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Người tạo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200/50">
                      {(selectedNotification.creator.fullname || "H")[0]}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">
                      {selectedNotification.creator.fullname}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-5 border-t border-slate-100 dark:border-slate-700">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                  <CalendarOutlined className="text-blue-500" /> Ngày tạo
                </label>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                  {new Date(selectedNotification.created_at).toLocaleString("vi-VN", {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {selectedNotification.updated_at && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
                    <CalendarOutlined className="text-orange-500" /> Cập nhật
                  </label>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium italic">
                    {new Date(selectedNotification.updated_at).toLocaleString("vi-VN", {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
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
