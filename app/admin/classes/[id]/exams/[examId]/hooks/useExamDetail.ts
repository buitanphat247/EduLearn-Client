"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { App } from "antd";
import { getRagTestDetail, type RagTestDetail } from "@/lib/api/rag-exams";
import { getTestAttempts, recalculateTestScores, type StudentAttempt } from "@/lib/api/exam-attempts";

export function useExamDetail(examId: string) {
  const { message } = App.useApp();
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<StudentAttempt | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    const id = ++fetchIdRef.current;
    if (!silent) setLoading(true);
    try {
      const [testData, attemptsData] = await Promise.all([
        getRagTestDetail(examId),
        getTestAttempts(examId),
      ]);
      if (!isMountedRef.current || id !== fetchIdRef.current) return;
      setTest(testData);
      setAttempts(attemptsData);
    } catch (error) {
      if (!isMountedRef.current || id !== fetchIdRef.current) return;
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      if (isMountedRef.current && id === fetchIdRef.current) setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData().catch(() => {
      if (isMountedRef.current) setLoading(false);
    });
    return () => {
      isMountedRef.current = false;
      fetchIdRef.current += 1;
    };
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData(true);
      message.success({ content: "Đã cập nhật dữ liệu mới nhất", key: "exam_detail_refresh", duration: 2 });
    } catch {
      message.error({ content: "Không thể tải lại dữ liệu", key: "exam_detail_refresh" });
    } finally {
      setRefreshing(false);
    }
  }, [fetchData, message]);

  const handleRecalculate = useCallback(async () => {
    setRecalculating(true);
    try {
      const result = await recalculateTestScores(examId);
      await fetchData(true);
      message.success({
        content: result.updated_count > 0 ? `Đã cập nhật điểm cho ${result.updated_count} bài làm` : result.message,
        key: "recalculate_scores",
        duration: 3,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      message.error({
        content: err?.response?.data?.error || err?.message || "Không thể cập nhật điểm số",
        key: "recalculate_scores",
      });
    } finally {
      setRecalculating(false);
    }
  }, [examId, fetchData, message]);

  const handleShowLogs = useCallback((attempt: StudentAttempt) => {
    setSelectedLogs(attempt);
    setIsLogModalOpen(true);
  }, []);

  const handleCloseLogs = useCallback(() => {
    setIsLogModalOpen(false);
  }, []);

  const averageScore = useMemo(
    () => (attempts.length > 0 ? (attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1) : 0),
    [attempts]
  );

  const completionRate = useMemo(
    () =>
      attempts.length > 0 ? Math.round((attempts.filter((a) => a.status === "submitted").length / attempts.length) * 100) : 0,
    [attempts]
  );

  return {
    loading,
    refreshing,
    recalculating,
    test,
    attempts,
    selectedLogs,
    isLogModalOpen,
    averageScore,
    completionRate,
    fetchData,
    handleRefresh,
    handleRecalculate,
    handleShowLogs,
    handleCloseLogs,
  };
}
