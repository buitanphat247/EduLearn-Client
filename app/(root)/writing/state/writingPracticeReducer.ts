/**
 * Writing Practice State Management
 * Consolidates multiple useState into a single useReducer
 */

export interface HintData {
  vocabulary: Array<{ word: string; meaning: string }>;
  structure: string;
}

export interface WritingPracticeState {
  userTranslation: string;
  showHint: boolean;
  completedSentences: Set<number>;
  revealedWordIndices: Set<number>;
  hintData: HintData | null;
  hintLoading: boolean;
  hintCache: Map<number, HintData>;
}

export type WritingPracticeAction =
  | { type: "SET_TRANSLATION"; payload: string }
  | { type: "TOGGLE_HINT" }
  | { type: "ADD_COMPLETED_SENTENCE"; payload: number }
  | { type: "SET_REVEALED_WORDS"; payload: Set<number> }
  | { type: "MERGE_REVEALED_WORDS"; payload: Set<number> }
  | { type: "RESET_REVEALED_WORDS" }
  | { type: "RESET_FOR_NEXT_SENTENCE" }
  | { type: "SET_HINT_LOADING"; payload: boolean }
  | { type: "SET_HINT_DATA"; payload: { sentenceIndex: number; data: HintData; currentViewIndex: number } }
  | { type: "LOAD_CACHED_HINT"; payload: number };

export const initialWritingState: WritingPracticeState = {
  userTranslation: "",
  showHint: false,
  completedSentences: new Set<number>(),
  revealedWordIndices: new Set<number>(),
  hintData: null,
  hintLoading: false,
  hintCache: new Map<number, HintData>(),
};

export function writingPracticeReducer(state: WritingPracticeState, action: WritingPracticeAction): WritingPracticeState {
  switch (action.type) {
    case "SET_TRANSLATION":
      return { ...state, userTranslation: action.payload };

    case "TOGGLE_HINT":
      return { ...state, showHint: !state.showHint };

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
        hintData: null,
        hintLoading: false,
      };

    case "SET_HINT_LOADING":
      return { ...state, hintLoading: action.payload };

    case "SET_HINT_DATA": {
      const { sentenceIndex, data, currentViewIndex } = action.payload;

      // Always update cache regardless of current view
      const newCache = new Map(state.hintCache);
      newCache.set(sentenceIndex, data);

      // Only update hintData display if indices match
      const shouldUpdateDisplay = sentenceIndex === currentViewIndex;

      return {
        ...state,
        hintData: shouldUpdateDisplay ? data : state.hintData,
        hintLoading: shouldUpdateDisplay ? false : state.hintLoading,
        hintCache: newCache,
      };
    }

    case "LOAD_CACHED_HINT": {
      const cached = state.hintCache.get(action.payload);
      return {
        ...state,
        hintData: cached || null,
      };
    }

    default:
      return state;
  }
}
