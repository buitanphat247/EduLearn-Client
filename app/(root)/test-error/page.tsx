"use client";

import { useState } from "react";
import { Button } from "antd";
import { BugOutlined, WarningOutlined } from "@ant-design/icons";

/**
 * Test Error Boundary Page
 * Trang này dùng để test Error Boundary overlay
 */
export default function TestErrorPage() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  // Component sẽ throw error khi shouldThrowError = true
  if (shouldThrowError) {
    throw new Error("Test Error: Đây là lỗi test để kiểm tra Error Boundary overlay!");
  }

  const triggerError = () => {
    setShouldThrowError(true);
  };

  return (
    <div className="h-full py-8 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BugOutlined className="text-4xl text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Test Error Boundary
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trang này dùng để test Error Boundary overlay
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <WarningOutlined className="text-yellow-600 dark:text-yellow-400 text-xl mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
                    Lưu ý
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Click button bên dưới để trigger error và xem Error Boundary overlay.
                    Error sẽ được catch bởi ErrorBoundary component.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="primary"
                danger
                size="large"
                icon={<BugOutlined />}
                onClick={triggerError}
                className="h-16 px-8 text-lg font-bold"
              >
                Trigger Error
              </Button>
            </div>

            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Hướng dẫn test:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Click button "Trigger Error" để xem Error Boundary overlay</li>
                <li>Kiểm tra overlay có hiển thị to và chữ màu đen không</li>
                <li>Kiểm tra stack trace có dễ đọc không</li>
                <li>Click "Thử lại" để reset error</li>
                <li>Click "Về trang chủ" để quay lại trang chủ</li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
