import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface ExamNavFooterProps {
  canPrev: boolean;
  canNext: boolean;
  hasAnswer: boolean;
  isSubmitted: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClearAnswer: () => void;
}

const footerRootClass =
  "flex items-center justify-between px-8 py-4 border-t border-slate-200/80 shrink-0 bg-white";
const navBtnClass = "rounded-xl font-semibold shadow-md";
const clearBtnClass = "rounded-xl font-semibold";

export function ExamNavFooter({
  canPrev,
  canNext,
  hasAnswer,
  isSubmitted,
  onPrev,
  onNext,
  onClearAnswer,
}: ExamNavFooterProps) {
  return (
    <footer className={footerRootClass}>
      <Button
        type="primary"
        icon={<LeftOutlined />}
        onClick={onPrev}
        disabled={!canPrev}
        size="large"
        className={navBtnClass}
      >
        Câu trước
      </Button>
      <div className="flex items-center gap-3">
        <Button
          onClick={onClearAnswer}
          disabled={isSubmitted || !hasAnswer}
          size="large"
          className={clearBtnClass}
        >
          Bỏ chọn
        </Button>
        <Button
          type="primary"
          icon={<RightOutlined />}
          iconPlacement="end"
          onClick={onNext}
          disabled={!canNext}
          size="large"
          className={navBtnClass}
        >
          Câu tiếp theo
        </Button>
      </div>
    </footer>
  );
}
