import { VULN_FINDINGS, type FindingVerdict, type VulnFinding } from '../data/vulnFindings';
import { baseScore, severityOf } from './cvss';

// ---------------------------------------------------------------------------
// Phase 10 — vulnerability finding triage.
//
// The same discrimination shape as Phase 7 alert triage and Phase 8 config
// audit, applied to scanner output: which findings are real, and does the raw
// CVSS score match the priority this environment actually warrants?
//
// Pure functions, same contract as the other engines.
// ---------------------------------------------------------------------------

export type VulnAnswer = Record<string, FindingVerdict | undefined>;

export type VulnItemResult = {
  findingId: string;
  chosen?: FindingVerdict;
  answered: boolean;
  correct: boolean;
  errorKind?: 'missed-vulnerability' | 'false-report';
  rationale: string;
};

export type VulnResult = {
  items: VulnItemResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Real vulnerabilities dismissed as false positives. */
  missedVulnerabilities: number;
  /** False positives reported as real — the credibility cost. */
  falseReports: number;
};

export function gradeVulnTriage(
  answer: VulnAnswer,
  findings: VulnFinding[] = VULN_FINDINGS
): VulnResult {
  const items: VulnItemResult[] = findings.map((f) => {
    const chosen = answer[f.id];
    const correct = chosen === f.verdict;

    let errorKind: VulnItemResult['errorKind'];
    if (chosen && !correct) {
      errorKind = f.verdict === 'confirmed' ? 'missed-vulnerability' : 'false-report';
    }

    return {
      findingId: f.id,
      chosen,
      answered: chosen !== undefined,
      correct,
      errorKind,
      rationale: f.verdictRationale,
    };
  });

  const correctCount = items.filter((i) => i.correct).length;
  return {
    items,
    correctCount,
    total: findings.length,
    percentage: findings.length > 0 ? Math.round((correctCount / findings.length) * 100) : 0,
    missedVulnerabilities: items.filter((i) => i.errorKind === 'missed-vulnerability').length,
    falseReports: items.filter((i) => i.errorKind === 'false-report').length,
  };
}

export function isVulnTriageComplete(
  answer: VulnAnswer,
  findings: VulnFinding[] = VULN_FINDINGS
): boolean {
  return findings.every((f) => answer[f.id] !== undefined);
}

export function countVulnTriaged(
  answer: VulnAnswer,
  findings: VulnFinding[] = VULN_FINDINGS
): number {
  return findings.filter((f) => answer[f.id] !== undefined).length;
}

/** A finding with its computed score attached, for sorting and display. */
export type ScoredFinding = VulnFinding & {
  score: number;
  severity: ReturnType<typeof severityOf>;
};

export function scoreFinding(f: VulnFinding): ScoredFinding {
  const score = baseScore(f.vector);
  return { ...f, score, severity: severityOf(score) };
}

/** All findings, highest CVSS first — the naive prioritisation. */
export function byRawScore(findings: VulnFinding[] = VULN_FINDINGS): ScoredFinding[] {
  return findings.map(scoreFinding).sort((a, b) => b.score - a.score);
}

/**
 * Prioritisation that accounts for what the scan cannot know: false positives
 * are not vulnerabilities at all, and a finding whose exploitability is
 * constrained by the environment ranks below its raw score.
 *
 * This is the phase's central point — CVSS measures the vulnerability, not
 * your exposure to it.
 */
export function byRealPriority(findings: VulnFinding[] = VULN_FINDINGS): ScoredFinding[] {
  return findings
    .filter((f) => f.verdict === 'confirmed')
    .map(scoreFinding)
    .sort((a, b) => {
      // A finding the environment constrains drops below one it does not,
      // regardless of which has the higher raw score.
      if (a.contextOverridesScore !== b.contextOverridesScore) {
        return a.contextOverridesScore ? 1 : -1;
      }
      return b.score - a.score;
    });
}

/** How far the naive ordering differs from the context-aware one. */
export function prioritisationDelta(findings: VulnFinding[] = VULN_FINDINGS): {
  naiveTop: ScoredFinding;
  realTop: ScoredFinding;
  differs: boolean;
} {
  const naive = byRawScore(findings);
  const real = byRealPriority(findings);
  return {
    naiveTop: naive[0],
    realTop: real[0],
    differs: naive[0].id !== real[0].id,
  };
}
