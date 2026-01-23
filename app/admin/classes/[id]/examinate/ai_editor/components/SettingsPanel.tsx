import { Button, Form, Input, InputNumber, Switch, DatePicker } from "antd";
import { SettingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CustomCard from "@/app/components/common/CustomCard";
import dayjs from "dayjs";

const { TextArea } = Input;

interface SettingsPanelProps {
  form: ReturnType<typeof Form.useForm>[0];
  onSave: (values: any) => Promise<void>;
  onTogglePublish: (isPublished: boolean) => Promise<void>;
  saving: boolean;
  isPublished: boolean;
  classId: string;
}

export default function SettingsPanel({ form, onSave, onTogglePublish, saving, isPublished, classId }: SettingsPanelProps) {
  const router = useRouter();

  const handleTogglePublish = async (checked: boolean) => {
    await onTogglePublish(checked);
  };

  return (
    <div className="col-span-12 lg:col-span-3 sticky h-fit">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push(`/admin/classes/${classId}`)}
        className="mb-3 w-full border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800"
      >
        Quay lại lớp học
      </Button>
      <CustomCard
        className="border border-gray-200 dark:border-slate-700 overflow-hidden"
        padding="none"
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-indigo-600 dark:text-indigo-400 text-sm" />
            <span className="font-black text-sm uppercase tracking-widest text-gray-600 dark:text-gray-300">Cấu hình</span>
          </div>
        }
      >
        <div className="bg-white dark:bg-gray-800 transition-colors duration-300">
          <Form form={form} layout="vertical" onFinish={onSave} className="space-y-2">
            <Form.Item
              name="title"
              label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tên đề thi</span>}
              className="mb-0"
            >
              <Input
                size="small"
                disabled={saving}
                className="h-10 rounded-lg border-gray-200 dark:border-gray-600 font-medium text-sm bg-gray-50/50 dark:bg-gray-700/50 px-3 dark:text-gray-200 dark:placeholder-gray-500"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Mô tả</span>}
              className="mb-0"
            >
              <TextArea
                rows={2}
                disabled={saving}
                className="rounded-lg text-sm border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                name="duration_minutes"
                label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">T.gian (phút)</span>}
                className="mb-0"
              >
                <InputNumber
                  min={5}
                  max={180}
                  size="small"
                  disabled={saving}
                  className="w-full h-10 rounded-lg flex items-center border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
                  placeholder="45"
                />
              </Form.Item>
              <Form.Item
                name="total_score"
                label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Tổng điểm</span>}
                className="mb-0"
              >
                <InputNumber
                  min={1}
                  size="small"
                  disabled={saving}
                  className="w-full h-10 rounded-lg flex items-center border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
                  placeholder="10"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Form.Item
                name="max_attempts"
                label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Số lượt làm</span>}
                className="mb-0"
              >
                <InputNumber
                  min={0}
                  max={100}
                  size="small"
                  disabled={saving}
                  className="w-full h-10 rounded-lg flex items-center border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
                  placeholder="0 = ∞"
                />
              </Form.Item>
              <Form.Item
                name="max_violations"
                label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Lỗi tối đa</span>}
                className="mb-0"
              >
                <InputNumber
                  min={1}
                  max={100}
                  size="small"
                  disabled={saving}
                  className="w-full h-10 rounded-lg flex items-center border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
                  placeholder="3"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="end_at"
              label={<span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hạn chót nộp bài</span>}
              className="mb-0"
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                disabled={saving}
                className="w-full h-10 rounded-lg flex items-center border-gray-100 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 dark:text-gray-200"
                placeholder="Chọn thời hạn..."
              />
            </Form.Item>

            <div className="flex flex-col gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                block
                size="middle"
                className="h-10 rounded-xl bg-gray-900 dark:bg-gray-700 border-none font-bold text-base uppercase tracking-widest shadow-none hover:!bg-gray-800 dark:hover:!bg-gray-600"
              >
                Lưu cấu hình
              </Button>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                    {isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isPublished ? "Học sinh có thể làm bài" : "Đề thi đang ở chế độ nháp"}
                  </span>
                </div>
                <Switch
                  checked={isPublished}
                  onChange={handleTogglePublish}
                  disabled={saving}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  className="bg-gray-300 dark:bg-gray-600"
                />
              </div>
            </div>
          </Form>
        </div>
      </CustomCard>
    </div>
  );
}
