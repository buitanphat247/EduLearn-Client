"use client";

import { Table, Tag, Button, App, Space, Input, Popconfirm, Modal, Form, Select, Typography, Card } from "antd";
import { SearchOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, QuestionCircleOutlined, FolderOutlined, EditOutlined, CrownOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import Papa from "papaparse";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { getFolders, createFolder, updateFolder, deleteFolder, bulkCreateVocabulary, getVocabularyGroups, type FolderResponse, type VocabularyGroupItem } from "@/lib/api/vocabulary";
import { useDebounce } from "@/app/hooks/useDebounce";

const { Option } = Select;
const { Title, Text } = Typography;

interface FolderTableType {
    key: number;
    folderId: number;
    folderName: string;
    total_count: number;
    scope: string;
    access_level: string;
}

interface ImportVocabularyType {
    content: string;
    pronunciation: string;
    pos: string;
    translation: string;
    audioUrl?: string;
}

export default function VocabularyManagementPage() {
    const router = useRouter();
    const { message } = App.useApp();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const [scopeFilter, setScopeFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderTableType | null>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
    });

    // Quick create state
    const [isQuickCreateModalOpen, setIsQuickCreateModalOpen] = useState(false);
    const [importData, setImportData] = useState<ImportVocabularyType[]>([]);
    const [fileInfo, setFileInfo] = useState<File | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [quickCreateFolderName, setQuickCreateFolderName] = useState("");

    const { data: vocabGroups = [] } = useQuery({
        queryKey: ['admin_vocabulary_groups'],
        queryFn: getVocabularyGroups,
        staleTime: 5 * 60 * 1000,
    });

    const { data: folderData, isLoading, isFetching } = useQuery({
        queryKey: ['admin_vocabulary_folders', pagination.current, pagination.pageSize, debouncedSearchQuery],
        queryFn: async () => {
            const result = await getFolders({
                page: pagination.current,
                limit: pagination.pageSize,
                search: debouncedSearchQuery.trim() || undefined
            });

            const formattedData: FolderTableType[] = result.data.map((folder: FolderResponse) => ({
                key: folder.folderId,
                folderId: folder.folderId,
                folderName: folder.folderName,
                total_count: folder.total_count || 0,
                scope: (folder as any).scope || "system",
                access_level: (folder as any).access_level || "free",
            }));

            return {
                folders: formattedData,
                total: result.total,
            };
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });

    const safeFolders = folderData?.folders || [];
    const filteredFolders = useMemo(() => {
        return scopeFilter === "all" ? safeFolders : safeFolders.filter(f => f.scope === scopeFilter);
    }, [safeFolders, scopeFilter]);

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return deleteFolder(id);
        },
        onSuccess: () => {
            message.success("Xóa thư mục thành công");
            queryClient.invalidateQueries({ queryKey: ['admin_vocabulary_folders'] });
        },
        onError: (error: any) => {
            message.error(error?.message || "Không thể xóa thư mục");
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (values: { folderName: string; access_level: string }) => {
            if (editingFolder) {
                return updateFolder(editingFolder.folderId, values.folderName, values.access_level);
            } else {
                return createFolder(values.folderName, values.access_level);
            }
        },
        onSuccess: () => {
            message.success(editingFolder ? "Cập nhật thư mục thành công" : "Tạo thư mục mới thành công");
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin_vocabulary_folders'] });
        },
        onError: (error: any) => {
            message.error(error?.message || "Đã có lỗi xảy ra");
        }
    });

    const quickCreateMutation = useMutation({
        mutationFn: async () => {
            const folder = await createFolder(quickCreateFolderName, 'free');
            await bulkCreateVocabulary(folder.folderId, selectedGroupId, importData);
            return importData.length;
        },
        onSuccess: (count) => {
            message.success(`Tạo thư mục và import thành công ${count} từ vựng`);
            setIsQuickCreateModalOpen(false);
            setQuickCreateFolderName("");
            setImportData([]);
            setFileInfo(null);
            setSelectedGroupId(null);
            queryClient.invalidateQueries({ queryKey: ['admin_vocabulary_folders'] });
        },
        onError: (error: any) => {
            message.error(error?.message || "Đã có lỗi xảy ra trong quá trình tạo nhanh");
        }
    });

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleOpenModal = (folder?: FolderTableType) => {
        if (folder) {
            setEditingFolder(folder);
            form.setFieldsValue({
                folderName: folder.folderName,
                access_level: folder.access_level
            });
        } else {
            setEditingFolder(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (values: { folderName: string; access_level: string }) => {
        saveMutation.mutate(values);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileInfo(file);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const mappedData: ImportVocabularyType[] = results.data.map((row: any) => ({
                    content: row["content"] || row["Word"] || "",
                    pronunciation: (row["pronunciation"] || "").replace(/\//g, ""),
                    pos: row["pos"] || row["meaning"] || "",
                    translation: row["translation"] || row["vi"] || "",
                    audioUrl: row["Audio URL"] || "",
                })).filter(item => item.content);

                setImportData(mappedData);
                if (mappedData.length === 0) {
                    message.warning("Không tìm thấy dữ liệu hợp lệ trong file");
                }
            },
            error: (err) => {
                message.error("Lỗi khi đọc file CSV: " + err.message);
            }
        });
    };

    const handleQuickCreate = () => {
        if (!quickCreateFolderName.trim()) {
            message.warning("Vui lòng nhập tên thư mục");
            return;
        }
        if (importData.length === 0) {
            message.warning("Vui lòng tải lên file CSV chứa từ vựng");
            return;
        }
        quickCreateMutation.mutate();
    };


    const columns: ColumnsType<FolderTableType> = [
        {
            title: "STT",
            key: "stt",
            width: 70,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên thư mục",
            dataIndex: "folderName",
            key: "folderName",
            render: (name: string) => (
                <Space>
                    <FolderOutlined className="text-amber-500" />
                    <span className="font-semibold text-gray-800">{name}</span>
                </Space>
            ),
        },
        {
            title: "Số lượng từ",
            dataIndex: "total_count",
            key: "total_count",
            align: "center",
            render: (count: number) => <Tag color="blue">{count}</Tag>,
        },
        {
            title: "Phạm vi",
            dataIndex: "scope",
            key: "scope",
            render: (scope: string) => (
                <Tag color={scope === "system" ? "purple" : "cyan"}>
                    {scope === "system" ? "Hệ thống" : "Người dùng"}
                </Tag>
            ),
        },
        {
            title: "Quyền truy cập",
            dataIndex: "access_level",
            key: "access_level",
            render: (level: string) => (
                <Tag color={level === "pro" ? "orange" : "default"} icon={level === "pro" ? <CrownOutlined /> : null}>
                    {level === "pro" ? "PRO" : "FREE"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 280,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        type="primary"
                        ghost
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/super-admin/vocabulary/${record.folderId}`);
                        }}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(record);
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa thư mục"
                        description="Bạn có chắc chắn muốn xóa thư mục này?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDelete(record.folderId);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            onClick={(e) => e.stopPropagation()}
                            loading={deleteMutation.isPending && deleteMutation.variables === record.folderId}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                <Input
                    placeholder="Tìm kiếm thư mục..."
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    allowClear
                    style={{ flex: 1 }}
                />
                <Select
                    value={scopeFilter}
                    onChange={(v) => { setScopeFilter(v); setPagination(prev => ({ ...prev, current: 1 })); }}
                    style={{ width: 160 }}
                >
                    <Option value="all">Tất cả phạm vi</Option>
                    <Option value="system">Hệ thống</Option>
                    <Option value="user">Người dùng</Option>
                </Select>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                >
                    Thêm thư mục
                </Button>
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => setIsQuickCreateModalOpen(true)}
                >
                    Tạo nhanh (CSV)
                </Button>
            </div>

            <Table
                rowKey="folderId"
                size="middle"
                columns={columns}
                dataSource={filteredFolders}
                loading={isLoading || isFetching}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: scopeFilter === "all" ? (folderData?.total || 0) : filteredFolders.length,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} thư mục`,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
                onRow={(record) => ({
                    onClick: () => router.push(`/super-admin/vocabulary/${record.folderId}`),
                    style: { cursor: 'pointer' }
                })}
            />

            <Modal
                title={editingFolder ? "Cập nhật thư mục" : "Tạo thư mục mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ access_level: 'free' }}
                >
                    <Form.Item
                        name="folderName"
                        label="Tên thư mục"
                        rules={[{ required: true, message: "Vui lòng nhập tên thư mục" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="access_level"
                        label="Gói áp dụng"
                    >
                        <Select>
                            <Option value="free">FREE (Tất cả người dùng)</Option>
                            <Option value="pro">PRO (Chỉ thành viên trả phí)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
                                {editingFolder ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Tạo nhanh thư mục & Import CSV"
                open={isQuickCreateModalOpen}
                onCancel={() => {
                    if (quickCreateMutation.isPending) return;
                    setIsQuickCreateModalOpen(false);
                }}
                footer={null}
                width={800}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Form layout="vertical">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Form.Item label="Tên thư mục mới" required>
                                <Input
                                    value={quickCreateFolderName}
                                    onChange={(e) => setQuickCreateFolderName(e.target.value)}
                                    disabled={quickCreateMutation.isPending}
                                />
                            </Form.Item>
                            <Form.Item label="Chọn nhóm từ vựng" required>
                                <Select
                                    placeholder="Chọn Vocabulary Group..."
                                    options={vocabGroups.map(g => ({ label: g.groupName, value: g.vocabularyGroupId }))}
                                    value={selectedGroupId}
                                    onChange={setSelectedGroupId}
                                    disabled={quickCreateMutation.isPending}
                                />
                            </Form.Item>
                        </div>
                    </Form>

                    {!fileInfo ? (
                        <div
                            style={{
                                border: '1px dashed #d9d9d9',
                                padding: '40px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                borderRadius: '8px'
                            }}
                            onClick={() => document.getElementById("csv-quick-upload")?.click()}
                        >
                            <input
                                id="csv-quick-upload"
                                type="file"
                                accept=".csv"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                            <div style={{ marginTop: '8px' }}>Nhấn để chọn file CSV</div>
                        </div>
                    ) : (
                        <Card size="small" title={`File: ${fileInfo.name} (${importData.length} từ)`}>
                            <Table
                                columns={[
                                    { title: "Từ vựng", dataIndex: "content", key: "content" },
                                    { title: "Phiên âm", dataIndex: "pronunciation", key: "pronunciation" },
                                    { title: "Loại từ", dataIndex: "pos", key: "pos", render: (t) => <Tag>{t}</Tag> },
                                    { title: "Bản dịch", dataIndex: "translation", key: "translation" },
                                ]}
                                dataSource={importData.slice(0, 5).map((item, id) => ({ ...item, key: id }))}
                                pagination={false}
                                size="small"
                                footer={() => importData.length > 5 ? `...và ${importData.length - 5} từ khác` : null}
                            />
                        </Card>
                    )}

                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsQuickCreateModalOpen(false)} disabled={quickCreateMutation.isPending}>Hủy</Button>
                            <Button
                                type="primary"
                                disabled={importData.length === 0 || !quickCreateFolderName.trim() || !selectedGroupId}
                                loading={quickCreateMutation.isPending}
                                onClick={handleQuickCreate}
                            >
                                Bắt đầu Import
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Modal>
        </div>
    );
}
