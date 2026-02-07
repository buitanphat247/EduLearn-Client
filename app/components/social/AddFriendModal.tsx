import React, { useState } from "react";
import { Modal, Input, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getUsers, GetUsersResponse } from "@/lib/api/users";
import { useSocial } from "@/app/social/SocialContext";
import UserProfileModal from "./UserProfileModal";

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddFriendModal({ open, onClose }: AddFriendModalProps) {
  const [inputType, setInputType] = useState<"phone" | "email">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GetUsersResponse | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (open) {
      // focus input?
    } else {
      setPhoneNumber("");
      setEmail("");
      setInputType("phone");
    }
  }, [open]);

  const handleSearch = async () => {
    let term = "";
    if (inputType === "phone") {
      if (!phoneNumber.trim()) return;
      term = phoneNumber.trim();
      // Normalize phone: strip leading 0
      if (/^0\d+$/.test(term)) {
        term = term.substring(1);
      }
    } else {
      if (!email.trim()) return;
      term = email.trim();
    }

    setLoading(true);
    setSelectedUser(null);

    try {
      const result = await getUsers({ search: term, limit: 10 });

      let foundUser = null;
      if (result.users && result.users.length > 0) {
        if (inputType === "email") {
          foundUser = result.users.find(u => u.email && u.email.toLowerCase() === term.toLowerCase());
        } else {
          // Phone search fuzzy match
          // If backend returns results, we usually trust them, but let's try to find exact phone match first if possible
          // But 'term' is stripped, 'u.phone' might be +84... or 09...
          // Simple check: does u.phone contain term?
          foundUser = result.users.find(u => u.phone && u.phone.includes(term));
        }

        // Fallback to first result if specific match fails but backend returned valid candidates
        if (!foundUser) foundUser = result.users[0];
      }

      if (foundUser) {
        setSelectedUser(foundUser);
        setIsProfileOpen(true);
      } else {
        message.info("Không tìm thấy người dùng");
      }
    } catch (error) {
      console.error(error);
      message.info("Không tìm thấy người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={360}
        centered
        className="add-friend-modal"
        closeIcon={null}
        styles={{
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
          },
        }}
        modalRender={(modal) => (
          <div className="bg-transparent">
            {React.cloneElement(modal as any, { style: { backgroundColor: "transparent", boxShadow: "none", padding: 0 } })}
          </div>
        )}
      >
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-2xl p-5 text-gray-600 dark:text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white leading-none mb-0 tracking-tight text-base">Thêm bạn bè</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all border-none bg-transparent cursor-pointer w-7 h-7"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setInputType("phone")}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none ${inputType === "phone"
                  ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 bg-transparent"
                }`}
            >
              Số điện thoại
            </button>
            <button
              type="button"
              onClick={() => setInputType("email")}
              className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none ${inputType === "email"
                  ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50 bg-transparent"
                }`}
            >
              Email
            </button>
          </div>

          {/* Input Area */}
          <div className="mb-6">
            {inputType === "phone" ? (
              <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                <div className="flex items-center px-3 border-r border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-800/50 rounded-l-xl">
                  <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">VN</span>
                  <span className="text-gray-700 dark:text-slate-300 ml-1 text-sm">+84</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập số điện thoại"
                  autoFocus
                  className="flex-1 bg-transparent border-none py-3 px-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            ) : (
              <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập địa chỉ email"
                  autoFocus
                  className="flex-1 bg-transparent border-none py-3 px-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || (inputType === "phone" ? !phoneNumber : !email)}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 border-none cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tìm kiếm...</span>
              </>
            ) : (
              <>
                <SearchOutlined />
                <span>Tìm kiếm</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      <UserProfileModal
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onCloseParent={onClose}
        user={selectedUser}
      />
    </>
  );
}
