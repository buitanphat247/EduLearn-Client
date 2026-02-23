import { useState, useEffect, useRef, useCallback } from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import { getRagTestDetail, RagTestDetail } from "@/lib/api/rag-exams";
import { DEMO_TEST_DATA } from "../constants/demoData";

export function useTestData(testId: string | null, metadataForm: ReturnType<typeof Form.useForm>[0]) {
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<RagTestDetail | null>(null);
  const formRef = useRef(metadataForm);
  const hasFetched = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    formRef.current = metadataForm;
  }, [metadataForm]);

  // Single fetch function used by both initial load and refetch
  const fetchTestData = useCallback(async (id: string) => {
    let data: RagTestDetail | null = null;

    if (id === "demo") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      data = DEMO_TEST_DATA;
    } else {
      try {
        data = await getRagTestDetail(id);
        if (!data) {
          console.warn(`Test ${id} not found, using demo data for testing`);
          data = { ...DEMO_TEST_DATA, id };
        } else {
          // Ensure test.id matches testId from URL
          data = { ...data, id };
        }
      } catch (apiError) {
        console.warn(`API error for test ${id}, using demo data for testing:`, apiError);
        data = { ...DEMO_TEST_DATA, id };
      }
    }

    // Final safety: ensure we always have data
    if (!data) {
      data = id === "demo" ? DEMO_TEST_DATA : { ...DEMO_TEST_DATA, id };
    }

    return data;
  }, []);

  const applyTestToForm = useCallback((data: RagTestDetail) => {
    formRef.current.setFieldsValue({
      title: data.title,
      description: data.description,
      duration_minutes: data.duration_minutes,
      max_attempts: data.max_attempts,
      total_score: data.total_score,
      difficulty: (data as any).difficulty || "medium",
      is_published: data.is_published ?? false,
      end_at: data.end_at ? dayjs(data.end_at) : null,
      max_violations: data.max_violations,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    hasFetched.current = false;

    if (!testId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const doFetch = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const data = await fetchTestData(testId);
        if (!isMountedRef.current) return;
        setTest(data);
        applyTestToForm(data);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error fetching test:", error);
        const fallback = testId === "demo" ? DEMO_TEST_DATA : { ...DEMO_TEST_DATA, id: testId };
        setTest(fallback);
        applyTestToForm(fallback);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    doFetch();

    return () => {
      isMountedRef.current = false;
    };
  }, [testId, fetchTestData, applyTestToForm]);

  // Refetch reuses the same fetchTestData function — no duplication
  const refetch = useCallback(async () => {
    if (!testId) {
      setLoading(false);
      return;
    }

    hasFetched.current = false;
    setLoading(true);

    try {
      const data = await fetchTestData(testId);
      setTest(data);
      applyTestToForm(data);
    } catch (error) {
      const fallback = testId === "demo" ? DEMO_TEST_DATA : { ...DEMO_TEST_DATA, id: testId };
      setTest(fallback);
      applyTestToForm(fallback);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  }, [testId, fetchTestData, applyTestToForm]);

  return {
    loading,
    test,
    setTest,
    refetch,
  };
}
