import type { MasteryEntry, MasteryLevel } from '../types';

/**
 * Leitner-style spaced repetition keyed to the 0-6 mastery ladder.
 * Higher mastery => longer gap before the concept resurfaces.
 * Index = mastery level, value = days until next review.
 */
export const REVIEW_INTERVAL_DAYS: Record<MasteryLevel, number> = {
  0: 0, // review immediately
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
  6: 30,
};

export const DAY_MS = 86_400_000;

/** Concepts at or below this level are treated as weak areas. */
export const WEAK_THRESHOLD: MasteryLevel = 2;

export function clampLevel(level: number): MasteryLevel {
  return Math.min(6, Math.max(0, Math.round(level))) as MasteryLevel;
}

export function nextReviewAt(level: MasteryLevel, from: number = Date.now()): number {
  return from + REVIEW_INTERVAL_DAYS[level] * DAY_MS;
}

/**
 * Apply a graded outcome to a concept. Correct answers advance one level;
 * a miss drops two, because over-confident concepts are the ones that fail
 * on exam day.
 */
export function applyOutcome(
  entry: MasteryEntry | undefined,
  conceptId: string,
  correct: boolean,
  now: number = Date.now()
): MasteryEntry {
  const current = entry?.level ?? 0;
  const level = clampLevel(correct ? current + 1 : current - 2);
  return {
    conceptId,
    level,
    lastReviewed: now,
    nextReview: nextReviewAt(level, now),
    weak: level <= WEAK_THRESHOLD,
  };
}

export function isDue(entry: MasteryEntry, now: number = Date.now()): boolean {
  return entry.nextReview <= now;
}

/** Concepts due for review, weakest and most overdue first. */
export function dueForReview(entries: MasteryEntry[], now: number = Date.now()): MasteryEntry[] {
  return entries
    .filter((e) => isDue(e, now))
    .sort((a, b) => a.level - b.level || a.nextReview - b.nextReview);
}

/** Overall readiness 0-100 across all tracked concepts (6 = full mastery). */
export function masteryPercentage(entries: MasteryEntry[]): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, e) => sum + e.level, 0);
  return Math.round((total / (entries.length * 6)) * 100);
}
