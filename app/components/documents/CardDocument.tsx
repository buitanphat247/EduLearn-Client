import { DownloadOutlined, FileWordOutlined, CheckOutlined, FileTextOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import CustomCard from "@/app/components/common/CustomCard";

export interface DocumentCardProps {
  title: string;
  grade: string;
  subject: string;
  updateDate: string;
  author: string;
  downloads: number;
  type: "word" | "checked" | "pdf";
  onPreview?: () => void;
}

export default function CardDocument({ title, grade, subject, updateDate, author, downloads, type, onPreview }: DocumentCardProps) {
  const getTypeConfig = () => {
    switch (type) {
      case "word":
        return {
          gradient: "from-blue-500 to-cyan-500",
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "pdf":
        return {
          gradient: "from-red-500 to-pink-500",
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
        };
      default:
        return {
          gradient: "from-orange-500 to-amber-500",
          iconColor: "text-orange-600",
          bgColor: "bg-orange-50",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <CustomCard
      padding="lg"
      onClick={onPreview}
      className="group cursor-pointer transition-all duration-300 overflow-hidden relative h-full"
    >
      {/* Hover effect background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className="relative z-10">
        {/* Icon Section */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-md group-hover:shadow-lg transition-all duration-300`}
          >
            {type === "word" ? (
              <FileWordOutlined className="text-3xl text-white" />
            ) : type === "pdf" ? (
              <FileTextOutlined className="text-3xl text-white" />
            ) : (
              <CheckOutlined className="text-2xl text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 text-base group-hover:text-blue-600 transition-colors duration-300 leading-tight">
              {title}
            </h3>
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">{grade}</span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">{subject}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-gray-400" />
            <span>{updateDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserOutlined className="text-gray-400" />
            <span>{author}</span>
          </div>

        </div>
      </div>

      {/* Hover indicator */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${config.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
      ></div>
    </CustomCard>
  );
}
