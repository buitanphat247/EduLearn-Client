import { useState } from "react";
import { BellOutlined, RobotOutlined } from "@ant-design/icons";
import NotificationPanel from "../NotificationPanel";
import AIChatPanel from "../AIChatPanel";

export default function AdminHeader() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Hệ thống quản lý</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors relative"
            title="Trợ lý AI"
          >
            <RobotOutlined className="text-2xl" />
          </button>
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="text-gray-600 hover:text-gray-800 transition-colors relative"
          >
            <BellOutlined className="text-2xl" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            BP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Admin Teacher</span>
            <span className="text-xs text-gray-600">Giáo viên</span>
          </div>
        </div>
      </div>
    </header>
    <NotificationPanel open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    <AIChatPanel open={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </>
  );
}

