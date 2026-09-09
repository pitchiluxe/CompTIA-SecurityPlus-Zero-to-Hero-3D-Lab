import {
  ATTACK_MAPPING,
  FEED_ITEMS,
  INDICATORS,
  PYRAMID_TIERS,
  type FeedItem,
  type IndicatorKind,
  type InfoCredibility,
  type PyramidTier,
  type SourceReliability,
} from '../data/threatIntel';

// ---------------------------------------------------------------------------
// Phase 13 — threat intelligence engine.
//
// Everything here computes. The pyramid ranking is derived from the published
// ordering rather than stored alongside it, and feed actionability is derived
// from the Admiralty Code rather than hard-coded per item — so a learner can
// change an input and watch the verdict move, and so the data cannot drift out
// of step with the verdicts.
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

// ------------------------------ Pyramid of Pain -----------------------------

/**
 * Rank of a tier, 0 (hash, trivial to evade) to 5 (TTPs, tough).
 *
 * Derived from the array order so the ordering has exactly one definition.
 */
export function pyramidRank(tier: PyramidTier): number {
  return PYRAMID_TIERS.findIndex((t) => t.id === tier);
}

/** True when `a` costs the attacker more to evade than `b`. */
export function costsMoreToEvade(a: PyramidTier, b: PyramidTier): boolean {
  return pyramidRank(a) > pyramidRank(b);
}

export type PyramidAnswer = Record<string, PyramidTier>;

export type PyramidResult = {
  correct: string[];
  incorrect: { indicatorId: string; chosen: PyramidTier; actual: PyramidTier }[];
  /**
   * Sum of the ranks the learner placed indicators at, against the sum of the
   * true ranks. Reported because placing everything at the apex scores badly
   * on accuracy while looking enthusiastic.
   */
  chosenRankTotal: number;
  actualRankTotal: number;
  correctCount: number;
  total: number;
  percentage: number;
};

export function gradePyramid(answer: PyramidAnswer): PyramidResult {
  const correct: string[] = [];
  const incorrect: PyramidResult['incorrect'] = [];
  let chosenRankTotal = 0;
  let actualRankTotal = 0;

  for (const indicator of INDICATORS) {
    const chosen = answer[indicator.id];
    actualRankTotal += pyramidRank(indicator.tier);
    if (chosen === undefined) continue;

    chosenRankTotal += pyramidRank(chosen);
    if (chosen === indicator.tier) {
      correct.push(indicator.id);
    } else {
      incorrect.push({ indicatorId: indicator.id, chosen, actual: indicator.tier });
    }
  }

  const total = INDICATORS.length;
  return {
    correct,
    incorrect,
    chosenRankTotal,
    actualRankTotal,
    correctCount: correct.length,
    total,
    percentage: total > 0 ? Math.round((correct.length / total) * 100) : 0,
  };
}

// --------------------------------- IOC vs IOA -------------------------------

export type IndicatorAnswer = Record<string, IndicatorKind>;

export type IndicatorResult = {
  correct: string[];
  /** Indicators of attack the learner called indicators of compromise. */
  ioaCalledIoc: string[];
  /** Indicators of compromise the learner called indicators of attack. */
  iocCalledIoa: string[];
  correctCount: number;
  total: number;
  percentage: number;
};

export function gradeIndicatorKinds(answer: IndicatorAnswer): IndicatorResult {
  const correct: string[] = [];
  const ioaCalledIoc: string[] = [];
  const iocCalledIoa: string[] = [];

  for (const indicator of INDICATORS) {
    const chosen = answer[indicator.id];
    if (chosen === undefined) continue;

    if (chosen === indicator.kind) {
      correct.push(indicator.id);
    } else if (indicator.kind === 'ioa') {
      ioaCalledIoc.push(indicator.id);
    } else {
      iocCalledIoa.push(indicator.id);
    }
  }

  const total = INDICATORS.length;
  return {
    correct,
    ioaCalledIoc,
    iocCalledIoa,
    correctCount: correct.length,
    total,
    percentage: total > 0 ? Math.round((correct.length / total) * 100) : 0,
  };
}

// ------------------------------ Admiralty Code ------------------------------

const RELIABILITY_SCORE: Record<SourceReliability, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

const CREDIBILITY_SCORE: Record<InfoCredibility, number> = {
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
  6: 0,
};

