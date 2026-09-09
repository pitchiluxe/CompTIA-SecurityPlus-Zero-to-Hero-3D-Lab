import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  CATEGORY_LABELS,
  INCIDENTS,
  INCIDENT_PATTERNS,
  IR_PHASES,
  ORDER_OF_VOLATILITY,
  getIncident,
  getPattern,
  type IncidentCategory,
} from '../src/data/incidents';
import {
  gradeAssets,
  gradeContainment,
  gradeTimeline,
  shuffledTimeline,
} from '../src/lib/irEngine';
import { PHASE_12 } from '../src/data/phase12';
import { IncidentConsoleView } from '../src/components/IncidentConsoleView';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_12_COMMANDS } from '../src/sim/phase12Commands';
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

const INCIDENT = INCIDENTS[0];

/** Every word of Phase 12 prose, for coverage and safety scanning. */
function phaseText(): string {
  const lessons = PHASE_12.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_12.labs.flatMap((lab) => [
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
  const commands = PHASE_12_COMMANDS.flatMap((c) => [c.output, c.teaches ?? '']);
  return [...lessons, ...labs, ...commands].join('\n');
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

// ---------------------------------------------------------------------------

describe('containment grading', () => {
  const ids = (names: string[]) =>
    INCIDENT.containmentOptions.filter((o) => names.includes(o.action)).map((o) => o.id);

  it('grades a plan that stops the attacker and keeps the evidence on both axes', () => {
    const recommended = INCIDENT.containmentOptions.filter((o) => o.recommended).map((o) => o.id);
    const result = gradeContainment(INCIDENT, recommended);

    expect(result.contained).toBe(true);
    expect(result.evidencePreserved).toBe(true);
    expect(result.missed).toHaveLength(0);
    expect(result.wronglyChosen).toHaveLength(0);
    expect(result.percentage).toBe(100);
  });

  it('fails BOTH axes for a reboot, which is the trap the phase is built around', () => {
    const reboot = ids(['Reboot WS-01 to clear the malicious process']);
    const result = gradeContainment(INCIDENT, reboot);

    expect(result.contained).toBe(false);
    expect(result.evidencePreserved).toBe(false);
    expect(result.evidenceDestroyingActions).toHaveLength(1);
  });

  it('separates the two axes: reimaging contains but destroys evidence', () => {
    const reimage = ids(['Reimage WS-01 immediately']);
    const result = gradeContainment(INCIDENT, reimage);

    expect(result.contained).toBe(true);
    expect(result.evidencePreserved).toBe(false);
  });

  it('separates the two axes: monitoring preserves evidence but contains nothing', () => {
    const monitor = ids(['Do nothing yet and continue monitoring to learn more']);
    const result = gradeContainment(INCIDENT, monitor);

    expect(result.contained).toBe(false);
    expect(result.evidencePreserved).toBe(true);
  });

  it('treats an empty plan as uncontained rather than evidence-safe success', () => {
    const result = gradeContainment(INCIDENT, []);
    expect(result.contained).toBe(false);
    expect(result.evidencePreserved).toBe(true);
    expect(result.missed.length).toBeGreaterThan(0);
  });

  it('credits leaving a wrong option unselected, not only picking right ones', () => {
    const partial = gradeContainment(INCIDENT, []);
    const wrongCount = INCIDENT.containmentOptions.filter((o) => !o.recommended).length;
    expect(partial.correctCount).toBe(wrongCount);
  });

  it('counts a blocked C2 address as recommended even though it stops nothing alone', () => {
    const block = INCIDENT.containmentOptions.find((o) =>
      o.action.startsWith('Block 203.0.113.55')
    );
    expect(block?.recommended).toBe(true);
    expect(block?.stopsAttacker).toBe(false);
  });
});

describe('timeline grading', () => {
  const correctOrder = INCIDENT.timeline.map((_, i) => i);

  it('accepts the chronological order', () => {
    const result = gradeTimeline(INCIDENT, correctOrder);
    expect(result.correct).toBe(true);
    expect(result.correctPositions).toBe(INCIDENT.timeline.length);
    expect(result.percentage).toBe(100);
  });

  it('gives partial credit for events in the right place', () => {
    const nearly = [...correctOrder];
    [nearly[0], nearly[1]] = [nearly[1], nearly[0]];

    const result = gradeTimeline(INCIDENT, nearly);
    expect(result.correct).toBe(false);
    expect(result.correctPositions).toBe(INCIDENT.timeline.length - 2);
  });

  it('rejects an answer of the wrong length rather than scoring it', () => {
    expect(gradeTimeline(INCIDENT, [0, 1, 2])).toEqual({
      correct: false,
      correctPositions: 0,
      total: INCIDENT.timeline.length,
      percentage: 0,
    });
  });
});

describe('timeline shuffling', () => {
  it('is deterministic for a given seed, so the exercise is reproducible', () => {
    expect(shuffledTimeline(INCIDENT)).toEqual(shuffledTimeline(INCIDENT));
    expect(shuffledTimeline(INCIDENT, 99)).not.toEqual(shuffledTimeline(INCIDENT, 7));
  });

  it('is a permutation, losing and duplicating nothing', () => {
    const shuffled = [...shuffledTimeline(INCIDENT)].sort((a, b) => a - b);
    expect(shuffled).toEqual(INCIDENT.timeline.map((_, i) => i));
  });

  it('does not hand the learner the answer already sorted', () => {
    expect(shuffledTimeline(INCIDENT)).not.toEqual(INCIDENT.timeline.map((_, i) => i));
  });
});

describe('asset scoping', () => {
  const confirmed = INCIDENT.affectedAssets.filter((a) => a.confirmed).map((a) => a.name);

  it('scores a correct scope at 100 percent', () => {
    const result = gradeAssets(INCIDENT, confirmed);
    expect(result.missed).toHaveLength(0);
    expect(result.falselyIncluded).toHaveLength(0);
    expect(result.percentage).toBe(100);
  });

  it('penalises inflating the scope with uninvolved assets', () => {
    const result = gradeAssets(INCIDENT, [...confirmed, 'SW-01']);
    expect(result.falselyIncluded).toEqual(['SW-01']);
    expect(result.percentage).toBeLessThan(100);
  });

  it('reports the second compromised host as missed when scope follows the alert', () => {
    const result = gradeAssets(INCIDENT, ['WS-01']);
    expect(result.missed).toContain('SRV-01');
  });
});

describe('the incident data set', () => {
  it('carries the incident the platform opened in Phase 0', () => {
    expect(INCIDENT.reference).toBe('IR-2026-0908-01');
    expect(getIncident('inc-0')).toBe(INCIDENT);
    expect(getIncident('nope')).toBeUndefined();
  });

  it('stores the timeline in chronological order, since grading depends on it', () => {
    const times = INCIDENT.timeline.map((e) => e.time);
    expect([...times].sort()).toEqual(times);
  });

  it('draws the timeline from more than one source, which is the point of correlation', () => {
    const sources = new Set(INCIDENT.timeline.map((e) => e.source));
    expect(sources.size).toBeGreaterThanOrEqual(6);
  });

  it('offers at least one option that satisfies both axes', () => {
    expect(
      INCIDENT.containmentOptions.some(
        (o) => o.stopsAttacker && o.preservesEvidence && o.recommended
      )
    ).toBe(true);
  });

  it('gives every containment option a rationale, since the grade must be explainable', () => {
    for (const option of INCIDENT.containmentOptions) {
      expect(option.rationale.length).toBeGreaterThan(80);
    }
  });

  it('includes assets that are not involved, so scoping is a decision', () => {
    expect(INCIDENT.affectedAssets.some((a) => !a.confirmed)).toBe(true);
    expect(INCIDENT.affectedAssets.some((a) => a.confirmed)).toBe(true);
  });

  it('names the seven lifecycle phases with the question each one asks', () => {
    expect(IR_PHASES).toHaveLength(7);
    expect(IR_PHASES[0].id).toBe('preparation');
    expect(IR_PHASES[IR_PHASES.length - 1].id).toBe('lessons-learned');
    for (const phase of IR_PHASES) expect(phase.question).toMatch(/\?$/);
  });

  it('ranks volatility from most to least volatile without gaps', () => {
    expect(ORDER_OF_VOLATILITY.map((v) => v.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(ORDER_OF_VOLATILITY[1].source).toMatch(/Memory/);
    expect(ORDER_OF_VOLATILITY[ORDER_OF_VOLATILITY.length - 1].source).toMatch(/Archival/);
  });

  it('covers all eight incident types PROMPT.md names', () => {
    const categories = INCIDENT_PATTERNS.map((p) => p.category);
    expect(new Set(categories).size).toBe(8);
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([...categories].sort());
  });

  it('gives every pattern indicators, a containment priority and a characteristic mistake', () => {
    for (const pattern of INCIDENT_PATTERNS) {
      expect(pattern.firstIndicators.length).toBeGreaterThanOrEqual(3);
      expect(pattern.evidenceToPreserve.length).toBeGreaterThanOrEqual(3);
      expect(pattern.containmentPriority.length).toBeGreaterThan(20);
      expect(pattern.commonMistake.length).toBeGreaterThan(40);
    }
  });

  it('records the ransomware exception to capture-before-contain', () => {
    expect(getPattern('ransomware')?.containmentPriority).toMatch(/immediately/i);
  });

  it('resolves patterns by category and reports an unknown one', () => {
    expect(getPattern('phishing')?.category).toBe('phishing');
    expect(getPattern('not-a-category' as IncidentCategory)).toBeUndefined();
  });
});

describe('Phase 12 prepared commands', () => {
  it('registers every artifact in the shared allowlist', () => {
    for (const command of PHASE_12_COMMANDS) {
      const result = runCommand(command.match);
      expect(result.recognised).toBe(true);
      expect(result.output).toBe(command.output);
    }
  });

  it('labels provenance on every artifact', () => {
    for (const command of PHASE_12_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(command.provenance);
    }
  });

  it('still refuses anything outside the allowlist', () => {
    const result = runCommand('reboot ws-01');
    expect(result.recognised).toBe(false);
    expect(result.output).toMatch(/not part of this lab/i);
  });

  it('teaches something on every artifact rather than only printing', () => {
    for (const command of PHASE_12_COMMANDS) {
      expect(command.teaches && command.teaches.length).toBeGreaterThan(60);
    }
  });
});

describe('Incident Console', () => {
  it('opens on the incident carried since Phase 0 and lists the seven phases', () => {
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    expect(screen.getAllByText(/IR-2026-0908-01/).length).toBeGreaterThan(0);
    const phases = screen.getByTestId('ir-phases');
    expect(within(phases).getAllByRole('listitem')).toHaveLength(7);
  });

  it('shows the volatility ordering on the evidence step', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '2. Evidence' }));

    const order = screen.getByTestId('volatility-order');
    expect(within(order).getAllByRole('listitem')).toHaveLength(8);
    expect(within(order).getByText(/Memory \(RAM\)/)).toBeInTheDocument();
  });

  it('grades a reconstructed timeline against the deterministic shuffle', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '3. Timeline' }));
    expect(within(screen.getByTestId('timeline-builder')).getAllByRole('listitem')).toHaveLength(
      INCIDENT.timeline.length
    );

    await user.click(screen.getByRole('button', { name: 'Submit timeline' }));

    const expected = gradeTimeline(INCIDENT, shuffledTimeline(INCIDENT));
    expect(screen.getByTestId('timeline-score')).toHaveTextContent(
      `${expected.correctPositions}/${expected.total}`
    );
  }, 20_000);

  it('lets the learner reorder events before submitting', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '3. Timeline' }));

    const builder = screen.getByTestId('timeline-builder');
    const firstEventBefore = within(builder).getAllByRole('listitem')[0].textContent;

    const shuffled = shuffledTimeline(INCIDENT);
    const secondEvent = INCIDENT.timeline[shuffled[1]].event;
    await user.click(screen.getByRole('button', { name: `Move up: ${secondEvent}` }));

    expect(within(builder).getAllByRole('listitem')[0].textContent).not.toBe(firstEventBefore);
  }, 20_000);

  it('scores asset selection and names what was missed', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '4. Assets' }));
    await user.click(screen.getByRole('button', { name: 'Include WS-01' }));
    await user.click(screen.getByRole('button', { name: 'Submit scope' }));

    expect(screen.getByTestId('assets-missed')).toHaveTextContent('SRV-01');
  }, 20_000);

  it('reports both containment axes as failed for a reboot', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '5. Contain' }));
    await user.click(
      screen.getByRole('button', { name: 'Select: Reboot WS-01 to clear the malicious process' })
    );
    await user.click(screen.getByRole('button', { name: 'Submit containment plan' }));

    expect(screen.getByTestId('contained')).toHaveTextContent('No');
    expect(screen.getByTestId('evidence-preserved')).toHaveTextContent('No');
  }, 20_000);

  it('reports both axes as satisfied for the recommended plan and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '5. Contain' }));
    for (const option of INCIDENT.containmentOptions.filter((o) => o.recommended)) {
      await user.click(screen.getByRole('button', { name: `Select: ${option.action}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Submit containment plan' }));

    expect(screen.getByTestId('contained')).toHaveTextContent('Yes');
    expect(screen.getByTestId('evidence-preserved')).toHaveTextContent('Yes');
    expect(useMasteryStore.getState().getLevel('containment')).toBe(1);
  }, 20_000);

  it('separates eradication from recovery on the remediate step', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '6. Remediate' }));

    expect(within(screen.getByTestId('eradication-steps')).getAllByRole('listitem')).toHaveLength(
      INCIDENT.eradicationSteps.length
    );
    expect(within(screen.getByTestId('recovery-steps')).getAllByRole('listitem')).toHaveLength(
      INCIDENT.recoverySteps.length
    );
  });

  it('closes with blameless lessons that name control gaps rather than the user', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/incident-console', '/incident-console', <IncidentConsoleView />);

    await user.click(screen.getByRole('button', { name: '7. Close and report' }));

    const lessons = screen.getByTestId('lessons-learned');
    expect(within(lessons).getAllByRole('listitem').length).toBeGreaterThanOrEqual(5);
    expect(lessons.textContent).not.toMatch(/user (should not|clicked)/i);
    expect(screen.getByTestId('key-lesson')).toHaveTextContent(/phishing-resistant/i);
  });
});

describe('Phase 12 curriculum', () => {
  it('is wired into the Security Operations domain with the SOC scene', () => {
    expect(PHASE_12.number).toBe(12);
    expect(PHASE_12.examDomain).toBe('Security Operations');
    expect(PHASE_12.scene).toBe('soc');
  });

  it('carries lessons, labs and a full quiz set', () => {
    expect(PHASE_12.lessons.length).toBeGreaterThanOrEqual(3);
    expect(PHASE_12.labs.length).toBeGreaterThanOrEqual(3);
    expect(PHASE_12.lessons.flatMap((l) => l.quiz).length).toBeGreaterThanOrEqual(10);
  });

  it('gives every lab the full lab template PROMPT.md requires', () => {
    for (const lab of PHASE_12.labs) {
      expect(lab.objective.length).toBeGreaterThan(20);
      expect(lab.securityConcepts.length).toBeGreaterThan(0);
      expect(lab.steps.length).toBeGreaterThan(0);
      expect(lab.expectedResults.length).toBeGreaterThan(0);
      expect(lab.verification.length).toBeGreaterThan(0);
      expect(lab.troubleshooting.length).toBeGreaterThan(0);
      expect(lab.challenge?.length ?? 0).toBeGreaterThan(40);
      expect(lab.evidence.length).toBeGreaterThan(0);
      expect(lab.securityLesson.length).toBeGreaterThan(40);
    }
  });

  it('references every lab command against the allowlist', () => {
    for (const lab of PHASE_12.labs) {
      for (const step of lab.steps) {
        if (!step.command) continue;
        expect(runCommand(step.command).recognised).toBe(true);
      }
    }
  });

  it('covers the concepts the exam tests in this domain', () => {
    const text = phaseText().toLowerCase();
    for (const term of [
      'preparation',
      'detection',
      'analysis',
      'containment',
      'eradication',
      'recovery',
      'lessons learned',
      'order of volatility',
      'chain of custody',
      'dwell time',
      'root cause',
      'ransomware',
      'phishing',
      'data exfiltration',
      'privilege escalation',
      'blameless',
    ]) {
      expect(text, `Phase 12 never mentions "${term}"`).toContain(term);
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

  it('contains no credential, key or token material', () => {
    const text = phaseText();
    expect(text).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(text).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(text).not.toMatch(/\bapi[_-]?key\s*[:=]/i);
  });
});

describe('Phase 12 labs and quizzes', () => {
  it('explains the lifecycle inside the lab terminal', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p12-lab-0', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'explain ir lifecycle{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/PREPARATION IS THE ONLY PHASE/)).toBeInTheDocument();
  });

  it('shows the two-axis containment matrix in the containment lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p12-lab-1', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'explain containment tradeoff{Enter}'
    );

    // The column layout matters here, so assert the raw text rather than the
    // whitespace-normalised match getByText would perform.
    const transcript = screen.getByTestId('lab-transcript');
    expect(transcript.textContent).toMatch(/STOPS ATTACKER {2}PRESERVES EVIDENCE/);
    expect(transcript.textContent).toMatch(/Reboot the host +no +NO/);
  });

  it('grades the lifecycle quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p12-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(screen.getByRole('button', { name: 'Preparation' }));
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('preparation')).toBe(1);
  });
});
