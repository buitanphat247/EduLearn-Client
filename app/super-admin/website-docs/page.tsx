"use client";

import { Table, Tag, Button, App, Space, Input, Select, Popconfirm, Modal, Form, Upload } from "antd";
import { SearchOutlined, EyeOutlined, DownloadOutlined, BookOutlined, FileTextOutlined, DeleteOutlined, PlusOutlined, QuestionCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { getDocuments, deleteDocument, createDocument, type DocumentResponse } from "@/lib/api/documents";
import DocumentPreviewModal from "@/app/components/documents/DocumentPreviewModal";
import { useDocumentPreview } from "@/app/components/documents/useDocumentPreview";
import { useUserId } from "@/app/hooks/useUserId";

const { Option } = Select;
const { Dragger } = Upload;

interface DocumentTableType {
    key: string;
    id: string;
    title: string;
    fileUrl: string;
    downloadCount: number;
    status: string;
    createdAt: string;
    uploaderName: string;
    uploaderEmail: string;
}

export default function WebsiteDocumentationPage() {
    const { userId } = useUserId();
    const { message } = App.useApp();
    const { previewDoc, openPreview, closePreview, handleAfterClose, isOpen } = useDocumentPreview();
    const [searchQuery, setSearchQuery] = useState("");
    const [documents, setDocuments] = useState<DocumentTableType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const isFetching = useRef(false);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchDocuments = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
        if (isFetching.current) return;

        isFetching.current = true;
        setLoading(true);

        try {
            const result = await getDocuments({ page, limit, search });

            const formattedData: DocumentTableType[] = result.data.map((doc: DocumentResponse) => ({
                key: doc.document_id,
                id: doc.document_id,
                title: doc.title,
                fileUrl: doc.file_url,
                downloadCount: doc.download_count || 0,
                status: doc.status || "approved",
                createdAt: doc.created_at,
                uploaderName: doc.uploader?.fullname || doc.uploader?.username || "Ẩn danh",
                uploaderEmail: doc.uploader?.email || "",
            }));

            setDocuments(formattedData);
            setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: limit,
                total: result.total,
            }));
        } catch (error: any) {
            message.error(error?.message || "Không thể tải danh sách tài liệu trang web");
            setDocuments([]);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [message]);

    useEffect(() => {
        fetchDocuments(1, 20);
    }, []);

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        searchDebounceRef.current = setTimeout(() => {
            fetchDocuments(1, pagination.pageSize, searchQuery.trim() || undefined);
        }, 500);

        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [searchQuery, pagination.pageSize, fetchDocuments]);

    const handleTableChange = (page: number, pageSize: number) => {
        fetchDocuments(page, pageSize, searchQuery.trim() || undefined);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDocument(id);
            message.success("Xóa tài liệu thành công");
            fetchDocuments(pagination.current, pagination.pageSize, searchQuery.trim() || undefined);
        } catch (error: any) {
            message.error(error?.message || "Không thể xóa tài liệu");
        }
    };

    const handleUpload = async (values: any) => {
        if (!userId) {
            message.error("Không tìm thấy thông tin người dùng");
            return;
        }

        if (fileList.length === 0) {
            message.error("Vui lòng chọn file để tải lên");
            return;
        }

        setUploadLoading(true);
        try {
            const originalFile = fileList[0];
            const extension = originalFile.name.split('.').pop() || '';

            // Format: YYYYMMDD_HHmmss_SSS
            const now = new Date();
            const timestamp = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') + "_" +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0') +
                now.getSeconds().toString().padStart(2, '0') + "_" +
                now.getMilliseconds().toString().padStart(3, '0');

            const newFileName = `${timestamp}.${extension}`;

            // Create a new file object with the new name
            const renamedFile = new File([originalFile], newFileName, {
                type: originalFile.type,
            });

            await createDocument({
                title: values.title,
                file: renamedFile,
                uploaded_by: Number(userId),
                status: "approved",
            });
            message.success("Tải lên tài liệu thành công");
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
            fetchDocuments(1, pagination.pageSize, searchQuery.trim() || undefined);
        } catch (error: any) {
            message.error(error?.message || "Không thể tải lên tài liệu");
        } finally {
            setUploadLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const columns: ColumnsType<DocumentTableType> = [
        {
            title: "STT",
            key: "stt",
            width: 70,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên tài liệu",
            dataIndex: "title",
            key: "title",
            render: (title: string) => (
                <Space>
                    <FileTextOutlined className="text-blue-500" />
                    <span className="font-semibold text-gray-800">{title}</span>
                </Space>
            ),
        },
        {
            title: "Người đăng",
            key: "uploader",
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-700">{record.uploaderName}</div>
                    <div className="text-xs text-gray-400">{record.uploaderEmail}</div>
                </div>
            ),
        },
        {
            title: "Lượt tải",
            dataIndex: "downloadCount",
            key: "downloadCount",
            align: "center",
            render: (count: number) => <Tag color="blue">{count}</Tag>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => <span className="text-gray-600 text-sm">{formatDate(date)}</span>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "approved" ? "success" : "warning"}>
                    {status === "approved" ? "Hoạt động" : "Bản nháp"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 250,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => openPreview({ title: record.title, fileUrl: record.fileUrl })}
                    >
                        Xem
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        type="primary"
                        ghost
                        onClick={async () => {
                            try {
                                const response = await fetch(record.fileUrl);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = record.title;
                                a.click();
                                message.success("Bắt đầu tải xuống...");
                            } catch (err) {
                                message.error("Không thể tải xuống tài liệu");
                            }
                        }}
                    >
                        Tải
                    </Button>
                    <Popconfirm
                        title="Xóa tài liệu"
                        description="Bạn có chắc chắn muốn xóa tài liệu này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm theo tiêu đề tài liệu..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    size="large"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    className="flex-1"
                />
                <Select defaultValue="all" size="large" style={{ width: 150 }}>
                    <Option value="all">Tất cả</Option>
                    <Option value="active">Hoạt động</Option>
                    <Option value="draft">Bản nháp</Option>
                </Select>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Thêm tài liệu mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={documents}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng cộng ${total} tài liệu`,
                    size: "small",
                    onChange: handleTableChange,
                }}
                className="news-table"
                rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
                size="small"
            />

            <Modal
                title={null}
                open={isModalOpen}
                maskClosable={!uploadLoading}
                closable={!uploadLoading}
                onCancel={() => {
                    if (uploadLoading) return;
                    setIsModalOpen(false);
                    form.resetFields();
                    setFileList([]);
                }}
                footer={null}
                width={600}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpload}
                    requiredMark="optional"
                >
                    <Form.Item
                        name="title"
                        label={<span className="font-semibold">Tiêu đề tài liệu</span>}
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề tài liệu" }]}
                    >
                        <Input
                            placeholder="Nhập tiêu đề cho tài liệu..."
                            size="large"
                            disabled={uploadLoading}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-semibold">Tải lên file</span>}
                        extra="Hỗ trợ các định dạng: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar. Tối đa 50MB."
                    >
                        {fileList.length === 0 ? (
                            <Dragger
                                fileList={fileList}
                                onRemove={() => setFileList([])}
                                beforeUpload={(file) => {
                                    setFileList([file]);
                                    return false; // Không tự động tải lên
                                }}
                                maxCount={1}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                                disabled={uploadLoading}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined className="text-blue-500" />
                                </p>
                                <p className="ant-upload-text">Nhấp hoặc kéo file vào đây để tải lên</p>
                                <p className="ant-upload-hint text-xs">
                                    Chỉ chấp nhận 1 file duy nhất cho mỗi lần tải lên.
                                </p>
                            </Dragger>
                        ) : (
                            <div className="border border-blue-100 bg-blue-50/30 p-4 rounded-xl flex items-center justify-between group transition-all hover:border-blue-200 hover:shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-3 bg-white rounded-lg shadow-sm border border-blue-50 flex items-center justify-center">
                                        <FileTextOutlined className="text-blue-500 text-2xl" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-gray-800 truncate text-base" title={fileList[0].name}>
                                            {fileList[0].name}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium">
                                            {(fileList[0].size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng tải lên
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined className="text-lg" />}
                                    onClick={() => setFileList([])}
                                    disabled={uploadLoading}
                                    className="opacity-50 group-hover:opacity-100 hover:bg-red-50 p-2 h-auto flex items-center justify-center disabled:opacity-30"
                                />
                            </div>
                        )}
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-8">
                        <Button
                            onClick={() => {
                                setIsModalOpen(false);
                                form.resetFields();
                                setFileList([]);
                            }}
                            size="large"
                            disabled={uploadLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={uploadLoading}
                            size="large"
                            icon={<PlusOutlined />}
                        >
                            Thêm tài liệu
                        </Button>
                    </div>
                </Form>
            </Modal>

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
