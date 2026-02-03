import { useState, useCallback } from "react";
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
 * @param challenges - Array of challenges
 * @returns Challenge state and handlers
 */
export function useListeningChallenge(challenges: Challenge[]) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "incorrect">("none");
  const [furthestIdx, setFurthestIdx] = useState(0);
  const [history, setHistory] = useState<Record<number, ChallengeHistory>>({});

  const currentChallenge = challenges[currentIdx];
  const currentHistory = history[currentIdx] || { input: "", feedback: "none", submittedInput: "" };

  // Update history when typing
  const handleInputChange = useCallback((val: string) => {
    setUserInput(val);
    setHistory((prev) => ({
      ...prev,
      [currentIdx]: {
        input: val,
        feedback: prev[currentIdx]?.feedback || "none",
        submittedInput: prev[currentIdx]?.submittedInput || "",
      },
    }));
  }, [currentIdx]);

  const checkAnswer = useCallback(() => {
    if (!currentChallenge) return;

    // Normalization logic
    const normalizedInput = userInput
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const normalizedTarget = currentChallenge.content_challenges
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    let newFeedback: "correct" | "incorrect" = "incorrect";

    if (normalizedInput === normalizedTarget) {
      newFeedback = "correct";
      message.success("Chính xác!");

      // Auto advance after 1.5 seconds
      if (currentIdx < challenges.length - 1) {
        setTimeout(() => {
          setCurrentIdx((prev) => prev + 1);
        }, 1500);
      } else {
        setTimeout(() => {
          message.success("Chúc mừng! Bạn đã hoàn thành bài học.");
        }, 1000);
      }
    } else {
      newFeedback = "incorrect";
      message.error("Chưa chính xác, hãy thử lại!");
    }

    setFeedback(newFeedback);
    setHistory((prev) => ({
      ...prev,
      [currentIdx]: {
        input: userInput,
        feedback: newFeedback,
        submittedInput: userInput,
      },
    }));
  }, [currentChallenge, userInput, currentIdx, challenges.length]);

  const skipSentence = useCallback(() => {
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, challenges.length]);

  // Reset state when index changes
  const resetStateForIndex = useCallback((idx: number) => {
    const savedState = history[idx];
    if (savedState) {
      setUserInput(savedState.input);
      setFeedback(savedState.feedback);
    } else {
      setUserInput("");
      setFeedback("none");
    }

    if (idx > furthestIdx) {
      setFurthestIdx(idx);
    }
  }, [history, furthestIdx]);

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
