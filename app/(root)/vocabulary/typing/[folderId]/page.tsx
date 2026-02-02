"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { App, Button, ConfigProvider, theme, Progress, Result, Spin, Input } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SoundOutlined,
    ArrowLeftOutlined,
    TrophyOutlined,
    ReloadOutlined,
    EnterOutlined
} from "@ant-design/icons";
import { getVocabulariesByFolder, type VocabularyResponse } from "@/lib/api/vocabulary";
import { IoArrowBackOutline } from "react-icons/io5";
import { useTheme } from "@/app/context/ThemeContext";

interface TypingQuestion {
    id: number;
    word: VocabularyResponse;
    sentence: string; // Câu ví dụ hoặc từ đơn
}

export default function VocabularyTyping() {
    const { message } = App.useApp();
    const router = useRouter();
    const params = useParams();
    const folderId = params?.folderId ? parseInt(params.folderId as string, 10) : null;
    const { theme: currentTheme } = useTheme();

    const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<TypingQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [userAnswers, setUserAnswers] = useState<Record<number, { answer: string; isCorrect: boolean }>>({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const inputRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastQuestionIdRef = useRef<number | null>(null);

    // Parse example để lấy câu
    const parseExample = useCallback((exampleStr: string) => {
        try {
            if (!exampleStr) return null;
            const parsed = JSON.parse(exampleStr);
            return parsed.content || "";
        } catch {
            return null;
        }
    }, []);

    // Generate typing questions
    const generateQuestions = useCallback((vocabs: VocabularyResponse[]) => {
        const questionCount = Math.min(10, vocabs.length);
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
        const selectedVocabs = shuffled.slice(0, questionCount);

        const newQuestions: TypingQuestion[] = selectedVocabs.map((vocab, index) => {
            // Ưu tiên dùng example sentence, nếu không có thì dùng từ đơn
            const example = parseExample(vocab.example);
            const sentence = example || vocab.content;

            return {
                id: index + 1,
                word: vocab,
                sentence: sentence,
            };
        });

        setQuestions(newQuestions);
        // Reset last question ID when questions are regenerated
        lastQuestionIdRef.current = null;
    }, [parseExample]);

    const fetchVocabularies = useCallback(async () => {
        if (!folderId) return;

        setLoading(true);
        try {
            const data = await getVocabulariesByFolder(folderId);
            setVocabularies(data);

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
    }, [folderId, message, generateQuestions]);

    useEffect(() => {
        if (folderId) {
            fetchVocabularies();
        }
    }, [folderId, fetchVocabularies]);

    // Focus input when question changes
    useEffect(() => {
        if (inputRef.current && !showResult) {
            inputRef.current.focus();
        }
    }, [currentQuestionIndex, showResult]);

    const folderName = useMemo(() => vocabularies[0]?.folder?.folderName || "", [vocabularies]);
    const currentQuestion = useMemo(
        () => questions[currentQuestionIndex] || null,
        [questions, currentQuestionIndex]
    );

    // Generate placeholder pattern: "i love you" -> "_ ___ ___"
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
        
        // Stop previous audio if exists
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
        
        // Clean up when audio ends
        audio.addEventListener('ended', () => {
            audioRef.current = null;
        });
    }, [message]);

    const playResultAudio = useCallback((isCorrect: boolean) => {
        const audioPath = isCorrect ? "/audio/true.mp3" : "/audio/false.mp3";
        const audio = new Audio(audioPath);
        audio.volume = 0.7;
        audio.play().catch((error) => {
            console.error("Error playing result audio:", error);
        });
    }, []);

    // Normalize text for comparison (lowercase, trim, remove extra spaces)
    const normalizeText = useCallback((text: string) => {
        return text.toLowerCase().trim().replace(/\s+/g, " ");
    }, []);

    const handleCheck = useCallback(() => {
        if (!currentQuestion || !userInput.trim() || isChecking) return;

        setIsChecking(true);
        const normalizedInput = normalizeText(userInput);
        const normalizedTarget = normalizeText(currentQuestion.sentence);

        const isCorrect = normalizedInput === normalizedTarget;

        // Save answer
        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: {
                answer: userInput,
                isCorrect,
            },
        }));

        // Play result audio
        playResultAudio(isCorrect);

        // Show message
        if (isCorrect) {
            message.success("Chính xác! 🎉");
        } else {
            message.error(`Sai rồi! Đáp án đúng là: "${currentQuestion.sentence}"`);
        }

        // Auto advance after delay
        setTimeout(() => {
            setIsChecking(false);
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setUserInput(userAnswers[currentQuestionIndex + 1]?.answer || "");
            } else {
                // Calculate final score
                const finalScore = questions.reduce((acc, q, idx) => {
                    const userAnswer = idx === currentQuestionIndex ? { answer: userInput, isCorrect } : userAnswers[idx];
                    return userAnswer?.isCorrect ? acc + 1 : acc;
                }, 0);
                setScore(finalScore);
                setShowResult(true);
            }
        }, 1500);
    }, [currentQuestion, userInput, isChecking, currentQuestionIndex, questions, userAnswers, message, playResultAudio, normalizeText]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !isChecking) {
            handleCheck();
        }
    }, [handleCheck, isChecking]);

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
            // Stop any playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
            // Reset last question ID
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

    // Auto play audio when question changes (only if question ID actually changed)
    useEffect(() => {
        // Don't play if still loading or no questions yet
        if (loading || questions.length === 0) {
            return;
        }

        // Only play if we have a valid question and it's different from the last one
        if (!currentQuestion || currentQuestion.id === lastQuestionIdRef.current) {
            return;
        }

        // Update the last question ID immediately to prevent duplicate plays
        const questionId = currentQuestion.id;
        lastQuestionIdRef.current = questionId;

        // Stop previous audio if exists
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }

        // Play new audio after a small delay to ensure previous audio is stopped
        if (currentQuestion.word?.audioUrl?.[0]?.url) {
            const timeoutId = setTimeout(() => {
                // Triple check: still on the same question, not loading, and questions are ready
                if (lastQuestionIdRef.current === questionId && !loading && questions.length > 0) {
                    const audio = new Audio(currentQuestion.word.audioUrl![0].url);
                    audioRef.current = audio;
                    audio.play().catch((error) => {
                        console.error("Error auto-playing audio:", error);
                    });
                    
                    // Clean up when audio ends
                    audio.addEventListener('ended', () => {
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

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [currentQuestion, loading, questions.length]);

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
                        <div className="text-center">
                            <Spin size="large" tip="Đang tải câu hỏi..." />
                        </div>
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
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có đủ từ vựng để luyện tập.</p>
                        <Button type="primary" onClick={() => router.push(`/vocabulary/${folderId}`)}>
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    const hasSubmitted = userAnswers[currentQuestionIndex] !== undefined;
    const isCorrect = userAnswers[currentQuestionIndex]?.isCorrect;

    return (
        <ConfigProvider
            theme={{
                algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#3b82f6",
                },
            }}
        >
            <main className="h-full bg-slate-50 dark:bg-[#0f172a] py-8 text-slate-800 dark:text-slate-200 transition-colors duration-500">
                <div className="mx-auto px-4 container">
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
                                    <span className="text-slate-600 dark:text-slate-300 font-medium">Gõ từ</span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors">
                                    Gõ từ vựng <span className="text-slate-400 dark:text-slate-600 font-light">|</span> {folderName}
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

                    {/* Typing Content */}
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
                                {/* Word Info */}
                                <div className="text-center mb-8">
                                    {/* Translation & POS */}
                                    <div className="space-y-4 mb-6">
                                        <p className="text-3xl font-bold text-slate-800 dark:text-white">
                                            {currentQuestion.word.translation}
                                        </p>
                                        <div className="flex items-center justify-center gap-3 flex-wrap">
                                            {currentQuestion.word.pos && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-wide border border-purple-200 dark:border-purple-500/30">
                                                    {currentQuestion.word.pos}
                                                </span>
                                            )}
                                            {currentQuestion.word.pronunciation && (
                                                <span className="text-lg text-slate-500 dark:text-slate-400 font-mono">
                                                    /{currentQuestion.word.pronunciation}/
                                                </span>
                                            )}
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
                                    </div>
                                </div>

                                {/* Placeholder Pattern */}
                                <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <p className="text-center text-lg text-slate-400 dark:text-slate-500 font-mono tracking-widest mb-2">
                                        {placeholder}
                                    </p>
                                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic">
                                        Gõ câu hoàn chỉnh
                                    </p>
                                </div>

                                {/* Input Field */}
                                <div className="space-y-4">
                                    <Input
                                        ref={inputRef}
                                        size="large"
                                        placeholder="Nhập câu của bạn..."
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={hasSubmitted || isChecking}
                                        className={`text-lg h-14 ${
                                            hasSubmitted
                                                ? isCorrect
                                                    ? "!border-emerald-500 !bg-emerald-50 dark:!bg-emerald-500/20"
                                                    : "!border-rose-500 !bg-rose-50 dark:!bg-rose-500/20"
                                                : ""
                                        }`}
                                        suffix={
                                            hasSubmitted ? (
                                                isCorrect ? (
                                                    <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400 text-xl" />
                                                ) : (
                                                    <CloseCircleOutlined className="text-rose-600 dark:text-rose-400 text-xl" />
                                                )
                                            ) : (
                                                <EnterOutlined className="text-slate-400 text-lg" />
                                            )
                                        }
                                    />

                                    {hasSubmitted && !isCorrect && (
                                        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/30">
                                            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-1">
                                                Đáp án đúng:
                                            </p>
                                            <p className="text-base text-rose-700 dark:text-rose-300 font-semibold">
                                                {currentQuestion.sentence}
                                            </p>
                                        </div>
                                    )}

                                    {hasSubmitted && isCorrect && (
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                                                <CheckCircleOutlined /> Chính xác!
                                            </p>
                                        </div>
                                    )}
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
                                    disabled={currentQuestionIndex === questions.length - 1 || !hasSubmitted}
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
    );
}
