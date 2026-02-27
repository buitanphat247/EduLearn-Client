"use client";

import { useState } from "react";
import { Modal, Button, Input, message } from "antd";
import { LinkOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  postId: string | number;
  author: string;
  content: string;
  postUrl?: string;
}

export default function ShareModal({ open, onClose, postId, author, content, postUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate post URL if not provided
  const shareUrl = postUrl || (typeof window !== "undefined" ? `${window.location.origin}/user/community/post/${postId}` : "");
  const shareText = `${author}: ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      message.success("Đã sao chép liên kết!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error("Không thể sao chép liên kết");
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      message.success("Đã sao chép nội dung!");
    } catch (err) {
      message.error("Không thể sao chép nội dung");
    }
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold text-gray-800">Chia sẻ bài viết</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      maskClosable={true}
      destroyOnHidden={false}
      styles={{
        body: { padding: "0px" },
      }}
    >
      <div className="space-y-4">
        {/* Share URL Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Liên kết bài viết</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
              prefix={<LinkOutlined className="text-gray-400" />}
              styles={{
                input: { cursor: "text" },
              }}
            />
            <Button
              type={copied ? "default" : "primary"}
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopyLink}
              className={`${copied ? "bg-green-500 hover:bg-green-600 border-green-500 text-white" : ""}`}
            >
              {copied ? "Đã copy" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Social Media Share Buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Chia sẻ lên mạng xã hội</label>
          <div className="grid grid-cols-3 gap-3">
            <div
              className="flex flex-row items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 rounded-lg px-3 py-2.5"
              onClick={handleShareFacebook}
            >
              <FacebookOutlined className="text-lg" />
              <span className="text-xs font-medium">Facebook</span>
            </div>
            <div
              className="flex flex-row items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1A91DA] text-white cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 rounded-lg px-3 py-2.5"
              onClick={handleShareTwitter}
            >
              <TwitterOutlined className="text-lg" />
              <span className="text-xs font-medium">Twitter</span>
            </div>
            <div
              className="flex flex-row items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#095195] text-white cursor-pointer shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 rounded-lg px-3 py-2.5"
              onClick={handleShareLinkedIn}
            >
              <LinkedinOutlined className="text-lg" />
              <span className="text-xs font-medium">LinkedIn</span>
            </div>
          </div>
        </div>

        {/* Copy Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung bài viết</label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-2 min-h-[60px]">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          <Button
            type="default"
            icon={<CopyOutlined />}
            onClick={handleCopyContent}
            className="w-full border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            Sao chép nội dung
          </Button>
        </div>
      </div>
    </Modal>
  );
}
