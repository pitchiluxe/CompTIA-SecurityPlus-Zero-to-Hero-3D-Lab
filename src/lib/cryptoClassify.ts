import {
  CLASSIFY_ITEMS,
  type ClassifyItem,
  type CryptoOperationId,
} from '../data/cryptoOperations';

// ---------------------------------------------------------------------------
// Phase 6 — grading for the encryption / hashing / encoding / signing
// discrimination exercise.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type ClassifyAnswer = Record<string, CryptoOperationId | undefined>;

export type ClassifyItemResult = {
  itemId: string;
  chosen?: CryptoOperationId;
  correct: boolean;
  answered: boolean;
  rationale: string;
};

export type ClassifyResult = {
  items: ClassifyItemResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Operations the learner mixed up, for targeted review. */
  confusedPairs: { chose: CryptoOperationId; actual: CryptoOperationId; count: number }[];
};

export function gradeClassification(
  answer: ClassifyAnswer,
  items: ClassifyItem[] = CLASSIFY_ITEMS
): ClassifyResult {
  const results: ClassifyItemResult[] = items.map((item) => {
    const chosen = answer[item.id];
    const correct = chosen === item.answer;
    return {
      itemId: item.id,
      chosen,
      correct,
      answered: chosen !== undefined,
      rationale: item.rationale,
    };
  });

  // Which confusions the learner actually made — "you called hashing
  // encryption three times" is more useful than a bare score.
  const pairs = new Map<
    string,
    { chose: CryptoOperationId; actual: CryptoOperationId; count: number }
  >();
  for (const [i, r] of results.entries()) {
    if (r.correct || !r.chosen) continue;
    const actual = items[i].answer;
    const key = `${r.chosen}->${actual}`;
    const existing = pairs.get(key);
    if (existing) existing.count += 1;
    else pairs.set(key, { chose: r.chosen, actual, count: 1 });
  }

  const correctCount = results.filter((r) => r.correct).length;
  return {
    items: results,
    correctCount,
    total: items.length,
    percentage: items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0,
    confusedPairs: [...pairs.values()].sort((a, b) => b.count - a.count),
  };
}

export function isClassificationComplete(
  answer: ClassifyAnswer,
  items: ClassifyItem[] = CLASSIFY_ITEMS
): boolean {
  return items.every((i) => answer[i.id] !== undefined);
}

export function countAnswered(
  answer: ClassifyAnswer,
  items: ClassifyItem[] = CLASSIFY_ITEMS
): number {
  return items.filter((i) => answer[i.id] !== undefined).length;
}
