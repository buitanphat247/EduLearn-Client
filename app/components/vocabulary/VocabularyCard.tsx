"use client";

import { BookOutlined, ArrowRightOutlined } from "@ant-design/icons";
import Link from "next/link";

interface VocabularyCardProps {
  folderId: number;
  folderName: string;
  href?: string;
}

export default function VocabularyCard({
  folderId,
  folderName,
  href = "#",
}: VocabularyCardProps) {
  return (
    <Link href={href} className="block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 h-full flex flex-col">
        {/* Header - Light gray background */}
        <div className="bg-gray-50 px-6 py-6 border-b border-gray-200 flex-1">
          {/* Icon */}
          <div className="mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOutlined className="text-lg text-gray-600" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {folderName}
          </h3>
        </div>
        
        {/* Footer - White background */}
        <div className="px-6 py-4 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">ID: {folderId}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 text-sm">Truy cập ngay</span>
          </div>
          <ArrowRightOutlined className="text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

