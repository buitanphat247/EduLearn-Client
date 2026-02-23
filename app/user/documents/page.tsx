"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Table, Tag, Button, Input, Space, App, Select } from "antd";
import { SearchOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const { Option } = Select;
import type { ColumnsType } from "antd/es/table";
import DocumentPreviewModal from "@/app/components/documents/DocumentPreviewModal";
import { getDocumentAttachmentsCrawl, type DocumentAttachmentCrawl } from "@/lib/api/documents";
import { useDocumentPreview } from "@/app/components/documents/useDocumentPreview";
import { useDebounce } from "@/app/hooks/useDebounce";

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

export default function UserDocuments() {
  const { message: messageApi } = App.useApp();
  const { previewDoc, openPreview, closePreview, handleAfterClose, isOpen } = useDocumentPreview();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedFileType, setSelectedFileType] = useState<string | undefined>();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Reset to page 1 unconditionally when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [debouncedSearchQuery, selectedFileType]);

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: [
      "documentAttachments",
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
    messageApi.error(error instanceof Error ? error.message : "Không thể tải danh sách tài liệu");
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

  const handleDownload = useCallback(
    async (record: DocumentTableType) => {
      if (!record.link) {
        messageApi.warning("Không có link để tải về");
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
        messageApi.success("Đã tải file thành công!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        messageApi.error(err?.message || "Không thể tải file");
      }
    },
    [messageApi]
  );

  const handleView = useCallback(
    (record: DocumentTableType) => {
      if (!record.link) {
        messageApi.warning("Không có link để xem");
        return;
      }
      openPreview({
        title: record.fileName,
        fileUrl: record.link,
      });
    },
    [messageApi, openPreview]
  );

  const columns: ColumnsType<DocumentTableType> = useMemo(
    () => [
      {
        title: "STT",
        key: "stt",
        width: 80,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, __: DocumentTableType, index: number) => {
          const stt = (pagination.current - 1) * pagination.pageSize + index + 1;
          return <span className="text-gray-600 dark:text-gray-400 font-mono text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{stt}</span>;
        },
      },
      {
        title: "TÊN FILE",
        dataIndex: "fileName",
        key: "fileName",
        width: "40%",
        render: (fileName: string) => (
          <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-1">
            {fileName}
          </span>
        ),
      },
      {
        title: "LOẠI FILE",
        dataIndex: "fileType",
        key: "fileType",
        width: 120,
        render: (fileType: string) => (
          <Tag className="px-2 py-0.5 rounded-md font-semibold text-xs border-none bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {fileType.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "SIZE",
        dataIndex: "fileSize",
        key: "fileSize",
        width: 120,
        render: (fileSize: string) => <span className="text-gray-600 dark:text-gray-400">{formatFileSize(fileSize)}</span>,
      },
      {
        title: "NGÀY TẠO",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) => <span className="text-gray-600 dark:text-gray-400">{formatDate(date)}</span>,
      },
      {
        title: "HÀNH ĐỘNG",
        key: "action",
        width: 200,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: DocumentTableType) => {
          return (
            <Space size="small">
              <Button
                icon={<EyeOutlined />}
                size="small"
                type="primary"
                ghost
                onClick={() => handleView(record)}
              >
                Xem
              </Button>
              <Button
                icon={<DownloadOutlined />}
                size="small"
                type="default"
                className="dark:bg-transparent dark:text-gray-300 dark:border-slate-600 dark:hover:text-blue-400 dark:hover:border-blue-400"
                onClick={() => handleDownload(record)}
              >
                Tải xuống
              </Button>
            </Space>
          );
        },
      },
    ],
    [pagination, handleView, handleDownload]
  );

  return (
    <div className="space-y-3">
      <style jsx global>{`
        .ant-pagination {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-top: 16px !important;
        }
        .ant-pagination-item {
          margin: 0 !important;
        }
        .ant-pagination-prev,
        .ant-pagination-next {
          margin: 0 !important;
        }
        .ant-pagination-total-text {
          margin-right: 16px !important;
        }
        .dark .ant-select-selector {
          background-color: #1f2937 !important; /* gray-800 */
          border-color: #475569 !important; /* slate-600 */
          color: #e5e7eb !important; /* gray-200 */
        }
        .dark .ant-select-arrow {
          color: #9ca3af !important; /* gray-400 */
        }
        .dark .ant-input {
          background-color: #1f2937 !important;
          border-color: #475569 !important; /* slate-600 */
          color: #e5e7eb !important;
        }
        .dark .ant-input::placeholder {
          color: #6b7280 !important; /* gray-500 */
        }
      `}</style>
      {/* Search Bar and File Type Filter */}
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
          classNames={{
            popup: {
              root: "dark:bg-gray-800 dark:text-gray-200"
            }
          }}
        >
          <Option value="pdf">PDF</Option>
          <Option value="docx">Word</Option>
          <Option value="powerpoint">PowerPoint</Option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-none dark:shadow-sm">
        <Table
          columns={columns}
          dataSource={data?.documents || []}
          loading={isLoading || isPlaceholderData}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: false,
            showTotal: (total) => <span className="text-gray-500 dark:text-gray-400 font-medium">Tổng {total} tài liệu</span>,
            onChange: handleTableChange,
          }}
          bordered={false}
          className="[&_.ant-pagination]:px-6 [&_.ant-pagination]:pb-4"
          rowClassName="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer border-b border-gray-100 dark:border-gray-800"
          size="middle"
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
