import { ReactNode } from "react";
import { Button } from "antd";
import { RagTestDetail } from "@/lib/api/rag-exams";
import { SidebarStatCard } from "./SidebarStatCard";

type UserAnswers = Record<string, string>;

const STAT_CARD_ICON_PROPS = {
  className: "w-5 h-5",
  fill: "none" as const,
  stroke: "currentColor",
  viewBox: "0 0 24 24",
};

interface StatCardConfig {
  key: string;
  title: string;
  iconWrapperClassName: string;
  iconPathD: string;
  valueClassName: string;
  renderValue: (ctx: {
    answeredCount: number;
    totalQuestions: number;
    progressPercent: number;
    flaggedCount: number;
    violationCount: number;
    maxViolations: number;
  }) => ReactNode;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "progress",
    title: "Tiến độ",
    iconWrapperClassName: "bg-indigo-100 text-indigo-600",
    iconPathD: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    valueClassName: "text-indigo-600",
    renderValue: (ctx) => (
      <>
        {ctx.answeredCount}/{ctx.totalQuestions}
        <span className="text-base text-slate-400 font-medium ml-1">
          ({ctx.progressPercent}%)
        </span>
      </>
    ),
  },
  {
    key: "flagged",
    title: "Gắn cờ",
    iconWrapperClassName: "bg-red-100 text-red-500",
    iconPathD: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
    valueClassName: "text-red-500",
    renderValue: (ctx) => (
      <>
        {ctx.flaggedCount}
        <span className="text-base text-slate-400 font-medium ml-1">câu</span>
      </>
    ),
  },
  {
    key: "violations",
    title: "Gian lận",
    iconWrapperClassName: "bg-amber-100 text-amber-600",
    iconPathD: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    valueClassName: "text-amber-600",
    renderValue: (ctx) => (
      <>
        <span className="tabular-nums font-semibold">{ctx.violationCount}</span>
        <span className="tabular-nums font-semibold mx-0.5 text-amber-600">/</span>
        <span className="tabular-nums font-semibold">{ctx.maxViolations}</span>
        <span className="text-base text-slate-400 font-medium ml-1">lần</span>
      </>
    ),
  },
];

interface ExamSidebarProps {
  test: RagTestDetail;
  currentPage: number;
  remainingSeconds: number | null;
  progressPercent: number;
  /** 0–100: phần trăm thời gian đã trôi (để thanh trong card đồng hồ chạy) */
  timeProgressPercent?: number;
  answeredCount: number;
  flaggedCount: number;
  violationCount: number;
  userAnswers: UserAnswers;
  flaggedQuestions: Set<string>;
  isSubmitted: boolean;
  /** Socket đã kết nối server (đồng hồ sync từ server). Khi false có thể hiện nút Đồng bộ lại */
  socketConnected?: boolean;
  onReconnect?: () => void;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
}

export function ExamSidebar(props: ExamSidebarProps) {
  const {
    test,
    currentPage,
    remainingSeconds,
    progressPercent,
    timeProgressPercent = 0,
    answeredCount,
    flaggedCount,
    violationCount,
    userAnswers,
    flaggedQuestions,
    isSubmitted,
    socketConnected = true,
    onReconnect,
    onSelectQuestion,
    onSubmit,
  } = props;

  return (
    <aside className="flex flex-col overflow-y-auto p-6 gap-5 border-l border-slate-200/80">
      {/* Đồng hồ */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Thời gian còn lại
        </p>
        <div className="flex items-baseline justify-center gap-1 tabular-nums">
          <span className="text-4xl font-bold text-slate-800">
            {Math.max(0, Math.floor((remainingSeconds ?? test.duration_minutes * 60) / 60))}
          </span>
          <span className="text-2xl font-bold text-slate-300 mx-1">:</span>
          <span className="text-4xl font-bold text-slate-800">
            {Math.max(0, (remainingSeconds ?? 0) % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
            style={{ width: `${timeProgressPercent}%` }}
          />
        </div>
        {!socketConnected && onReconnect && (
          <button
            type="button"
            onClick={onReconnect}
            className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 underline"
          >
            Đồng bộ lại đồng hồ
          </button>
        )}
      </div>

      {/* Cảnh báo hệ thống */}
      <div
        className="rounded-3xl p-4 shadow-md flex items-start gap-3"
        style={{ backgroundColor: "#a78bfa" }}
      >
        <div
          className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            style={{ color: "#fef08a" }}
          >
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.83V16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.17A7 7 0 0 0 12 2Z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "#ffffff" }}
          >
            Cảnh báo hệ thống
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Hệ thống sẽ tự động <span style={{ fontWeight: 600, color: "#ffffff" }}>nộp bài</span> khi hết thời gian,
            bạn vẫn có thể chủ động bấm nút bên dưới để nộp sớm.
          </p>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        {STAT_CARDS.map((card) => (
          <SidebarStatCard
            key={card.key}
            title={card.title}
            iconWrapperClassName={card.iconWrapperClassName}
            icon={
              <svg {...STAT_CARD_ICON_PROPS} aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={card.iconPathD}
                />
              </svg>
            }
            value={
              <span className={card.valueClassName}>
                {card.renderValue({
                  answeredCount,
                  totalQuestions: test.questions.length,
                  progressPercent,
                  flaggedCount,
                  violationCount,
                  maxViolations: test.max_violations ?? 3,
                })}
              </span>
            }
          />
        ))}
      </div>

      {/* Grid câu hỏi */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-700">Danh sách câu hỏi</h3>
          <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
              Xong
            </span>
            <span className="flex items-center gap-1">
              <span
                className="h-2 w-2 shrink-0 rounded-full border border-red-400"
                style={{ backgroundColor: "#ef4444" }}
              />
              Cờ
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="grid grid-cols-5 gap-3">
            {test.questions.map((q, idx) => {
              const answered = !!userAnswers[q.id];
              const flagged = flaggedQuestions.has(q.id);
              const active = idx === currentPage;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelectQuestion(idx)}
                  className={`
                    rounded-2xl px-4 py-2 text-sm font-semibold transition-all border-2
                    focus:outline-none focus-visible:ring-0
                    ${active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : flagged
                        ? "border-red-400 bg-red-50 text-red-500"
                        : answered
                          ? "border-slate-200 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
                    }
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nút nộp bài */}
      <div className="mt-auto pt-2">
        <Button
          type="primary"
          size="large"
          onClick={onSubmit}
          disabled={isSubmitted}
          className="w-full bg-orange-500! border-orange-500! hover:bg-orange-600! hover:border-orange-600! font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20"
        >
          {isSubmitted ? "Bài thi đã được nộp" : "NỘP BÀI THI NGAY"}
        </Button>
      </div>
    </aside>
  );
}

