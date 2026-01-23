import { useState } from "react";
import { message } from "antd";
import { updateRagTest, publishRagTest, RagTestDetail } from "@/lib/api/rag-exams";
import { transactionQueue } from "../utils/transactionQueue";

interface UseTestMetadataProps {
  testId: string | null;
  test: RagTestDetail | null;
  setTest: (test: RagTestDetail | null) => void;
  refetch: () => Promise<void>;
}

export function useTestMetadata({ testId, test, setTest, refetch }: UseTestMetadataProps) {
  const [saving, setSaving] = useState(false);

  const saveMetadata = async (values: any) => {
    // Set saving state immediately for instant spinner
    setSaving(true);
    
    try {
      // Enqueue the transaction to ensure sequential execution
      await transactionQueue.enqueue(async () => {
        try {
          if (testId === "demo") {
            // Demo mode: update local state only
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (test) {
              setTest({
                ...test,
                ...values,
              });
            }
            message.success("Đã cập nhật cấu hình (demo mode)");
          } else {
            // Prepare payload
            const payload = { ...values };
            if (payload.end_at && typeof payload.end_at.format === "function") {
               payload.end_at = payload.end_at.format("YYYY-MM-DD HH:mm:ss");
            }

            const success = await updateRagTest(testId!, payload);
            if (success) {
              message.success("Đã cập nhật cấu hình");
              await refetch();
            } else {
              message.error("Cập nhật thất bại");
              throw new Error("Cập nhật thất bại");
            }
          }
        } catch (error) {
          message.error("Lỗi khi lưu thông tin");
          throw error;
        }
      });
    } catch (error) {
      // Error already handled in queue
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (isPublished: boolean) => {
    // Set saving state immediately for instant spinner
    setSaving(true);
    
    try {
      // Enqueue the transaction to ensure sequential execution
      await transactionQueue.enqueue(async () => {
        try {
          if (testId === "demo") {
            // Demo mode: update local state only
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (test) {
              setTest({
                ...test,
                is_published: isPublished,
              });
            }
            message.success(isPublished ? "Đã xuất bản đề thi (demo mode)" : "Đã hủy xuất bản đề thi (demo mode)");
          } else {
            const success = await publishRagTest(testId!, isPublished);
            if (success) {
              message.success(isPublished ? "Đã xuất bản đề thi thành công!" : "Đã hủy xuất bản đề thi thành công!");
              await refetch();
            } else {
              message.error(isPublished ? "Xuất bản thất bại" : "Hủy xuất bản thất bại");
              throw new Error("Thao tác thất bại");
            }
          }
        } catch (error) {
          message.error("Lỗi khi thực hiện thao tác");
          throw error;
        }
      });
    } catch (error) {
      // Error already handled in queue
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveMetadata,
    togglePublish,
  };
}
