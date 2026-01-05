"use client";

import { memo, useCallback, useMemo } from "react";
import { Button, Input, Radio } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { OptionCardProps } from "./types";
import { ParsedMathContent } from "./ParsedMathContent";
import { hasMathPlaceholder } from "./utils";

// Memoized Option Card Component
export const OptionCard = memo<OptionCardProps>(
  ({ answer, answerIndex, questionId, partIndex, canDelete, questionType, isCorrect, correctAnswer, onUpdate, onRemove, onSelect }) => {
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

    const handleContentChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(partIndex, questionId, answerIndex, "content", e.target.value);
      },
      [partIndex, questionId, answerIndex, onUpdate]
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
          {answer.content && hasMathPlaceholder(answer.content) ? (
            <div className="text-sm leading-relaxed text-gray-700 py-1">
              <ParsedMathContent text={answer.content} />
            </div>
          ) : (
            <Input.TextArea
              value={answer.content}
              onChange={handleContentChange}
              placeholder="Nhập nội dung đáp án..."
              bordered={false}
              autoSize={{ minRows: 1, maxRows: 5 }}
              className="shadow-none px-0 bg-transparent hover:bg-transparent focus:bg-transparent resize-none! text-sm leading-5 py-0"
              style={{ padding: 0, height: "auto", minHeight: "auto", maxHeight: "none" }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
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

