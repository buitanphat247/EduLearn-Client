import React from "react";
import { Modal, Button, Avatar } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, CameraOutlined } from "@ant-design/icons";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string | number;
    username: string;
    fullname?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar?: string | null;
    role_name?: string | null;
  } | null;
  friendCount?: number;
  groupCount?: number;
}

export default function ProfileModal({ isOpen, onClose, user, friendCount = 0, groupCount = 0 }: ProfileModalProps) {
  if (!user) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      modalRender={(modal) => (
        <div
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          }}
        >
          {React.cloneElement(modal as any, { style: { ...(modal as any)?.props?.style, backgroundColor: "transparent", padding: 0 } })}
        </div>
      )}
      styles={{
        header: {
          backgroundColor: "transparent",
          marginBottom: 0,
          padding: "16px",
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          zIndex: 10,
        },
        body: {
          padding: 0,
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
      closeIcon={
        <span className="text-white bg-black/20 hover:bg-black/40 w-8 h-8 flex items-center justify-center rounded-full transition-colors">×</span>
      }
    >
      <div className="flex flex-col relative">
        {/* Cover Image Placeholder */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600 w-full relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        </div>

        {/* Content Container */}
        <div className="px-6 pb-8 -mt-12 flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="rounded-full p-1 bg-[#0f172a]">
              {user.avatar ? (
                <Avatar src={user.avatar} size={100} className="border-4 border-[#0f172a]" />
              ) : (
                <div className="w-[100px] h-[100px] rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-[#0f172a]">
                  {(user.fullname?.[0] || user.username?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 bg-slate-800 text-white p-2 rounded-full border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg">
              <CameraOutlined />
            </button>
          </div>

          {/* Name & Info */}
          <h2 className="text-2xl font-bold text-white mb-1">{user.fullname || user.username}</h2>
          <p className="text-slate-400 mb-2">@{user.username}</p>

          {/* Role Tag */}
          {user.role_name && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide mb-6 ${user.role_name.toLowerCase().includes('admin') || user.role_name.toLowerCase().includes('quản trị')
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : user.role_name.toLowerCase().includes('teacher') || user.role_name.toLowerCase().includes('giáo viên') || user.role_name.toLowerCase().includes('gia sư')
                  ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  : user.role_name.toLowerCase().includes('student') || user.role_name.toLowerCase().includes('học sinh') || user.role_name.toLowerCase().includes('học viên')
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
              {user.role_name}
            </div>
          )}

          {/* Stats / Quick Info */}
          <div className="grid grid-cols-3 gap-4 w-full mb-8 border-y border-slate-800 py-4">
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-lg">{friendCount}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Bạn bè</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-800">
              <span className="text-white font-bold text-lg">{groupCount}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Nhóm</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-800">
              <span className="text-green-500 font-bold text-lg">Online</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Trạng thái</span>
            </div>
          </div>

          {/* Detail Info */}
          <div className="w-full flex flex-col gap-4 text-slate-300 mb-8">
            {user.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <MailOutlined className="text-blue-500" />
                <span className="flex-1 truncate">{user.email}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <PhoneOutlined className="text-green-500" />
                <span className="flex-1 truncate">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <Button
            type="primary"
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 border-none font-medium shadow-lg shadow-blue-600/20"
          >
            <EditOutlined /> Chỉnh sửa thông tin
          </Button>
        </div>
      </div>
    </Modal>
  );
}
