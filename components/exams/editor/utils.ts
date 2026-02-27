import { QuestionType } from "./types";
import { HAS_MATH_REGEX } from "./constants";
import katex from "katex";

// Cache for KaTeX rendered HTML to avoid re-rendering
const katexCache = new Map<string, string>();

// Helper function to determine question type from part name
export const getQuestionType = (partName: string): QuestionType => {
  if (partName.includes("đúng sai") || partName.includes("Đúng/Sai")) {
    return "true_false";
  }
  if (partName.includes("trả lời ngắn") || partName.includes("Tự luận")) {
    return "fill_blank";
  }
  return "multiple_choice";
};

// Helper function to render KaTeX with caching
export const renderKaTeX = (mathValue: string): string => {
  if (katexCache.has(mathValue)) {
    return katexCache.get(mathValue)!;
  }
  try {
    const html = katex.renderToString(mathValue, {
      throwOnError: false,
      displayMode: false,
    });
    katexCache.set(mathValue, html);
    return html;
  } catch (error) {
    return "";
  }
};

// Helper function to check if text contains math placeholders (optimized)
export const hasMathPlaceholder = (text: string): boolean => {
  if (!text) return false;
  return HAS_MATH_REGEX.test(text);
};

// Helper function to strip <b> tags from text
// Converts <b>ABCD</b> to ABCD
export const stripBoldTags = (text: string): string => {
  if (!text) return text;
  // Remove opening <b> and closing </b> tags (case-insensitive)
  return text.replace(/<\/?b>/gi, "");
};

