"use client";

import { useState } from "react";
import { Modal, Input, Select, Button, Form } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPost: (content: string, tags: string[]) => void;
}

export default function CreatePostModal({ open, onClose, onPost }: CreatePostModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onPost(values.content, values.tags);
      form.resetFields();
      setLoading(false);
    } catch (error) {
      // Validation error is handled by Ant Design Form
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo bài viết mới"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          icon={<SendOutlined />}
          className="bg-blue-600"
        >
          Đăng bài
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="content"
          label="Nội dung thảo luận"
          rules={[{ required: true, message: "Vui lòng nhập nội dung bài viết!" }]}
        >
          <TextArea
            rows={6}
            placeholder="Bạn đang thắc mắc điều gì? Hãy chia sẻ với mọi người..."
            className="resize-none"
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Chủ đề liên quan"
          rules={[{ required: true, message: "Vui lòng chọn ít nhất một chủ đề!" }]}
        >
          <Select
            mode="tags"
            placeholder="Chọn hoặc nhập chủ đề (VD: Toán học, Vật lý...)"
            style={{ width: "100%" }}
            tokenSeparators={[","]}
          >
            <Option value="Toán học">Toán học</Option>
            <Option value="Ngữ văn">Ngữ văn</Option>
            <Option value="Vật lý">Vật lý</Option>
            <Option value="Hóa học">Hóa học</Option>
            <Option value="Sinh học">Sinh học</Option>
            <Option value="Lịch sử">Lịch sử</Option>
            <Option value="Địa lý">Địa lý</Option>
            <Option value="Tiếng Anh">Tiếng Anh</Option>
            <Option value="Tin học">Tin học</Option>
            <Option value="GDCD">GDCD</Option>
            <Option value="Hỏi đáp">Hỏi đáp</Option>
            <Option value="Thảo luận">Thảo luận</Option>
            <Option value="Tài liệu">Tài liệu</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
