"use client";

import { useState } from "react";
import DocumentPreviewModal from "@/app/components/modal_components/DocumentPreviewModal";
import ContentSidebar from "@/app/components/content_components/ContentSidebar";
import ContentHeader from "@/app/components/content_components/ContentHeader";
import DocumentGrid, { type DocumentItem } from "@/app/components/content_components/DocumentGrid";

const buildOfficeViewer = (url: string) => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

const viewerSources = {
  pdf: buildOfficeViewer("https://files.catbox.moe/ewg30t.pdf"),
  pptx: buildOfficeViewer("https://files.catbox.moe/rl2dde.pptx"),
  xls: buildOfficeViewer("https://files.catbox.moe/qdxjea.xls"),
  doc: buildOfficeViewer("https://files.catbox.moe/ewg30t.pdf"),
};

const documents: DocumentItem[] = [
  {
    id: "1",
    title: "ÔN TẬP GĐDP 9.docx",
    grade: "Khối 9",
    subject: "Khác",
    updateDate: "13/11/2025 01:49",
    author: "Ngân Phan",
    downloads: 0,
    type: "pdf",
    viewerUrl: viewerSources.pdf,
  },
  {
    id: "2",
    title: "BÀI 1 -3 (Sử 12)_1.docx",
    grade: "Khối 12",
    subject: "Lịch sử",
    updateDate: "12/11/2025 14:25",
    author: "Trần Thị B",
    downloads: 0,
    type: "word",
    viewerUrl: viewerSources.pptx,
  },
  {
    id: "3",
    title: "TOÁN THỰC TẾ LƯỢNG GIÁC",
    grade: "Khối 11",
    subject: "Toán học",
    updateDate: "11/11/2025 14:20",
    author: "Lê Văn C",
    downloads: 0,
    type: "checked",
    viewerUrl: viewerSources.xls,
  },
  {
    id: "4",
    title: "BÀI TẬP VẬT LÝ 10.docx",
    grade: "Khối 10",
    subject: "Vật lý",
    updateDate: "10/11/2025 14:15",
    author: "Phạm Thị D",
    downloads: 0,
    type: "word",
    viewerUrl: viewerSources.pdf,
  },
  {
    id: "5",
    title: "ĐỀ KIỂM TRA HÓA HỌC",
    grade: "Khối 12",
    subject: "Hóa học",
    updateDate: "09/11/2025 14:10",
    author: "Hoàng Văn E",
    downloads: 0,
    type: "checked",
    viewerUrl: viewerSources.pptx,
  },
  {
    id: "6",
    title: "TÀI LIỆU SINH HỌC 11.docx",
    grade: "Khối 11",
    subject: "Sinh học",
    updateDate: "08/11/2025 14:05",
    author: "Vũ Thị F",
    downloads: 0,
    type: "word",
    viewerUrl: viewerSources.xls,
  },
  // Test documents với link thực tế
  {
    id: "test-1",
    title: "Tài liệu Word Test",
    grade: "Khối 10",
    subject: "Toán học",
    updateDate: "29/10/2025 10:00",
    author: "Test Author",
    downloads: 0,
    type: "word",
    viewerUrl: buildOfficeViewer(
      "https://storage.googleapis.com/liveazotastoragept032025/document_bank/m10_2025/d29/106743489/ef1fe34e986cd85c8f614aea209d7d48.docx"
    ),
  },
  {
    id: "test-2",
    title: "Tài liệu PDF Test",
    grade: "Khối 10",
    subject: "Vật lý",
    updateDate: "25/10/2025 10:00",
    author: "Test Author",
    downloads: 0,
    type: "pdf",
    viewerUrl: buildOfficeViewer(
      "https://storage.googleapis.com/liveazotastoragept032025/document_bank/m10_2025/d25/133224885/a3a240043e5db885c3b5fb142b6e35ce.pdf"
    ),
  },
  {
    id: "test-3",
    title: "Tài liệu PowerPoint Test",
    grade: "Khối 11",
    subject: "Hóa học",
    updateDate: "12/03/2025 10:00",
    author: "Test Author",
    downloads: 0,
    type: "word",
    viewerUrl: buildOfficeViewer(
      "https://storage.googleapis.com/liveazotastoragept012025/document_bank/m03_2025/d12/14405157/4eceb70be23d8511fe6de04b8b4f858b.pptx"
    ),
  },
];

export default function AdminContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  return (
    <div className="flex h-full bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 border border-gray-200 rounded-xl overflow-hidden">
      <ContentSidebar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ContentHeader title="Tài liệu mới nhất" activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <DocumentGrid documents={documents} onPreview={setPreviewDoc} />
      </div>

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        title={previewDoc?.title || ""}
        viewerUrl={previewDoc?.viewerUrl || ""}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}
