"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Empty, message } from "antd";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUserId } from "@/app/hooks/useUserId";
import { useDocumentsQuery } from "@/app/hooks/queries";
import { useDebounce } from "@/app/hooks/useDebounce";
import FeaturesHeader from "@/app/components/features/FeaturesHeader";
import DocumentCard from "@/app/components/documents/DocumentCard";
import DarkPagination from "@/app/components/common/DarkPagination";
import CustomInput from "@/app/components/common/CustomInput";
import DocumentFeatureSkeleton from "@/app/components/features/documents/DocumentFeatureSkeleton";

const PAGE_SIZE = 20;

export default function PublicDocumentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Context / Auth
    const { userId, loading: authLoading } = useUserId();

    // Redirect if not authenticated
    if (!authLoading && !userId) {
        router.push("/auth");
        message.info("Vui lòng đăng nhập để xem tài liệu");
    }

    // Initialize from URL
    const initialPage = Number(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") || "";

    const [searchText, setSearchText] = useState(initialSearch);
    const debouncedSearchQuery = useDebounce(searchText, 500);
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Sync state changes to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        let changed = false;

        if (currentPage > 1) {
            if (params.get("page") !== String(currentPage)) { params.set("page", String(currentPage)); changed = true; }
        } else if (params.has("page")) { params.delete("page"); changed = true; }

        if (debouncedSearchQuery) {
            if (params.get("search") !== debouncedSearchQuery) { params.set("search", debouncedSearchQuery); changed = true; }
        } else if (params.has("search")) { params.delete("search"); changed = true; }

        if (changed) {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    }, [currentPage, debouncedSearchQuery, pathname, router, searchParams]);

    // Reset pagination to page 1 if search query changes
    const prevSearchRef = useRef(debouncedSearchQuery);
    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearchQuery) {
            setCurrentPage(1);
            prevSearchRef.current = debouncedSearchQuery;
        }
    }, [debouncedSearchQuery]);

    // React Query
    const { data, isLoading } = useDocumentsQuery({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearchQuery,
        enabled: !!userId,
    });

    const documents = data?.data ?? [];
    const total = data?.total ?? 0;

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

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

                {isLoading ? (
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
