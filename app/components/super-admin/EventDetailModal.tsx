"use client";

import { Modal, Descriptions, Avatar, Tag, Typography, Spin } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { EventResponse } from "@/lib/api/events";

const { Title, Text } = Typography;

interface EventDetailModalProps {
  open: boolean;
  onCancel: () => void;
  eventDetail: EventResponse | null;
  loading?: boolean;
  afterClose?: () => void;
}

export default function EventDetailModal({ open, onCancel, eventDetail, loading = false, afterClose }: EventDetailModalProps) {
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  if (!eventDetail && !loading) {
    return null;
  }

  const status = eventDetail ? getEventStatus(eventDetail.start_event_date, eventDetail.end_event_date) : "";
  const statusMap: Record<string, { color: string; text: string }> = {
    upcoming: { color: "blue", text: "Sắp diễn ra" },
    ongoing: { color: "orange", text: "Đang diễn ra" },
    completed: { color: "green", text: "Đã hoàn thành" },
    cancelled: { color: "red", text: "Đã hủy" },
  };
  const statusInfo = statusMap[status] || { color: "default", text: status };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <CalendarOutlined className="text-blue-500 text-xl" />
          <span>Chi tiết sự kiện</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      afterClose={afterClose}
      footer={null}
      width={700}
      className="event-detail-modal"
      destroyOnHidden={false}
      maskClosable={true}
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="small" />
        </div>
      ) : eventDetail ? (
        <div className="space-y-6">
          {/* Header with Title and Status */}
          <div className="pb-2 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <Title level={4} className="mb-2 text-gray-800 flex-1" style={{ marginBottom: '0.5rem' }}>
                {eventDetail.title}
              </Title>
              <Tag color={statusInfo.color} className="px-3 py-1 text-sm font-semibold">
                {statusInfo.text}
              </Tag>
            </div>
            {eventDetail.description && (
              <Text className="text-gray-600 text-base leading-relaxed block">
                {eventDetail.description}
              </Text>
            )}
          </div>

          {/* Detailed Information */}
          <Descriptions
            column={1}
            bordered
            size="middle"
            labelStyle={{
              backgroundColor: "#f5f5f5",
              fontWeight: 600,
              width: "180px",
            }}
            contentStyle={{
              backgroundColor: "#fff",
            }}
          >
            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <IdcardOutlined className="text-blue-500" />
                  <span>Event ID</span>
                </span>
              }
            >
              <Text strong className="text-gray-700">
                {eventDetail.event_id}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FileTextOutlined className="text-blue-500" />
                  <span>Tiêu đề</span>
                </span>
              }
            >
              <Text className="text-gray-700">{eventDetail.title}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <FileTextOutlined className="text-blue-500" />
                  <span>Mô tả</span>
                </span>
              }
            >
              <Text className="text-gray-700">{eventDetail.description || "-"}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-500" />
                  <span>Địa điểm</span>
                </span>
              }
            >
              <Text className="text-gray-700">{eventDetail.location}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  <span>Ngày bắt đầu</span>
                </span>
              }
            >
              <Text className="text-gray-700">{formatDateTime(eventDetail.start_event_date)}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-blue-500" />
                  <span>Ngày kết thúc</span>
                </span>
              }
            >
              <Text className="text-gray-700">{formatDateTime(eventDetail.end_event_date)}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <UserOutlined className="text-blue-500" />
                  <span>Người tạo</span>
                </span>
              }
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size={32}
                  src={eventDetail.creator?.avatar}
                  icon={<UserOutlined />}
                  className="border border-gray-200"
                />
                <div>
                  <Text className="text-gray-700 font-medium block">
                    {eventDetail.creator?.fullname || eventDetail.creator?.username || "N/A"}
                  </Text>
                  {eventDetail.creator?.email && (
                    <Text type="secondary" className="text-sm">
                      {eventDetail.creator.email}
                    </Text>
                  )}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-500" />
                  <span>Ngày tạo</span>
                </span>
              }
            >
              <Text className="text-gray-700">{formatDateTime(eventDetail.created_at)}</Text>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-2">
                  <CalendarOutlined className="text-blue-500" />
                  <span>Ngày cập nhật</span>
                </span>
              }
            >
              <Text className="text-gray-700">{formatDateTime(eventDetail.updated_at)}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : null}
    </Modal>
  );
}
