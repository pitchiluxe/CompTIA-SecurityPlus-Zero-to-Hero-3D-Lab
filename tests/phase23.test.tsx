import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getIncident } from '../src/data/incidents';
import { CAPSTONE_ALERTS } from '../src/data/capstoneAlerts';
import { gradeAssets, gradeContainment, gradeTimeline, shuffledTimeline } from '../src/lib/irEngine';
import { gradeTriage, isTriageComplete, type TriageAnswer } from '../src/lib/triageEngine';
import { PHASE_23 } from '../src/data/phase23';
import { PHASE_23_COMMANDS } from '../src/sim/phase23Commands';
import { SocCapstoneView } from '../src/components/SocCapstoneView';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';
import { __setWebGLAvailable } from '../src/lib/webgl';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

const INCIDENT = getIncident('inc-1')!;

/** Every word of Phase 23 prose, for coverage and safety scanning. */
function phaseText(): string {
  const lessons = PHASE_23.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_23.labs.flatMap((lab) => [
    lab.title,
    lab.objective,
    ...lab.securityConcepts,
    ...lab.steps.flatMap((s) => [s.instruction, s.expected, s.command ?? '']),
    ...lab.expectedResults,
    ...lab.verification,
    ...lab.troubleshooting,
    lab.challenge ?? '',
    lab.securityLesson,
  ]);
  const commands = PHASE_23_COMMANDS.flatMap((c) => [c.output, c.teaches ?? '']);
  return [...lessons, ...labs, ...commands].join('\n');
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('capstone incident data (inc-1)', () => {
  it('is a ransomware incident distinct from inc-0', () => {
    expect(INCIDENT.id).toBe('inc-1');
    expect(INCIDENT.category).toBe('ransomware');
  });

  it('has a chronologically ordered timeline', () => {
    const times = INCIDENT.timeline.map((e) => e.time);
    expect([...times].sort()).toEqual(times);
    expect(INCIDENT.timeline.length).toBeGreaterThanOrEqual(6);
  });

  it('has four affected assets confirmed and at least one distractor excluded', () => {
    const confirmed = INCIDENT.affectedAssets.filter((a) => a.confirmed);
    const distractors = INCIDENT.affectedAssets.filter((a) => !a.confirmed);
    expect(confirmed.length).toBeGreaterThanOrEqual(4);
    expect(distractors.length).toBeGreaterThanOrEqual(2);
  });

  it('has at least one recommended action per axis and one option failing each axis', () => {
    const options = INCIDENT.containmentOptions;
    expect(options.some((o) => o.recommended && o.stopsAttacker && o.preservesEvidence)).toBe(true);
    expect(options.some((o) => o.recommended && !o.stopsAttacker)).toBe(true);
    expect(options.some((o) => !o.preservesEvidence)).toBe(true);
  });

  it('carries eradication, recovery, and blameless lessons learned', () => {
    expect(INCIDENT.eradicationSteps.length).toBeGreaterThan(0);
    expect(INCIDENT.recoverySteps.length).toBeGreaterThan(0);
    expect(INCIDENT.lessonsLearned.length).toBeGreaterThan(0);
    expect(INCIDENT.keyLesson.length).toBeGreaterThan(20);
  });
});

describe('containment grading demonstrates the ransomware exception', () => {
  it('reports the isolate-first plan as satisfying both axes', () => {
    const result = gradeContainment(INCIDENT, ['rco0', 'rco2', 'rco5']);
    expect(result.contained).toBe(true);
    expect(result.evidencePreserved).toBe(true);
  });

  it('reports capture-memory-first alone as NOT containing the attacker (unlike inc-0)', () => {
    const result = gradeContainment(INCIDENT, ['rco1']);
    expect(result.contained).toBe(false);
  });

  it('reports restoring from backup immediately as destroying evidence', () => {
    const result = gradeContainment(INCIDENT, ['rco4']);
    expect(result.evidencePreserved).toBe(false);
    expect(result.evidenceDestroyingActions.map((o) => o.id)).toContain('rco4');
  });

  it('reports a hard power-off as stopping the attacker but destroying evidence', () => {
    const result = gradeContainment(INCIDENT, ['rco6']);
    expect(result.contained).toBe(true);
    expect(result.evidencePreserved).toBe(false);
  });
});

describe('asset scoping', () => {
  it('flags CORE-FW-01 and BACKUP-SRV-01 as falsely included if selected', () => {
    const result = gradeAssets(INCIDENT, ['vendor-support', 'FILESRV-02', 'CORE-FW-01']);
    expect(result.falselyIncluded).toContain('CORE-FW-01');
    expect(result.missed.length).toBeGreaterThan(0);
  });

  it('gives a perfect score for exactly the confirmed assets', () => {
    const confirmedNames = INCIDENT.affectedAssets.filter((a) => a.confirmed).map((a) => a.name);
    const result = gradeAssets(INCIDENT, confirmedNames);
    expect(result.percentage).toBe(100);
  });
});

describe('capstone timeline shuffling', () => {
  it('grades a perfectly reconstructed order as fully correct', () => {
    const inOrder = INCIDENT.timeline.map((_, i) => i);
    const result = gradeTimeline(INCIDENT, inOrder);
    expect(result.correct).toBe(true);
    expect(result.percentage).toBe(100);
  });

  it('is deterministic for a given seed', () => {
    expect(shuffledTimeline(INCIDENT, 11)).toEqual(shuffledTimeline(INCIDENT, 11));
  });

  it('is a genuine permutation of every event index', () => {
    const shuffled = shuffledTimeline(INCIDENT, 11);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(INCIDENT.timeline.map((_, i) => i));
  });
});

describe('capstone triage alerts', () => {
  it('has exactly two true-positive and two false-positive alerts', () => {
    const tp = CAPSTONE_ALERTS.filter((a) => a.correctVerdict === 'true-positive');
    const fp = CAPSTONE_ALERTS.filter((a) => a.correctVerdict === 'false-positive');
    expect(tp).toHaveLength(2);
    expect(fp).toHaveLength(2);
  });

  it('grades a perfect triage as 100%', () => {
    const answer: TriageAnswer = Object.fromEntries(
      CAPSTONE_ALERTS.map((a) => [a.id, a.correctVerdict === 'true-positive' ? 'escalate' : 'close-fp'])
    );
    const result = gradeTriage(answer, CAPSTONE_ALERTS);
    expect(result.percentage).toBe(100);
    expect(result.missedIncidents).toBe(0);
    expect(result.falseEscalations).toBe(0);
  });

  it('flags closing a true positive as a missed incident', () => {
    const answer = Object.fromEntries(CAPSTONE_ALERTS.map((a) => [a.id, 'close-fp'] as const));
    const result = gradeTriage(answer, CAPSTONE_ALERTS);
    expect(result.missedIncidents).toBe(2);
  });

  it('is complete only once every alert has a decision', () => {
    expect(isTriageComplete({}, CAPSTONE_ALERTS)).toBe(false);
    const full = Object.fromEntries(CAPSTONE_ALERTS.map((a) => [a.id, 'escalate'] as const));
    expect(isTriageComplete(full, CAPSTONE_ALERTS)).toBe(true);
  });
});

describe('Phase 23 curriculum and safety', () => {
  it('has two lessons and two labs', () => {
    expect(PHASE_23.lessons).toHaveLength(2);
    expect(PHASE_23.labs).toHaveLength(2);
  });

  it('gives every prepared command a provenance and a substantial teaching note', () => {
    for (const command of PHASE_23_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(command.provenance);
      expect(command.teaches && command.teaches.length).toBeGreaterThan(40);
    }
  });

  it('keeps every address in a documentation or private range', () => {
    const addresses = phaseText().match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) ?? [];
    for (const address of addresses) {
      expect(
        address.startsWith('203.0.113.') ||
          address.startsWith('198.51.100.') ||
          address.startsWith('192.0.2.') ||
          address.startsWith('192.168.') ||
          address.startsWith('10.') ||
          address.startsWith('127.'),
        `${address} is outside the documentation and private ranges`
      ).toBe(true);
    }
  });

  it('contains no credential, key, or token material', () => {
    const text = phaseText();
    expect(text).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(text).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(text).not.toMatch(/\bapi[_-]?key\s*[:=]/i);
    expect(text).not.toMatch(/secret\s*[:=]/i);
  });
});

