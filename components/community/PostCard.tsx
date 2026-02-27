"use client";

import React, { useState } from "react";
import { Avatar, Tag, Button, Space } from "antd";
import { LikeOutlined, CommentOutlined, ShareAltOutlined, LikeFilled } from "@ant-design/icons";
import CustomCard from "@/components/common/CustomCard";

interface PostCardProps {
  id: string | number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  onCommentClick: () => void;
  onShareClick: () => void;
}

export default function PostCard({
  id,
  author,
  avatar,
  time,
  content,
  tags,
  likes,
  comments,
  onCommentClick,
  onShareClick,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <CustomCard padding="lg" className="hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <Avatar size={48} className="shrink-0">
          {avatar}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-800">{author}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">{time}</span>
          </div>
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{content}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Tag key={index} color="blue">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <Button
              type="text"
              icon={isLiked ? <LikeFilled className="text-red-500" /> : <LikeOutlined />}
              onClick={handleLike}
              className="flex items-center gap-1"
            >
              {likeCount}
            </Button>
            <Button
              type="text"
              icon={<CommentOutlined />}
              onClick={onCommentClick}
              className="flex items-center gap-1"
            >
              {comments}
            </Button>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={onShareClick}
              className="flex items-center gap-1"
            >
              Chia sẻ
            </Button>
          </div>
        </div>
      </div>
    </CustomCard>
  );
}

