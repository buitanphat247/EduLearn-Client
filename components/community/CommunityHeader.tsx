"use client";

import { Button, Input } from "antd";
import { SearchOutlined, PlusOutlined, TeamOutlined } from "@ant-design/icons";
import CustomCard from "@/components/common/CustomCard";

interface CommunityHeaderProps {
  onSearchClick: () => void;
  onCreatePostClick: () => void;
}

export default function CommunityHeader({ onSearchClick, onCreatePostClick }: CommunityHeaderProps) {
  return (
    <CustomCard padding="sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <TeamOutlined className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 m-0">Cộng đồng học tập</h1>
            <p className="text-sm text-gray-500 m-0">Trao đổi, thảo luận và chia sẻ kiến thức</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            icon={<SearchOutlined />} 
            onClick={onSearchClick}
            className="flex items-center"
          >
            Tìm kiếm
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onCreatePostClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            Tạo bài viết
          </Button>
        </div>
      </div>
    </CustomCard>
  );
}
