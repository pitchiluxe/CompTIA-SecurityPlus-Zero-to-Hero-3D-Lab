import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  baseScore,
  formatVector,
  largestReduction,
  parseVector,
  roundup,
  severityOf,
  type CvssVector,
} from '../src/lib/cvss';
import {
  CONFIRMED_COUNT,
  FALSE_POSITIVE_COUNT,
  VULN_FINDINGS,
  getFinding,
} from '../src/data/vulnFindings';
import {
  byRawScore,
  byRealPriority,
  countVulnTriaged,
  gradeVulnTriage,
  isVulnTriageComplete,
  prioritisationDelta,
  scoreFinding,
  type VulnAnswer,
} from '../src/lib/vulnTriage';
import { PHASE_10 } from '../src/data/phase10';
import { VulnManagementView } from '../src/components/VulnManagementView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_10_COMMANDS } from '../src/sim/phase10Commands';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

function perfectVulnTriage(): VulnAnswer {
  return Object.fromEntries(VULN_FINDINGS.map((f) => [f.id, f.verdict]));
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('CVSS v3.1 calculator', () => {
  // Verified against officially published CVSS v3.1 vectors. If the formula
  // is ever refactored, these are the guard — a scoring engine that is subtly
  // wrong is worse than none, because learners would trust it.
  const published: [string, number][] = [
    ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', 9.8],
    ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H', 7.5],
    ['CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', 7.8],
    ['CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N', 6.1],
    ['CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N', 5.9],
    ['CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', 7.8],
    ['CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N', 4.3],
    ['CVSS:3.1/AV:P/AC:H/PR:H/UI:R/S:U/C:L/I:N/A:N', 1.6],
    ['CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', 10.0],
  ];

  it.each(published)('scores %s as %f', (vector, expected) => {
    expect(baseScore(parseVector(vector)!)).toBe(expected);
  });

  it('scores a vector with no impact as zero', () => {
    const none = parseVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:N')!;
    expect(baseScore(none)).toBe(0);
    expect(severityOf(0)).toBe('None');
  });

  it('implements CVSS Roundup on integer arithmetic', () => {
    // The spec defines Roundup precisely because Math.ceil(x*10)/10 is wrong
    // for values already exact at one decimal place.
    expect(roundup(4.0)).toBe(4.0);
    expect(roundup(4.02)).toBe(4.1);
    expect(roundup(0.0)).toBe(0.0);
    expect(roundup(6.1)).toBe(6.1);
  });

  it('maps scores onto the published severity bands', () => {
    expect(severityOf(0)).toBe('None');
    expect(severityOf(0.1)).toBe('Low');
    expect(severityOf(3.9)).toBe('Low');
    expect(severityOf(4.0)).toBe('Medium');
    expect(severityOf(6.9)).toBe('Medium');
    expect(severityOf(7.0)).toBe('High');
    expect(severityOf(8.9)).toBe('High');
    expect(severityOf(9.0)).toBe('Critical');
    expect(severityOf(10)).toBe('Critical');
  });

  it('round-trips a vector through format and parse', () => {
    const v: CvssVector = { AV: 'A', AC: 'H', PR: 'L', UI: 'R', S: 'C', C: 'L', I: 'H', A: 'N' };
    expect(parseVector(formatVector(v))).toEqual(v);
  });

  it('rejects malformed vectors rather than throwing', () => {
    expect(parseVector('nonsense')).toBeUndefined();
    expect(parseVector('CVSS:3.1/AV:N/AC:L')).toBeUndefined();
    expect(parseVector('CVSS:3.1/AV:X/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')).toBeUndefined();
  });

  it('scores scope-changed higher than scope-unchanged, all else equal', () => {
    const unchanged = parseVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')!;
    const changed = { ...unchanged, S: 'C' as const };
    expect(baseScore(changed)).toBeGreaterThan(baseScore(unchanged));
  });

  it('identifies restricting the attack vector as a score reduction', () => {
    const v = parseVector('CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H')!;
    const reduction = largestReduction(v)!;
    expect(reduction.newScore).toBeLessThan(baseScore(v));
  });
});

describe('Phase 10 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_10.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'vulnerabilit',
      'cve',
      'cvss',
      'vulnerability scanning',
      'patch management',
      'configuration management',
      'prioritis',
      'remediat',
      'validat',
      'false positive',
    ];

    for (const topic of required) {
      expect(text, `Phase 10 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('produces the six report elements PROMPT.md requires', () => {
    const reportLab = PHASE_10.labs.find((l) => l.id === 'p10-lab-3')!;
    const text = `${reportLab.objective} ${reportLab.challenge}`.toLowerCase();
    for (const element of [
      'finding',
      'severity',
      'evidence',
      'risk',
      'remediation',
      'validation',
    ]) {
      expect(text, `report lab never mentions "${element}"`).toContain(element);
    }
  });

  it('states the authorisation constraint in the scanning lab', () => {
    const scanLab = PHASE_10.labs.find((l) => l.id === 'p10-lab-1')!;
    const text = [scanLab.environment, scanLab.topology, ...scanLab.steps.map((s) => s.instruction)]
      .join(' ')
      .toLowerCase();
    expect(text).toMatch(/authoris|owned/);
  });

  it('ships three lessons and four labs', () => {
    expect(PHASE_10.lessons).toHaveLength(3);
    expect(PHASE_10.labs).toHaveLength(4);
  });
});

describe('vulnerability findings data', () => {
  it('contains both confirmed findings and false positives', () => {
    expect(CONFIRMED_COUNT).toBeGreaterThan(0);
    expect(FALSE_POSITIVE_COUNT).toBeGreaterThan(0);
    expect(CONFIRMED_COUNT + FALSE_POSITIVE_COUNT).toBe(VULN_FINDINGS.length);
  });

  it('stores vectors rather than scores, so the score is always computed', () => {
    for (const f of VULN_FINDINGS) {
      expect(f).not.toHaveProperty('score');
      expect(baseScore(f.vector)).toBeGreaterThan(0);
    }
  });

  it('gives every finding both scanner and verification evidence', () => {
    for (const f of VULN_FINDINGS) {
      expect(f.scannerEvidence.length, `${f.id} has no scanner evidence`).toBeGreaterThan(20);
      expect(f.verificationEvidence.length, `${f.id} has no verification evidence`).toBeGreaterThan(
        20
      );
      expect(f.verdictRationale.length).toBeGreaterThan(60);
    }
  });

  it('includes a high-scoring finding that the environment constrains', () => {
    const constrained = VULN_FINDINGS.filter((f) => f.contextOverridesScore);
    expect(constrained.length).toBeGreaterThan(0);

    // The constrained one must actually outscore the top unconstrained finding,
    // or the prioritisation lesson has nothing to demonstrate.
    const top = byRealPriority()[0];
    expect(baseScore(constrained[0].vector)).toBeGreaterThanOrEqual(baseScore(top.vector));
  });

  it('gives confirmed findings remediation and validation steps', () => {
    for (const f of VULN_FINDINGS.filter((x) => x.verdict === 'confirmed')) {
      expect(f.remediation.length, `${f.id} has no remediation`).toBeGreaterThan(20);
      expect(f.validation.length, `${f.id} has no validation`).toBeGreaterThan(20);
    }
  });

  it('uses reserved placeholder CVE identifiers rather than real advisories', () => {
    for (const f of VULN_FINDINGS) {
      expect(f.cve).toMatch(/^CVE-2026-1000\d$/);
    }
  });

  it('resolves a finding by id', () => {
    expect(getFinding('v0')?.verdict).toBe('confirmed');
    expect(getFinding('nope')).toBeUndefined();
  });
});

describe('vulnerability triage grading', () => {
  it('scores a perfect triage', () => {
    const result = gradeVulnTriage(perfectVulnTriage());
    expect(result.correctCount).toBe(VULN_FINDINGS.length);
    expect(result.percentage).toBe(100);
    expect(result.missedVulnerabilities).toBe(0);
    expect(result.falseReports).toBe(0);
  });

  it('names dismissing a real finding a missed vulnerability', () => {
    const answer = { ...perfectVulnTriage() };
    const real = VULN_FINDINGS.find((f) => f.verdict === 'confirmed')!;
    answer[real.id] = 'false-positive';

    const result = gradeVulnTriage(answer);
    expect(result.missedVulnerabilities).toBe(1);
    expect(result.items.find((i) => i.findingId === real.id)?.errorKind).toBe(
      'missed-vulnerability'
    );
  });

  it('names reporting a false positive a false report', () => {
    const answer = { ...perfectVulnTriage() };
    const fp = VULN_FINDINGS.find((f) => f.verdict === 'false-positive')!;
    answer[fp.id] = 'confirmed';

    const result = gradeVulnTriage(answer);
    expect(result.falseReports).toBe(1);
    expect(result.items.find((i) => i.findingId === fp.id)?.errorKind).toBe('false-report');
  });

  it('penalises confirming everything', () => {
    const answer: VulnAnswer = Object.fromEntries(
      VULN_FINDINGS.map((f) => [f.id, 'confirmed' as const])
    );
    const result = gradeVulnTriage(answer);
    expect(result.falseReports).toBe(FALSE_POSITIVE_COUNT);
  });

  it('tracks completeness and count', () => {
    expect(isVulnTriageComplete({})).toBe(false);
    expect(countVulnTriaged({})).toBe(0);
    expect(isVulnTriageComplete(perfectVulnTriage())).toBe(true);
  });
});

describe('prioritisation', () => {
  it('sorts naively by descending raw score', () => {
    const order = byRawScore().map((f) => f.score);
    expect([...order].sort((a, b) => b - a)).toEqual(order);
  });

  it('excludes false positives from real priority', () => {
    const real = byRealPriority();
    expect(real).toHaveLength(CONFIRMED_COUNT);
    expect(real.every((f) => f.verdict === 'confirmed')).toBe(true);
  });

  it('ranks an environment-constrained finding below unconstrained ones', () => {
    const real = byRealPriority();
    const firstConstrained = real.findIndex((f) => f.contextOverridesScore);
    const lastUnconstrained = real.map((f) => f.contextOverridesScore).lastIndexOf(false);
    expect(firstConstrained).toBeGreaterThan(lastUnconstrained);
  });

  it('produces a different top finding than raw score alone', () => {
    // This is the phase's central claim, so it is asserted rather than assumed.
    const delta = prioritisationDelta();
    expect(delta.differs).toBe(true);
    expect(delta.naiveTop.id).not.toBe(delta.realTop.id);
  });

  it('attaches a computed score and severity to a finding', () => {
    const scored = scoreFinding(VULN_FINDINGS[0]);
    expect(scored.score).toBe(baseScore(VULN_FINDINGS[0].vector));
    expect(scored.severity).toBe(severityOf(scored.score));
  });
});

describe('Phase 10 simulated evidence', () => {
  it('states the authorisation requirement before discussing scanning', () => {
    const out = runCommand('explain vulnerability scanning').output;
    expect(out).toMatch(/AUTHORISATION/);
    expect(out).toMatch(/own or are contracted to test/i);
  });

  it('explains what CVSS does not measure', () => {
    const out = runCommand('explain cvss').output;
    expect(out).toMatch(/WHAT CVSS DOES NOT KNOW/);
    expect(out).toMatch(/does not describe your exposure/i);
  });

  it('warns that the scan report is not a work list', () => {
    const out = runCommand('show scan report').output;
    expect(out).toMatch(/not a work list/i);
    expect(out).toMatch(/two of these are false positives/i);
  });

  it('shows verification disproving the Struts finding', () => {
    const out = runCommand('verify finding struts').output;
    expect(out).toMatch(/FALSE POSITIVE/);
    expect(out).toMatch(/no Java runtime/i);
  });

  it('distinguishes confirmed-but-constrained from false positive', () => {
    const out = runCommand('verify finding postgres').output;
    expect(out).toMatch(/CONFIRMED, but not remotely reachable/i);
    expect(out).toMatch(/not a false/i);
  });

  it('names chaining as what separates a pentest from a scan', () => {
    const out = runCommand('compare scan pentest').output;
    expect(out).toMatch(/Chains findings/);
    expect(out).toMatch(/only reports scanner output is not a pentest/i);
  });

  it('orders the remediation plan by exposure, not score', () => {
    const out = runCommand('show remediation plan').output;
    expect(out).toMatch(/NOTE THE ORDERING/);
    expect(out).toMatch(/scores 10\.0 and sits fifth/i);
  });

  it('requires validation to prove the service still works', () => {
    const out = runCommand('validate remediation').output;
    expect(out).toMatch(/EVIDENCE SERVICE STILL WORKS/);
    expect(out).toMatch(/BOTH/);
  });

  it('labels every artifact with a provenance', () => {
    for (const c of PHASE_10_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(c.provenance);
    }
  });
});

describe('VulnManagementView', () => {
  it('computes a CVSS score from the selected metrics', () => {
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);
    // Default vector is AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8 Critical.
    expect(screen.getByTestId('cvss-score')).toHaveTextContent('9.8');
    expect(screen.getByTestId('cvss-severity')).toHaveTextContent('Critical');
  });

  it('recalculates when a metric changes', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);

    await user.click(screen.getByRole('button', { name: 'Attack Vector: Physical' }));
    expect(screen.getByTestId('cvss-score')).not.toHaveTextContent('9.8');
  });

  it('names the metric change that most reduces the score', () => {
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);
    expect(screen.getByTestId('cvss-reduction')).toBeInTheDocument();
  });

  it('blocks verdict submission until every finding is triaged', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);

    await user.click(screen.getByRole('button', { name: 'Triage the findings' }));
    expect(screen.getByRole('button', { name: 'Submit verdicts' })).toBeDisabled();
  });

  it('grades a perfect triage and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);

    await user.click(screen.getByRole('button', { name: 'Triage the findings' }));
    for (const f of VULN_FINDINGS) {
      const label = f.verdict === 'confirmed' ? 'Confirmed' : 'False positive';
      await user.click(screen.getByRole('button', { name: `${f.cve}: ${label}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit verdicts' }));

    expect(screen.getByTestId('vuln-score')).toHaveTextContent(`${VULN_FINDINGS.length}/`);
    expect(screen.getByTestId('false-reports')).toHaveTextContent('0');
    expect(useMasteryStore.getState().getLevel('vulnerability-triage')).toBe(1);
  });

  it('reports false reports when the learner confirms everything', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);

    await user.click(screen.getByRole('button', { name: 'Triage the findings' }));
    for (const f of VULN_FINDINGS) {
      await user.click(screen.getByRole('button', { name: `${f.cve}: Confirmed` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit verdicts' }));

    expect(screen.getByTestId('false-reports')).toHaveTextContent(String(FALSE_POSITIVE_COUNT));
  });

  it('shows the two orderings differing on the prioritisation tab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/vulnerabilities', '/vulnerabilities', <VulnManagementView />);

    await user.click(screen.getByRole('button', { name: 'Prioritisation' }));

    expect(
      screen.getByText(/CVSS measures the vulnerability, not your exposure/)
    ).toBeInTheDocument();
    const naive = screen.getByTestId('naive-order');
    const real = screen.getByTestId('real-order');
    expect(within(naive).getAllByRole('listitem')).toHaveLength(VULN_FINDINGS.length);
    expect(within(real).getAllByRole('listitem')).toHaveLength(CONFIRMED_COUNT);
  });
});

describe('Phase 10 labs and quizzes', () => {
  it('shows the false positive verification in the triage lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p10-lab-2', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'verify finding struts{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/FALSE POSITIVE/).length).toBeGreaterThan(0);
  });

  it('shows the exposure-ordered plan in the remediation lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p10-lab-3', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'show remediation plan{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/NOTE THE ORDERING/)).toBeInTheDocument();
  });

  it('grades the CVSS lesson quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p10-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'Only that it is a uniquely identified, publicly disclosed vulnerability',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('cve')).toBe(1);
  });
});
