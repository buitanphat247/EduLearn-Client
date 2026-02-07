import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "antd";
import { MessageOutlined, ContactsOutlined, SettingOutlined, HomeOutlined } from "@ant-design/icons";
import { FaUser } from "react-icons/fa";

interface NavigationRailProps {
  onSettingsClick: () => void;
  onProfileClick: () => void;
  user: {
    avatar?: string | null;
    fullname?: string;
    username?: string;
  } | null;
}

export default function NavigationRail({ onSettingsClick, onProfileClick, user }: NavigationRailProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on path
  const isContacts = pathname?.startsWith("/social/contacts");
  const isMessages = !isContacts && (pathname === "/social" || pathname?.startsWith("/social/messages"));

  return (
    <nav className="w-[64px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-5 shrink-0 z-20">
      {/* User Logic */}
      <div>
        <div
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full cursor-pointer hover:bg-slate-800 transition-all border border-slate-700 flex items-center justify-center group"
          title="Trang cá nhân"
        >
          <FaUser className="text-lg text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* Main Navigation Icons */}
      <div className="flex flex-col gap-4 w-full px-2">
        <button
          onClick={() => router.push("/social")}
          title="Tin nhắn"
          className={`w-12 h-12 rounded-xl transition-all duration-200 border-none cursor-pointer flex items-center justify-center mx-auto ${isMessages ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            }`}
        >
          <MessageOutlined className="text-xl" />
        </button>

        <button
          onClick={() => router.push("/social/contacts")}
          title="Danh bạ"
          className={`w-12 h-12 rounded-xl transition-all duration-200 border-none cursor-pointer flex items-center justify-center mx-auto ${isContacts ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent"
            }`}
        >
          <ContactsOutlined className="text-xl" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 w-full px-2 mb-2">
        <button
          onClick={onSettingsClick}
          title="Cài đặt"
          className="w-12 h-12 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent transition-all duration-200 border-none cursor-pointer flex items-center justify-center mx-auto"
        >
          <SettingOutlined className="text-xl" />
        </button>

        <div className="w-8 h-[1px] bg-slate-700/50 mx-auto my-1"></div>

        <button
          onClick={() => router.push("/")}
          title="Trang chủ"
          className="w-12 h-12 rounded-xl hover:bg-slate-800 hover:text-white text-slate-400 transition-all duration-200 border-none bg-transparent cursor-pointer flex items-center justify-center mx-auto"
        >
          <HomeOutlined className="text-xl" />
        </button>
      </div>
    </nav>
  );
}
