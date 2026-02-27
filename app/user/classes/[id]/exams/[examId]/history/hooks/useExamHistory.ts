"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getRagTestDetail, type RagTestDetail } from "@/lib/services/rag-exams";
import { getTestAttempts, type StudentAttempt } from "@/lib/services/exam-attempts";
import { useUserId } from "@/hooks/useUserId";

export function useExamHistory(examId: string) {
  const { userId, loading: userLoading } = useUserId();
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);

  const fetchData = useCallback(async () => {
    const sid = Number(userId);
    if (!examId || !sid || sid <= 0) {
      setLoading(false);
      return;
    }
    const id = ++fetchIdRef.current;
    setLoading(true);
    try {
      const [testData, attemptsData] = await Promise.all([getRagTestDetail(examId), getTestAttempts(examId)]);
      if (!isMountedRef.current || id !== fetchIdRef.current) return;
      setTest(testData);
      const myAttempts = attemptsData.filter((a) => Number(a.student_id) === sid);
      setAttempts(myAttempts);
    } catch {
      if (isMountedRef.current && id === fetchIdRef.current) setAttempts([]);
    } finally {
      if (isMountedRef.current && id === fetchIdRef.current) setLoading(false);
    }
  }, [examId, userId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (userId && !userLoading) fetchData();
    else if (!userLoading) setLoading(false);
    return () => {
      isMountedRef.current = false;
      fetchIdRef.current += 1;
    };
  }, [fetchData, userId, userLoading]);

  return { loading, test, attempts, refetch: fetchData };
}
