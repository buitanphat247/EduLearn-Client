"use client";

import { memo, useMemo } from "react";
import { MATH_DATA, MATH_PLACEHOLDER_REGEX } from "./constants";
import { renderKaTeX, stripBoldTags } from "./utils";
import { sanitizeForDisplay } from "@/lib/utils/sanitize";
import "katex/dist/katex.min.css";

interface ParsedMathContentProps {
  text: string;
  mathData?: Record<string, string>;
  onMathClick?: (key: string, isRaw: boolean) => void;
}

// Memoized component for parsed math content
export const ParsedMathContent = memo<ParsedMathContentProps>(({ text, mathData = MATH_DATA, onMathClick }) => {
  const parsedContent = useMemo(() => {
    if (!text) return [];

    const regex = new RegExp(MATH_PLACEHOLDER_REGEX.source, "g");
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }

      // Replace placeholder with KaTeX or HTML
      const placeholderKey = match[1];
      const rawLatex = match[2];
      const uniqueKey = `math-${placeholderKey || "raw"}-${keyCounter++}`;

      if (placeholderKey) {
        let mathValue = mathData[placeholderKey];
        if (mathValue) {
          // Strip <b> tags first
          mathValue = stripBoldTags(mathValue);

          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            // placeholderKey is a key in mathMap, pass false to indicate it's a key (not raw LaTeX)
            onMathClick?.(placeholderKey, false); // false = it's a key in mathMap, not raw LaTeX
          };

          // Check if it's HTML (contains <i>, etc. - but <b> already stripped)
          if (mathValue.trim().startsWith("<") || mathValue.includes("<i>")) {
            // Render as HTML (for italic or other HTML tags)
            parts.push(
              <span
                key={uniqueKey}
                dangerouslySetInnerHTML={{ __html: sanitizeForDisplay(mathValue) }}
                onClick={handleClick}
                className="cursor-pointer bg-blue-200 hover:bg-blue-300 rounded px-1 py-0.5 transition-colors"
                title="Click to edit"
              />
            );
          } else {
            // Check if it contains LaTeX commands (starts with \ or contains math symbols)
            const hasLaTeXCommands = /\\[a-zA-Z]+|[\^_\\{}]/.test(mathValue);

            if (!hasLaTeXCommands && mathValue.trim()) {
              // Plain text after stripping <b> tags - render directly
              parts.push(
                <span
                  key={uniqueKey}
                  onClick={handleClick}
                  className="cursor-pointer bg-blue-200 hover:bg-blue-300 rounded px-1 py-0.5 transition-colors"
                  title="Click to edit"
                >
                  {mathValue}
                </span>
              );
            } else {
              // Render as KaTeX inline math with caching
              const html = renderKaTeX(mathValue);
              if (html) {
                parts.push(
                  <span
                    key={uniqueKey}
                    dangerouslySetInnerHTML={{ __html: html }}
                    onClick={handleClick}
                    className="cursor-pointer bg-blue-200 hover:bg-blue-300 rounded px-1 py-0.5 transition-colors inline-block"
                    title="Click to edit formula"
                  />
                );
              } else {
                parts.push(
                  <span key={uniqueKey} className="text-red-500">
                    [Math Error: {placeholderKey}]
                  </span>
                );
              }
            }
          }
        } else {
          // If not found, show placeholder
          parts.push(
            <span key={uniqueKey} className="text-yellow-600">
              [Missing: {placeholderKey}]
            </span>
          );
        }
      } else if (rawLatex) {
        // Render raw LaTeX
        // For raw latex, we might want to edit the raw content.
        // We pass the raw content as key? Or a special indicator?
        // Let's pass the raw latex string.
        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          // rawLatex is raw LaTeX string, pass true to indicate it's raw LaTeX (not a key in mathMap)
          onMathClick?.(rawLatex, true); // true = raw LaTeX string, not a key
        };

        const html = renderKaTeX(rawLatex);
        if (html) {
          parts.push(
            <span
              key={uniqueKey}
              dangerouslySetInnerHTML={{ __html: html }}
              onClick={handleClick}
              className="cursor-pointer bg-blue-200 hover:bg-blue-300 rounded px-1 py-0.5 transition-colors inline-block"
              title="Click to edit LaTeX"
            />
          );
        } else {
          parts.push(
            <span key={uniqueKey} className="text-red-500">
              [Math Error]
            </span>
          );
        }
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    // If no matches found, return the original text
    if (parts.length === 0) {
      return [text];
    }

    return parts;
  }, [text, mathData, onMathClick]); // Depend on mathData

  return <>{parsedContent}</>;
});

ParsedMathContent.displayName = "ParsedMathContent";
