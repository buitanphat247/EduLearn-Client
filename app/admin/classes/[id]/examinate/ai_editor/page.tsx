"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Typography, Button, Space, Input, Form, Spin, message, Divider, Badge, Result, Empty, Tooltip, InputNumber, Select, Tag } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  WarningOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  SettingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getRagTestDetail, updateRagTest, updateRagQuestion, RagTestDetail } from "@/lib/api/rag-exams";
import CustomCard from "@/app/components/common/CustomCard";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AIEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = params.id as string;
  const testId = searchParams.get("testId") as string;

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [metadataForm] = Form.useForm();

  const fetchTest = useCallback(async () => {
    if (!testId) return;
    setLoading(true);
    try {
      const data = await getRagTestDetail(testId);
      if (data) {
        setTest(data);
        metadataForm.setFieldsValue({
          title: data.title,
          description: data.description,
          duration_minutes: data.duration_minutes,
          max_attempts: data.max_attempts,
          total_score: data.total_score,
        });
      }
    } catch (error) {
      message.error("Không thể tải nội dung bộ đề");
    } finally {
      setLoading(false);
    }
  }, [testId, metadataForm]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleSaveMetadata = async (values: any) => {
    setSaving(true);
    try {
      const success = await updateRagTest(testId, values);
      if (success) {
        message.success("Đã cập nhật cấu hình");
        fetchTest();
      } else {
        message.error("Cập nhật thất bại");
      }
    } catch (error) {
      message.error("Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestion = async (questionId: string, values: any) => {
    setSaving(true);
    try {
      const updateData = {
        content: values.content,
        answer_a: values.options[0],
        answer_b: values.options[1],
        answer_c: values.options[2],
        answer_d: values.options[3],
        correct_answer: values.correct_answer,
        explanation: values.explanation,
      };

      const success = await updateRagQuestion(questionId, updateData);
      if (success) {
        message.success("Cập nhật câu hỏi thành công!");
        setEditingQuestionId(null);
        fetchTest();
      } else {
        message.error("Cập nhật thất bại");
      }
    } catch (error) {
      message.error("Lỗi khi lưu câu hỏi");
    } finally {
      setSaving(false);
    }
  };

  if (!testId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Result
          status="warning"
          title="Thiếu mã bộ đề"
          subTitle="Vui lòng quay lại trang tạo đề AI."
          extra={
            <Button type="primary" onClick={() => router.push(`/admin/classes/${classId}/examinate`)}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 bg-white">
        <Spin size="large" indicator={<SyncOutlined spin className="text-2xl text-indigo-600" />} />
        <Text strong className="text-gray-400 text-xs tracking-widest uppercase">
          Syncing AI Content...
        </Text>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Empty description="Không tìm thấy bộ đề" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 w-full gap-4 min-h-screen">
      {/* Left: Questions List - Wrapped in CustomCards with Gray-200 Border */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-3">
        {test.questions.map((q, idx) => (
          <CustomCard
            key={q.id}
            padding="none"
            className={`transition-all duration-300 overflow-hidden border border-gray-200 ${
              editingQuestionId === q.id ? "ring-2 ring-indigo-500 border-transparent shadow-xl" : "shadow-sm"
            }`}
          >
            {editingQuestionId === q.id ? (
              <Form
                layout="vertical"
                className="p-6 bg-white"
                initialValues={{
                  content: q.content,
                  options: q.options,
                  correct_answer: q.correct_answer,
                  explanation: q.explanation,
                }}
                onFinish={(values) => handleSaveQuestion(q.id, values)}
              >
                <div className="flex justify-between items-center mb-6">
                  <Space size="middle">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded text-xs flex items-center justify-center font-black">{idx + 1}</span>
                    <span className="text-xs font-black text-indigo-600 uppercase">Biên tập câu hỏi</span>
                  </Space>
                  <Space>
                    <Button onClick={() => setEditingQuestionId(null)} size="small" className="rounded-lg border-none text-gray-400 font-bold">
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      size="small"
                      icon={<SaveOutlined />}
                      className="bg-indigo-600 rounded-lg font-bold shadow-none"
                    >
                      Lưu
                    </Button>
                  </Space>
                </div>

                <Form.Item name="content" className="mb-4">
                  <TextArea rows={2} className="rounded-xl text-sm border-gray-200" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {["A", "B", "C", "D"].map((char, i) => (
                    <Form.Item key={char} name={["options", i]} className="mb-0">
                      <Input
                        size="small"
                        className="h-9 rounded-lg border-gray-200"
                        prefix={<span className="font-black text-indigo-300 mr-2 text-[10px]">{char}</span>}
                      />
                    </Form.Item>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                  <Form.Item
                    name="correct_answer"
                    label={<span className="text-[10px] font-black text-gray-400 uppercase">Đáp án</span>}
                    className="mb-0"
                  >
                    <Select size="small" className="w-full">
                      {["A", "B", "C", "D"].map((v) => (
                        <Select.Option key={v} value={v}>
                          Phương án {v}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="explanation"
                    label={<span className="text-[10px] font-black text-gray-400 uppercase">Giải thích</span>}
                    className="lg:col-span-2 mb-0"
                  >
                    <Input size="small" className="rounded-lg border-gray-200" placeholder="..." />
                  </Form.Item>
                </div>
              </Form>
            ) : (
              <div className="flex gap-4 group p-4 bg-white relative">
                <div className="shrink-0">
                  <div className="w-8 h-8 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg text-xs flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    {idx + 1}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <Text className="text-[15px] text-gray-800 leading-relaxed block max-w-[95%] font-medium">{q.content}</Text>
                    <Button
                      icon={<EditOutlined />}
                      size="small"
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border-gray-100 text-gray-400 hover:text-indigo-600 bg-white"
                      onClick={() => setEditingQuestionId(q.id)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => {
                      const char = String.fromCharCode(65 + i);
                      const isCorrect = q.correct_answer === char;
                      return (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded-lg border flex items-center gap-2 transition-all ${
                            isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-white border-gray-100 shadow-sm"
                          }`}
                        >
                          <span className={`text-[10px] font-black ${isCorrect ? "text-emerald-500" : "text-gray-300"}`}>{char}.</span>
                          <span className={`text-[13px] ${isCorrect ? "text-emerald-700 font-bold" : "text-gray-600"}`}>{opt}</span>
                          {isCorrect && <CheckCircleFilled className="ml-auto text-emerald-500 text-xs" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CustomCard>
        ))}
      </div>

      {/* Right: Settings - CustomCard with Gray-200 Border */}
      <div className="col-span-12 lg:col-span-3 sticky top-4 h-fit">
        <CustomCard
          className="shadow-sm border border-gray-200 overflow-hidden"
          padding="none"
          title={
            <div className="flex items-center gap-2 px-4 py-3">
              <SettingOutlined className="text-indigo-600 text-xs" />
              <span className="font-black text-[10px] uppercase tracking-widest text-gray-600">Cấu hình</span>
            </div>
          }
        >
          <div className="p-4 bg-white">
            <Form form={metadataForm} layout="vertical" onFinish={handleSaveMetadata} className="space-y-3">
              <Form.Item
                name="title"
                label={<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên đề thi</span>}
                className="mb-0"
              >
                <Input size="small" className="h-8 rounded-lg border-gray-200 font-medium text-xs bg-gray-50/50 px-2" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mô tả</span>}
                className="mb-0"
              >
                <TextArea rows={2} className="rounded-lg text-[11px] border-gray-200 bg-gray-50/50" />
              </Form.Item>

              <div className="grid grid-cols-3 gap-2">
                <Form.Item
                  name="duration_minutes"
                  label={<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">T.gian</span>}
                  className="mb-0"
                >
                  <InputNumber size="small" className="w-full h-8 rounded-lg flex items-center border-gray-200 bg-gray-50/50" />
                </Form.Item>
                <Form.Item
                  name="max_attempts"
                  label={<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lượt</span>}
                  className="mb-0"
                >
                  <InputNumber size="small" className="w-full h-8 rounded-lg flex items-center border-gray-100 bg-gray-50/50" placeholder="∞" />
                </Form.Item>
                <Form.Item
                  name="total_score"
                  label={<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm</span>}
                  className="mb-0"
                >
                  <InputNumber size="small" className="w-full h-8 rounded-lg flex items-center border-gray-100 bg-gray-50/50" />
                </Form.Item>
              </div>

              <div className="pt-3 mt-1 border-t border-gray-50 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-black uppercase tracking-widest">Độ khó</span>
                  <Tag color="orange" className="m-0 border-none rounded-md text-[8px] font-black px-1.5 py-0 bg-orange-50 text-orange-600">
                    HARD
                  </Tag>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-black uppercase tracking-widest">Trạng thái</span>
                  <Badge status="processing" text={<span className="font-black text-indigo-500 text-[8px] uppercase">Active</span>} />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  block
                  size="small"
                  className="h-9 rounded-xl bg-gray-900 border-none font-black text-[10px] uppercase tracking-widest shadow-none"
                >
                  Lưu cấu hình
                </Button>

                <Button
                  type="primary"
                  block
                  size="small"
                  className="h-9 rounded-xl bg-indigo-600 border-none font-black text-[10px] uppercase tracking-widest shadow-none"
                  onClick={() => router.push(`/admin/classes/${classId}`)}
                >
                  Xuất bản đề
                </Button>
              </div>
            </Form>

            <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-50/50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <ThunderboltFilled className="text-indigo-600 text-[10px]" />
                <span className="font-black text-[8px] uppercase tracking-widest text-indigo-700">AI Support</span>
              </div>
              <p className="text-indigo-900/60 text-[10px] leading-tight italic m-0 font-medium">Rà soát lại đề thi trước khi lưu.</p>
            </div>
          </div>
        </CustomCard>
      </div>
    </div>
  );
}
