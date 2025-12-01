"use client";

import { useState, useEffect } from "react";
import CardDocument from "@/app/components/card_components/Card_document";
import DocumentPreviewModal from "@/app/components/modal_components/DocumentPreviewModal";
import DocumentSearchModal, { DocumentItem } from "@/app/components/modal_components/DocumentSearchModal";
import DocumentsHeader from "@/app/components/documents_components/DocumentsHeader";
import CustomCard from "@/app/components/ui_components/CustomCard";

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
    title: "Tài liệu ôn thi Toán 9",
    grade: "Khối 9",
    subject: "Toán học",
    updateDate: "15/01/2024",
    author: "Nguyễn Văn A",
    downloads: 125,
    type: "pdf",
    viewerUrl: viewerSources.pdf,
  },
  {
    id: "2",
    title: "Bài tập Văn học kỳ 1",
    grade: "Khối 9",
    subject: "Ngữ văn",
    updateDate: "14/01/2024",
    author: "Trần Thị B",
    downloads: 89,
    type: "word",
    viewerUrl: viewerSources.doc,
  },
  {
    id: "3",
    title: "Đề cương Vật lý",
    grade: "Khối 9",
    subject: "Vật lý",
    updateDate: "13/01/2024",
    author: "Lê Văn C",
    downloads: 156,
    type: "pdf",
    viewerUrl: viewerSources.pdf,
  },
  {
    id: "4",
    title: "Tổng hợp công thức Hóa học",
    grade: "Khối 9",
    subject: "Hóa học",
    updateDate: "12/01/2024",
    author: "Phạm Thị D",
    downloads: 203,
    type: "word",
    viewerUrl: viewerSources.doc,
  },
  // Test documents với link thực tế
  {
    id: "test-1",
    title: "Tài liệu Word Test",
    grade: "Khối 10",
    subject: "Toán học",
    updateDate: "29/10/2025",
    author: "Test Author",
    downloads: 0,
    type: "word",
    viewerUrl: buildOfficeViewer("https://storage.googleapis.com/liveazotastoragept032025/document_bank/m10_2025/d29/106743489/ef1fe34e986cd85c8f614aea209d7d48.docx"),
  },
  {
    id: "test-2",
    title: "Tài liệu PDF Test",
    grade: "Khối 10",
    subject: "Vật lý",
    updateDate: "25/10/2025",
    author: "Test Author",
    downloads: 0,
    type: "pdf",
    viewerUrl: buildOfficeViewer("https://storage.googleapis.com/liveazotastoragept032025/document_bank/m10_2025/d25/133224885/a3a240043e5db885c3b5fb142b6e35ce.pdf"),
  },
  {
    id: "test-3",
    title: "Tài liệu PowerPoint Test",
    grade: "Khối 11",
    subject: "Hóa học",
    updateDate: "12/03/2025",
    author: "Test Author",
    downloads: 0,
    type: "word",
    viewerUrl: buildOfficeViewer("https://storage.googleapis.com/liveazotastoragept012025/document_bank/m03_2025/d12/14405157/4eceb70be23d8511fe6de04b8b4f858b.pptx"),
  },
];

export default function UserDocuments() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Keyboard shortcut for search modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (event.key === "Escape" && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen]);

  const handleDocumentClick = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DocumentsHeader onSearchClick={() => setIsSearchModalOpen(true)} />

      {/* Results Count */}
      {documents.length > 0 && (
        <div className="text-sm text-gray-600">
          Tổng cộng <span className="font-semibold text-blue-600">{documents.length}</span> tài liệu
        </div>
      )}

      {/* Document Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {documents.map((doc) => (
            <CardDocument
              key={doc.id}
              title={doc.title}
              grade={doc.grade}
              subject={doc.subject}
              updateDate={doc.updateDate}
              author={doc.author}
              downloads={doc.downloads}
              type={doc.type}
              onPreview={() => setPreviewDoc(doc)}
            />
          ))}
        </div>
      ) : (
        <CustomCard padding="lg" className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📄</div>
          <p className="text-gray-600 font-medium">Không có tài liệu nào</p>
        </CustomCard>
      )}

      {/* Search Modal */}
      <DocumentSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        documents={documents}
        onDocumentClick={handleDocumentClick}
      />

      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        title={previewDoc?.title || ""}
        viewerUrl={previewDoc?.viewerUrl || ""}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}

