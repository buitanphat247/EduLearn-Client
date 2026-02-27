"use client";

import { memo, useCallback, useMemo } from "react";
import { Button, Input, Radio } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { OptionCardProps } from "./types";
import { ParsedMathContent } from "./ParsedMathContent";

// Memoized Option Card Component
export const OptionCard = memo<OptionCardProps>(
  ({ answer, answerIndex, questionId, partIndex, canDelete, questionType, isCorrect, correctAnswer, onUpdate, onRemove, onSelect, onMathClick, mathData }) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (
          questionType === "multiple_choice" &&
          !(e.target as HTMLElement).closest(".delete-option-btn") &&
          !(e.target as HTMLElement).closest(".true-false-radio")
        ) {
          if (!isCorrect) {
            onSelect(partIndex, questionId, answerIndex);
          }
        }
      },
      [isCorrect, partIndex, questionId, answerIndex, questionType, onSelect]
    );


    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(partIndex, questionId, answerIndex);
      },
      [partIndex, questionId, answerIndex, onRemove]
    );

    const handleTrueFalseChange = useCallback(
      (e: any) => {
        // For true_false type, toggle the correct_answer
        onSelect(partIndex, questionId, answerIndex);
      },
      [partIndex, questionId, answerIndex, onSelect]
    );

    // Get true/false value from correct_answer
    const trueFalseValue = useMemo(() => {
      if (questionType === "true_false" && correctAnswer) {
        const isTrue = correctAnswer[answer.key] === true;
        return isTrue ? "true" : "false";
      }
      return null;
    }, [questionType, correctAnswer, answer.key]);

    return (
      <div
        className={`flex items-center gap-1.5 px-1.5 py-1 rounded border transition-all ${
          questionType === "multiple_choice" ? "cursor-pointer" : ""
        } ${questionType === "multiple_choice" && isCorrect ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
        onClick={handleClick}
      >
        <div
          className={`w-6 h-6 rounded flex items-center justify-center font-semibold text-xs text-gray-700 shrink-0 ${
            questionType === "multiple_choice" && isCorrect ? "bg-blue-500 text-white" : "bg-gray-100"
          } transition-colors`}
        >
          {answer.key}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="text-sm leading-relaxed text-gray-700 py-1">
            <ParsedMathContent text={answer.content || ""} onMathClick={onMathClick} mathData={mathData} />
          </div>
        </div>
        {questionType === "true_false" && (
          <div className="true-false-radio shrink-0" onClick={(e) => e.stopPropagation()}>
            <Radio.Group value={trueFalseValue} onChange={handleTrueFalseChange}>
              <Radio value="true">Đúng</Radio>
              <Radio value="false">Sai</Radio>
            </Radio.Group>
          </div>
        )}
        {canDelete && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              className="delete-option-btn w-6 h-6 p-0 flex items-center justify-center"
            />
          </div>
        )}
      </div>
    );
  }
);

OptionCard.displayName = "OptionCard";

