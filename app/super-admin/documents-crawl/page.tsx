"use client";

import { Table, Tag, Button, Select, App, Space, Input } from "antd";
import { SearchOutlined, EyeOutlined, DownloadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { ColumnsType } from "antd/es/table";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDocumentAttachmentsCrawl, type DocumentAttachmentCrawl } from "@/lib/api/documents";
import DocumentPreviewModal from "@/app/components/documents/DocumentPreviewModal";
import { useDocumentPreview } from "@/app/components/documents/useDocumentPreview";
import { useDebounce } from "@/app/hooks/useDebounce";

const { Option } = Select;

interface DocumentTableType {
  key: string;
  id: number;
  attachment_id: number;
  fileName: string;
  link: string;
  fileType: string;
  fileSize: string;
  createdAt: string;
  documentTitle: string;
  documentKhoi: string;
  documentMonHoc: string;
  documentLink: string;
}

export default function SuperAdminDocumentsCrawl() {
  const { message } = App.useApp();
  const { previewDoc, openPreview, closePreview, handleAfterClose, isOpen } = useDocumentPreview();
  const [selectedFileType, setSelectedFileType] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [debouncedSearchQuery, selectedFileType]);

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: [
      "documentAttachmentsCrawl",
      pagination.current,
      pagination.pageSize,
      debouncedSearchQuery,
      selectedFileType,
    ],
    queryFn: async () => {
      const result = await getDocumentAttachmentsCrawl({
        page: pagination.current,
        limit: pagination.pageSize,
        fileName: debouncedSearchQuery.trim() || undefined,
        fileType: selectedFileType,
      });

      return {
        documents: result.documents.map((doc: DocumentAttachmentCrawl) => ({
          key: doc.id.toString(),
          id: doc.id,
          attachment_id: doc.attachment_id,
          fileName: doc.fileName,
          link: doc.link,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          createdAt: doc.created_at || doc.createdAt,
          documentTitle: doc.document?.ten_tai_lieu || "",
          documentKhoi: doc.document?.khoi || "",
          documentMonHoc: doc.document?.mon_hoc || "",
          documentLink: doc.document?.link || "",
        })),
        total: result.total,
      };
    },
    placeholderData: keepPreviousData,
  });

  if (isError) {
    message.error(error instanceof Error ? error.message : "Không thể tải danh sách tài liệu crawl");
  }

  const handleTableChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize });
    },
    []
  );

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes, 10);
    if (isNaN(size)) return "0 B";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const columns: ColumnsType<DocumentTableType> = useMemo(() => [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_: any, __: DocumentTableType, index: number) => {
        const currentPage = pagination.current;
        const pageSize = pagination.pageSize;
        const stt = (currentPage - 1) * pageSize + index + 1;
        return <span className="text-gray-600 font-mono text-sm bg-gray-50 px-2 py-1 rounded">{stt}</span>;
      },
    },
    {
      title: "Tên file",
      dataIndex: "fileName",
      key: "fileName",
      width: "50%",
      render: (fileName: string) => (
        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">{fileName}</span>
      ),
    },
    {
      title: "Loại file",
      dataIndex: "fileType",
      key: "fileType",
      render: (fileType: string) => (
        <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs" color="default">
          {fileType.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Size",
      dataIndex: "fileSize",
      key: "fileSize",
      render: (fileSize: string) => <span className="text-gray-600">{formatFileSize(fileSize)}</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <span className="text-gray-600">{formatDate(date)}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: DocumentTableType) => {
        const handleDownload = async (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!record.link) {
            message.warning("Không có link để tải về");
            return;
          }

          try {
            const response = await fetch(record.link);
            if (!response.ok) {
              throw new Error("Không thể tải file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = record.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            message.success("Đã tải file thành công!");
          } catch (error: any) {
            message.error(error?.message || "Không thể tải file");
          }
        };

        const handleView = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!record.link) {
            message.warning("Không có link để xem");
            return;
          }
          openPreview({
            title: record.fileName,
            fileUrl: record.link,
          });
        };

        return (
          <Space size="small">
            <Button
              icon={<EyeOutlined />}
              size="small"
              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={handleView}
            >
              Xem
            </Button>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all duration-200"
              onClick={handleDownload}
            >
              Tải xuống
            </Button>
          </Space>
        );
      },
    },
  ], [pagination, message, openPreview]);

  return (
    <div className="space-y-3">
      {/* Search Bar and Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Tìm kiếm tài liệu theo tên file, loại file, tác giả..."
          prefix={<SearchOutlined className="text-gray-400" />}
          size="large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="flex-1"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <Select
          placeholder="Lọc theo loại file"
          size="large"
          value={selectedFileType}
          onChange={setSelectedFileType}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="pdf">PDF</Option>
          <Option value="docx">Word</Option>
          <Option value="powerpoint">PowerPoint</Option>
        </Select>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <Table
          columns={columns}
          dataSource={data?.documents || []}
          loading={isLoading || isPlaceholderData}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} tài liệu`,
            size: "small",
            onChange: handleTableChange,
          }}
          className="news-table"
          rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
          size="small"
        />
      </div>

      <DocumentPreviewModal
        open={isOpen}
        title={previewDoc?.title}
        fileUrl={previewDoc?.fileUrl}
        onClose={closePreview}
        afterClose={handleAfterClose}
      />
    </div>
  );
}
