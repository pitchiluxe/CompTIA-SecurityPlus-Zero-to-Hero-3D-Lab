import { CONFIG_ITEMS, type ConfigItem, type ConfigVerdict } from '../data/networkConfig';

// ---------------------------------------------------------------------------
// Phase 11 — network configuration review grading.
//
// Same discrimination shape as the earlier phases, but harder: the learner is
// not shown a recommended value to compare against. They see the config as it
// would appear and must know what right looks like.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type ConfigAnswer = Record<string, ConfigVerdict | undefined>;

export type ConfigItemResult = {
  itemId: string;
  chosen?: ConfigVerdict;
  answered: boolean;
  correct: boolean;
  errorKind?: 'missed-error' | 'false-error';
  explanation: string;
};

export type ConfigResult = {
  items: ConfigItemResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Real misconfigurations passed as correct. */
  missedErrors: number;
  /** Correct configuration flagged as broken. */
  falseErrors: number;
  /** High-severity errors missed — the ones that matter most. */
  missedHighSeverity: number;
};

export function gradeConfigReview(
  answer: ConfigAnswer,
  items: ConfigItem[] = CONFIG_ITEMS
): ConfigResult {
  const results: ConfigItemResult[] = items.map((item) => {
    const chosen = answer[item.id];
    const correct = chosen === item.verdict;

    let errorKind: ConfigItemResult['errorKind'];
    if (chosen && !correct) {
      errorKind = item.verdict === 'error' ? 'missed-error' : 'false-error';
    }

    return {
      itemId: item.id,
      chosen,
      answered: chosen !== undefined,
      correct,
      errorKind,
      explanation: item.explanation,
    };
  });

  const missedHighSeverity = results.filter((r) => {
    if (r.errorKind !== 'missed-error') return false;
    return items.find((i) => i.id === r.itemId)?.severity === 'high';
  }).length;

  const correctCount = results.filter((r) => r.correct).length;
  return {
    items: results,
    correctCount,
    total: items.length,
    percentage: items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0,
    missedErrors: results.filter((r) => r.errorKind === 'missed-error').length,
    falseErrors: results.filter((r) => r.errorKind === 'false-error').length,
    missedHighSeverity,
  };
}

export function isConfigReviewComplete(
  answer: ConfigAnswer,
  items: ConfigItem[] = CONFIG_ITEMS
): boolean {
  return items.every((i) => answer[i.id] !== undefined);
}

export function countConfigReviewed(
  answer: ConfigAnswer,
  items: ConfigItem[] = CONFIG_ITEMS
): number {
  return items.filter((i) => answer[i.id] !== undefined).length;
}
