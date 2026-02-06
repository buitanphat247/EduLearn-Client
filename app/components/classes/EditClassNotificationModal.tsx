"use client";

import { useState, useEffect } from "react";
import { App, Modal, Form, Input, Button } from "antd";
import { updateNotification, type UpdateNotificationParams } from "@/lib/api/notifications";
import { getUserIdFromCookie } from "@/lib/utils/cookies";
import type { EditClassNotificationModalProps } from "./types";

export default function EditClassNotificationModal({ open, notification, classId, onCancel, onSuccess }: EditClassNotificationModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && notification) {
      form.setFieldsValue({
        title: notification.title,
        message: notification.message,
      });
    }
  }, [open, notification, form]);

  const handleSubmit = async (values: any) => {
    if (!notification) return;

    setSubmitting(true);
    try {
      const userId = getUserIdFromCookie();
      if (!userId) {
        message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        setSubmitting(false);
        return;
      }

      const numericUserId = typeof userId === "string" ? Number(userId) : userId;
      const numericClassId = typeof classId === "string" ? Number(classId) : classId;
      const notificationId = typeof notification.notification_id === "string" ? Number(notification.notification_id) : notification.notification_id;

      if (isNaN(numericClassId)) {
        message.error("ID lớp học không hợp lệ");
        setSubmitting(false);
        return;
      }

      if (isNaN(notificationId)) {
        message.error("ID thông báo không hợp lệ");
        setSubmitting(false);
        return;
      }

      const params: UpdateNotificationParams = {
        title: values.title,
        message: values.message,
        scope: "class",
        scope_id: numericClassId,
        created_by: numericUserId,
      };

      await updateNotification(notificationId, params);
      message.success("Cập nhật thông báo thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể cập nhật thông báo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      message.warning("Đang cập nhật thông báo, vui lòng đợi...");
      return;
    }
    form.resetFields();
    onCancel();
  };

  const { TextArea } = Input;

  return (
    <Modal
      title="Chỉnh sửa thông báo"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      maskClosable={!submitting}
      closable={!submitting}
      destroyOnHidden={true}
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

        <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: "Vui lòng nhập nội dung thông báo" }]}>
          <TextArea
            placeholder="Nhập nội dung thông báo"
            rows={4}
            disabled={submitting}
            showCount
            maxLength={5000}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={submitting} size="middle">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
              size="middle"
              className="bg-blue-500 hover:bg-blue-600"
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật thông báo"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

