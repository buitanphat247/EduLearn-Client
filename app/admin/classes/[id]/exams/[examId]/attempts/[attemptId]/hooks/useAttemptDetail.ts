"use client";

import { useState, useEffect, useCallback } from "react";
import { App } from "antd";
import { getAttemptDetail, type AttemptDetail } from "@/lib/api/exam-attempts";

export function useAttemptDetail(attemptId: string | undefined) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AttemptDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!attemptId) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await getAttemptDetail(attemptId);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Không thể tải chi tiết bài làm");
      if (showLoading) message.error(err?.message || "Lỗi tải dữ liệu");
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [attemptId, message]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetchSilent = useCallback(() => fetchData(false), [fetchData]);
  return { loading, data, error, refetch: fetchData, refetchSilent };
}
