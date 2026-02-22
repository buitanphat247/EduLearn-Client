"use client";

import { Table, Tag, Button, App, Space, Input, Breadcrumb, Avatar, Tooltip, Popconfirm, Modal, Select } from "antd";
import { SearchOutlined, ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SoundOutlined, TranslationOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import Papa from "papaparse";
import { getVocabulariesByFolder, getFolderDetail, bulkCreateVocabulary, getVocabularyGroups, type VocabularyResponse, type FolderResponse, type VocabularyGroupItem } from "@/lib/api/vocabulary";

interface VocabularyTableType extends VocabularyResponse {
    key: number;
}

interface ImportVocabularyType {
    content: string;
    pronunciation: string;
    pos: string;
    translation: string;
    audioUrl?: string;
}

export default function VocabularyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const folderId = Number(params.folderId);
    const { message } = App.useApp();

    const [vocabularies, setVocabularies] = useState<VocabularyTableType[]>([]);
    const [folder, setFolder] = useState<FolderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Import state
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importData, setImportData] = useState<ImportVocabularyType[]>([]);
    const [fileInfo, setFileInfo] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const [groups, setGroups] = useState<VocabularyGroupItem[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

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

    const handleBulkImport = async () => {
        if (!folderId || importData.length === 0) return;

        setImporting(true);
        try {
            await bulkCreateVocabulary(folderId, selectedGroupId, importData);
            message.success(`Đã import thành công ${importData.length} từ vựng`);
            setIsImportModalOpen(false);
            setImportData([]);
            setFileInfo(null);
            setSelectedGroupId(null);
            fetchDetail(); // Refresh list
        } catch (error: any) {
            message.error(error?.message || "Lỗi khi import dữ liệu");
        } finally {
            setImporting(false);
        }
    };

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const [folderData, vocabData] = await Promise.all([
                getFolderDetail(folderId),
                getVocabulariesByFolder(folderId)
            ]);

            setFolder(folderData);
            setVocabularies(vocabData.map(v => ({ ...v, key: v.sourceWordId })));
            setPagination(prev => ({ ...prev, total: vocabData.length }));
        } catch (error: any) {
            message.error(error?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [folderId, message]);

    useEffect(() => {
        if (folderId) fetchDetail();
    }, [folderId, fetchDetail]);

    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        getVocabularyGroups().then((data) => {
            if (isMountedRef.current) setGroups(data);
        });
        return () => { isMountedRef.current = false; };
    }, []);

    const filteredVocab = useMemo(() => {
        if (!searchQuery.trim()) return vocabularies;
        const query = searchQuery.toLowerCase().trim();
        return vocabularies.filter(v =>
            v.content?.toLowerCase().includes(query) ||
            v.translation?.toLowerCase().includes(query)
        );
    }, [vocabularies, searchQuery]);

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch(e => message.error("Không thể phát âm thanh"));
    };

    const columns: ColumnsType<VocabularyTableType> = [
        {
            title: "STT",
            key: "stt",
            width: 60,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Từ vựng",
            dataIndex: "content",
            key: "content",
            width: 280,
            render: (text, record) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="overflow-hidden">
                        <div className="font-bold text-gray-900 text-sm truncate">{text}</div>
                        <div className="text-blue-500 text-[11px] font-semibold mt-0.5 bg-blue-50 px-2 py-0.25 rounded-md inline-block">
                            {record.pronunciation}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Nghĩa / Loại từ",
            key: "translation_pos",
            render: (_, record) => (
                <div className="py-1">
                    <div className="font-semibold text-gray-800 text-sm">{record.translation}</div>
                    <Tag color="gold" className="mt-1 rounded border-0 bg-amber-50 text-amber-600 font-bold uppercase text-[9px]">
                        {record.pos}
                    </Tag>
                </div>
            )
        },
        {
            title: "Phát âm",
            key: "audio",
            align: "center",
            width: 80,
            render: (_, record) => (
                <Space>
                    {record.audioUrl && record.audioUrl.length > 0 ? (
                        <Button
                            icon={<SoundOutlined />}
                            size="small"
                            shape="circle"
                            onClick={() => playAudio(record.audioUrl[0].url)}
                        />
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                </Space>
            )
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            align: "right",
            render: () => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa từ vựng"
                        description="Bạn có chắc muốn xóa từ này?"
                        onConfirm={() => { }}
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
            )
        }
    ];

    return (
        <div className="space-y-4">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push("/super-admin/vocabulary")}
                        type="text"
                        className="hover:bg-gray-100 rounded-lg h-9 w-9 flex items-center justify-center p-0 text-gray-500"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-bold text-gray-900 m-0 uppercase line-clamp-1">
                                {folder?.folderName || "Đang tải..."}
                            </h1>
                            <Tag color="purple" className="m-0 rounded border-0 bg-purple-50 text-purple-600 font-bold text-[10px]">
                                {(folder as any)?.scope === "system" ? "HỆ THỐNG" : "NGƯỜI DÙNG"}
                            </Tag>
                        </div>
                        <Breadcrumb
                            className="text-[11px] font-medium mt-0.5"
                            items={[
                                { title: "Quản lý từ vựng", href: "#", onClick: (e) => { e.preventDefault(); router.push("/super-admin/vocabulary"); } },
                                { title: folder?.folderName || "..." }
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Tìm kiếm từ vựng..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        size="middle"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        className="w-64 rounded-lg bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsImportModalOpen(true)}
                        className="rounded-lg shadow-sm border-0 px-4 h-9 font-semibold"
                    >
                        Thêm từ vựng
                    </Button>
                </div>
            </div>

            {/* Import Modal */}
            <Modal
                title={null}
                open={isImportModalOpen}
                maskClosable={!importing}
                closable={!importing}
                onCancel={() => {
                    if (importing) return;
                    setIsImportModalOpen(false);
                    setImportData([]);
                    setFileInfo(null);
                    setSelectedGroupId(null);
                }}
                footer={null}
                width={1000}
                centered
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold m-0 flex items-center gap-2">
                            <PlusOutlined className="text-blue-500" />
                            Import từ vựng từ CSV
                        </h2>
                        <Button
                            type="primary"
                            disabled={importData.length === 0 || !selectedGroupId}
                            loading={importing}
                            onClick={handleBulkImport}
                            icon={<PlusOutlined />}
                        >
                            Import {importData.length} từ vựng
                        </Button>
                    </div>

                    {!fileInfo ? (
                        <div
                            className={`border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center transition-all group ${importing ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'}`}
                            onClick={() => {
                                if (importing) return;
                                document.getElementById("csv-upload")?.click();
                            }}
                        >
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <div className="bg-blue-50 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <PlusOutlined className="text-2xl" />
                            </div>
                            <h3 className="text-base font-bold text-gray-800 mb-1">Chọn file CSV để tải lên</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                Tải lên file CSV chứa danh sách từ vựng theo mẫu đã quy định (ETS 2023).
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Chọn nhóm từ vựng (Bắt buộc)</div>
                                    <Select
                                        placeholder="Chọn Vocabulary Group..."
                                        className="w-full"
                                        size="large"
                                        options={groups.map(g => ({ label: g.groupName, value: g.vocabularyGroupId }))}
                                        value={selectedGroupId}
                                        onChange={setSelectedGroupId}
                                        disabled={importing}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Thông tin File</div>
                                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded shadow-xs">
                                                <PlusOutlined className="text-blue-500 text-xs" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{fileInfo.name}</div>
                                                <div className="text-[10px] text-gray-500">{importData.length} từ</div>
                                            </div>
                                        </div>
                                        <Button
                                            size="small"
                                            type="text"
                                            danger
                                            className="text-[10px]"
                                            disabled={importing}
                                            onClick={() => {
                                                setFileInfo(null);
                                                setImportData([]);
                                            }}
                                        >
                                            Thay đổi
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Table
                                columns={[
                                    { title: "Từ vựng", dataIndex: "content", key: "content", width: 150, className: "font-bold text-gray-800" },
                                    { title: "Phiên âm", dataIndex: "pronunciation", key: "pronunciation", width: 120 },
                                    { title: "Loại từ", dataIndex: "pos", key: "pos", width: 100, render: (t) => <Tag color="gold" className="text-[10px] uppercase font-bold m-0">{t}</Tag> },
                                    { title: "Bản dịch", dataIndex: "translation", key: "translation", ellipsis: true },
                                    {
                                        title: "Audio",
                                        dataIndex: "audioUrl",
                                        key: "audioUrl",
                                        width: 100,
                                        render: (url) => url ? <Tag color="success">Có sẳn</Tag> : <Tag color="warning">Tự tạo (AI)</Tag>
                                    },
                                ]}
                                dataSource={importData.map((item, id) => ({ ...item, key: id }))}
                                size="small"
                                pagination={{
                                    pageSize: 50,
                                    size: "small",
                                    showTotal: (total) => `Tổng cộng ${total} từ`,
                                }}
                                scroll={{ y: 400 }}
                                className="news-table border border-gray-100 rounded-xl overflow-hidden"
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Table Section */}
            <Table
                columns={columns}
                dataSource={filteredVocab}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredVocab.length,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng cộng ${total} từ vựng`,
                    size: "small",
                    onChange: (page) => setPagination(prev => ({ ...prev, current: page }))
                }}
                className="news-table"
                rowClassName="group hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer border-b border-gray-100"
                size="small"
            />
        </div>
    );
}
