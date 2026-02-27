"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, App } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { createEvent } from "@/lib/services/events";
import { useUserId } from "@/hooks/useUserId";
import { useQueryClient } from "@tanstack/react-query";
import CSVUploadForm from "@/components/common/CSVUploadForm";

export default function CreateEventPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { userId } = useUserId();
  const queryClient = useQueryClient();
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const convertDateToYYYYMMDD = (dateString: string): string | null => {
    if (!dateString) return null;

    const trimmed = dateString.trim();

    // Nếu đã đúng định dạng YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Xử lý định dạng có dấu / (M/D/YYYY, MM/DD/YYYY, DD/MM/YYYY)
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
      const parts = trimmed.split("/");
      if (parts.length === 3) {
        const part1 = parseInt(parts[0], 10);
        const part2 = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        let month: number;
        let day: number;

        // Nếu part1 > 12 thì chắc chắn là DD/MM/YYYY
        if (part1 > 12) {
          day = part1;
          month = part2;
        } else if (part2 > 12) {
          // Nếu part2 > 12 thì chắc chắn là M/D/YYYY hoặc MM/DD/YYYY
          month = part1;
          day = part2;
        } else {
          // Trường hợp cả 2 đều <= 12, giả định là M/D/YYYY (phổ biến hơn)
          month = part1;
          day = part2;
        }

        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          // Verify date is correct (tránh trường hợp 13/13/2025)
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            const formattedYear = String(year);
            const formattedMonth = String(month).padStart(2, "0");
            const formattedDay = String(day).padStart(2, "0");
            return `${formattedYear}-${formattedMonth}-${formattedDay}`;
          }
        }
      }
    }

    // Thử parse với Date constructor (hỗ trợ nhiều định dạng khác)
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return null;
  };

  const mapCSVToAPI = (csvRow: any): { title: string; description: string; start_event_date: string; end_event_date: string; location: string; created_by: number } | null => {
    try {
      if (!userId) {
        return null;
      }

      const title = csvRow.title || "";
      const description = csvRow.description || "";
      const start_event_date_raw = csvRow.start_event_date || "";
      const end_event_date_raw = csvRow.end_event_date || "";
      const location = csvRow.location || "";
      const created_by = csvRow.created_by ? Number(csvRow.created_by) : Number(userId);

      if (!title || !description || !start_event_date_raw || !end_event_date_raw || !location) {
        return null;
      }

      // Convert dates to YYYY-MM-DD format
      const start_event_date = convertDateToYYYYMMDD(start_event_date_raw);
      const end_event_date = convertDateToYYYYMMDD(end_event_date_raw);

      if (!start_event_date || !end_event_date) {
        return null;
      }

      return {
        title: title.trim(),
        description: description.trim(),
        start_event_date,
        end_event_date,
        location: location.trim(),
        created_by,
      };
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            if (submitting) {
              message.warning("Vui lòng đợi upload xong!");
              return;
            }
            router.push("/super-admin/events");
          }}
          type="default"
          disabled={submitting}
        >
          Quay lại
        </Button>
      </div>

      <CSVUploadForm
        templatePath="/data/template/event_template.csv"
        templateFileName="event_template.csv"
        csvPreviewData={csvPreviewData}
        setCsvPreviewData={setCsvPreviewData}
        uploadFileList={uploadFileList}
        setUploadFileList={setUploadFileList}
        submitting={submitting}
        setSubmitting={setSubmitting}
        mapCSVToAPI={mapCSVToAPI}
        createItem={createEvent}
        itemName="sự kiện"
        itemNamePlural="sự kiện"
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin_events'] });
          router.push("/super-admin/events");
        }}
        templateColumns={[
          { title: "title", dataIndex: "title", key: "title", width: 200, ellipsis: true },
          { title: "description", dataIndex: "description", key: "description", width: 300, ellipsis: true },
          { title: "start_event_date", dataIndex: "start_event_date", key: "start_event_date", width: 150 },
          { title: "end_event_date", dataIndex: "end_event_date", key: "end_event_date", width: 150 },
          { title: "location", dataIndex: "location", key: "location", width: 200, ellipsis: true },
          { title: "created_by", dataIndex: "created_by", key: "created_by", width: 120 },
        ]}
      />
    </div>
  );
}

