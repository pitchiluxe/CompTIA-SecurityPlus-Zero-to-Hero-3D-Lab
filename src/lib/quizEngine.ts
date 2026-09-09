import type { MasteryLevel, QuizQuestion, QuizResult } from '../types';
import {
  EXAM_DOMAINS,
  EXAM_MAX_QUESTIONS,
  EXAM_PASSING_SCORE,
  toScaledScore,
  type ExamDomainId,
} from '../data/examBlueprint';

export type QuizAttempt = {
  id: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  startedAt: number;
  endedAt?: number;
  score?: number;
  weakConcepts: string[];
};

export type GradedQuestion = { correct: boolean; score: number };

export type QuizGrade = {
  correctCount: number;
  total: number;
  percentage: number;
  weakConcepts: string[];
  strongConcepts: string[];
};

export type DomainBreakdown = {
  domainId: ExamDomainId;
  title: string;
  weight: number;
  asked: number;
  correct: number;
  /** 0-1; NaN-free — 0 when nothing was asked in this domain. */
  ratio: number;
};

export type ExamReport = {
  raw: QuizGrade;
  domains: DomainBreakdown[];
  /** Weighted ratio using official domain weights, restricted to domains asked. */
  weightedRatio: number;
  scaledScore: number;
  passed: boolean;
  verdict: 'not-ready' | 'approaching' | 'ready';
  weakDomains: DomainBreakdown[];
  strongDomains: DomainBreakdown[];
};

/**
 * True when two answers match.
 *
 * `ordered` controls how array answers are compared, and the distinction
 * matters: a PBQ asks the learner to *sequence* steps, so [0,1,2] and [2,1,0]
 * are different answers and only one is right. Comparing those order-
 * insensitively would make any ordering question that uses every option
 * unfailable — click all of them in any order and it grades correct.
 *
 * A genuine multi-select ("pick the three that apply") is the opposite: order
 * carries no meaning and must be ignored.
 */
function answersMatch(
  expected: number | number[],
  given: number | number[],
  ordered: boolean
): boolean {
  if (Array.isArray(expected)) {
    const g = Array.isArray(given) ? given : [given];
    if (g.length !== expected.length) return false;
    if (ordered) return expected.every((v, i) => v === g[i]);

    const sortedExpected = [...expected].sort((a, b) => a - b);
    const sortedGiven = [...g].sort((a, b) => a - b);
    return sortedExpected.every((v, i) => v === sortedGiven[i]);
  }
  const g = Array.isArray(given) ? given[0] : given;
  return g === expected;
}

export function gradeQuestion(q: QuizQuestion, userAnswer: number | number[]): GradedQuestion {
  const correct = answersMatch(q.answer, userAnswer, q.type === 'pbq');
  return { correct, score: correct ? 1 : 0 };
}

/** Build a QuizResult without needing the caller to pre-grade. */
export function recordAnswer(
  q: QuizQuestion,
  userAnswer: number | number[],
  timeSpentMs = 0
): QuizResult {
  return {
    questionId: q.id,
    correct: gradeQuestion(q, userAnswer).correct,
    timeSpentMs,
    userAnswer,
  };
}

export function gradeQuiz(questions: QuizQuestion[], results: QuizResult[]): QuizGrade {
  const total = questions.length;
  const weakConcepts = new Set<string>();
  const strongConcepts = new Set<string>();
  let correctCount = 0;

  for (const r of results) {
    const q = questions.find((item) => item.id === r.questionId);
    if (!q) continue;
    if (r.correct) {
      correctCount += 1;
      if (q.conceptId) strongConcepts.add(q.conceptId);
    } else if (q.conceptId) {
      weakConcepts.add(q.conceptId);
    }
  }

  // A concept missed anywhere stays weak even if answered right elsewhere.
  for (const c of weakConcepts) strongConcepts.delete(c);

  return {
    correctCount,
    total,
    percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
    weakConcepts: Array.from(weakConcepts),
    strongConcepts: Array.from(strongConcepts),
  };
}

