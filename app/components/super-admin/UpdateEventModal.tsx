"use client";

import { Modal, Form, Input, DatePicker, App, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { updateEvent, type UpdateEventParams, type EventResponse } from "@/lib/api/events";
import { getCurrentUser } from "@/lib/api/users";
import dayjs from "dayjs";

interface UpdateEventModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  eventId: number;
  eventData: EventResponse | null;
}

export default function UpdateEventModal({
  open,
  onCancel,
  onSuccess,
  eventId,
  eventData,
}: UpdateEventModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [updating, setUpdating] = useState(false);

  // Reset form và cập nhật initialValues khi modal mở hoặc eventData thay đổi
  useEffect(() => {
    if (open && eventData) {
      form.setFieldsValue({
        title: eventData.title,
        description: eventData.description,
        start_event_date: dayjs(eventData.start_event_date),
        end_event_date: dayjs(eventData.end_event_date),
        location: eventData.location,
      });
    } else if (!open) {
      // Reset form khi đóng modal
      form.resetFields();
    }
  }, [open, eventData, form]);

  const handleSubmit = async (values: any) => {
    const user = getCurrentUser();
    if (!user || !user.user_id) {
      message.error("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    setUpdating(true);
    try {
      const params: UpdateEventParams = {
        title: values.title,
        description: values.description,
        start_event_date: values.start_event_date.format("YYYY-MM-DD"),
        end_event_date: values.end_event_date.format("YYYY-MM-DD"),
        location: values.location,
        created_by: Number(user.user_id),
      };

      await updateEvent(eventId, params);
      message.success("Cập nhật sự kiện thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể cập nhật sự kiện");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span>Cập nhật sự kiện</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden={false}
      maskClosable={!updating}
      closable={!updating}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={updating}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề sự kiện!" }]}
        >
          <Input placeholder="Nhập tiêu đề sự kiện" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả sự kiện!" }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập mô tả sự kiện" />
        </Form.Item>

        <Form.Item
          name="start_event_date"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
        >
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

        <Form.Item
          name="location"
          label="Địa điểm"
          rules={[{ required: true, message: "Vui lòng nhập địa điểm!" }]}
        >
          <Input placeholder="Nhập địa điểm tổ chức" />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={updating}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={updating} icon={<CheckOutlined />}>
              Cập nhật
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

