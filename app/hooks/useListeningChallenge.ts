import { useState, useCallback, useRef } from "react";
import { message } from "antd";

interface Challenge {
  id_challenges: number;
  content_challenges: string;
  translateText_challenges?: string;
}

interface ChallengeHistory {
  input: string;
  feedback: "none" | "correct" | "incorrect";
  submittedInput: string;
}

/**
 * Custom hook for managing listening challenge logic
 * Uses refs for latest values to avoid stale closures in callbacks
 */
export function useListeningChallenge(challenges: Challenge[]) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const [history, setHistory] = useState<Record<number, ChallengeHistory>>({});

  // Refs for latest values - prevents stale closures
  const currentIdxRef = useRef(currentIdx);
  const userInputRef = useRef(userInput);
  const challengesRef = useRef(challenges);
  const historyRef = useRef(history);
  const isAdvancingRef = useRef(false);

  currentIdxRef.current = currentIdx;
  userInputRef.current = userInput;
  challengesRef.current = challenges;
  historyRef.current = history;

  const currentChallenge = challenges[currentIdx];
  const currentHistory = history[currentIdx] || { input: "", feedback: "none", submittedInput: "" };

  // Update history when typing
  const handleInputChange = useCallback((val: string) => {
    setUserInput(val);
    const idx = currentIdxRef.current;
    setHistory((prev) => ({
      ...prev,
      [idx]: {
        input: val,
        feedback: prev[idx]?.feedback || "none",
        submittedInput: prev[idx]?.submittedInput || "",
      },
    }));
  }, []);

  const checkAnswer = useCallback(() => {
    const idx = currentIdxRef.current;
    const input = userInputRef.current;
    const chals = challengesRef.current;
    const challenge = chals[idx];

    if (!challenge || isAdvancingRef.current) return;

    // Normalization
    const normalize = (text: string) =>
      text
        .trim()
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()'?"]/g, "")
        .replace(/\s+/g, " ");

    const normalizedInput = normalize(input);
    const normalizedTarget = normalize(challenge.content_challenges);

    if (!normalizedInput) {
      message.warning("Vui lòng nhập câu trả lời");
      return;
    }

    let newFeedback: "correct" | "incorrect" = "incorrect";

    if (normalizedInput === normalizedTarget) {
      newFeedback = "correct";
      message.success("Chính xác!");

      // Auto advance after 1.5 seconds
      if (idx < chals.length - 1) {
        isAdvancingRef.current = true;
        setTimeout(() => {
          setCurrentIdx((prev) => {
            const next = prev + 1;
            if (next < challengesRef.current.length) {
              return next;
            }
            return prev;
          });
          isAdvancingRef.current = false;
        }, 1500);
      } else {
        setTimeout(() => {
          message.success("Chúc mừng! Bạn đã hoàn thành bài học.");
        }, 1000);
      }
    } else {
      message.error("Chưa chính xác, hãy thử lại!");
    }

    setFeedback(newFeedback);
    setHistory((prev) => ({
      ...prev,
      [idx]: {
        input,
        feedback: newFeedback,
        submittedInput: input,
      },
    }));
  }, []);

  const skipSentence = useCallback(() => {
    const idx = currentIdxRef.current;
    const chals = challengesRef.current;

    if (isAdvancingRef.current) return;

    if (idx < chals.length - 1) {
      setCurrentIdx(idx + 1);
    } else {
      message.info("Đây là câu cuối cùng");
    }
  }, []);

  // Reset state when index changes - uses ref so this callback is stable
  const resetStateForIndex = useCallback((idx: number) => {
    const savedState = historyRef.current[idx];
    if (savedState) {
      setUserInput(savedState.input);
      setFeedback(savedState.feedback);
    } else {
      setUserInput("");
      setFeedback("none");
    }
  }, []);

  return {
    currentIdx,
    setCurrentIdx,
    userInput,
    feedback,
    currentChallenge,
    currentHistory,
    history,
    handleInputChange,
    checkAnswer,
    skipSentence,
    resetStateForIndex,
  };
}
