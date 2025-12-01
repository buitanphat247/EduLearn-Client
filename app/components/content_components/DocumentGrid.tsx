import CardDocument from "../card_components/Card_document";

export interface DocumentItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  updateDate: string;
  author: string;
  downloads: number;
  type: "word" | "checked" | "pdf";
  viewerUrl: string;
}

interface DocumentGridProps {
  documents: DocumentItem[];
  onPreview: (doc: DocumentItem) => void;
}

export default function DocumentGrid({ documents, onPreview }: DocumentGridProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
            onPreview={() => onPreview(doc)}
          />
        ))}
      </div>
    </div>
  );
}

