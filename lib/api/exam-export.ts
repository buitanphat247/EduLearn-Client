import apiClient from "@/app/config/api";

export type ExportMode = "highest" | "average";

/**
 * Xuất điểm thi ra Excel qua NestJS proxy.
 * @param classId - ID lớp
 * @param testId - Mã bài thi (examId)
 * @param mode - highest: điểm cao nhất mỗi học sinh | average: điểm TB các lượt
 */
async function parseBlobError(blob: Blob): Promise<string> {
  const text = await blob.text();
  try {
    const json = JSON.parse(text);
    return (json.message ?? json.error ?? text) || "Không thể xuất file";
  } catch {
    return text || "Không thể xuất file";
  }
}

export const exportScoresExcel = async (
  classId: number | string,
  testId: string,
  mode: ExportMode = "highest",
): Promise<void> => {
  try {
    const response = await apiClient.get("/exams/export", {
      params: {
        class_id: Number(classId),
        test_id: testId,
        mode,
      },
      responseType: "blob",
    });

    const blob = response.data as Blob;
    const contentType = response.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      const msg = await parseBlobError(blob);
      throw new Error(msg);
    }

    const cd = response.headers["content-disposition"];
    const match = cd?.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) || cd?.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1]?.trim() || `diem_thi_${mode}_${Date.now()}.xlsx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error: any) {
    if (error?.response?.data instanceof Blob) {
      const msg = await parseBlobError(error.response.data);
      throw new Error(msg);
    }
    throw error;
  }
};
