"use client";

import { Collapse, List, Space, Tag, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

interface SecurityLog {
  type: string;
  timestamp: string;
  details: string | null;
}

interface SecurityLogsCollapseProps {
  security: {
    reload_count: number;
    tab_hidden_count: number;
    disconnect_count: number;
    logs: SecurityLog[];
  };
}

export default function SecurityLogsCollapse({ security }: SecurityLogsCollapseProps) {
  const totalViolations = security.logs?.length || 0;
  const hasLogs =
    totalViolations > 0 ||
    security.reload_count > 0 ||
    security.tab_hidden_count > 0 ||
    security.disconnect_count > 0;

  if (!hasLogs) return null;

  return (
    <Collapse
      items={[
        {
          key: "security",
          label: (
            <Space>
              <SafetyCertificateOutlined className="text-orange-500" />
              <span>Nhật ký bảo mật</span>
              <Tag color="orange">{totalViolations} sự kiện</Tag>
            </Space>
          ),
          children: (
            <div className="space-y-2">
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Reload: {security.reload_count}</span>
                <span>Tab hidden: {security.tab_hidden_count}</span>
                <span>Disconnect: {security.disconnect_count}</span>
              </div>
              <List
                size="small"
                dataSource={security.logs || []}
                renderItem={(log, i) => (
                  <List.Item key={i} className="border-b-0">
                    <div className="flex justify-between w-full">
                      <Text strong className="uppercase text-xs">
                        {log.type}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {dayjs(log.timestamp).format("HH:mm:ss DD/MM/YYYY")}
                      </Text>
                    </div>
                    {log.details && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                        {log.details}
                      </Text>
                    )}
                  </List.Item>
                )}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
