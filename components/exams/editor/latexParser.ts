import type { PartData, QuestionItem } from "./types";

export const parseLatexToData = (latexSource: string): PartData[] => {
  const parts: PartData[] = [];
  const lines = latexSource.split("\n");

  let currentPart: PartData | null = null;
  let currentQuestion: QuestionItem | null = null;

  // Custom parsing logic (simplified)
  // This needs to be robust to handle the format generateLatexSource produces

  // Regex to identify Parts
  const partRegex = /^(PHẦN [IVX]+\..*)/;
  // Regex to identify Questions
  const questionRegex = /^Câu (\d+)\. (.*)/;
  // Regex to identify Answers
  // Matches: "A. content", "*A. content", "×A. content - Đúng/Sai"
  // Needs to handle multiple choice and true/false
  const answerRegex = /^([×*])?([A-Z])\. (.*)/;
  const fillBlankRegex = /^Đáp án: (.*)/;

  // Helper to save current question
  const saveCurrentQuestion = () => {
    if (currentQuestion && currentPart) {
      currentPart.questions.push(currentQuestion);
      currentQuestion = null;
    }
  };

  lines.forEach((line) => {
    line = line.trim();
    if (!line) return;

    // Check Part
    const partMatch = line.match(partRegex);
    if (partMatch) {
      if (currentPart) {
        saveCurrentQuestion(); // Save last question of previous part
        parts.push(currentPart);
      }
      currentPart = {
        name: partMatch[1],
        questions: [],
      };
      currentQuestion = null;
      return;
    }

    // Check Question Start
    const questionMatch = line.match(questionRegex);
    if (questionMatch) {
      saveCurrentQuestion(); // Save previous question if any

      // Ensure currentPart exists before creating question
      if (!currentPart) {
        // Create a default part if none exists
        currentPart = {
          name: "PHẦN I. Câu hỏi",
          questions: [],
        };
      }

      currentQuestion = {
        id: `part-${parts.length}-q-${currentPart.questions.length}`, // Stable ID based on index
        question: questionMatch[2],
        answers: [],
        correct_answer: {},
      };
      return;
    }

    // Check Answers
    if (currentQuestion) {
      // Handle Fill Blank
      const fillBlankMatch = line.match(fillBlankRegex);
      if (fillBlankMatch) {
        currentQuestion.answers.push({ key: "A", content: fillBlankMatch[1] });
        currentQuestion.correct_answer = { A: true };
        return;
      }

      // Handle Multiple Choice / True False
      const answerMatch = line.match(answerRegex);
      if (answerMatch) {
        const marker = answerMatch[1]; // * or × or undefined
        const key = answerMatch[2];
        let content = answerMatch[3];

        // Check for True/False specific format: "content - Đúng" or "content - Sai"
        // Note: The generator outputs: `${marker}${answer.key}. ${answer.content} - ${isCorrect ? "Đúng" : "Sai"}\n`
        // So content here might include " - Đúng" or " - Sai"

        let isCorrect = marker === "*";

        // Try to detect True/False suffix
        if (content.endsWith(" - Đúng")) {
          content = content.replace(" - Đúng", "");
          // In generator, * means correct? No wait.
          // Generator: isCorrect ? "*" : "×"
          // Then displays " - Đúng" if isCorrect, " - Sai" if not?
          // Wait, logic in generator:
          // const isCorrect = question.correct_answer[answer.key] === true;
          // const marker = isCorrect ? "*" : "×";
          // so * means Answer is True (Correct).
          isCorrect = true;
        } else if (content.endsWith(" - Sai")) {
          content = content.replace(" - Sai", "");
          isCorrect = false;
          // Wait, if it says "Sai", does it mean the statement is false -> correct answer is False?
          // The correct_answer object stores { Key: boolean }.
          // In T/F, usually it means "Key is True" or "Key is False".
          // Our generator: correct_answer[key] === true -> marker "*" -> " - Đúng".
          // So if text says " - Sai", it means correct_answer[key] is false.
        }

        currentQuestion.answers.push({ key, content });
        currentQuestion.correct_answer[key] = isCorrect;
        return;
      }
    }
  });

  // Save last items
  saveCurrentQuestion();
  if (currentPart) {
    parts.push(currentPart);
  }

  return parts;
};
