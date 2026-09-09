// ---------------------------------------------------------------------------
// CVSS v3.1 base score calculator.
//
// The formula is published by FIRST, so this is implemented properly rather
// than hard-coded — a learner can change a metric and watch the score move,
// and the tests verify against officially published vectors.
//
// Reference: CVSS v3.1 Specification Document, section 7.1 (Base Score).
// ---------------------------------------------------------------------------

export type AttackVector = 'N' | 'A' | 'L' | 'P';
export type AttackComplexity = 'L' | 'H';
export type PrivilegesRequired = 'N' | 'L' | 'H';
export type UserInteraction = 'N' | 'R';
export type Scope = 'U' | 'C';
export type Impact = 'H' | 'L' | 'N';

export type CvssVector = {
  AV: AttackVector;
  AC: AttackComplexity;
  PR: PrivilegesRequired;
  UI: UserInteraction;
  S: Scope;
  C: Impact;
  I: Impact;
  A: Impact;
};

export type Severity = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

const AV_WEIGHT: Record<AttackVector, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
const AC_WEIGHT: Record<AttackComplexity, number> = { L: 0.77, H: 0.44 };
const UI_WEIGHT: Record<UserInteraction, number> = { N: 0.85, R: 0.62 };
const CIA_WEIGHT: Record<Impact, number> = { H: 0.56, L: 0.22, N: 0 };

// Privileges Required is the one metric whose weight depends on Scope: when
// scope changes, holding low privilege is worth more to an attacker.
const PR_WEIGHT: Record<Scope, Record<PrivilegesRequired, number>> = {
  U: { N: 0.85, L: 0.62, H: 0.27 },
  C: { N: 0.85, L: 0.68, H: 0.5 },
};

export const METRIC_LABELS = {
  AV: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' },
  AC: { L: 'Low', H: 'High' },
  PR: { N: 'None', L: 'Low', H: 'High' },
  UI: { N: 'None', R: 'Required' },
  S: { U: 'Unchanged', C: 'Changed' },
  C: { H: 'High', L: 'Low', N: 'None' },
  I: { H: 'High', L: 'Low', N: 'None' },
  A: { H: 'High', L: 'Low', N: 'None' },
} as const;

export const METRIC_NAMES = {
  AV: 'Attack Vector',
  AC: 'Attack Complexity',
  PR: 'Privileges Required',
  UI: 'User Interaction',
  S: 'Scope',
  C: 'Confidentiality',
  I: 'Integrity',
  A: 'Availability',
} as const;

/**
 * CVSS 3.1 Roundup, specified on integer arithmetic to avoid floating-point
 * drift. Implementing this as Math.ceil(x * 10) / 10 gives wrong answers on
 * values that are exactly representable at 1 decimal place, so the spec's
 * integer form is used verbatim.
 */
export function roundup(input: number): number {
  const intInput = Math.round(input * 100_000);
  if (intInput % 10_000 === 0) return intInput / 100_000;
  return (Math.floor(intInput / 10_000) + 1) / 10;
}

export function baseScore(v: CvssVector): number {
  const iscBase = 1 - (1 - CIA_WEIGHT[v.C]) * (1 - CIA_WEIGHT[v.I]) * (1 - CIA_WEIGHT[v.A]);

  const impact =
    v.S === 'U' ? 6.42 * iscBase : 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);

  if (impact <= 0) return 0;

  const exploitability =
    8.22 * AV_WEIGHT[v.AV] * AC_WEIGHT[v.AC] * PR_WEIGHT[v.S][v.PR] * UI_WEIGHT[v.UI];

  const raw =
    v.S === 'U'
      ? Math.min(impact + exploitability, 10)
      : Math.min(1.08 * (impact + exploitability), 10);

  return roundup(raw);
}

/** Qualitative rating from a base score, per the CVSS 3.1 severity scale. */
export function severityOf(score: number): Severity {
  if (score === 0) return 'None';
  if (score <= 3.9) return 'Low';
  if (score <= 6.9) return 'Medium';
  if (score <= 8.9) return 'High';
  return 'Critical';
}

export const SEVERITY_COLOR: Record<Severity, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#38bdf8',
  None: '#64748b',
};

/** Render a vector in the standard CVSS string form. */
export function formatVector(v: CvssVector): string {
  return `CVSS:3.1/AV:${v.AV}/AC:${v.AC}/PR:${v.PR}/UI:${v.UI}/S:${v.S}/C:${v.C}/I:${v.I}/A:${v.A}`;
}

/**
 * Parse a CVSS 3.1 vector string. Returns undefined rather than throwing on
 * malformed input, since this parses learner-supplied text.
 */
export function parseVector(input: string): CvssVector | undefined {
  const parts = input.trim().toUpperCase().split('/');
  const map = new Map<string, string>();

  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) map.set(key, value);
  }

  const required = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A'] as const;
  if (!required.every((k) => map.has(k))) return undefined;

  const valid: Record<string, string[]> = {
    AV: ['N', 'A', 'L', 'P'],
    AC: ['L', 'H'],
    PR: ['N', 'L', 'H'],
    UI: ['N', 'R'],
    S: ['U', 'C'],
    C: ['H', 'L', 'N'],
    I: ['H', 'L', 'N'],
    A: ['H', 'L', 'N'],
  };
  if (!required.every((k) => valid[k].includes(map.get(k)!))) return undefined;

  return {
    AV: map.get('AV') as AttackVector,
    AC: map.get('AC') as AttackComplexity,
    PR: map.get('PR') as PrivilegesRequired,
    UI: map.get('UI') as UserInteraction,
    S: map.get('S') as Scope,
    C: map.get('C') as Impact,
    I: map.get('I') as Impact,
    A: map.get('A') as Impact,
  };
}

/**
 * Which single metric change would most reduce the score. Used to teach that
 * mitigations move CVSS metrics — putting a service behind a VPN changes AV
 * from Network to Adjacent, and the score drops accordingly.
 */
export function largestReduction(
  v: CvssVector
): { metric: keyof CvssVector; to: string; newScore: number } | undefined {
  const current = baseScore(v);
  const options: { metric: keyof CvssVector; to: string }[] = [
    { metric: 'AV', to: 'A' },
    { metric: 'AV', to: 'L' },
    { metric: 'AC', to: 'H' },
    { metric: 'PR', to: 'L' },
    { metric: 'PR', to: 'H' },
    { metric: 'UI', to: 'R' },
  ];

  let best: { metric: keyof CvssVector; to: string; newScore: number } | undefined;
  for (const option of options) {
    const candidate = { ...v, [option.metric]: option.to } as CvssVector;
    const score = baseScore(candidate);
    if (score >= current) continue;
    if (!best || score < best.newScore) best = { ...option, newScore: score };
  }
  return best;
}