export function buildAttempt(questions: QuizQuestion[]): QuizAttempt {
  return {
    id: crypto.randomUUID(),
    questions,
    results: [],
    startedAt: Date.now(),
    weakConcepts: [],
  };
}

export function submitAttempt(attempt: QuizAttempt, results: QuizResult[]): QuizAttempt {
  const grade = gradeQuiz(attempt.questions, results);
  return {
    ...attempt,
    results,
    endedAt: Date.now(),
    score: grade.percentage,
    weakConcepts: grade.weakConcepts,
  };
}

/**
 * Full exam report: per-domain breakdown plus a weighted readiness verdict.
 * Weights are renormalised across only the domains actually represented, so a
 * partial practice set is not penalised for the domains it never asked about.
 */
export function buildExamReport(questions: QuizQuestion[], results: QuizResult[]): ExamReport {
  const raw = gradeQuiz(questions, results);

  const domains: DomainBreakdown[] = EXAM_DOMAINS.map((d) => {
    const inDomain = questions.filter((q) => q.domain === d.title || q.domain === d.id);
    const ids = new Set(inDomain.map((q) => q.id));
    const correct = results.filter((r) => ids.has(r.questionId) && r.correct).length;
    return {
      domainId: d.id,
      title: d.title,
      weight: d.weight,
      asked: inDomain.length,
      correct,
      ratio: inDomain.length > 0 ? correct / inDomain.length : 0,
    };
  });

  const asked = domains.filter((d) => d.asked > 0);
  const weightSum = asked.reduce((sum, d) => sum + d.weight, 0);
  const weightedRatio =
    weightSum > 0 ? asked.reduce((sum, d) => sum + d.ratio * d.weight, 0) / weightSum : 0;

  const scaledScore = toScaledScore(weightedRatio);
  const passed = scaledScore >= EXAM_PASSING_SCORE;
  const verdict: ExamReport['verdict'] = passed
    ? 'ready'
    : scaledScore >= EXAM_PASSING_SCORE - 100
      ? 'approaching'
      : 'not-ready';

  return {
    raw,
    domains,
    weightedRatio,
    scaledScore,
    passed,
    verdict,
    weakDomains: asked.filter((d) => d.ratio < 0.7).sort((a, b) => a.ratio - b.ratio),
    strongDomains: asked.filter((d) => d.ratio >= 0.85).sort((a, b) => b.ratio - a.ratio),
  };
}

