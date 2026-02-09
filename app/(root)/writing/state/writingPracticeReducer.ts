/**
 * Writing Practice State Management
 * Consolidates multiple useState into a single useReducer
 */

export interface WritingPracticeState {
  userTranslation: string;
  showHint: boolean;
  showTranscript: boolean;
  showTranslation: boolean;
  completedSentences: Set<number>;
  revealedWordIndices: Set<number>;
}

export type WritingPracticeAction =
  | { type: "SET_TRANSLATION"; payload: string }
  | { type: "TOGGLE_HINT" }
  | { type: "TOGGLE_TRANSCRIPT" }
  | { type: "TOGGLE_TRANSLATION" }
  | { type: "ADD_COMPLETED_SENTENCE"; payload: number }
  | { type: "SET_REVEALED_WORDS"; payload: Set<number> }
  | { type: "MERGE_REVEALED_WORDS"; payload: Set<number> }
  | { type: "RESET_REVEALED_WORDS" }
  | { type: "RESET_FOR_NEXT_SENTENCE" };

export const initialWritingState: WritingPracticeState = {
  userTranslation: "",
  showHint: false,
  showTranscript: false,
  showTranslation: false,
  completedSentences: new Set<number>(),
  revealedWordIndices: new Set<number>(),
};

export function writingPracticeReducer(state: WritingPracticeState, action: WritingPracticeAction): WritingPracticeState {
  switch (action.type) {
    case "SET_TRANSLATION":
      return { ...state, userTranslation: action.payload };

    case "TOGGLE_HINT":
      return { ...state, showHint: !state.showHint };

    case "TOGGLE_TRANSCRIPT":
      return { ...state, showTranscript: !state.showTranscript };

    case "TOGGLE_TRANSLATION":
      return { ...state, showTranslation: !state.showTranslation };

    case "ADD_COMPLETED_SENTENCE":
      return {
        ...state,
        completedSentences: new Set(state.completedSentences).add(action.payload),
      };

    case "SET_REVEALED_WORDS":
      return { ...state, revealedWordIndices: action.payload };

    case "MERGE_REVEALED_WORDS": {
      const merged = new Set(state.revealedWordIndices);
      action.payload.forEach((idx) => merged.add(idx));
      return { ...state, revealedWordIndices: merged };
    }

    case "RESET_REVEALED_WORDS":
      return { ...state, revealedWordIndices: new Set<number>() };

    case "RESET_FOR_NEXT_SENTENCE":
      return {
        ...state,
        userTranslation: "",
        showHint: false,
        revealedWordIndices: new Set<number>(),
      };

    default:
      return state;
  }
}
