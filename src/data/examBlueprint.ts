// ---------------------------------------------------------------------------
// CompTIA Security+ SY0-701 exam blueprint
// Source: CompTIA Security+ (SY0-701) exam objectives.
// 90 questions max · 90 minutes · scaled 100-900 · passing 750
// ---------------------------------------------------------------------------

export type ExamDomainId = '1.0' | '2.0' | '3.0' | '4.0' | '5.0';

export type ExamDomain = {
  id: ExamDomainId;
  title: string;
  /** Percentage of the exam, per the official objectives. */
  weight: number;
};

export const EXAM_VERSION = 'SY0-701';
export const EXAM_MAX_QUESTIONS = 90;
export const EXAM_DURATION_MINUTES = 90;
export const EXAM_SCALE_MIN = 100;
export const EXAM_SCALE_MAX = 900;
export const EXAM_PASSING_SCORE = 750;

export const EXAM_DOMAINS: ExamDomain[] = [
  { id: '1.0', title: 'General Security Concepts', weight: 12 },
  { id: '2.0', title: 'Threats, Vulnerabilities, and Mitigations', weight: 22 },
  { id: '3.0', title: 'Security Architecture', weight: 18 },
  { id: '4.0', title: 'Security Operations', weight: 28 },
  { id: '5.0', title: 'Security Program Management and Oversight', weight: 20 },
];

export const DOMAIN_BY_TITLE: Record<string, ExamDomainId> = Object.fromEntries(
  EXAM_DOMAINS.map((d) => [d.title, d.id])
);

export function getDomain(id: ExamDomainId): ExamDomain | undefined {
  return EXAM_DOMAINS.find((d) => d.id === id);
}

/**
 * Map a weighted correctness ratio (0-1) onto the CompTIA 100-900 scale.
 * CompTIA does not publish its exact scaling, so this is an explicitly
 * declared linear approximation used only for practice readiness feedback.
 */
export function toScaledScore(ratio: number): number {
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round(EXAM_SCALE_MIN + clamped * (EXAM_SCALE_MAX - EXAM_SCALE_MIN));
}
