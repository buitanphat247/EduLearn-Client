import { useState, useCallback, useMemo, useRef } from "react";
import { message } from "antd";
import { VocabularyResponse } from "@/lib/api/vocabulary";

interface QuizQuestion {
  id: number;
  word: VocabularyResponse;
  options: VocabularyResponse[];
  correctAnswer: number;
}

/**
 * Custom hook for managing vocabulary quiz logic
 * @param vocabularies - Array of vocabularies
 * @returns Quiz state and handlers
 */
export function useVocabularyQuiz(vocabularies: VocabularyResponse[]) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate random quiz questions
  const generateQuestions = useCallback((vocabs: VocabularyResponse[]) => {
    const questionCount = Math.min(10, vocabs.length);
    const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
    const selectedVocabs = shuffled.slice(0, questionCount);

    const newQuestions: QuizQuestion[] = selectedVocabs.map((vocab, index) => {
      const wrongAnswers = vocabs
        .filter((v) => v.sourceWordId !== vocab.sourceWordId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = [vocab, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.findIndex((v) => v.sourceWordId === vocab.sourceWordId);

      return {
        id: index + 1,
        word: vocab,
        options: allOptions,
        correctAnswer: correctIndex,
      };
    });

    setQuestions(newQuestions);
  }, []);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex] || null,
    [questions, currentQuestionIndex]
  );

  const playAudio = useCallback((audioUrl?: string) => {
    if (!audioUrl) {
      message.warning("Không có audio cho từ này");
      return;
    }
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      message.error("Không thể phát audio");
    });
  }, []);

  const playResultAudio = useCallback((isCorrect: boolean) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioPath = isCorrect ? "/audio/true.mp3" : "/audio/false.mp3";
    const audio = new Audio(audioPath);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch((error) => {
      console.error("Error playing result audio:", error);
    });
  }, []);

  const handleAnswerSelect = useCallback(
    (optionIndex: number) => {
      if (selectedAnswer !== null || showResult || userAnswers[currentQuestionIndex] !== undefined) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setSelectedAnswer(optionIndex);
      const newUserAnswers = {
        ...userAnswers,
        [currentQuestionIndex]: optionIndex,
      };
      setUserAnswers(newUserAnswers);

      const isCorrect = optionIndex === currentQuestion?.correctAnswer;
      playResultAudio(isCorrect);

      if (isCorrect) {
        message.success("Chính xác! 🎉");
      } else {
        message.error(`Sai rồi! Đáp án đúng là: ${currentQuestion?.options[currentQuestion?.correctAnswer]?.translation}`);
      }

      timeoutRef.current = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(newUserAnswers[currentQuestionIndex + 1] ?? null);
        } else {
          const finalScore = questions.reduce((acc, q, idx) => {
            const userAnswer = idx === currentQuestionIndex ? optionIndex : newUserAnswers[idx];
            return userAnswer === q.correctAnswer ? acc + 1 : acc;
          }, 0);
          setScore(finalScore);
          setShowResult(true);
        }
      }, 1500);
    },
    [selectedAnswer, currentQuestionIndex, showResult, currentQuestion, questions, userAnswers, playResultAudio]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] ?? null);
    }
  }, [currentQuestionIndex, questions.length, userAnswers]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] ?? null);
    }
  }, [currentQuestionIndex, userAnswers]);

  const handleRestart = useCallback(() => {
    if (vocabularies.length > 0) {
      generateQuestions(vocabularies);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setUserAnswers({});
      setShowResult(false);
      setScore(0);
    }
  }, [vocabularies, generateQuestions]);

  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return {
    questions,
    currentQuestionIndex,
    selectedAnswer,
    userAnswers,
    showResult,
    score,
    currentQuestion,
    progress,
    generateQuestions,
    playAudio,
    handleAnswerSelect,
    handleNext,
    handlePrev,
    handleRestart,
    cleanup,
  };
}
