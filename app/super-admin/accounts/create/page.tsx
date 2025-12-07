"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Upload, Table, App, Progress } from "antd";
import { UploadOutlined, DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { createUser } from "@/lib/api/users";

export default function CreateAccountPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => {
              if (submitting) {
                message.warning("Vui lòng đợi upload xong!");
                return;
              }
              router.push("/super-admin/accounts");
            }} 
            type="default"
            disabled={submitting}
          >
            Quay lại
          </Button>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
        <FileUploadForm
          csvPreviewData={csvPreviewData}
          setCsvPreviewData={setCsvPreviewData}
          uploadFileList={uploadFileList}
          setUploadFileList={setUploadFileList}
          submitting={submitting}
          setSubmitting={setSubmitting}
          onSuccess={() => {
            router.push("/super-admin/accounts");
          }}
        />
      </div>
    </div>
  );
}

function FileUploadForm({
  csvPreviewData,
  setCsvPreviewData,
  uploadFileList,
  setUploadFileList,
  submitting,
  setSubmitting,
  onSuccess,
}: {
  csvPreviewData: any[];
  setCsvPreviewData: (data: any[]) => void;
  uploadFileList: UploadFile[];
  setUploadFileList: (files: UploadFile[]) => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  onSuccess: () => void;
}) {
  const { message } = App.useApp();
  const [uploadProgress, setUploadProgress] = useState(0);
  const processedFileRef = useRef<string | null>(null);

  const handleDownloadTemplate = () => {
    if (submitting) {
      message.warning("Vui lòng đợi upload xong!");
      return;
    }
    const link = document.createElement("a");
    link.href = "/data/template/account_template.csv";
    link.download = "account_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Đã tải template!");
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let currentValue = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleFileChange = (info: any) => {
    if (submitting) {
      message.warning("Vui lòng đợi upload xong!");
      return;
    }

    setUploadFileList(info.fileList);

    if (info.fileList.length === 0) {
      setCsvPreviewData([]);
      processedFileRef.current = null;
      return;
    }

    const file = info.file.originFileObj || info.file;
    if (!file) return;

    // Create unique file identifier
    const fileId = `${file.name}-${file.size}-${file.lastModified}`;

    // Skip if this file was already processed
    if (processedFileRef.current === fileId) {
      return;
    }

    // Only process new files (not on status changes)
    if (info.file.status && info.file.status !== "removed") {
      return;
    }

    processedFileRef.current = fileId;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          message.warning("File CSV không có dữ liệu hoặc format không đúng!");
          setCsvPreviewData([]);
          processedFileRef.current = null;
          return;
        }

        setCsvPreviewData(parsed);
        message.success(`Đã đọc ${parsed.length} dòng dữ liệu`);
      } catch (error) {
        message.error("Không thể parse file CSV!");
        setCsvPreviewData([]);
        processedFileRef.current = null;
      }
    };

    reader.onerror = () => {
      message.error("Không thể đọc file!");
      setCsvPreviewData([]);
      processedFileRef.current = null;
    };

    reader.readAsText(file, "UTF-8");
  };

  const mapCSVToAPI = (csvRow: any): { username: string; fullname: string; email: string; phone: string; password: string; role_id: number } | null => {
    try {
      // Map CSV columns to API format
      const fullname = csvRow.Fullname || csvRow.fullname || "";
      const username = csvRow.Username || csvRow.username || "";
      const phone = csvRow.Phone || csvRow.phone || "";
      const email = csvRow.Gmail || csvRow.gmail || csvRow.Email || csvRow.email || "";
      const password = csvRow.Password || csvRow.password || "";
      const role = csvRow.Role || csvRow.role || "";

      // Convert role to role_id
      let role_id = 3; // Default to student
      if (typeof role === "string") {
        const roleLower = role.toLowerCase();
        if (roleLower === "admin" || role === "1") {
          role_id = 1;
        } else if (roleLower === "teacher" || roleLower === "giảng viên" || role === "2") {
          role_id = 2;
        } else if (roleLower === "student" || roleLower === "học sinh" || role === "3") {
          role_id = 3;
        }
      } else if (typeof role === "number") {
        role_id = role;
      }

      if (!username || !fullname || !email || !password) {
        return null;
      }

      return {
        username: username.trim(),
        fullname: fullname.trim(),
        email: email.trim(),
        phone: phone.trim() || "",
        password: password.trim(),
        role_id,
      };
    } catch (error) {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (csvPreviewData.length === 0) {
      message.warning("Vui lòng upload file CSV trước!");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      for (let i = 0; i < csvPreviewData.length; i++) {
        const row = csvPreviewData[i];
        const apiData = mapCSVToAPI(row);

        if (!apiData) {
          results.failed++;
          results.errors.push(`Dòng ${i + 1}: Thiếu thông tin bắt buộc`);
          continue;
        }

        try {
          await createUser(apiData);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`Dòng ${i + 1}: ${error.message || "Lỗi không xác định"}`);
        }

        // Update progress
        const progress = Math.round(((i + 1) / csvPreviewData.length) * 100);
        setUploadProgress(progress);
      }

      if (results.success > 0) {
        message.success(`Đã tạo thành công ${results.success}/${csvPreviewData.length} tài khoản!`);
      }

      if (results.failed > 0) {
        message.warning(`Có ${results.failed} tài khoản không thể tạo. Vui lòng kiểm tra lại dữ liệu.`);
      }

      if (results.success === csvPreviewData.length) {
        onSuccess();
      }
    } catch (error: any) {
      message.error(error?.message || "Không thể tạo tài khoản từ file");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Define columns based on template structure - always show these columns
  const templateColumns = [
    { title: "Fullname", dataIndex: "Fullname", key: "Fullname", width: 200, ellipsis: true },
    { title: "Username", dataIndex: "Username", key: "Username", width: 150, ellipsis: true },
    { title: "Phone", dataIndex: "Phone", key: "Phone", width: 120 },
    { title: "Gmail", dataIndex: "Gmail", key: "Gmail", width: 200, ellipsis: true },
    { title: "Role", dataIndex: "Role", key: "Role", width: 100 },
    { title: "Password", dataIndex: "Password", key: "Password", width: 120 },
  ];

  // Use template columns if no data, otherwise use dynamic columns from data
  const columns =
    csvPreviewData.length > 0
      ? Object.keys(csvPreviewData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key: key,
          width: 150,
          ellipsis: true,
        }))
      : templateColumns;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          type="default"
          className="bg-blue-500 hover:bg-blue-600 text-white border-0"
        >
          Tải template
        </Button>
      </div>

      <Upload 
        accept=".csv" 
        fileList={uploadFileList} 
        onChange={handleFileChange} 
        beforeUpload={() => {
          if (submitting) {
            message.warning("Vui lòng đợi upload xong!");
            return false;
          }
          return false;
        }} 
        maxCount={1} 
        showUploadList={true}
      >
        <Button 
          icon={<UploadOutlined />} 
          type="primary" 
          className="bg-green-500 hover:bg-green-600 border-0"
          onClick={(e) => {
            if (submitting) {
              e.preventDefault();
              e.stopPropagation();
              message.warning("Vui lòng đợi upload xong!");
            }
          }}
        >
          Upload file
        </Button>
      </Upload>

      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Preview dữ liệu</h3>
            <p className="text-sm text-gray-600">{csvPreviewData.length > 0 ? `Tổng cộng: ${csvPreviewData.length} tài khoản` : "Chưa có dữ liệu"}</p>
          </div>
          {csvPreviewData.length > 0 && (
            <Button
              onClick={() => {
                if (submitting) {
                  message.warning("Vui lòng đợi upload xong!");
                  return;
                }
                setCsvPreviewData([]);
                setUploadFileList([]);
                processedFileRef.current = null;
              }}
              danger
              disabled={submitting}
            >
              Xóa preview
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={csvPreviewData.map((row, index) => ({
            key: index,
            ...row,
          }))}
          pagination={
            csvPreviewData.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: false,
                  showTotal: (total) => `Tổng ${total} dòng`,
                }
              : false
          }
          size="small"
          className="accounts-preview-table"
        
        />
      </div>

      {submitting && (
        <div className="pt-4">
          <Progress percent={uploadProgress} status="active" />
          <p className="text-sm text-gray-600 mt-2 text-center">Đang tạo tài khoản... {uploadProgress}%</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          onClick={() => {
            setCsvPreviewData([]);
            setUploadFileList([]);
            processedFileRef.current = null;
          }}
          disabled={csvPreviewData.length === 0 || submitting}
        >
          Hủy
        </Button>
        <Button type="primary" onClick={handleSubmit} loading={submitting} disabled={csvPreviewData.length === 0}>
          Submit ({csvPreviewData.length} tài khoản)
        </Button>
      </div>
    </div>
  );
}
