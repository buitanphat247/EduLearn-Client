"use client";

import { memo, useCallback } from "react";
import { Button } from "antd";
import { SaveOutlined, SettingOutlined, FullscreenOutlined, CodeOutlined } from "@ant-design/icons";
import { LatexEditorProps } from "./types";

// Memoized LaTeX Editor Component
export const LatexEditor = memo<LatexEditorProps>(
  ({ latexSource, latexLines, totalLines, onLatexChange, lineNumbersRef, textareaRef, onLineNumbersScroll, onTextareaScroll }) => {
    const handleLatexChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onLatexChange(e.target.value);
      },
      [onLatexChange]
    );

    return (
      <div className="h-full overflow-y-auto flex flex-col">
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
              className="bg-gray-50 text-gray-600 px-3 py-2 text-right select-none border-r border-gray-200 shrink-0 overflow-y-auto custom-scrollbar"
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
                className="absolute inset-0 w-full h-full p-2 m-0 font-mono text-xs text-gray-800 bg-white border-none outline-none resize-none leading-6 custom-scrollbar overflow-y-auto"
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

