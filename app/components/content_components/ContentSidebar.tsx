import { Button } from "antd";
import {
  PlusOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FilePptOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

interface Category {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ContentSidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onContributeClick: () => void;
}

const subCategories: Category[] = [
  { key: "latest", label: "Tài liệu mới nhất", icon: FileTextOutlined },
  { key: "exercises", label: "Bài tập, Đề thi", icon: CheckCircleOutlined },
  { key: "reference", label: "Tài liệu tham khảo", icon: EditOutlined },
  { key: "video", label: "Bài giảng Video", icon: VideoCameraOutlined },
  { key: "powerpoint", label: "Slide Powerpoint", icon: FilePptOutlined },
  { key: "lesson-plan", label: "Kế hoạch bài giảng", icon: CalendarOutlined },
  { key: "my-content", label: "Nội dung của bạn", icon: UserOutlined },
];

export default function ContentSidebar({ activeCategory, onCategoryChange, onContributeClick }: ContentSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 flex flex-col bg-white">
      <div className="p-2">
        {/* Contribute Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="w-full mb-6 bg-linear-to-r from-blue-500 to-purple-500 border-0 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          size="large"
          onClick={onContributeClick}
        >
          Đóng góp nội dung
        </Button>

        {/* Main Category - All Documents */}
        <button
          onClick={() => onCategoryChange("all")}
          className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group ${
            activeCategory === "all"
              ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg font-semibold"
              : "text-gray-700 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md hover:text-purple-600"
          }`}
        >
          <HomeOutlined
            className={`text-lg transition-transform duration-300 group-hover:scale-110 ${
              activeCategory === "all" ? "text-white" : "text-gray-700 group-hover:text-blue-600"
            }`}
          />
          <span
            className={`text-sm ${
              activeCategory === "all" ? "text-white font-semibold" : "text-gray-700 group-hover:text-blue-600 font-normal"
            }`}
          >
            Tất cả tài liệu
          </span>
        </button>

        {/* Sub Categories */}
        <div className="space-y-1.5 mt-2">
          {subCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.key;
            return (
              <button
                key={category.key}
                onClick={() => onCategoryChange(category.key)}
                className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group ${
                  isActive
                    ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg font-semibold"
                    : "text-gray-700 hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md hover:text-purple-600"
                }`}
              >
                <Icon
                  className={`text-base transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-600"
                  }`}
                />
                <span className={`text-sm ${isActive ? "font-semibold" : "font-normal"}`}>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
