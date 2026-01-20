
export type WritingTone = 'Standard' | 'Professional' | 'Casual' | 'Academic';

export interface GrammarChange {
  original: string;
  corrected: string;
  reason: string;
  category: 'Tense' | 'Vocabulary' | 'Punctuation' | 'Article' | 'Other';
}

export interface DiffSegment {
  text: string;
  type: 'unchanged' | 'removed' | 'added';
}

export interface GrammarAnalysis {
  correctedText: string;
  rawDiff: string;
  diff: DiffSegment[];
  explanations: GrammarChange[];
  overallFeedback: string;
}

export interface HistoryItem extends GrammarAnalysis {
  id: string;
  originalText: string;
  tone: WritingTone;
  timestamp: number;
}