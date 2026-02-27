"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Tag, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface Post {
  id: string | number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
}

interface CommunitySearchModalProps {
  open: boolean;
  onClose: () => void;
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

export default function CommunitySearchModal({ open, onClose, posts, onPostClick }: CommunitySearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handlePostClick = (post: Post) => {
    if (onPostClick) {
      onPostClick(post);
    }
    onClose();
    setSearchQuery("");
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={700}
      styles={{
        body: { padding: 0 },
      }}
      className="search-modal"
      destroyOnHidden
    >
      <div >
        {/* Search Input */}
        <div className="mb-3">
          <Input
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-lg"
            autoFocus
            suffix={
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K
              </span>
            }
          />
        </div>

        {/* Search Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {searchQuery.trim() ? (
            filteredPosts.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-2">Tìm thấy {filteredPosts.length} kết quả</div>
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {post.author}
                          </span>
                          <span className="text-xs text-gray-500">{post.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.tags.map((tag, index) => (
                            <Tag key={index} color="blue" className="px-2 py-0.5 rounded-md text-xs">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{post.likes} Thích</span>
                          <span>{post.comments} Bình luận</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description={<span className="text-gray-500">Không tìm thấy kết quả nào</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )
          ) : (
            <div className="text-center py-8">
              <SearchOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">Nhập từ khóa để tìm kiếm</p>
              <p className="text-xs text-gray-400">Sử dụng {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K để mở nhanh</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
