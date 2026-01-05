"use client";

import { memo, useCallback, useMemo } from "react";
import { Button, Input, Select, Tag } from "antd";
import { FileTextOutlined, InfoCircleOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import CustomCard from "@/app/components/common/CustomCard";
import { QuestionCardProps } from "./types";
import { OptionCard } from "./OptionCard";
import { ParsedMathContent } from "./ParsedMathContent";
import { getQuestionType, hasMathPlaceholder } from "./utils";

// Memoized Question Card Component
export const QuestionCard = memo<QuestionCardProps>(
  ({ question, partIndex, partName, questionIndex, onUpdate, onDelete, onAddAnswer, onUpdateAnswer, onRemoveAnswer, onSelectAnswer }) => {
    const handleQuestionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(partIndex, question.id, "question", e.target.value);
      },
      [partIndex, question.id, onUpdate]
    );

    const handleDelete = useCallback(() => {
      onDelete(partIndex, question.id);
    }, [partIndex, question.id, onDelete]);

    const handleAddAnswer = useCallback(() => {
      onAddAnswer(partIndex, question.id);
    }, [partIndex, question.id, onAddAnswer]);

    const handleSelectAnswer = useCallback(
      (answerIndex: number) => {
        onSelectAnswer(partIndex, question.id, answerIndex);
      },
      [partIndex, question.id, onSelectAnswer]
    );

    // Determine question type from part name
    const questionType = useMemo(() => {
      return getQuestionType(partName);
    }, [partName]);

    const getTypeLabel = useCallback(() => {
      switch (questionType) {
        case "multiple_choice":
          return "Trắc nghiệm";
        case "true_false":
          return "Đúng/Sai";
        case "fill_blank":
          return "Tự luận";
        default:
          return "Trắc nghiệm";
      }
    }, [questionType]);

    const getTypeColor = useCallback(() => {
      switch (questionType) {
        case "multiple_choice":
          return "blue";
        case "true_false":
          return "orange";
        case "fill_blank":
          return "green";
        default:
          return "blue";
      }
    }, [questionType]);

    // Get current correct answer key for multiple choice
    const currentCorrectAnswer = useMemo(() => {
      if (questionType === "multiple_choice") {
        const correctKey = Object.keys(question.correct_answer).find(
          (key) => question.correct_answer[key] === true
        );
        return correctKey || undefined;
      }
      return undefined;
    }, [questionType, question.correct_answer]);

    // Handle correct answer selection from dropdown
    const handleCorrectAnswerChange = useCallback(
      (value: string) => {
        // Find answer index by key
        const answerIndex = question.answers.findIndex((ans) => ans.key === value);
        if (answerIndex !== -1) {
          onSelectAnswer(partIndex, question.id, answerIndex);
        }
      },
      [partIndex, question.id, question.answers, onSelectAnswer]
    );

    // Generate options for Select dropdown - chỉ hiển thị A, B, C, D
    const answerOptions = useMemo(() => {
      return question.answers.map((answer) => {
        return {
          value: answer.key,
          label: answer.key,
        };
      });
    }, [question.answers]);

    // Render answers based on question type
    const renderAnswers = () => {
      if (questionType === "true_false") {
        // True/False: Multiple answers with Đúng/Sai radio buttons
        return (
          <>
            <div className="space-y-2">
              {question.answers.map((answer, answerIndex) => {
                const isCorrect = question.correct_answer[answer.key] === true;
                return (
                  <OptionCard
                    key={answerIndex}
                    answer={answer}
                    answerIndex={answerIndex}
                    questionId={question.id}
                    partIndex={partIndex}
                    canDelete={question.answers.length > 2}
                    questionType={questionType}
                    isCorrect={isCorrect}
                    correctAnswer={question.correct_answer}
                    onUpdate={onUpdateAnswer}
                    onRemove={onRemoveAnswer}
                    onSelect={onSelectAnswer}
                  />
                );
              })}
            </div>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddAnswer} className="w-full mt-3">
              + Thêm câu hỏi
            </Button>
          </>
        );
      } else if (questionType === "fill_blank") {
        // Fill blank: Single input for answer
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án đúng:</label>
            {question.answers[0]?.content && hasMathPlaceholder(question.answers[0].content) ? (
              <div className="text-sm leading-relaxed text-gray-700 py-2">
                <ParsedMathContent text={question.answers[0].content} />
              </div>
            ) : (
              <Input
                value={question.answers[0]?.content || ""}
                onChange={(e) => onUpdateAnswer(partIndex, question.id, 0, "content", e.target.value)}
                placeholder="Nhập đáp án..."
                className="w-full"
              />
            )}
          </div>
        );
      } else {
        // Multiple choice: Default behavior
        return (
          <>
            <div className="grid grid-cols-1 gap-2">
              {question.answers.map((answer, answerIndex) => {
                const isCorrect = question.correct_answer[answer.key] === true;
                return (
                  <OptionCard
                    key={answerIndex}
                    answer={answer}
                    answerIndex={answerIndex}
                    questionId={question.id}
                    partIndex={partIndex}
                    canDelete={question.answers.length > 2}
                    questionType={questionType}
                    isCorrect={isCorrect}
                    correctAnswer={question.correct_answer}
                    onUpdate={onUpdateAnswer}
                    onRemove={onRemoveAnswer}
                    onSelect={onSelectAnswer}
                  />
                );
              })}
            </div>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddAnswer} className="w-full mt-3">
              + Thêm đáp án
            </Button>
          </>
        );
      }
    };

    return (
      <CustomCard key={question.id} padding="md" className="border-l-4 border-l-blue-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag color="blue" className="px-3 py-1 text-sm font-semibold">
                Câu {questionIndex + 1}
              </Tag>
              <Tag color={getTypeColor()} className="px-3 py-1 text-sm">
                {getTypeLabel()}
              </Tag>
            </div>
            <div className="flex items-center gap-2">
              {questionType === "multiple_choice" && (
                <Select
                  value={currentCorrectAnswer}
                  onChange={handleCorrectAnswerChange}
                  placeholder="A"
                  size="small"
                  style={{ width: 80 }}
                  options={answerOptions}
                />
              )}
              <Button type="text" icon={<FileTextOutlined />} size="small" />
              <Button type="text" icon={<InfoCircleOutlined />} size="small" />
              <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={handleDelete} />
            </div>
          </div>
          <div>
            {question.question && hasMathPlaceholder(question.question) ? (
              <div className="text-base leading-relaxed text-gray-700 py-2">
                <ParsedMathContent text={question.question} />
              </div>
            ) : (
              <Input.TextArea value={question.question} onChange={handleQuestionChange} placeholder="Nhập câu hỏi..." rows={3} className="text-base" />
            )}
            {question.picture && (
              <div className="mt-3">
                <img 
                  src={question.picture} 
                  alt="Question illustration" 
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            )}
          </div>
          <div>{renderAnswers()}</div>
        </div>
      </CustomCard>
    );
  }
);

QuestionCard.displayName = "QuestionCard";

