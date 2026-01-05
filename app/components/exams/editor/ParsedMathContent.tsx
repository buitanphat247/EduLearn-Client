"use client";

import { memo, useMemo } from "react";
import { MATH_DATA, MATH_PLACEHOLDER_REGEX } from "./constants";
import { renderKaTeX } from "./utils";
import "katex/dist/katex.min.css";

interface ParsedMathContentProps {
  text: string;
}

// Memoized component for parsed math content
export const ParsedMathContent = memo<ParsedMathContentProps>(({ text }) => {
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
      const mathKey = match[1];
      const mathValue = MATH_DATA[mathKey];
      const uniqueKey = `math-${mathKey}-${keyCounter++}`;

      if (mathValue) {
        // If it's HTML (contains <b>, <i>, etc.), render as HTML
        if (mathValue.trim().startsWith("<") || mathValue.includes("<b>") || mathValue.includes("<i>")) {
          parts.push(<span key={uniqueKey} dangerouslySetInnerHTML={{ __html: mathValue }} />);
        } else {
          // Render as KaTeX inline math with caching
          const html = renderKaTeX(mathValue);
          if (html) {
            parts.push(<span key={uniqueKey} dangerouslySetInnerHTML={{ __html: html }} />);
          } else {
            parts.push(<span key={uniqueKey} className="text-red-500">[Math Error: {mathKey}]</span>);
          }
        }
      } else {
        // If not found, show placeholder
        parts.push(<span key={uniqueKey} className="text-yellow-600">[Missing: {mathKey}]</span>);
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
  }, [text]);

  return <>{parsedContent}</>;
});

ParsedMathContent.displayName = "ParsedMathContent";

