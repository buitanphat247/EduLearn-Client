"use client";

import { Card, Button, Space, App, Divider, Input, message, Select, Form, Tag } from "antd";
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  MonitorOutlined,
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


export default function SuperAdminAll() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [healthCheck, setHealthCheck] = useState<HealthCheckResult>({
    status: "idle",
  });
  const [baseUrl, setBaseUrl] = useState("http://localhost:1611/api");
  const [endpoint, setEndpoint] = useState("/health");
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">("GET");

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
      const minLoadingTime = 500;
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
      const minLoadingTime = 500;
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
                disabled
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
                  disabled
                />
              </Form.Item>

              <Form.Item label="Endpoint" required className="col-span-2">
                <Input
                  prefix={<ApiOutlined className="text-gray-400" />}
                  placeholder="/health"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="h-10"
                  disabled
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

            {/* Health Check Result */}
            {healthCheck.status !== "idle" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700">Kết quả kiểm tra:</span>
                  {getStatusIcon(healthCheck.status)}
                </div>
                {healthCheck.statusCode && (
                  <div className="text-sm text-gray-600 mb-2">
                    Status Code: <Tag color={healthCheck.statusCode >= 200 && healthCheck.statusCode < 300 ? "green" : "red"}>{healthCheck.statusCode}</Tag>
                  </div>
                )}
                {healthCheck.responseTime && (
                  <div className="text-sm text-gray-600 mb-2">
                    Response Time: <span className="font-semibold">{healthCheck.responseTime}ms</span>
                  </div>
                )}
                {healthCheck.message && (
                  <div className="text-sm text-gray-600">
                    {healthCheck.message}
                  </div>
                )}
                {healthCheck.data && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {healthCheck.data.uptime && (
                      <div className="text-sm text-gray-600 mb-2">
                        <ClockCircleOutlined className="mr-2" />
                        Uptime: <span className="font-semibold">{formatUptime(healthCheck.data.uptime)}</span>
                      </div>
                    )}
                    {healthCheck.data.database && (
                      <div className="text-sm text-gray-600">
                        <DatabaseOutlined className="mr-2" />
                        Database: <Tag color={healthCheck.data.database.status === "connected" ? "green" : "red"}>{healthCheck.data.database.status}</Tag>
                        {healthCheck.data.database.responseTime && (
                          <span className="ml-2">({healthCheck.data.database.responseTime}ms)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Form>

          </div>
        </Card>

        {/* System Information Section */}
        <Card
          hoverable
          className="group cursor-default border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          styles={{
            body: { padding: 0 },
          }}
        >
          <div className="bg-linear-to-br from-purple-500 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-black">
                  <InfoCircleOutlined className="text-3xl text-purple-600" />
                  </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Thông tin hệ thống</h3>
              <p className="text-purple-100 text-sm">Xem thống kê và trạng thái hệ thống</p>
            </div>
          </div>
          <div className="p-6 bg-white">
            <div className="space-y-4">
              {/* System Metrics */}
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <CloudServerOutlined className="text-2xl text-blue-600 mr-2" />
                    <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                    </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <DatabaseOutlined className="text-2xl text-green-600 mr-2" />
                    <div className="text-2xl font-bold text-green-600">2.5 TB</div>
                  </div>
                  <div className="text-sm text-gray-600">Dung lượng đã sử dụng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center mb-2">
                    <MonitorOutlined className="text-2xl text-purple-600 mr-2" />
                    <div className="text-2xl font-bold text-purple-600">1,234</div>
                  </div>
                  <div className="text-sm text-gray-600">Tổng requests hôm nay</div>
                </div>
              </div>

              {/* Additional System Info */}
              {healthCheck.data && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Thông tin từ API Health Check:</h4>
                  <div className="space-y-2 text-sm">
                    {healthCheck.data.timestamp && (
                      <div className="flex items-center text-gray-600">
                        <ClockCircleOutlined className="mr-2" />
                        <span>Timestamp: {new Date(healthCheck.data.timestamp).toLocaleString("vi-VN")}</span>
                      </div>
                    )}
                    {healthCheck.data.status && (
                      <div className="flex items-center text-gray-600">
                        <CheckCircleOutlined className="mr-2 text-green-500" />
                        <span>Status: <Tag color="green">{healthCheck.data.status}</Tag></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