/** The two-character Admiralty rating, e.g. "B2". */
export function admiraltyRating(item: FeedItem): string {
  return `${item.reliability}${item.credibility}`;
}

/** Combined confidence, 0-10. Reliability and credibility weigh equally. */
export function confidenceScore(item: FeedItem): number {
  return RELIABILITY_SCORE[item.reliability] + CREDIBILITY_SCORE[item.credibility];
}

export type Actionability = 'act' | 'corroborate' | 'disregard';

/**
 * What to do with a feed item.
 *
 * Relevance is checked first and on its own: a perfectly sourced, confirmed
 * report about a product you do not run is still not actionable here. Age is
 * deliberately NOT part of this verdict — it affects priority, not truth — so
 * ordering and verdict stay separable.
 */
export function actionability(item: FeedItem): Actionability {
  if (!item.relevantToEstate) return 'disregard';

  const score = confidenceScore(item);
  if (score >= 8) return 'act';
  if (score >= 4) return 'corroborate';
  return 'disregard';
}

/** Most confident first; fresher wins a tie. */
export function rankFeedItems(items: FeedItem[] = FEED_ITEMS): FeedItem[] {
  return [...items].sort((a, b) => {
    const byConfidence = confidenceScore(b) - confidenceScore(a);
    if (byConfidence !== 0) return byConfidence;
    return a.ageDays - b.ageDays;
  });
}

export type FeedAnswer = Record<string, Actionability>;

export type FeedResult = {
  correct: string[];
  incorrect: { itemId: string; chosen: Actionability; actual: Actionability }[];
  /** Items the learner would act on that do not support it. */
  overTrusted: string[];
  /** Items the learner would discard that are actionable. */
  underTrusted: string[];
  correctCount: number;
  total: number;
  percentage: number;
};

const ACTION_RANK: Record<Actionability, number> = { disregard: 0, corroborate: 1, act: 2 };

export function gradeFeedTriage(answer: FeedAnswer, items: FeedItem[] = FEED_ITEMS): FeedResult {
  const correct: string[] = [];
  const incorrect: FeedResult['incorrect'] = [];
  const overTrusted: string[] = [];
  const underTrusted: string[] = [];

  for (const item of items) {
    const chosen = answer[item.id];
    if (chosen === undefined) continue;

    const actual = actionability(item);
    if (chosen === actual) {
      correct.push(item.id);
      continue;
    }

    incorrect.push({ itemId: item.id, chosen, actual });
    if (ACTION_RANK[chosen] > ACTION_RANK[actual]) overTrusted.push(item.id);
    else underTrusted.push(item.id);
  }

  const total = items.length;
  return {
    correct,
    incorrect,
    overTrusted,
    underTrusted,
    correctCount: correct.length,
    total,
    percentage: total > 0 ? Math.round((correct.length / total) * 100) : 0,
  };
}

// -------------------------------- ATT&CK map --------------------------------

export type AttackAnswer = Record<string, string>;

export type AttackResult = {
  correct: string[];
  incorrect: { stage: string; chosen: string; actual: string }[];
  correctCount: number;
  total: number;
  percentage: number;
};

/**
 * Grade a mapping of incident stages to technique IDs. Keyed by stage because
 * that is the direction an analyst works: you have an observation and you are
 * looking for the technique it belongs to.
 */
export function gradeAttackMapping(answer: AttackAnswer): AttackResult {
  const correct: string[] = [];
  const incorrect: AttackResult['incorrect'] = [];

  for (const technique of ATTACK_MAPPING) {
    const chosen = answer[technique.incidentStage];
    if (chosen === undefined) continue;

    if (chosen === technique.id) correct.push(technique.incidentStage);
    else incorrect.push({ stage: technique.incidentStage, chosen, actual: technique.id });
  }

  const total = ATTACK_MAPPING.length;
  return {
    correct,
    incorrect,
    correctCount: correct.length,
    total,
    percentage: total > 0 ? Math.round((correct.length / total) * 100) : 0,
  };
}

/** Distinct ATT&CK tactics the incident touched, in first-seen order. */
export function tacticsCovered(): string[] {
  const seen: string[] = [];
  for (const technique of ATTACK_MAPPING) {
    for (const tactic of technique.tactic.split(',').map((t) => t.trim())) {
      if (!seen.includes(tactic)) seen.push(tactic);
    }
  }
  return seen;
}
