"use client";

import { Card, Button, Space, App, Progress, Tag, Divider, Modal, Input, message, Select, Form } from "antd";
import {
  ApiOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";

const { Option } = Select;

interface HealthCheckResult {
  status: "success" | "error" | "loading" | "idle";
  responseTime?: number;
  statusCode?: number;
  message?: string;
  data?: {
    status: string;
    timestamp: string;
    uptime: number;
    database: {
      status: string;
      responseTime?: number;
      error?: string;
    };
  };
}

interface BackupInfo {
  id: string;
  name: string;
  date: string;
  size: string;
  status: "completed" | "failed" | "in-progress";
}

export default function SuperAdminAll() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult>({
    status: "idle",
  });
  const [baseUrl, setBaseUrl] = useState("http://localhost:1611/api");
  const [endpoint, setEndpoint] = useState("/health");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">("GET");

  const [backups, setBackups] = useState<BackupInfo[]>([
    { id: "1", name: "Backup đầy đủ - 2024-01-20", date: "20/01/2024 10:30", size: "2.5 GB", status: "completed" },
    { id: "2", name: "Backup đầy đủ - 2024-01-19", date: "19/01/2024 10:30", size: "2.4 GB", status: "completed" },
    { id: "3", name: "Backup đầy đủ - 2024-01-18", date: "18/01/2024 10:30", size: "2.3 GB", status: "completed" },
  ]);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupName, setBackupName] = useState("");

  const handleHealthCheck = async () => {
    if (!baseUrl.trim() || !endpoint.trim()) {
      message.warning("Vui lòng nhập đầy đủ URL và endpoint");
      return;
    }

    setHealthCheck({ status: "loading" });
    const startTime = Date.now();

    try {
      // Sử dụng /api-proxy để tránh CORS
      const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const proxyUrl = `/api-proxy${endpointPath}`;

      let response;
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 seconds timeout
      };

      switch (method) {
        case "GET":
          response = await axios.get(proxyUrl, config);
          break;
        case "POST":
          response = await axios.post(proxyUrl, {}, config);
          break;
        case "PUT":
          response = await axios.put(proxyUrl, {}, config);
          break;
        case "DELETE":
          response = await axios.delete(proxyUrl, config);
          break;
        case "PATCH":
          response = await axios.patch(proxyUrl, {}, config);
          break;
        default:
          response = await axios.get(proxyUrl, config);
      }

      const responseTime = Date.now() - startTime;

      // Ensure minimum loading time of 1.5 seconds
      const minLoadingTime = 1500;
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      const finalResponseTime = Date.now() - startTime;
      setHealthCheck({
        status: "success",
        responseTime: finalResponseTime,
        statusCode: response.status,
        message: response.data?.message || "Request thành công",
        data: response.data?.data,
      });
      message.success(response.data?.message || `Request thành công (${finalResponseTime}ms)`);
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      // Ensure minimum loading time of 1.5 seconds even on error
      const minLoadingTime = 1500;
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      const statusCode = error?.response?.status || error?.code === "ECONNABORTED" ? 408 : 503;
      const errorMessage = error?.code === "ECONNABORTED" 
        ? "Request timeout - Vượt quá thời gian chờ"
        : error?.response?.data?.message || error?.message || "Không thể kết nối đến server";

      const finalResponseTime = Date.now() - startTime;
      setHealthCheck({
        status: "error",
        responseTime: finalResponseTime,
        statusCode,
        message: errorMessage,
        data: error?.response?.data?.data,
      });
      message.error(errorMessage);
    }
  };

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      message.error("Vui lòng nhập tên backup");
      return;
    }

    const newBackup: BackupInfo = {
      id: Date.now().toString(),
      name: backupName,
      date: new Date().toLocaleString("vi-VN"),
      size: "0 MB",
      status: "in-progress",
    };

    setBackups((prev) => [newBackup, ...prev]);
    setIsBackupModalOpen(false);
    setBackupName("");

    setTimeout(() => {
      setBackups((prev) =>
        prev.map((backup) =>
          backup.id === newBackup.id ? { ...backup, status: "completed", size: `${(Math.random() * 2 + 2).toFixed(1)} GB` } : backup
        )
      );
      message.success("Backup thành công!");
    }, 3000);
  };

  const handleRestoreBackup = (backup: BackupInfo) => {
    modal.confirm({
      title: "Xác nhận khôi phục",
      content: `Bạn có chắc chắn muốn khôi phục từ "${backup.name}"? Hành động này sẽ ghi đè dữ liệu hiện tại.`,
      okText: "Khôi phục",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        message.warning("Tính năng khôi phục đang được phát triển");
      },
    });
  };

  const getStatusIcon = (status: HealthCheckResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircleOutlined className="text-green-500 text-xl" />;
      case "error":
        return <CloseCircleOutlined className="text-red-500 text-xl" />;
      case "loading":
        return <LoadingOutlined className="text-blue-500 text-xl" spin />;
      default:
        return <ClockCircleOutlined className="text-gray-400 text-xl" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  const getBackupStatusColor = (status: BackupInfo["status"]) => {
    switch (status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      case "in-progress":
        return "blue";
      default:
        return "default";
    }
  };

  const getBackupStatusText = (status: BackupInfo["status"]) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "failed":
        return "Thất bại";
      case "in-progress":
        return "Đang xử lý...";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 p-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Test Section */}
        <Card
          hoverable
          className="group cursor-default border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          styles={{
            body: { padding: 0 },
          }}
        >
          <div className="bg-linear-to-br from-blue-500 to-blue-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-black">
                  <ApiOutlined className="text-3xl text-blue-600" />
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Test API</h3>
              <p className="text-blue-100 text-sm">Kiểm tra kết nối và test API endpoints</p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <Form form={form} layout="vertical" className="space-y-4">
            <Form.Item label="Base URL" required>
              <Input
                prefix={<GlobalOutlined className="text-gray-400" />}
                placeholder="http://localhost:1611/api"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="h-10"
              />
            </Form.Item>

            <div className="grid grid-cols-3 gap-3">
              <Form.Item label="Method" required className="col-span-1">
                <Select
                  value={method}
                  onChange={setMethod}
                  className="h-10"
                  options={[
                    { value: "GET", label: "GET" },
                    { value: "POST", label: "POST" },
                    { value: "PUT", label: "PUT" },
                    { value: "DELETE", label: "DELETE" },
                    { value: "PATCH", label: "PATCH" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Endpoint" required className="col-span-2">
                <Input
                  prefix={<ApiOutlined className="text-gray-400" />}
                  placeholder="/health"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="h-10"
                />
              </Form.Item>
            </div>

            <Form.Item>
              <Button
                type="primary"
                icon={healthCheck.status === "loading" ? <LoadingOutlined spin /> : <PlayCircleOutlined />}
                onClick={handleHealthCheck}
                disabled={healthCheck.status === "loading"}
                block
                size="large"
                className="bg-blue-500 hover:bg-blue-600 h-11"
              >
                {healthCheck.status === "loading" ? "Đang kiểm tra..." : "Gửi Request"}
              </Button>
            </Form.Item>
          </Form>

          </div>
        </Card>

        {/* Backup System Section */}
        <Card
          hoverable
          className="group cursor-default border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          styles={{
            body: { padding: 0 },
          }}
        >
          <div className="bg-linear-to-br from-green-500 to-green-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-black">
                    <DatabaseOutlined className="text-3xl text-green-600" />
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Backup hệ thống</h3>
                <p className="text-blue-100 text-sm">Quản lý sao lưu và khôi phục dữ liệu</p>
              </div>
              <Button
                type="default"
                icon={<SaveOutlined />}
                onClick={() => setIsBackupModalOpen(true)}
                className="bg-white text-green-600 hover:bg-green-50 border-0"
              >
                Tạo backup
              </Button>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">{backup.name}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <ClockCircleOutlined />
                        {backup.date}
                      </span>
                      <span>{backup.size}</span>
                    </div>
                  </div>
                  <Tag color={getBackupStatusColor(backup.status)}>{getBackupStatusText(backup.status)}</Tag>
                </div>
                {backup.status === "in-progress" && <Progress percent={75} size="small" status="active" className="mt-2" />}
                {backup.status === "completed" && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      type="default"
                      icon={<CloudDownloadOutlined />}
                      size="small"
                      onClick={() => message.info("Tính năng tải xuống đang được phát triển")}
                    >
                      Tải xuống
                    </Button>
                    <Button type="default" icon={<CloudUploadOutlined />} size="small" onClick={() => handleRestoreBackup(backup)}>
                      Khôi phục
                    </Button>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Divider className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
          <div className="text-gray-600">Uptime</div>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-2">2.5 TB</div>
          <div className="text-gray-600">Dung lượng đã sử dụng</div>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">1,234</div>
          <div className="text-gray-600">Tổng requests hôm nay</div>
        </div>
      </div>

      {/* Backup Modal */}
      <Modal
        title="Tạo backup mới"
        open={isBackupModalOpen}
        onOk={handleCreateBackup}
        onCancel={() => {
          setIsBackupModalOpen(false);
          setBackupName("");
        }}
        okText="Tạo backup"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên backup</label>
            <Input
              placeholder="Nhập tên backup (ví dụ: Backup đầy đủ - 2024-01-20)"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              onPressEnter={handleCreateBackup}
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">Backup sẽ bao gồm: Database, Files, Configurations. Quá trình này có thể mất vài phút.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
