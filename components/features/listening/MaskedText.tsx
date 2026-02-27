"use client";

interface MaskedTextProps {
  text: string;
  revealed: boolean;
  userInput?: string;
}

/**
 * Component to display masked text with word-by-word reveal based on user input
 */
export default function MaskedText({ text, revealed, userInput = "" }: MaskedTextProps) {
  // If the entire sentence is already revealed (completed), just show it.
  if (revealed) return <span>{text}</span>;

  // Split both target text and user input into words
  const words = text.split(" ");
  const userWords = userInput.trim().split(/\s+/);

  return (
    <span>
      {words.map((word, idx) => {
        // Normalize for comparison: remove punctuation, lowercase
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]|_/g, "");
        const cleanTarget = normalize(word);

        // Check if the user has a matching word at the same index
        const cleanInput = userWords[idx] ? normalize(userWords[idx]) : "";

        // It's a match if the cleaned words match
        let isMatch = cleanTarget === cleanInput;

        // Secondary strict check: User input shouldn't have characters NOT in the target
        if (isMatch && userWords[idx]) {
          const lowerTarget = word.toLowerCase();
          const lowerInput = userWords[idx].toLowerCase();
          for (const char of lowerInput) {
            if (!lowerTarget.includes(char)) {
              isMatch = false;
              break;
            }
          }
        }

        if (isMatch) {
          return <span key={idx}>{word} </span>;
        }

        return (
          <span key={idx} className="font-mono tracking-widest text-blue-400">
            {word.replace(/[a-zA-Z0-9]/g, "*")}{" "}
          </span>
        );
      })}
    </span>
  );
}
