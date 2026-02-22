/**
 * Writing Practice Business Logic
 * Utility functions for text comparison and validation
 */

/**
 * Normalize text for comparison
 * Removes punctuation, extra spaces, and converts to lowercase
 */
export function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,!?;:。，！？、：；「」『』（）"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract content from a sentence (removes speaker prefix)
 * Format: "Speaker: content" -> "content"
 */
export function extractSentenceContent(sentence: string): string {
  return sentence.includes(":") ? sentence.split(":").slice(1).join(":").trim() : sentence;
}

/**
 * Check if user translation matches target sentence
 * @returns Object with match status and revealed word indices
 */
export function checkTranslation(
  userTranslation: string,
  targetSentence: string,
): {
  isCorrect: boolean;
  revealedIndices: Set<number>;
} {
  const targetContent = extractSentenceContent(targetSentence);
  const normalizedInput = normalizeForComparison(userTranslation);
  const normalizedTarget = normalizeForComparison(targetContent);

  // Check if completely correct
  if (normalizedInput === normalizedTarget) {
    const targetWords = targetContent.split(/\s+/);
    const allIndices = new Set<number>();
    for (let i = 0; i < targetWords.length; i++) {
      allIndices.add(i);
    }
    return { isCorrect: true, revealedIndices: allIndices };
  }

  // Find partially correct words
  const targetWords = targetContent.split(/\s+/);
  const userWords = userTranslation.trim().split(/\s+/);
  const revealedIndices = new Set<number>();

  targetWords.forEach((targetWord, idx) => {
    const cleanTarget = normalizeForComparison(targetWord);
    const cleanInput = userWords[idx] ? normalizeForComparison(userWords[idx]) : "";

    if (cleanTarget === cleanInput && cleanTarget.length > 0) {
      revealedIndices.add(idx);
    }
  });

  return { isCorrect: false, revealedIndices };
}