describe('Full SOC Capstone console', () => {
  it('opens on the ransomware incident and lists all eight steps', () => {
    renderAt('/soc-capstone', '/soc-capstone', <SocCapstoneView />);

    expect(screen.getAllByText(/IR-2026-0909-01/).length).toBeGreaterThan(0);
    for (const label of [
      '1. Detect',
      '2. Triage',
      '3. Investigate',
      '4. Collect Evidence',
      '5. Contain',
      '6. Remediate',
      '7. Recover',
      '8. Document',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('grades triage and reports missed incidents when everything is closed', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-capstone', '/soc-capstone', <SocCapstoneView />);

    await user.click(screen.getByRole('button', { name: '2. Triage' }));
    const closeButtons = screen.getAllByRole('button', { name: 'Close (false positive)' });
    for (const button of closeButtons) await user.click(button);
    await user.click(screen.getByRole('button', { name: 'Submit triage' }));

    expect(screen.getByTestId('triage-error-kinds')).toHaveTextContent('Missed incidents: 2');
  }, 20_000);

  it('grades the recommended containment plan as satisfying both axes and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-capstone', '/soc-capstone', <SocCapstoneView />);

    await user.click(screen.getByRole('button', { name: '5. Contain' }));
    for (const option of INCIDENT.containmentOptions.filter((o) => o.recommended)) {
      await user.click(screen.getByRole('button', { name: `Select: ${option.action}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit containment plan' }));

    expect(screen.getByTestId('contained')).toHaveTextContent('Yes');
    expect(screen.getByTestId('evidence-preserved')).toHaveTextContent('Yes');
    expect(useMasteryStore.getState().getLevel('ransomware')).toBe(1);
  }, 20_000);

  it('separates eradication from recovery and shows blameless lessons on document', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/soc-capstone', '/soc-capstone', <SocCapstoneView />);

    await user.click(screen.getByRole('button', { name: '6. Remediate' }));
    expect(within(screen.getByTestId('eradication-steps')).getAllByRole('listitem')).toHaveLength(
      INCIDENT.eradicationSteps.length
    );

    await user.click(screen.getByRole('button', { name: '7. Recover' }));
    expect(within(screen.getByTestId('recovery-steps')).getAllByRole('listitem')).toHaveLength(
      INCIDENT.recoverySteps.length
    );

    await user.click(screen.getByRole('button', { name: '8. Document' }));
    expect(screen.getByTestId('key-lesson').textContent?.length).toBeGreaterThan(20);
  });
});
