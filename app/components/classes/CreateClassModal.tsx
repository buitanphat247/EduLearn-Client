"use client";

import { Modal, Form, Input, Button, App } from "antd";
import { useState, useEffect } from "react";
import { createClass, type CreateClassParams } from "@/lib/api/classes";
import { getCurrentUser } from "@/lib/api/users";

interface CreateClassModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// Generate code tự động: năm thứ ngày tháng phút giây miligiây
const generateClassCode = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

export default function CreateClassModal({ open, onCancel, onSuccess }: CreateClassModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      // Generate code tự động khi mở modal
      form.setFieldsValue({
        code: generateClassCode(),
      });
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const user = getCurrentUser();
      if (!user || !user.user_id) {
        message.error("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      const params: CreateClassParams = {
        name: values.name.trim(),
        code: values.code.trim(),
        student_count: 0, // Mặc định 0
        status: "active", // Mặc định active
        created_by: Number(user.user_id),
      };

      await createClass(params);
      message.success("Tạo lớp học thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể tạo lớp học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) {
      message.warning("Đang tạo lớp học, vui lòng đợi...");
      return;
    }
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Tạo lớp học mới"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      maskClosable={!submitting}
      closable={!submitting}
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên lớp"
          rules={[
            { required: true, message: "Vui lòng nhập tên lớp" },
            { max: 255, message: "Tên lớp không được vượt quá 255 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên lớp học" disabled={submitting} size="middle" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Mã lớp (tự động)"
          tooltip="Mã lớp được tạo tự động để tránh trùng lặp"
        >
          <Input placeholder="Mã lớp sẽ được tạo tự động" disabled size="middle" className="bg-gray-50" />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} disabled={submitting} size="middle">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting} size="middle" className="bg-blue-500 hover:bg-blue-600">
              {submitting ? "Đang tạo..." : "Tạo lớp học"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

