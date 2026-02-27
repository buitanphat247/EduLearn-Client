"use client";

import { useState, useRef } from "react";
import { Button, Upload, Table, App, Progress, Tag } from "antd";
import { UploadOutlined, DownloadOutlined, CloudUploadOutlined, InboxOutlined, ArrowLeftOutlined, TableOutlined, CheckCircleOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useRouter } from "next/navigation";

interface CSVUploadFormProps<T> {
  templatePath: string;
  templateFileName: string;
  csvPreviewData: any[];
  setCsvPreviewData: (data: any[]) => void;
  uploadFileList: UploadFile[];
  setUploadFileList: (files: UploadFile[]) => void;
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
  mapCSVToAPI: (csvRow: any) => T | null;
  createItem: (data: T) => Promise<any>;
  itemName: string;
  itemNamePlural: string;
  onSuccess: () => void;
  templateColumns?: Array<{ title: string; dataIndex: string; key: string; width?: number; ellipsis?: boolean }>;
  title?: string;
  description?: string;
  showHeader?: boolean;
  onBack?: () => void;
}

export default function CSVUploadForm<T>({
  templatePath,
  templateFileName,
  csvPreviewData,
  setCsvPreviewData,
  uploadFileList,
  setUploadFileList,
  submitting,
  setSubmitting,
  mapCSVToAPI,
  createItem,
  itemName,
  itemNamePlural,
  onSuccess,
  templateColumns,
  title,
  description,
  showHeader = true,
  onBack,
}: CSVUploadFormProps<T>) {
  const { message } = App.useApp();
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const processedFileRef = useRef<string | null>(null);

  const handleDownloadTemplate = () => {
    if (submitting) {
      message.warning("Vui lòng đợi upload xong!");
      return;
    }
    const link = document.createElement("a");
    link.href = templatePath;
    link.download = templateFileName;
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

  const handleSubmit = async () => {
    if (csvPreviewData.length === 0) {
      message.warning(`Vui lòng upload file CSV trước!`);
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
          await createItem(apiData);
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
        message.success(`Đã tạo thành công ${results.success}/${csvPreviewData.length} ${itemNamePlural}!`);
      }

      if (results.failed > 0) {
        message.warning(`Có ${results.failed} ${itemNamePlural} không thể tạo. Vui lòng kiểm tra lại dữ liệu.`);
      }

      if (results.success === csvPreviewData.length) {
        onSuccess();
      }
    } catch (error: any) {
      message.error(error?.message || `Không thể tạo ${itemNamePlural} từ file`);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Use template columns if provided, otherwise use dynamic columns from data
  const columns =
    csvPreviewData.length > 0
      ? [
          { title: "#", key: "index", width: 60, render: (_: any, __: any, index: number) => index + 1 },
          ...Object.keys(csvPreviewData[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
            width: 150,
            ellipsis: true,
          })),
        ]
      : templateColumns
      ? [
          { title: "#", key: "index", width: 60, render: (_: any, __: any, index: number) => index + 1 },
          ...templateColumns,
        ]
      : [];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      {showHeader && (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title || `Import ${itemNamePlural.charAt(0).toUpperCase() + itemNamePlural.slice(1)}`}
            </h1>
            <p className="text-gray-500">
              {description || `Upload your customer data to bulk invite ${itemNamePlural}. We support .CSV format up to 5MB.`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              disabled={submitting}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400"
            >
              Tải template
            </Button>
            {onBack && (
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  if (submitting) {
                    message.warning("Vui lòng đợi upload xong!");
                    return;
                  }
                  onBack();
                }}
                disabled={submitting}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400"
              >
                Quay lại
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      {uploadFileList.length === 0 && (
        <div className="w-full">
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
            showUploadList={false}
            className="w-full block"
          >
            <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="bg-gray-100 p-4 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
                <CloudUploadOutlined className="text-gray-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Drop your file here</h3>
              <p className="text-sm text-gray-500 mb-6">
                or <span className="text-blue-600 hover:text-blue-500 font-medium">browse files</span> from your computer
              </p>
              <div className="flex space-x-2">
                <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded border border-gray-200">CSV</span>
              </div>
            </div>
          </Upload>
        </div>
      )}

      {/* File Status Card */}
      {uploadFileList.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 z-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <TableOutlined className="text-green-600 text-lg" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {uploadFileList[0]?.name || "uploaded_file.csv"}
                </h4>
                <p className="text-xs text-gray-500">
                  {uploadFileList[0]?.size ? `${(uploadFileList[0].size / 1024 / 1024).toFixed(1)} MB` : "0 MB"} • Ready to import
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-sm">100%</span>
              <CheckCircleOutlined className="text-blue-600 text-base" />
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {csvPreviewData.length > 0 && (
        <section className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Preview Header */}
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Preview Data</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 border border-gray-200">
                {csvPreviewData.length} Records
              </span>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={csvPreviewData.map((row, index) => ({
                key: index,
                ...row,
              }))}
              pagination={
                csvPreviewData.length > 20
                  ? {
                      pageSize: 20,
                      showSizeChanger: false,
                      showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    }
                  : false
              }
              size="small"
              className="csv-preview-table"
            />
          </div>
        </section>
      )}

      {/* Progress Bar */}
      {submitting && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <Progress percent={uploadProgress} status="active" className="mb-2" />
          <p className="text-sm text-gray-600 text-center">Đang tạo {itemNamePlural}... {uploadProgress}%</p>
        </div>
      )}

      {/* Footer Actions */}
      {csvPreviewData.length > 0 && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              setCsvPreviewData([]);
              setUploadFileList([]);
              processedFileRef.current = null;
            }}
            disabled={submitting}
            className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Submit ({csvPreviewData.length} {itemNamePlural})
          </Button>
        </div>
      )}
    </div>
  );
}

