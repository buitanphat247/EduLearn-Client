"use client";

import { Modal, Form, Select, App, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { updateUserStatus } from "@/lib/api/users";

interface UpdateUserStatusModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  userId: string | number;
  currentStatus?: string;
  userName?: string;
}

export default function UpdateUserStatusModal({
  open,
  onCancel,
  onSuccess,
  userId,
  currentStatus,
  userName,
}: UpdateUserStatusModalProps) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [updating, setUpdating] = useState(false);

  // Reset form và cập nhật initialValues khi modal mở hoặc userId/currentStatus thay đổi
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ status: currentStatus || "online" });
    } else {
      // Reset form khi đóng modal
      form.resetFields();
    }
  }, [open, currentStatus, form]);

  const handleSubmit = async (values: { status: string }) => {
    setUpdating(true);
    try {
      await updateUserStatus(userId, values.status);
      message.success("Cập nhật trạng thái thành công!");
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(error?.message || "Không thể cập nhật trạng thái");
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
          <span>Thay đổi trạng thái người dùng</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnHidden={false}
      maskClosable={!updating}
      closable={!updating}
    >
      {userName && (
        <div className="mb-2 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Người dùng:</p>
          <p className="font-semibold text-gray-800">{userName}</p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: currentStatus || "online" }}
        disabled={updating}
      >
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select
            placeholder="Chọn trạng thái"
            size="middle"
            options={[
              { value: "online", label: "Hoạt động bình thường" },
              { value: "banned", label: "Bị cấm (không thể đăng nhập)" },
            ]}
          />
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

