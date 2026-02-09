interface ExamMainHeaderProps {
  title: string;
  currentIndex: number;
  totalQuestions: number;
  isFlagged: boolean;
  isSubmitted: boolean;
  onToggleFlag: () => void;
}

const headerRootClass =
  "flex items-center justify-between px-8 py-4 border-b border-slate-200/80 shrink-0";
const paginationClass = "text-sm text-slate-500 font-medium";
const flagBtnBaseClass =
  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors";
const flagBtnActiveClass = "border-amber-400 text-amber-600 bg-amber-50";
const flagBtnInactiveClass =
  "border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-600";
const flagBtnDisabledClass = "opacity-40 pointer-events-none";

export function ExamMainHeader({
  currentIndex,
  totalQuestions,
  isFlagged,
  isSubmitted,
  onToggleFlag,
}: ExamMainHeaderProps) {
  return (
    <header className={headerRootClass}>
      <div className="flex items-center gap-3">
        <span className={paginationClass}>
          Câu {currentIndex + 1} / {totalQuestions}
        </span>
      </div>
      <button
        type="button"
        className={`${flagBtnBaseClass} ${
          isFlagged ? flagBtnActiveClass : flagBtnInactiveClass
        } ${isSubmitted ? flagBtnDisabledClass : ""}`}
        onClick={() => !isSubmitted && onToggleFlag()}
        disabled={isSubmitted}
      >
        {isFlagged ? "Bỏ gắn cờ" : "Gắn cờ"}
      </button>
    </header>
  );
}
