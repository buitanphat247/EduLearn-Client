"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getRagTestDetail, type RagTestDetail } from "@/lib/api/rag-exams";
import { getTestAttempts, type StudentAttempt } from "@/lib/api/exam-attempts";
import { getUserIdFromCookie, getUserDataFromSession } from "@/lib/utils/cookies";

export function useExamHistory(examId: string) {
  const fetchIdRef = useRef(0);
  const isMountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    let id = Number(getUserIdFromCookie());
    if (!id && typeof window !== "undefined") {
      try {
        const u = getUserDataFromSession() || {};
        id = Number(u.id || u.user_id) || 0;
      } catch {
        id = 0;
      }
    }
    setStudentId(id);
  }, []);

  const fetchData = useCallback(async () => {
    const sid = studentId ?? 0;
    if (!examId || sid <= 0) {
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
  }, [examId, studentId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (studentId !== null) fetchData();
    else setLoading(false);
    return () => {
      isMountedRef.current = false;
      fetchIdRef.current += 1;
    };
  }, [fetchData, studentId]);

  return { loading, test, attempts, refetch: fetchData };
}
