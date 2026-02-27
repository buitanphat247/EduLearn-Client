"use client";

import { memo, useCallback } from "react";
import { Button } from "antd";
import { SaveOutlined, SettingOutlined, FullscreenOutlined, CodeOutlined } from "@ant-design/icons";
import { LatexEditorProps } from "./types";

// Memoized LaTeX Editor Component
export const LatexEditor = memo<LatexEditorProps>(
  ({
    latexSource,
    latexLines,
    totalLines,
    onLatexChange,
    lineNumbersRef,
    textareaRef,
    onLineNumbersScroll,
    onTextareaScroll,
    onCursorChange,
    onMathSelect,
  }) => {
    const handleLatexChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onLatexChange(e.target.value);
        if (onCursorChange) {
          const currentValue = e.target.value;
          const selectionStart = e.target.selectionStart;
          const lineNumber = currentValue.substring(0, selectionStart).split("\n").length;
          onCursorChange(lineNumber);
        }
      },
      [onLatexChange, onCursorChange]
    );

    const handleCursorMove = useCallback(
      (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const currentValue = textarea.value;
        const selectionStart = textarea.selectionStart;

        // 1. Line Sync
        if (onCursorChange) {
          const lineNumber = currentValue.substring(0, selectionStart).split("\n").length;
          onCursorChange(lineNumber);
        }

        // 2. Math Click Detection
        if (onMathSelect && e.type === "click") {
          const textLeft = currentValue.slice(0, selectionStart);
          const textRight = currentValue.slice(selectionStart);

          // Check for [:$key$]
          // We look backwards for "[:$" and forwards for "$]"
          const lastOpen = textLeft.lastIndexOf("[:$");

          if (lastOpen !== -1) {
            // Ensure we haven't encountered a closing "$]" since the opening "[:$" (which would mean we are outside)
            const textAfterOpen = textLeft.slice(lastOpen);
            if (textAfterOpen.indexOf("$]") === -1) {
              // We are potentially inside. Look for closest closing "$]"
              const nextClose = textRight.indexOf("$]");
              if (nextClose !== -1) {
                // Check for any nested openers that might invalidate this being a simple token
                const textInBetween = textRight.slice(0, nextClose);
                if (textInBetween.indexOf("[:$") === -1) {
                  // Valid match found: [:$...$]
                  const key = textAfterOpen.slice(3) + textInBetween;

                  // Check requirement: "có tên biến mathm"
                  if (key.startsWith("mathm")) {
                    onMathSelect(key, true);
                    return;
                  }
                }
              }
            }
          }
        }
      },
      [onCursorChange, onMathSelect]
    );

    return (
      <div className="h-full overflow-hidden flex flex-col">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
            <div className="flex items-center gap-2">
              <CodeOutlined className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">&lt;&gt; LATEX SOURCE</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="text" size="small" icon={<SaveOutlined />} />
              <Button type="text" size="small" icon={<SettingOutlined />} />
              <Button type="text" size="small" icon={<FullscreenOutlined />} />
            </div>
          </div>
          <div className="relative bg-white text-gray-800 font-mono text-xs flex-1 overflow-hidden flex border-t border-gray-200">
            <div
              ref={lineNumbersRef}
              onScroll={onLineNumbersScroll}
              className="bg-gray-50 text-gray-600 px-3 py-2 text-right select-none border-r border-gray-200 shrink-0 overflow-y-auto no-scrollbar"
              style={{ maxHeight: "100%" }}
            >
              {latexLines.map((_, index) => (
                <div key={index} className="leading-6">
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden bg-white relative">
              <textarea
                ref={textareaRef}
                onScroll={onTextareaScroll}
                value={latexSource}
                onChange={handleLatexChange}
                onClick={handleCursorMove}
                onKeyUp={handleCursorMove}
                onSelect={handleCursorMove}
                className="absolute inset-0 w-full h-full p-2 m-0 font-mono text-xs text-gray-800 bg-white border-none outline-none resize-none leading-6 custom-scrollbar overflow-y-auto whitespace-pre-wrap break-words"
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 shrink-0">
            <div className="flex items-center gap-4">
              <span>Line {totalLines}, Column 1</span>
              <span>UTF-8</span>
              <span>LaTeX</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LatexEditor.displayName = "LatexEditor";
