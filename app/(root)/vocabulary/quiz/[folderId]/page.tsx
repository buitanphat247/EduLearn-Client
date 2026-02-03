"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Button, ConfigProvider, theme, Progress, Result, Spin } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SoundOutlined,
    ArrowLeftOutlined,
    TrophyOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { IoArrowBackOutline } from "react-icons/io5";
import { useTheme } from "@/app/context/ThemeContext";
import RouteErrorBoundary from "@/app/components/common/RouteErrorBoundary";

interface QuizQuestion {
    id: number;
    word: VocabularyResponse;
    options: VocabularyResponse[];
    correctAnswer: number;
}

export default function VocabularyQuiz() {
    const { message } = App.useApp();
    const router = useRouter();
    const params = useParams();
    const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
    const { theme: currentTheme } = useTheme();

    const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchVocabularies = useCallback(async () => {
        if (!folderId) return;

        setLoading(true);
        try {
            const data = await getVocabulariesByFolder(folderId);
            setVocabularies(data);

            // Generate quiz questions
            if (data.length > 0) {
                generateQuestions(data);
            }
        } catch (error: any) {
            console.error("Error fetching vocabularies:", error);
            message.error(error?.message || "Không thể tải danh sách từ vựng");
            setVocabularies([]);
        } finally {
            setLoading(false);
        }
    }, [folderId, message]);

    // Generate random quiz questions
    const generateQuestions = useCallback((vocabs: VocabularyResponse[]) => {
        const questionCount = Math.min(10, vocabs.length); // Max 10 questions
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
        const selectedVocabs = shuffled.slice(0, questionCount);

        const newQuestions: QuizQuestion[] = selectedVocabs.map((vocab, index) => {
            // Get 3 random wrong answers
            const wrongAnswers = vocabs
                .filter((v) => v.sourceWordId !== vocab.sourceWordId)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            // Combine with correct answer and shuffle
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

    useEffect(() => {
        if (folderId) {
            fetchVocabularies();
        }
    }, [folderId, fetchVocabularies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const folderName = useMemo(() => vocabularies[0]?.folder?.folderName || "", [vocabularies]);
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
    }, [message]);

    const playResultAudio = useCallback((isCorrect: boolean) => {
        // Cleanup previous audio if exists
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        const audioPath = isCorrect ? "/audio/true.mp3" : "/audio/false.mp3";
        const audio = new Audio(audioPath);
        audio.volume = 0.7; // Set volume to 70%
        audioRef.current = audio;
        audio.play().catch((error) => {
            console.error("Error playing result audio:", error);
        });
    }, []);

    const handleAnswerSelect = useCallback((optionIndex: number) => {
        if (selectedAnswer !== null || showResult || userAnswers[currentQuestionIndex] !== undefined) return; // Prevent changing answer after submission

        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setSelectedAnswer(optionIndex);

        // Save answer immediately
        const newUserAnswers = {
            ...userAnswers,
            [currentQuestionIndex]: optionIndex,
        };
        setUserAnswers(newUserAnswers);

        // Check answer immediately
        const isCorrect = optionIndex === currentQuestion?.correctAnswer;

        // Play result audio
        playResultAudio(isCorrect);

        if (isCorrect) {
            message.success("Chính xác! 🎉");
        } else {
            message.error(`Sai rồi! Đáp án đúng là: ${currentQuestion?.options[currentQuestion?.correctAnswer]?.translation}`);
        }

        // Auto move to next question or show result after 1.5 seconds
        timeoutRef.current = setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setSelectedAnswer(newUserAnswers[currentQuestionIndex + 1] ?? null);
            } else {
                // Calculate final score
                const finalScore = questions.reduce((acc, q, idx) => {
                    const userAnswer = idx === currentQuestionIndex ? optionIndex : newUserAnswers[idx];
                    return userAnswer === q.correctAnswer ? acc + 1 : acc;
                }, 0);
                setScore(finalScore);
                setShowResult(true);
            }
        }, 1500);
    }, [selectedAnswer, currentQuestionIndex, showResult, currentQuestion, questions, userAnswers, message, playResultAudio]);


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

    if (!folderId) {
        return (
            <main className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <p className="text-slate-500">Folder ID không hợp lệ</p>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Spin size="large" tip="Đang tải câu hỏi..." />
                    </div>
                </div>
            </main>
        );
    }

    if (questions.length === 0) {
        return (
            <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
                <div className="container mx-auto px-4">
                    <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có đủ từ vựng để tạo quiz.</p>
                        <Button type="primary" onClick={() => router.push(`/vocabulary/${folderId}`)}>
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <RouteErrorBoundary routeName="vocabulary">
            <ConfigProvider
                theme={{
                    algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: "#3b82f6",
                    },
                }}
            >
                <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
                <div className=" mx-auto px-4 container">
                    {/* Header & Breadcrumb */}
                    <div className="mb-8">
                        <div className="mb-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded-xl px-6 py-4 shadow-sm text-sm font-medium flex items-center flex-wrap gap-2 transition-colors">
                            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                Trang chủ
                            </Link>
                            <span className="text-slate-400 dark:text-slate-600">/</span>
                            <Link href="/vocabulary" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                Học từ vựng
                            </Link>
                            {folderName && (
                                <>
                                    <span className="text-slate-400 dark:text-slate-600">/</span>
                                    <Link href={`/vocabulary/${folderId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                                        {folderName}
                                    </Link>
                                    <span className="text-slate-400 dark:text-slate-600">/</span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">Kiểm tra</span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
                                    Kiểm tra từ vựng <span className="text-slate-400 dark:text-slate-600 font-light">|</span> {folderName}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {questions.length > 0 && !showResult
                                        ? `Câu hỏi ${currentQuestionIndex + 1} / ${questions.length}`
                                        : showResult
                                            ? `Hoàn thành: ${score}/${questions.length} câu đúng`
                                            : "Đang tải câu hỏi..."}
                                </p>
                            </div>

                            <Button
                                icon={<IoArrowBackOutline />}
                                onClick={() => router.push(`/vocabulary/${folderId}`)}
                                size="middle"
                                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                            >
                                Quay lại
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {!showResult && (
                        <div className="mb-8">
                            <Progress
                                percent={progress}
                                strokeColor={{
                                    "0%": "#3b82f6",
                                    "100%": "#8b5cf6",
                                }}
                                showInfo={false}
                                className="mb-2"
                            />
                            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </div>
                    )}

                    {/* Quiz Content */}
                    {showResult ? (
                        <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-12">
                            <Result
                                icon={<TrophyOutlined style={{ color: score >= questions.length * 0.7 ? "#f59e0b" : "#3b82f6" }} />}
                                title={
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {score >= questions.length * 0.7
                                            ? "Xuất sắc! 🎉"
                                            : score >= questions.length * 0.5
                                                ? "Tốt lắm! 👍"
                                                : "Cố gắng thêm nhé! 💪"}
                                    </span>
                                }
                                subTitle={
                                    <div className="space-y-2">
                                        <p className="text-lg text-slate-600 dark:text-slate-400">
                                            Bạn đã trả lời đúng <span className="font-bold text-blue-600 dark:text-blue-400">{score}</span> /{" "}
                                            <span className="font-bold">{questions.length}</span> câu hỏi
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-500">
                                            Tỷ lệ đúng: <span className="font-semibold">{Math.round((score / questions.length) * 100)}%</span>
                                        </p>
                                    </div>
                                }
                                extra={[
                                    <Button
                                        key="restart"
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        size="large"
                                        onClick={handleRestart}
                                        className="bg-blue-600 hover:bg-blue-700 border-0 shadow-lg shadow-blue-500/30"
                                    >
                                        Làm lại
                                    </Button>,
                                    <Button
                                        key="back"
                                        size="large"
                                        onClick={() => router.push(`/vocabulary/${folderId}`)}
                                        className="border-slate-300 dark:border-slate-600"
                                    >
                                        Quay lại danh sách
                                    </Button>,
                                ]}
                            />
                        </div>
                    ) : currentQuestion ? (
                        <div className="space-y-6">
                            {/* Question Card */}
                            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 md:p-10">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 transition-colors">
                                        Nghĩa của từ này là gì?
                                    </h2>

                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <h3 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
                                            {currentQuestion.word.content}
                                        </h3>
                                        {currentQuestion.word.audioUrl?.[0]?.url && (
                                            <Button
                                                type="text"
                                                shape="circle"
                                                icon={<SoundOutlined className="text-xl" />}
                                                size="large"
                                                onClick={() => playAudio(currentQuestion.word.audioUrl![0].url)}
                                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
                                            />
                                        )}
                                    </div>

                                    {currentQuestion.word.pronunciation && (
                                        <p className="text-xl text-slate-500 dark:text-slate-400 font-mono">
                                            /{currentQuestion.word.pronunciation}/
                                        </p>
                                    )}
                                </div>

                                {/* Answer Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                    {currentQuestion.options.map((option, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const hasSubmitted = userAnswers[currentQuestionIndex] !== undefined;
                                        const isCorrect = index === currentQuestion.correctAnswer;
                                        const isWrong = isSelected && !isCorrect && hasSubmitted;

                                        let buttonClass = "h-16 w-full text-left px-6 rounded-xl border-2 transition-all duration-200 font-medium text-base ";

                                        if (hasSubmitted) {
                                            if (isCorrect) {
                                                buttonClass += "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/20";
                                            } else if (isWrong) {
                                                buttonClass += "bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
                                            } else {
                                                buttonClass += "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400";
                                            }
                                        } else {
                                            buttonClass += isSelected
                                                ? "bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md shadow-blue-500/20"
                                                : "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 cursor-pointer";
                                        }

                                        return (
                                            <button
                                                key={option.sourceWordId}
                                                onClick={() => handleAnswerSelect(index)}
                                                disabled={hasSubmitted}
                                                className={buttonClass}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="flex-1 text-left">{option.translation}</span>
                                                    {hasSubmitted && (
                                                        <span className="ml-3">
                                                            {isCorrect ? (
                                                                <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 text-xl" />
                                                            ) : isWrong ? (
                                                                <CloseCircleOutlined className="text-rose-600 dark:text-rose-400 text-xl" />
                                                            ) : null}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between items-center">
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handlePrev}
                                    disabled={currentQuestionIndex === 0}
                                    size="large"
                                    className="h-12 px-6 border-slate-300 dark:border-slate-600"
                                >
                                    Câu trước
                                </Button>

                                <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    {currentQuestionIndex + 1} / {questions.length}
                                </span>

                                <Button
                                    onClick={handleNext}
                                    disabled={currentQuestionIndex === questions.length - 1 || selectedAnswer === null}
                                    size="large"
                                    className="h-12 px-6 bg-blue-600 hover:bg-blue-700 border-0 text-white"
                                >
                                    Câu sau
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
        </ConfigProvider>
        </RouteErrorBoundary>
    );
}
