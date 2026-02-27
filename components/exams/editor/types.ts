// Exam Editor Types and Interfaces

export interface Answer {
  key: string;
  content: string;
}

export interface QuestionItem {
  id: string;
  question: string;
  answers: Answer[];
  correct_answer: Record<string, boolean>; // e.g., { A: true, B: false, C: false, D: false }
  picture?: string; // URL của hình ảnh nếu có
}

export interface PartData {
  name: string;
  questions: QuestionItem[];
}

export type QuestionType = "multiple_choice" | "true_false" | "fill_blank";

// Legacy interface for backward compatibility (will be removed)
export interface Question {
  id: string;
  part: string;
  type: QuestionType;
  points: number;
  question: string;
  options: { label: string; text: string; isCorrect: boolean; trueFalse?: "true" | "false" | null }[];
  answer?: string;
}

export interface OptionCardProps {
  answer: Answer;
  answerIndex: number;
  questionId: string;
  partIndex: number;
  canDelete: boolean;
  questionType: QuestionType;
  isCorrect: boolean;
  correctAnswer?: Record<string, boolean>; // For true_false type
  onUpdate: (partIndex: number, questionId: string, answerIndex: number, field: string, value: any) => void;
  onRemove: (partIndex: number, questionId: string, answerIndex: number) => void;
  onSelect: (partIndex: number, questionId: string, answerIndex: number) => void;
  onMathClick?: (key: string, isRaw: boolean) => void;
  mathData?: Record<string, string>;
}

export interface QuestionCardProps {
  question: QuestionItem;
  partIndex: number;
  partName: string;
  questionIndex: number;
  onUpdate: (partIndex: number, questionId: string, field: keyof QuestionItem, value: any) => void;
  onDelete: (partIndex: number, questionId: string) => void;
  onAddAnswer: (partIndex: number, questionId: string) => void;
  onUpdateAnswer: (partIndex: number, questionId: string, answerIndex: number, field: string, value: any) => void;
  onRemoveAnswer: (partIndex: number, questionId: string, answerIndex: number) => void;
  onSelectAnswer: (partIndex: number, questionId: string, answerIndex: number) => void;
  onMathClick?: (key: string, isRaw: boolean) => void;
  mathData?: Record<string, string>;
}

export interface GeneralConfigProps {
  timeMinutes: number;
  maxScore: number;
  totalQuestions: number;
  status: string;
  onTimeChange: (value: number | null) => void;
  onMaxScoreChange: (value: number | null) => void;
  onTotalQuestionsChange: (value: number | null) => void;
  onStatusChange: (value: string) => void;
}

export interface LatexEditorProps {
  latexSource: string;
  latexLines: string[];
  totalLines: number;
  onLatexChange: (value: string) => void;
  lineNumbersRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onLineNumbersScroll: () => void;
  onTextareaScroll: () => void;
  onCursorChange?: (lineNumber: number) => void;
  onMathSelect?: (key: string, isKey: boolean) => void;
}
