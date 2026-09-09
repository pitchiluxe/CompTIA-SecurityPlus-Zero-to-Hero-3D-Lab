import { describe, expect, it } from 'vitest';
import {
  applyOutcome,
  clampLevel,
  DAY_MS,
  dueForReview,
  isDue,
  masteryPercentage,
  nextReviewAt,
  REVIEW_INTERVAL_DAYS,
} from '../src/lib/srs';
import type { MasteryEntry } from '../src/types';

const NOW = 1_700_000_000_000;

describe('clampLevel', () => {
  it('keeps levels inside the 0-6 ladder', () => {
    expect(clampLevel(-3)).toBe(0);
    expect(clampLevel(9)).toBe(6);
    expect(clampLevel(3)).toBe(3);
  });
});

describe('applyOutcome', () => {
  it('advances one level on a correct answer', () => {
    const entry = applyOutcome(undefined, 'c', true, NOW);
    expect(entry.level).toBe(1);
    expect(entry.lastReviewed).toBe(NOW);
  });

  it('drops two levels on a miss, because over-confidence is the risk', () => {
    const start = applyOutcome(undefined, 'c', true, NOW);
    const up = applyOutcome(start, 'c', true, NOW);
    const up2 = applyOutcome(up, 'c', true, NOW);
    expect(up2.level).toBe(3);

    const missed = applyOutcome(up2, 'c', false, NOW);
    expect(missed.level).toBe(1);
  });

  it('never drops below zero', () => {
    const entry = applyOutcome(undefined, 'c', false, NOW);
    expect(entry.level).toBe(0);
  });

  it('flags levels at or below 2 as weak', () => {
    expect(applyOutcome(undefined, 'c', true, NOW).weak).toBe(true);
    const l4 = {
      conceptId: 'c',
      level: 4,
      lastReviewed: NOW,
      nextReview: NOW,
      weak: false,
    } as MasteryEntry;
    expect(applyOutcome(l4, 'c', true, NOW).weak).toBe(false);
  });

  it('schedules the next review from the interval table', () => {
    const entry = applyOutcome(undefined, 'c', true, NOW);
    expect(entry.nextReview).toBe(NOW + REVIEW_INTERVAL_DAYS[1] * DAY_MS);
  });
});

describe('nextReviewAt', () => {
  it('makes level 0 due immediately and level 6 due in 30 days', () => {
    expect(nextReviewAt(0, NOW)).toBe(NOW);
    expect(nextReviewAt(6, NOW)).toBe(NOW + 30 * DAY_MS);
  });
});

describe('dueForReview', () => {
  const entries: MasteryEntry[] = [
    {
      conceptId: 'strong',
      level: 5,
      lastReviewed: NOW,
      nextReview: NOW + 10 * DAY_MS,
      weak: false,
    },
    { conceptId: 'weak', level: 1, lastReviewed: NOW, nextReview: NOW - DAY_MS, weak: true },
    { conceptId: 'new', level: 0, lastReviewed: NOW, nextReview: NOW, weak: true },
  ];

  it('returns only overdue entries', () => {
    expect(dueForReview(entries, NOW).map((e) => e.conceptId)).toEqual(['new', 'weak']);
  });

  it('orders weakest first', () => {
    expect(dueForReview(entries, NOW)[0].level).toBe(0);
  });

  it('agrees with isDue', () => {
    expect(isDue(entries[0], NOW)).toBe(false);
    expect(isDue(entries[1], NOW)).toBe(true);
  });
});

describe('masteryPercentage', () => {
  it('returns 0 with no entries rather than NaN', () => {
    expect(masteryPercentage([])).toBe(0);
  });

  it('scores full mastery at 100', () => {
    const entries: MasteryEntry[] = [
      { conceptId: 'a', level: 6, lastReviewed: NOW, nextReview: NOW, weak: false },
      { conceptId: 'b', level: 6, lastReviewed: NOW, nextReview: NOW, weak: false },
    ];
    expect(masteryPercentage(entries)).toBe(100);
  });

  it('averages across the ladder', () => {
    const entries: MasteryEntry[] = [
      { conceptId: 'a', level: 6, lastReviewed: NOW, nextReview: NOW, weak: false },
      { conceptId: 'b', level: 0, lastReviewed: NOW, nextReview: NOW, weak: true },
    ];
    expect(masteryPercentage(entries)).toBe(50);
  });
});
