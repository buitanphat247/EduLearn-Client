import { RagQuestion, RagTestDetail } from "@/lib/api/rag-exams";
import { ExamNavFooter } from "./ExamNavFooter";
import { ExamQuestionBody } from "./ExamQuestionBody";
import { ExamMainHeader } from "./ExamMainHeader";

type UserAnswers = Record<string, string>;

interface ExamMainProps {
  test: RagTestDetail;
  currentPage: number;
  totalQuestions: number;
  currentQuestion: RagQuestion;
  userAnswers: UserAnswers;
  isSubmitted: boolean;
  onSelectOption: (questionId: string, option: string) => void;
  onToggleFlag: (questionId: string) => void;
  onClearAnswer: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isFlagged: boolean;
}

const mainClass = "flex flex-col col-span-2 bg-white overflow-hidden";

export function ExamMain(props: ExamMainProps) {
  const {
    test,
    currentPage,
    totalQuestions,
    currentQuestion,
    userAnswers,
    isSubmitted,
    onSelectOption,
    onToggleFlag,
    onClearAnswer,
    onPrev,
    onNext,
    canPrev,
    canNext,
    isFlagged,
  } = props;

  return (
    <main className={mainClass}>
      <ExamMainHeader
        title={test.title || "Bài thi"}
        currentIndex={currentPage}
        totalQuestions={totalQuestions}
        isFlagged={isFlagged}
        isSubmitted={isSubmitted}
        onToggleFlag={() => onToggleFlag(currentQuestion.id)}
      />

      <ExamQuestionBody
        question={currentQuestion}
        questionIndex={currentPage}
        userAnswers={userAnswers}
        isSubmitted={isSubmitted}
        onSelectOption={onSelectOption}
      />

      <ExamNavFooter
        canPrev={canPrev}
        canNext={canNext}
        hasAnswer={!!userAnswers[currentQuestion.id]}
        isSubmitted={isSubmitted}
        onPrev={onPrev}
        onNext={onNext}
        onClearAnswer={onClearAnswer}
      />
    </main>
  );
}
