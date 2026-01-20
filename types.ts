
export interface GrammarChange {
  original: string;
  corrected: string;
  reason: string;
}

export interface DiffSegment {
  text: string;
  type: 'unchanged' | 'removed' | 'added';
}

export interface GrammarAnalysis {
  correctedText: string;
  diff: DiffSegment[];
  explanations: GrammarChange[];
  overallFeedback: string;
}
