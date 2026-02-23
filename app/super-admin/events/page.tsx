"use client";

import { Table, Tag, Button, Space, Select, App, Modal, Form, Input, DatePicker } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { createEvent, getEvents, getEventById, deleteEvent, type EventResponse } from "@/lib/api/events";
import { useUserId } from "@/app/hooks/useUserId";
import { useDebounce } from "@/app/hooks/useDebounce";
import EventDetailModal from "@/app/components/super-admin/EventDetailModal";
import UpdateEventModal from "@/app/components/super-admin/UpdateEventModal";

const { Option } = Select;

interface EventType {
  key: string;
  event_id: number;
  title: string;
  description: string;
  location: string;
  start_event_date: string;
  end_event_date: string;
  created_by: number;
  creator: {
    user_id: number;
    username: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  created_at: string;
  updated_at: string;
}

export default function SuperAdminEvents() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
  const [isUpdateEventModalOpen, setIsUpdateEventModalOpen] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventDetail, setEventDetail] = useState<EventResponse | null>(null);
  const [loadingEventDetail, setLoadingEventDetail] = useState(false);
  const [selectedEventForUpdate, setSelectedEventForUpdate] = useState<EventResponse | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  const getEventStatus = (startDate: string, endDate: string): string => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "upcoming";
    } else if (now >= start && now <= end) {
      return "ongoing";
    } else {
      return "completed";
    }
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['admin_events', pagination.current, pagination.pageSize, debouncedSearchQuery],
    queryFn: async () => {
      const result = await getEvents({
        page: pagination.current,
        limit: pagination.pageSize,
        search: debouncedSearchQuery.trim() || undefined
      });

      const formattedData: EventType[] = result.events.map((event: EventResponse) => ({
        key: event.event_id.toString(),
        event_id: event.event_id,
        title: event.title,
        description: event.description,
        location: event.location,
        start_event_date: event.start_event_date,
        end_event_date: event.end_event_date,
        created_by: event.created_by,
        creator: event.creator,
        created_at: event.created_at,
        updated_at: event.updated_at,
      }));

      return {
        events: formattedData,
        total: result.total || 0,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000, // 30s - admin needs fresh data
  });

  if (isError) {
    message.error((error as Error)?.message || "Không thể tải danh sách sự kiện");
  }

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleViewEvent = async (eventId: number) => {
    setIsViewDetailModalOpen(true);
    setSelectedEventId(eventId);
    setLoadingEventDetail(true);
    setEventDetail(null);

    try {
      const eventData = await getEventById(eventId);
      setEventDetail(eventData);
    } catch (error: any) {
      message.error(error?.message || "Không thể tải thông tin sự kiện");
      setIsViewDetailModalOpen(false);
      setSelectedEventId(null);
    } finally {
      setLoadingEventDetail(false);
    }
  };

  const handleCloseEventModal = () => {
    setIsViewDetailModalOpen(false);
  };

  const handleAfterClose = () => {
    setSelectedEventId(null);
    setEventDetail(null);
    setLoadingEventDetail(false);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return deleteEvent(id);
    },
    onSuccess: () => {
      message.success("Xóa sự kiện thành công!");
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
    },
    onError: (error: Error) => {
      message.error(error?.message || "Không thể xóa sự kiện");
    }
  });

  const columns: ColumnsType<EventType> = useMemo(() => [
    {
      title: "STT",
      dataIndex: "event_id",
      key: "event_id",
      width: 80,
      render: (_: any, __: EventType, index: number) => {
        const currentPage = pagination.current;
        const pageSize = pagination.pageSize;
        const stt = (currentPage - 1) * pageSize + index + 1;
        return <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{stt}</span>;
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{text}</span>,
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      render: (location: string) => <span className="text-gray-600">{location}</span>,
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_: any, record: EventType) => (
        <div className="text-sm">
          <div className="text-gray-800 font-medium">Bắt đầu: {formatDate(record.start_event_date)}</div>
          <div className="text-gray-600">Kết thúc: {formatDate(record.end_event_date)}</div>
        </div>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "creator",
      key: "creator",
      render: (creator: EventType["creator"]) => <span className="text-gray-600">{creator?.fullname || creator?.username || "-"}</span>,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: EventType) => {
        const status = getEventStatus(record.start_event_date, record.end_event_date);
        const statusMap: Record<string, { color: string; text: string }> = {
          upcoming: { color: "blue", text: "Sắp diễn ra" },
          ongoing: { color: "orange", text: "Đang diễn ra" },
          completed: { color: "green", text: "Đã hoàn thành" },
          cancelled: { color: "red", text: "Đã hủy" },
        };
        const statusInfo = statusMap[status] || { color: "default", text: status };
        return (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => <span className="text-gray-600">{formatDate(date)}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: EventType) => {
        const handleEdit = async (e: React.MouseEvent) => {
          e.stopPropagation();
          try {
            setLoadingEventDetail(true);
            const eventData = await getEventById(record.event_id);
            setSelectedEventForUpdate(eventData);
            setSelectedEventId(record.event_id);
            setIsUpdateEventModalOpen(true);
          } catch (error: any) {
            message.error(error?.message || "Không thể tải thông tin sự kiện");
          } finally {
            setLoadingEventDetail(false);
          }
        };

        const handleDelete = (e: React.MouseEvent) => {
          e.stopPropagation();
          modal.confirm({
            title: "Xác nhận xóa",
            content: `Bạn có chắc chắn muốn xóa sự kiện "${record.title}"?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk() {
              deleteMutation.mutate(record.event_id);
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
                handleViewEvent(record.event_id);
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
  ], [pagination.current, pagination.pageSize, message, modal, deleteMutation, handleViewEvent]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <Input
            prefix={isFetching ? <LoadingOutlined spin /> : <SearchOutlined />}
            placeholder="Tìm kiếm theo tên sự kiện..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="flex-1 min-w-[200px]"
            size="middle"
          />
        </div>
        <Space>
          <Button
            type="default"
            icon={<PlusOutlined />}
            size="middle"
            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => setIsAddEventModalOpen(true)}
          >
            Thêm single
          </Button>
          <Button
            type="default"
            icon={<UploadOutlined />}
            size="middle"
            className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => router.push("/super-admin/events/create")}
          >
            Thêm file
          </Button>
        </Space>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={data?.events || []}
          loading={isLoading || isFetching}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} sự kiện`,
            size: "small",
            onChange: handleTableChange,
          }}
          className="news-table"
          rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
          size="small"
        />
      </div>

      <Modal
        title="Thêm sự kiện"
        open={isAddEventModalOpen}
        onCancel={() => {
          setIsAddEventModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <AddEventForm
          form={form}
          onSuccess={() => {
            setIsAddEventModalOpen(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['admin_events'] });
          }}
        />
      </Modal>

      <EventDetailModal
        open={isViewDetailModalOpen}
        onCancel={handleCloseEventModal}
        eventDetail={eventDetail}
        loading={loadingEventDetail}
        afterClose={handleAfterClose}
      />

      <UpdateEventModal
        open={isUpdateEventModalOpen}
        onCancel={() => {
          setIsUpdateEventModalOpen(false);
          setSelectedEventForUpdate(null);
          setSelectedEventId(null);
        }}
        onSuccess={() => {
          setIsUpdateEventModalOpen(false);
          setSelectedEventForUpdate(null);
          setSelectedEventId(null);
          queryClient.invalidateQueries({ queryKey: ['admin_events'] });
        }}
        eventId={selectedEventId || 0}
        eventData={selectedEventForUpdate}
      />
    </div>
  );
}

function AddEventForm({ form, onSuccess }: { form: any; onSuccess: () => void }) {
  const { message } = App.useApp();
  const { userId } = useUserId();

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      if (!userId) {
        throw new Error("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!");
      }
      const eventData = {
        title: values.title,
        description: values.description,
        start_event_date: values.start_event_date.format("YYYY-MM-DD"),
        end_event_date: values.end_event_date.format("YYYY-MM-DD"),
        location: values.location,
        created_by: Number(userId),
      };
      return createEvent(eventData);
    },
    onSuccess: () => {
      message.success("Tạo sự kiện thành công!");
      onSuccess();
    },
    onError: (error: Error) => {
      message.error(error?.message || "Không thể tạo sự kiện");
    }
  });

  const handleSubmit = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: "Vui lòng nhập tiêu đề sự kiện!" }]}>
        <Input placeholder="Nhập tiêu đề sự kiện" />
      </Form.Item>

      <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả sự kiện!" }]}>
        <Input.TextArea rows={4} placeholder="Nhập mô tả sự kiện" />
      </Form.Item>

      <Form.Item name="start_event_date" label="Ngày bắt đầu" rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}>
        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày bắt đầu" />
      </Form.Item>

      <Form.Item
        name="end_event_date"
        label="Ngày kết thúc"
        rules={[
          { required: true, message: "Vui lòng chọn ngày kết thúc!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || !getFieldValue("start_event_date")) {
                return Promise.resolve();
              }
              if (value.isBefore(getFieldValue("start_event_date"))) {
                return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu!"));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} placeholder="Chọn ngày kết thúc" />
      </Form.Item>

      <Form.Item name="location" label="Địa điểm" rules={[{ required: true, message: "Vui lòng nhập địa điểm!" }]}>
        <Input placeholder="Nhập địa điểm tổ chức" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={mutation.isPending}>
            Tạo sự kiện
          </Button>
          <Button onClick={() => form.resetFields()}>Làm mới</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