/** Deterministic shuffle (seeded) so practice sets are reproducible in tests. */
export function shuffleQuestions<T>(items: T[], seed = 1): T[] {
  const out = [...items];
  let s = seed >>> 0 || 1;
  const next = () => {
    // xorshift32 — small, deterministic, dependency-free
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Phase 24 — Exam Preparation session builders.
// ---------------------------------------------------------------------------

/** Every question tagged with a given SY0-701 domain title. */
export function questionsForDomain(questions: QuizQuestion[], domainTitle: string): QuizQuestion[] {
  return questions.filter((q) => q.domain === domainTitle);
}

/** Every question whose concept is in the given set — the weak-area review pool. */
export function questionsForConcepts(
  questions: QuizQuestion[],
  conceptIds: string[]
): QuizQuestion[] {
  const ids = new Set(conceptIds);
  return questions.filter((q) => q.conceptId && ids.has(q.conceptId));
}

// ---------------------------------------------------------------------------
// Blueprint-weighted mock exam.
//
// A mock exam is only useful if its shape matches the real one. Two properties
// have to hold, and neither comes free from shuffling the whole bank:
//
//   1. SIZE. SY0-701 is at most 90 questions in 90 minutes. Handing the learner
//      every question in the bank is a 450-minute sitting that tells them
//      nothing about exam-day pacing.
//   2. DOMAIN MIX. Each domain must appear in proportion to its official
//      weight, because the scaled score is weighted by those same weights. A
//      pool that under-represents a heavy domain produces a readiness verdict
//      resting on a handful of questions from the domain worth the most marks.
//
// `examQuotas` computes the per-domain question counts using largest-remainder
// apportionment, so the parts always sum exactly to the requested size rather
// than drifting by a question or two from independent rounding.
// ---------------------------------------------------------------------------

export type DomainQuota = {
  domainId: ExamDomainId;
  title: string;
  weight: number;
  /** Questions this domain should contribute to an exam of the requested size. */
  quota: number;
};

export function examQuotas(size: number = EXAM_MAX_QUESTIONS): DomainQuota[] {
  const totalWeight = EXAM_DOMAINS.reduce((sum, d) => sum + d.weight, 0);

  const exact = EXAM_DOMAINS.map((d) => ({
    domain: d,
    ideal: (d.weight / totalWeight) * size,
  }));

  const quotas = exact.map((e) => ({
    domainId: e.domain.id,
    title: e.domain.title,
    weight: e.domain.weight,
    quota: Math.floor(e.ideal),
  }));

  // Largest remainder: hand out the leftover questions to the domains with the
  // biggest fractional parts, so the quotas sum to `size` exactly.
  let remaining = size - quotas.reduce((sum, q) => sum + q.quota, 0);
  const byRemainder = exact
    .map((e, i) => ({ i, remainder: e.ideal - Math.floor(e.ideal) }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let k = 0; remaining > 0; k = (k + 1) % byRemainder.length) {
    quotas[byRemainder[k].i].quota += 1;
    remaining -= 1;
  }

  return quotas;
}

export type MockExamShortfall = {
  domainId: ExamDomainId;
  title: string;
  quota: number;
  available: number;
};

export type MockExam = {
  questions: QuizQuestion[];
  /** Per-domain target counts for the requested size. */
  quotas: DomainQuota[];
  /**
   * Domains where the bank could not fill the quota. Surfaced rather than
   * silently absorbed: a short domain means the exam under-samples the thing
   * it is meant to measure, and the learner should be told.
   */
  shortfalls: MockExamShortfall[];
  requestedSize: number;
};

/**
 * Build a mock exam of at most `size` questions, sampled to the official
 * domain weights. `seed` varies the selection, so successive attempts are
 * different exams drawn from the same blueprint rather than one fixed paper.
 */
export function buildMockExam(
  questions: QuizQuestion[],
  size: number = EXAM_MAX_QUESTIONS,
  seed = 1
): MockExam {
  const quotas = examQuotas(size);
  const shortfalls: MockExamShortfall[] = [];
  const picked: QuizQuestion[] = [];

  for (const [i, q] of quotas.entries()) {
    const pool = questions.filter((item) => item.domain === q.title || item.domain === q.domainId);
    // A distinct seed per domain, so two domains of equal size do not select
    // in a correlated order.
    const shuffled = shuffleQuestions(pool, seed + i * 1009);
    picked.push(...shuffled.slice(0, q.quota));

    if (pool.length < q.quota) {
      shortfalls.push({
        domainId: q.domainId,
        title: q.title,
        quota: q.quota,
        available: pool.length,
      });
    }
  }

  return {
    // Interleave across domains so the paper does not run domain-by-domain.
    questions: shuffleQuestions(picked, seed + 7919),
    quotas,
    shortfalls,
    requestedSize: size,
  };
}

/**
 * Adaptive session: groups the pool into mastery tiers (0-6) using the
 * learner's current level for each question's concept, then orders tiers
 * weakest-first so the session surfaces what needs work before what is
 * already solid. Questions are shuffled deterministically within a tier —
 * order across tiers is never randomised, only within one. Untagged
 * questions are treated as tier 3 (unknown, neither weak nor strong).
 */
export function buildAdaptiveSession(
  questions: QuizQuestion[],
  levelOf: (conceptId: string) => MasteryLevel,
  size: number,
  seed = 1
): QuizQuestion[] {
  const tiers: QuizQuestion[][] = Array.from({ length: 7 }, () => []);
  for (const q of questions) {
    const level = q.conceptId ? levelOf(q.conceptId) : 3;
    tiers[level].push(q);
  }
  const ordered = tiers.flatMap((tier, level) => shuffleQuestions(tier, seed + level * 97));
  return ordered.slice(0, Math.max(0, Math.min(size, ordered.length)));
}
