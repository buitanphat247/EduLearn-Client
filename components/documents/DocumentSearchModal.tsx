"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Select, Tag, Empty } from "antd";
import { SearchOutlined, FilterOutlined, FileTextOutlined, DownloadOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";

const { Option } = Select;

export interface DocumentItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  updateDate: string;
  author: string;
  downloads: number;
  type: "word" | "checked" | "pdf";
  viewerUrl?: string;
}

interface DocumentSearchModalProps {
  open: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onDocumentClick?: (document: DocumentItem) => void;
}

export default function DocumentSearchModal({ open, onClose, documents, onDocumentClick }: DocumentSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedGrade(undefined);
      setSelectedSubject(undefined);
    }
  }, [open]);

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = !searchQuery.trim() || doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = !selectedGrade || doc.grade === selectedGrade;
    const matchesSubject = !selectedSubject || doc.subject === selectedSubject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleDocumentClick = (doc: DocumentItem) => {
    if (onDocumentClick) {
      onDocumentClick(doc);
    }
    onClose();
    setSearchQuery("");
    setSelectedGrade(undefined);
    setSelectedSubject(undefined);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "word":
        return "📄";
      case "pdf":
        return "📕";
      default:
        return "📋";
    }
  };

  const getTypeColorClass = (type: string) => {
    switch (type) {
      case "word":
        return "text-blue-600";
      case "pdf":
        return "text-red-600";
      default:
        return "text-orange-600";
    }
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
      <div>
        {/* Search Input */}
        <div className="mb-3">
          <Input
            size="large"
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm kiếm tài liệu..."
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

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <Select
            placeholder="Lọc theo khối"
            allowClear
            style={{ width: "50%" }}
            value={selectedGrade}
            onChange={setSelectedGrade}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="Khối 9">Khối 9</Option>
            <Option value="Khối 10">Khối 10</Option>
            <Option value="Khối 11">Khối 11</Option>
            <Option value="Khối 12">Khối 12</Option>
          </Select>
          <Select
            placeholder="Lọc theo môn"
            allowClear
            style={{ width: "50%" }}
            value={selectedSubject}
            onChange={setSelectedSubject}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="Toán học">Toán học</Option>
            <Option value="Ngữ văn">Ngữ văn</Option>
            <Option value="Vật lý">Vật lý</Option>
            <Option value="Hóa học">Hóa học</Option>
          </Select>
        </div>

        {/* Search Results */}
        <div className="max-h-[500px] overflow-y-auto">
          {searchQuery.trim() || selectedGrade || selectedSubject ? (
            filteredDocuments.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 mb-2">Tìm thấy {filteredDocuments.length} kết quả</div>
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl shrink-0">{getTypeIcon(doc.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                          {doc.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Tag color="blue" className="px-2 py-0.5 rounded-md text-xs">
                            {doc.grade}
                          </Tag>
                          <Tag color="purple" className="px-2 py-0.5 rounded-md text-xs">
                            {doc.subject}
                          </Tag>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarOutlined />
                            {doc.updateDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserOutlined />
                            {doc.author}
                          </span>
                          <span className={`flex items-center gap-1 ${getTypeColorClass(doc.type)}`}>
                            <DownloadOutlined />
                            {doc.downloads} lượt tải
                          </span>
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
              <FileTextOutlined className="text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 mb-1">Nhập từ khóa để tìm kiếm</p>
              <p className="text-xs text-gray-400">Sử dụng {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K để mở nhanh</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
