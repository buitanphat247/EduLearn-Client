import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { message } from "antd";
import { VocabularyResponse } from "@/lib/api/vocabulary";

interface TypingQuestion {
  id: number;
  word: VocabularyResponse;
  sentence: string;
}

/**
 * Custom hook for managing vocabulary typing practice
 * @param vocabularies - Array of vocabularies
 * @returns Typing state and handlers
 */
export function useVocabularyTyping(vocabularies: VocabularyResponse[]) {
  const [questions, setQuestions] = useState<TypingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [userAnswers, setUserAnswers] = useState<Record<number, { answer: string; isCorrect: boolean }>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastQuestionIdRef = useRef<number | null>(null);
  const inputRef = useRef<any>(null);

  // Generate typing questions
  const generateQuestions = useCallback((vocabs: VocabularyResponse[]) => {
    const questionCount = vocabs.length;
    const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
    const selectedVocabs = shuffled.slice(0, questionCount);

    const newQuestions: TypingQuestion[] = selectedVocabs.map((vocab, index) => {
      return {
        id: index + 1,
        word: vocab,
        sentence: vocab.content,
      };
    });

    setQuestions(newQuestions);
    lastQuestionIdRef.current = null;
  }, []);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex] || null, [questions, currentQuestionIndex]);

  // Generate placeholder pattern
  const generatePlaceholder = useCallback((sentence: string) => {
    const words = sentence.trim().split(/\s+/);
    return words.map((word) => "_".repeat(word.length)).join(" ");
  }, []);

  const placeholder = useMemo(() => {
    if (!currentQuestion) return "";
    return generatePlaceholder(currentQuestion.sentence);
  }, [currentQuestion, generatePlaceholder]);

  const playAudio = useCallback((audioUrl?: string) => {
    if (!audioUrl) {
      message.warning("Không có audio cho từ này");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      message.error("Không thể phát audio");
    });

    audio.addEventListener("ended", () => {
      audioRef.current = null;
    });
  }, []);

  const playResultAudio = useCallback((isCorrect: boolean) => {
    const audioPath = isCorrect ? "/audio/true.mp3" : "/audio/false.mp3";
    const audio = new Audio(audioPath);
    audio.volume = 0.7;
    audio.play().catch((error) => {
      console.error("Error playing result audio:", error);
    });
  }, []);

  // Normalize text for comparison
  const normalizeText = useCallback((text: string) => {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
  }, []);

  const handleCheck = useCallback(() => {
    if (!currentQuestion || !userInput.trim() || isChecking) return;

    setIsChecking(true);
    const normalizedInput = normalizeText(userInput);
    const normalizedTarget = normalizeText(currentQuestion.sentence);
    const isCorrect = normalizedInput === normalizedTarget;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        answer: userInput,
        isCorrect,
      },
    }));

    playResultAudio(isCorrect);

    // Gửi kết quả về Server để tính toán SM-2
    const syncReview = async () => {
      try {
        const { getProfile } = await import("@/lib/api/auth");
        const { reviewWord, createUserVocabulary } = await import("@/lib/api/vocabulary");
        const profile = await getProfile();
        if (profile?.user_id && currentQuestion) {
          const userIdNum = Number(profile.user_id);
          const wordId = currentQuestion.word.sourceWordId;

          // Gửi review
          await reviewWord({
            user_id: userIdNum,
            sourceWordId: wordId,
            grade: isCorrect ? 5 : 1,
          });
        }
      } catch (error) {
        console.error("Failed to sync review result:", error);
      }
    };
    syncReview();

    if (isCorrect) {
      message.success("Chính xác! 🎉");
    } else {
      message.error(`Sai rồi! Đáp án đúng là: "${currentQuestion.sentence}"`);
    }

    setTimeout(() => {
      setIsChecking(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserInput(userAnswers[currentQuestionIndex + 1]?.answer || "");
      } else {
        const finalScore = questions.reduce((acc, q, idx) => {
          const userAnswer = idx === currentQuestionIndex ? { answer: userInput, isCorrect } : userAnswers[idx];
          return userAnswer?.isCorrect ? acc + 1 : acc;
        }, 0);
        setScore(finalScore);
        setShowResult(true);
      }
    }, 1500);
  }, [currentQuestion, userInput, isChecking, currentQuestionIndex, questions, userAnswers, message, playResultAudio, normalizeText]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserInput(userAnswers[currentQuestionIndex + 1]?.answer || "");
    }
  }, [currentQuestionIndex, questions.length, userAnswers]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setUserInput(userAnswers[currentQuestionIndex - 1]?.answer || "");
    }
  }, [currentQuestionIndex, userAnswers]);

  const handleRestart = useCallback(() => {
    if (vocabularies.length > 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      lastQuestionIdRef.current = null;
      generateQuestions(vocabularies);
      setCurrentQuestionIndex(0);
      setUserInput("");
      setUserAnswers({});
      setShowResult(false);
      setScore(0);
      setIsChecking(false);
    }
  }, [vocabularies, generateQuestions]);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  const [loading, setLoading] = useState(false);

  // Auto play audio when question changes
  useEffect(() => {
    if (loading || questions.length === 0 || !currentQuestion || currentQuestion.id === lastQuestionIdRef.current) {
      return;
    }

    const questionId = currentQuestion.id;
    lastQuestionIdRef.current = questionId;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (currentQuestion.word?.audioUrl?.[0]?.url) {
      const timeoutId = setTimeout(() => {
        if (lastQuestionIdRef.current === questionId && !loading && questions.length > 0) {
          const audio = new Audio(currentQuestion.word.audioUrl![0].url);
          audioRef.current = audio;
          audio.play().catch((error) => {
            console.error("Error auto-playing audio:", error);
          });

          audio.addEventListener("ended", () => {
            audioRef.current = null;
          });
        }
      }, 200);

      return () => {
        clearTimeout(timeoutId);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [currentQuestion, loading, questions.length]);

  // Focus input when question changes
  useEffect(() => {
    if (inputRef.current && !showResult) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, showResult]);

  return {
    questions,
    currentQuestionIndex,
    userInput,
    setUserInput,
    userAnswers,
    showResult,
    score,
    isChecking,
    currentQuestion,
    placeholder,
    progress,
    inputRef,
    generateQuestions,
    playAudio,
    handleCheck,
    handleNext,
    handlePrev,
    handleRestart,
  };
}
