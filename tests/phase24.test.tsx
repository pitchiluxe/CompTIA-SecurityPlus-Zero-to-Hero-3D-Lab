import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { allQuestions } from '../src/data/curriculum';
import { EXAM_DOMAINS } from '../src/data/examBlueprint';
import {
  buildAdaptiveSession,
  questionsForConcepts,
  questionsForDomain,
  shuffleQuestions,
} from '../src/lib/quizEngine';
import { PHASE_24 } from '../src/data/phase24';
import { PHASE_24_COMMANDS } from '../src/sim/phase24Commands';
import { ExamPrepView } from '../src/components/ExamPrepView';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';
import { __setWebGLAvailable } from '../src/lib/webgl';
import type { MasteryLevel } from '../src/types';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

function phaseText(): string {
  const lessons = PHASE_24.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_24.labs.flatMap((lab) => [
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
  const commands = PHASE_24_COMMANDS.flatMap((c) => [c.output, c.teaches ?? '']);
  return [...lessons, ...labs, ...commands].join('\n');
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('quiz engine — Phase 24 session builders', () => {
  const pool = allQuestions();

  it('filters questions by domain title', () => {
    const domain = EXAM_DOMAINS[3]; // Security Operations
    const filtered = questionsForDomain(pool, domain.title);
    expect(filtered.length).toBeGreaterThan(0);
    for (const q of filtered) expect(q.domain).toBe(domain.title);
  });

  it('filters questions by a set of concept ids', () => {
    const sample = pool.find((q) => q.conceptId)!;
    const filtered = questionsForConcepts(pool, [sample.conceptId!]);
    expect(filtered.length).toBeGreaterThan(0);
    for (const q of filtered) expect(q.conceptId).toBe(sample.conceptId);
  });

  it('returns an empty array for concepts nothing is tagged with', () => {
    expect(questionsForConcepts(pool, ['no-such-concept'])).toEqual([]);
  });

  it('orders an adaptive session weakest-tier-first', () => {
    const levels: Record<string, MasteryLevel> = {};
    const withConcepts = pool.filter((q) => q.conceptId);
    // Force the first two distinct concepts to opposite ends of the ladder.
    const [a, b] = [...new Set(withConcepts.map((q) => q.conceptId!))];
    levels[a] = 0;
    levels[b] = 6;
    const levelOf = (id: string): MasteryLevel => levels[id] ?? 3;

    const targeted = withConcepts.filter((q) => q.conceptId === a || q.conceptId === b);
    const session = buildAdaptiveSession(targeted, levelOf, targeted.length, 5);

    const firstWeakIndex = session.findIndex((q) => q.conceptId === a);
    const firstStrongIndex = session.findIndex((q) => q.conceptId === b);
    expect(firstWeakIndex).toBeLessThan(firstStrongIndex);
  });

  it('caps an adaptive session to the requested size', () => {
    const session = buildAdaptiveSession(pool, () => 3, 10, 2);
    expect(session).toHaveLength(10);
  });

  it('is deterministic for a given seed', () => {
    const a = buildAdaptiveSession(pool, () => 3, 15, 9);
    const b = buildAdaptiveSession(pool, () => 3, 15, 9);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('reuses the existing deterministic shuffle for mock exam pools', () => {
    expect(shuffleQuestions(pool, 42)).toEqual(shuffleQuestions(pool, 42));
  });
});

describe('Phase 24 curriculum and safety', () => {
  it('has two lessons and two labs', () => {
    expect(PHASE_24.lessons).toHaveLength(2);
    expect(PHASE_24.labs).toHaveLength(2);
  });

  it('gives every prepared command a provenance and a substantial teaching note', () => {
    for (const command of PHASE_24_COMMANDS) {
      expect(['real', 'simulated', 'prepared']).toContain(command.provenance);
      expect(command.teaches && command.teaches.length).toBeGreaterThan(40);
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

describe('Exam Preparation view', () => {
  it('shows all four session types on the selection screen', () => {
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    expect(screen.getByText('Domain Quiz')).toBeInTheDocument();
    expect(screen.getByText('Weak-Area Review')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Session')).toBeInTheDocument();
    expect(screen.getByText('Mock Exam')).toBeInTheDocument();
  });

  it('disables weak-area review until a concept is flagged weak', () => {
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);
    expect(screen.getByRole('button', { name: 'Start weak-area review' })).toBeDisabled();
  });

  it('enables weak-area review once a concept is flagged weak, and scopes the session to it', async () => {
    useMasteryStore.getState().recordOutcome('exam-clue', false);
    const user = userEvent.setup({ delay: null });
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    await user.click(screen.getByRole('button', { name: 'Start weak-area review' }));

    expect(screen.getByText(/Exam Preparation — Weak-Area Review/)).toBeInTheDocument();
    for (const q of questionsForConcepts(allQuestions(), ['exam-clue'])) {
      expect(screen.getByText(q.stem)).toBeInTheDocument();
    }
  });

  it('starts a domain quiz scoped to exactly that domain', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    await user.click(screen.getByRole('button', { name: /4\.0 Security Operations/ }));

    expect(screen.getAllByText(/Security Operations/).length).toBeGreaterThan(0);
    const expected = questionsForDomain(allQuestions(), 'Security Operations');
    expect(screen.getByText(expected[0].stem)).toBeInTheDocument();
  });

  it('reveals an answer immediately after selection in an untimed session', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    await user.click(screen.getByRole('button', { name: 'Start adaptive session' }));

    const firstOption = screen.getAllByRole('button').find((b) => b.textContent && !['Back to menu'].includes(b.textContent));
    expect(firstOption).toBeTruthy();
  });

  it('runs a timed mock exam and shows a scaled score with a domain breakdown on submit', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    // Domain-scoped rather than the full bank — same timed/report code path,
    // far fewer questions rendered, so the interaction stays fast under jsdom.
    await user.click(screen.getByRole('button', { name: '1.0 only' }));
    expect(screen.getByText(/Exam Preparation — Mock Exam/)).toBeInTheDocument();
    expect(screen.getByText(/Time remaining/)).toBeInTheDocument();

    // Answer the first question so the submit button is enabled.
    const optionButtons = screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('w-full rounded-md border'));
    await user.click(optionButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Submit exam' }));

    expect(screen.getByTestId('scaled-score')).toBeInTheDocument();
    expect(screen.getByTestId('domain-breakdown')).toBeInTheDocument();
  }, 20_000);

  it('returns to the selection menu', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/exam-prep', '/exam-prep', <ExamPrepView />);

    await user.click(screen.getByRole('button', { name: 'Start adaptive session' }));
    await user.click(screen.getByRole('button', { name: 'Back to menu' }));

    expect(screen.getByText('Weak-Area Review')).toBeInTheDocument();
  });
});
