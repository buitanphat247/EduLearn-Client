import React, { useState } from "react";
import { Modal, Switch, Button, Select } from "antd";
import {
  SettingOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  CloseOutlined,
  UserOutlined,
  SyncOutlined,
  DatabaseOutlined,
  SkinOutlined,
  MessageOutlined,
  PhoneOutlined,
  ToolOutlined,
} from "@ant-design/icons";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type SettingSection = "general" | "account" | "privacy" | "sync" | "data" | "theme" | "notification" | "message" | "call" | "utilities";

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingSection>("general");

  const menuItems = [
    { key: "general" as const, icon: <SettingOutlined />, label: "Cài đặt chung" },
    { key: "account" as const, icon: <SafetyCertificateOutlined />, label: "Tài khoản và bảo mật" },
    { key: "privacy" as const, icon: <SafetyCertificateOutlined />, label: "Quyền riêng tư" },
    { key: "sync" as const, icon: <SyncOutlined />, label: "Đồng bộ tin nhắn" },
    { key: "data" as const, icon: <DatabaseOutlined />, label: "Quản lý dữ liệu" },
    { key: "theme" as const, icon: <SkinOutlined />, label: "Giao diện" },
    { key: "notification" as const, icon: <BellOutlined />, label: "Thông báo" },
    { key: "message" as const, icon: <MessageOutlined />, label: "Tin nhắn" },
    { key: "call" as const, icon: <PhoneOutlined />, label: "Cài đặt cuộc gọi" },
    { key: "utilities" as const, icon: <ToolOutlined />, label: "Tiện ích" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Danh bạ</h3>
            <div className="space-y-4">
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">Danh sách bạn bè được hiển thị trong danh bạ</p>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <span className="text-gray-700 dark:text-slate-200">Hiển thị tất cả bạn bè</span>
                <div className="w-5 h-5 rounded-full border border-gray-400 dark:border-slate-600"></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <span className="text-gray-700 dark:text-slate-200">Chỉ hiển thị bạn bè đang sử dụng Zalo</span>
                <div className="w-5 h-5 rounded-full border-4 border-blue-500 bg-transparent"></div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700/50 my-4"></div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ngôn ngữ</h3>
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <span className="text-gray-700 dark:text-slate-200">Thay đổi ngôn ngữ</span>
              <Select
                defaultValue="vi"
                style={{ width: 120 }}
                classNames={{ popup: { root: "bg-white dark:bg-slate-800 text-gray-900 dark:text-white" } }}
                options={[
                  { value: "vi", label: "Tiếng Việt" },
                  { value: "en", label: "English" },
                ]}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700/50 my-4"></div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Khởi động & ghi nhớ tài khoản</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-slate-200">Khởi động Zalo khi mở máy</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-slate-200">Ghi nhớ tài khoản đăng nhập</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        );
      case "theme":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Giao diện</h3>
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <AppstoreOutlined className="text-purple-500 text-xl" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-200">Chế độ tối</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Giao diện tối giúp bảo vệ mắt</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        );
      case "notification":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thông báo</h3>
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <BellOutlined className="text-yellow-500 text-xl" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-200">Âm thanh thông báo</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-slate-500">
            <SettingOutlined className="text-4xl mb-4 opacity-50" />
            <p>Tính năng đang được cập nhật</p>
          </div>
        );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={null}
      width={900}
      centered
      className="settings-modal"
      modalRender={(modal) => (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700/50 shadow-2xl shadow-black/50 p-0 pointer-events-auto">
          {React.cloneElement(modal as any, { style: { ...(modal as any).props?.style, padding: 0 } })}
          <div className="flex h-[600px] text-gray-700 dark:text-slate-200">
            {/* Sidebar */}
            <div className="w-[280px] bg-gray-50 dark:bg-[#1e293b]/50 border-r border-gray-200 dark:border-slate-700/30 flex flex-col">
              <div className="p-5 border-b border-gray-200 dark:border-slate-700/30">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white m-0">Cài đặt</h2>
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${activeSection === item.key
                      ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <div className="text-lg opacity-80">{item.icon}</div>
                    <span className="text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0f172a]">
              {/* Header */}
              <div className="h-[69px] border-b border-gray-200 dark:border-slate-700/30 flex items-center justify-end px-6">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <CloseOutlined className="text-lg" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{renderContent()}</div>
            </div>
          </div>
        </div>
      )}
      styles={{
        mask: { backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" },
      }}
    >
      <div />
    </Modal>
  );
}
