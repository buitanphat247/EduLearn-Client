"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
    Empty,
    message,
    Skeleton
} from "antd";
import { getDocuments, DocumentResponse } from "@/lib/api/documents";
import { useTheme } from "@/app/context/ThemeContext";
import { useUserId } from "@/app/hooks/useUserId";
import { useRouter } from "next/navigation";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";
import DocumentCard from "@/app/components/documents/DocumentCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import { useDebounce } from "@/app/hooks/useDebounce";
import DocumentFeatureSkeleton from "@/app/components/features/documents/DocumentFeatureSkeleton";

const PAGE_SIZE = 20;

export default function PublicDocumentsPage() {
    const { theme } = useTheme();
    const { userId, loading: authLoading } = useUserId();
    const router = useRouter();

    const [documents, setDocuments] = useState<DocumentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const debouncedSearchQuery = useDebounce(searchText, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);

    const isFetching = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    useEffect(() => {
        if (!authLoading && !userId) {
            router.push("/auth");
            message.info("Vui lòng đăng nhập để xem tài liệu");
        }
    }, [userId, authLoading, router]);

    const fetchDocuments = useCallback(async (page: number = 1) => {
        if (isFetching.current) return;
        isFetching.current = true;
        setLoading(true);

        try {
            const result = await getDocuments({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearchQuery || undefined,
            });

            if (!isMountedRef.current) return;

            setDocuments(result.data);
            setTotal(result.total);
            setCurrentPage(result.page);
        } catch (error: any) {
            if (!isMountedRef.current) return;
            console.error("Error fetching documents:", error);
            message.error(error?.message || "Không thể tải danh sách tài liệu");
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                isFetching.current = false;
            }
        }
    }, [debouncedSearchQuery, message]);

    useEffect(() => {
        fetchDocuments(1);
    }, [fetchDocuments]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
        fetchDocuments(page);
    }, [fetchDocuments]);

    if (authLoading) {
        return (
            <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
                <div className="mx-auto container px-4 py-8">
                    <FeaturesHeader
                        title="Thư viện tài liệu"
                        description="Khám phá và tải về những tài liệu học tập hữu ích dành cho bạn."
                    />
                    <div className="max-w-4xl mx-auto mb-12">
                        <div className="w-full h-10 bg-white dark:bg-slate-800 rounded-lg animate-pulse"></div>
                    </div>
                    <DocumentFeatureSkeleton />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300">
            <div className="mx-auto container px-4 py-8">
                <FeaturesHeader
                    title="Thư viện tài liệu"
                    description="Khám phá và tải về những tài liệu học tập hữu ích dành cho bạn."
                />

                {/* Search Bar */}
                <div className="max-w-4xl mx-auto mb-12">
                    <CustomInput
                        placeholder="Tìm kiếm tài liệu học tập..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        wrapperClassName="w-full"
                    />
                </div>

                {loading ? (
                    <DocumentFeatureSkeleton />
                ) : documents.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                            {documents.map((doc) => (
                                <DocumentCard key={doc.document_id} document={doc} />
                            ))}
                        </div>

                        {total > PAGE_SIZE && (
                            <DarkPagination
                                current={currentPage}
                                total={total}
                                pageSize={PAGE_SIZE}
                                onChange={handlePageChange}
                                showTotal={(total, range) => (
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {range[0]}-{range[1]} của {total} tài liệu
                                    </span>
                                )}
                            />
                        )}
                    </>
                ) : (
                    <div className="py-20 bg-white/50 dark:bg-[#1e293b]/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed transition-colors duration-300">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span className="text-slate-500 dark:text-slate-400 text-lg">
                                    {debouncedSearchQuery
                                        ? "Không tìm thấy tài liệu nào phù hợp"
                                        : "Chưa có tài liệu nào trong thư viện"}
                                </span>
                            }
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
