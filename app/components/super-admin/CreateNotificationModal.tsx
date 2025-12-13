"use client";

import { Modal, Form, Input, Select, Button, App } from "antd";
import { useState, useEffect } from "react";
import { createNotification, type CreateNotificationParams } from "@/lib/api/notifications";

const { TextArea } = Input;
const { Option } = Select;

interface CreateNotificationModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateNotificationModal({ open, onCancel, onSuccess }: CreateNotificationModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const notificationScope = Form.useWatch("scope", form);

  useEffect(() => {
    if (open) {
      form.resetFields();
      // Set default values
      form.setFieldsValue({
        scope: "all",
      });
    }
  }, [open, form]);

  // Reset scope_id khi scope thay đổi
  useEffect(() => {
    if (notificationScope === "all") {
      form.setFieldsValue({ scope_id: undefined });
    }
  }, [notificationScope, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const params: CreateNotificationParams = {
        title: values.title,
        message: values.message,
        scope: values.scope,
      };

      // Chỉ thêm scope_id nếu scope không phải "all"
      if (values.scope !== "all" && values.scope_id) {
        params.scope_id = Number(values.scope_id);
      }

      await createNotification(params);
      message.success("Tạo thông báo thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể tạo thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      message.warning("Đang tạo thông báo, vui lòng đợi...");
      return;
    }
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Tạo thông báo mới"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      maskClosable={!submitting}
      closable={!submitting}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề" },
            { max: 255, message: "Tiêu đề không được vượt quá 255 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề thông báo" disabled={submitting} size="middle" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Nội dung"
          rules={[{ required: true, message: "Vui lòng nhập nội dung thông báo" }]}
        >
          <TextArea
            placeholder="Nhập nội dung thông báo"
            rows={4}
            disabled={submitting}
            showCount
            maxLength={5000}
          />
        </Form.Item>

        <Form.Item
          name="scope"
          label="Phạm vi"
          rules={[{ required: true, message: "Vui lòng chọn phạm vi" }]}
        >
          <Select placeholder="Chọn phạm vi" disabled={submitting} size="middle">
            <Option value="all">Tất cả</Option>
            <Option value="user">Người dùng</Option>
            <Option value="class">Lớp học</Option>
          </Select>
        </Form.Item>

        {notificationScope !== "all" && (
          <Form.Item
            name="scope_id"
            label={notificationScope === "user" ? "Mã người dùng" : "Mã lớp"}
            rules={
              notificationScope !== "all"
                ? [{ required: true, message: notificationScope === "user" ? "Vui lòng nhập mã người dùng" : "Vui lòng nhập mã lớp" }]
                : []
            }
          >
            <Input
              type="number"
              placeholder={notificationScope === "user" ? "Nhập mã người dùng" : "Nhập mã lớp"}
              disabled={submitting}
              size="middle"
              min={1}
            />
          </Form.Item>
        )}

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={submitting} size="middle">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting} size="middle" className="bg-blue-500 hover:bg-blue-600">
              {submitting ? "Đang tạo..." : "Tạo thông báo"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

