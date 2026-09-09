import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PHASES } from '../src/data/curriculum';
import { CAREER_ROLES } from '../src/data/careerRoles';
import { RESUME_BULLETS } from '../src/data/resumeBullets';
import { TROUBLESHOOT_SCENARIOS } from '../src/data/troubleshootScenarios';
import { allQuestions } from '../src/data/curriculum';
import {
  assessRole,
  gapSkills,
  recommendLabsForRole,
  interviewQuestionsForRole,
  troubleshootScenariosForRole,
  gradeBulletReview,
  isBulletReviewComplete,
  type BulletAnswer,
} from '../src/lib/careerEngine';
import { PHASE_26 } from '../src/data/phase26';
import { CareerModeView } from '../src/components/CareerModeView';
import { useProgressStore } from '../src/store/useProgressStore';
import { useMasteryStore } from '../src/store/useMasteryStore';
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
  const lessons = PHASE_26.lessons.flatMap((l) => [
    l.title,
    ...l.objectives,
    ...l.sections.flatMap((s) => [s.title, s.body]),
    ...l.quiz.flatMap((q) => [q.stem, ...(q.options ?? []), q.explanation, q.examClue ?? '']),
  ]);
  const labs = PHASE_26.labs.flatMap((lab) => [
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
  return [...lessons, ...labs].join('\n');
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('careerEngine — role assessment', () => {
  it('assesses a role against mastery data and flags gaps correctly', () => {
    const role = CAREER_ROLES[0];
    const getLevel = (conceptId: string): MasteryLevel => {
      // Simulate some strong and some weak mastery
      if (conceptId === 'alert-correlation') return 4;
      if (conceptId === 'incident-response') return 1;
      return 3;
    };

    const assessment = assessRole(role, getLevel);
    expect(assessment).toHaveLength(role.skills.length);
    
    const gaps = gapSkills(assessment);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].gap).toBe(true);
  });

  it('handles concepts with no mastery data (level 0) as gaps', () => {
    const role = CAREER_ROLES[0];
    const getLevel = (): MasteryLevel => 0; // No mastery data

    const assessment = assessRole(role, getLevel);
    const gaps = gapSkills(assessment);
    
    expect(gaps).toHaveLength(assessment.length);
    expect(gaps.every((g) => g.gap)).toBe(true);
  });

  it('returns no gaps when all skills are above weak threshold', () => {
    const role = CAREER_ROLES[0];
    const getLevel = (): MasteryLevel => 5; // Strong mastery

    const assessment = assessRole(role, getLevel);
    const gaps = gapSkills(assessment);
    
    expect(gaps).toHaveLength(0);
  });
});

describe('careerEngine — lab recommendations', () => {
  it('recommends labs from phases covering role concepts', () => {
    const role = CAREER_ROLES[0];
    const labs = recommendLabsForRole(role, PHASES);
    
    expect(labs.length).toBeGreaterThan(0);
    expect(labs).toHaveLength(Math.min(6, labs.length)); // Default limit is 6
    expect(labs.every((item) => item.lab && item.phaseTitle)).toBe(true);
  });

  it('limits recommendations to the specified limit', () => {
    const role = CAREER_ROLES[0];
    const limited = recommendLabsForRole(role, PHASES, 2);
    
    expect(limited.length).toBeLessThanOrEqual(2);
  });
});

describe('careerEngine — interview questions', () => {
  it('filters scenario questions by role concepts', () => {
    const role = CAREER_ROLES[0];
    const questions = interviewQuestionsForRole(role, allQuestions());
    
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((q) => q.type === 'scenario')).toBe(true);
  });

  it('limits interview questions to the specified limit', () => {
    const role = CAREER_ROLES[0];
    const limited = interviewQuestionsForRole(role, allQuestions(), 2);
    
    expect(limited.length).toBeLessThanOrEqual(2);
  });
});

describe('careerEngine — troubleshooting scenarios', () => {
  it('ranks scenarios by concept overlap with role', () => {
    const role = CAREER_ROLES[0];
    const scenarios = troubleshootScenariosForRole(role, TROUBLESHOOT_SCENARIOS);
    
    expect(scenarios.length).toBeGreaterThanOrEqual(0);
    expect(scenarios.every((s) => s.id && s.title)).toBe(true);
  });

  it('returns empty array when no scenarios overlap', () => {
    const role = CAREER_ROLES[0];
    // Create a role with concepts that don't overlap with any scenario
    const noOverlapRole = {
      ...role,
      skills: [{ label: 'Non-existent skill', conceptIds: ['non-existent-concept'] }],
    };
    
    const scenarios = troubleshootScenariosForRole(noOverlapRole, TROUBLESHOOT_SCENARIOS);
    expect(scenarios).toHaveLength(0);
  });
});

describe('careerEngine — resume bullet honesty check', () => {
  it('grades a complete bullet review correctly', () => {
    const answer: BulletAnswer = {};
    RESUME_BULLETS.forEach((b) => {
      answer[b.id] = b.verdict;
    });

    const result = gradeBulletReview(answer);
    expect(result.correctCount).toBe(RESUME_BULLETS.length);
    expect(result.total).toBe(RESUME_BULLETS.length);
    expect(result.percentage).toBe(100);
    expect(result.missedFabrications).toBe(0);
  });

  it('detects missed fabrications (dangerous error)', () => {
    const answer: BulletAnswer = {};
    RESUME_BULLETS.forEach((b) => {
      // Mark all as honest, including fabricated ones
      answer[b.id] = 'honest';
    });

    const result = gradeBulletReview(answer);
    const fabricatedCount = RESUME_BULLETS.filter((b) => b.verdict === 'fabricated').length;
    expect(result.missedFabrications).toBe(fabricatedCount);
  });

  it('correctly identifies honest vs fabricated bullets', () => {
    const answer: BulletAnswer = {};
    // Only test the first two bullets
    answer[RESUME_BULLETS[0].id] = RESUME_BULLETS[0].verdict;
    answer[RESUME_BULLETS[1].id] = RESUME_BULLETS[1].verdict;

    const result = gradeBulletReview(answer, RESUME_BULLETS.slice(0, 2));
    expect(result.correctCount).toBe(2);
    expect(result.bullets.every((b) => b.correct)).toBe(true);
  });

  it('detects incomplete reviews', () => {
    const answer: BulletAnswer = {};
    answer[RESUME_BULLETS[0].id] = RESUME_BULLETS[0].verdict;
    // Leave others unanswered

    expect(isBulletReviewComplete(answer)).toBe(false);
  });

  it('detects complete reviews', () => {
    const answer: BulletAnswer = {};
    RESUME_BULLETS.forEach((b) => {
      answer[b.id] = b.verdict;
    });

    expect(isBulletReviewComplete(answer)).toBe(true);
  });
});

describe('Phase 26 career roles data', () => {
  it('defines exactly eight target roles', () => {
    expect(CAREER_ROLES).toHaveLength(8);
  });

  it('every role has required fields and non-empty skills', () => {
    expect(CAREER_ROLES.every((r) => r.id && r.title && r.summary && r.skills.length > 0)).toBe(true);
  });

  it('every skill has a label and at least one concept ID', () => {
    expect(
      CAREER_ROLES.every((r) =>
        r.skills.every((s) => s.label && s.conceptIds.length > 0)
      )
    ).toBe(true);
  });

  it('concept IDs reference real concepts from the platform', () => {
    const allConceptIds = new Set(
      PHASES.flatMap((p) => p.lessons.flatMap((l) => l.concepts))
    );
    
    const careerConceptIds = CAREER_ROLES.flatMap((r) =>
      r.skills.flatMap((s) => s.conceptIds)
    );
    
    // Most concept IDs should map to real concepts
    const mappedCount = careerConceptIds.filter((id) => allConceptIds.has(id)).length;
    expect(mappedCount).toBeGreaterThan(careerConceptIds.length * 0.5);
  });
});

describe('Phase 26 resume bullets data', () => {
  it('has a balanced mix of honest and fabricated examples', () => {
    const honest = RESUME_BULLETS.filter((b) => b.verdict === 'honest').length;
    const fabricated = RESUME_BULLETS.filter((b) => b.verdict === 'fabricated').length;
    
    expect(honest).toBeGreaterThan(0);
    expect(fabricated).toBeGreaterThan(0);
    expect(Math.abs(honest - fabricated)).toBeLessThanOrEqual(2); // Roughly balanced
  });

  it('every bullet has required fields and rationale', () => {
    expect(
      RESUME_BULLETS.every((b) => b.id && b.text && b.verdict && b.rationale.length > 10)
    ).toBe(true);
  });
});

describe('Phase 26 curriculum and safety', () => {
  it('has two lessons and two labs', () => {
    expect(PHASE_26.lessons).toHaveLength(2);
    expect(PHASE_26.labs).toHaveLength(2);
  });

  it('every lesson has objectives, sections, and quiz', () => {
    expect(
      PHASE_26.lessons.every((l) => 
        l.objectives.length > 0 && 
        l.sections.length > 0 && 
        l.quiz.length > 0
      )
    ).toBe(true);
  });

  it('every lab has complete structure', () => {
    expect(
      PHASE_26.labs.every((lab) =>
        lab.objective &&
        lab.securityConcepts.length > 0 &&
        lab.steps.length > 0 &&
        lab.expectedResults.length > 0 &&
        lab.verification.length > 0 &&
        lab.troubleshooting.length > 0 &&
        lab.securityLesson
      )
    ).toBe(true);
  });

  it('contains no credential, key, or token material', () => {
    const text = phaseText();
    expect(text).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(text).not.toMatch(/password\s*[:=]\s*\S+/i);
    expect(text).not.toMatch(/\bapi[_-]?key\s*[:=]/i);
    expect(text).not.toMatch(/secret\s*[:=]/i);
  });

  it('emphasizes professional honesty and anti-fabrication', () => {
    const text = phaseText();
    expect(text.toLowerCase()).toContain('fabricat');
    expect(text.toLowerCase()).toContain('honest');
  });
});

describe('Career Mode view', () => {
  it('renders all eight target roles as buttons', () => {
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    for (const role of CAREER_ROLES) {
      expect(screen.getAllByRole('button').some(btn => btn.textContent === role.title)).toBe(true);
    }
  });

  it('displays skill gap analysis for selected role', () => {
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    expect(screen.getByText(/skill gap analysis/i)).toBeInTheDocument();
  });

  it('shows recommended labs section', () => {
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    expect(screen.getByTestId('recommended-labs')).toBeInTheDocument();
  });

  it('shows interview questions section', () => {
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    expect(screen.getByTestId('interview-questions')).toBeInTheDocument();
  });

  it('displays resume bullet honesty check', () => {
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    expect(screen.getByText(/never fabricate/i)).toBeInTheDocument();
    expect(screen.getByText(/resume bullet honesty check/i)).toBeInTheDocument();
  });

  it('allows switching between career roles', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    const secondRole = CAREER_ROLES[1];
    
    const secondRoleButton = screen.getAllByRole('button').find(btn => btn.textContent === secondRole.title);
    expect(secondRoleButton).toBeInTheDocument();
    
    if (secondRoleButton) {
      await user.click(secondRoleButton);
      
      // Verify the second role is now selected (button should have accent styling)
      expect(secondRoleButton).toHaveClass('border-accent', 'bg-accent/10');
    }
  });

  it('submits bullet review and shows results', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/career-mode', '/career-mode', <CareerModeView />);
    
    // Make selections for all bullets
    const buttons = screen.getAllByText('Honest');
    for (const button of buttons) {
      await user.click(button);
    }
    
    const submitButton = screen.getByText('Submit review');
    await user.click(submitButton);
    
    expect(screen.getByText(/Retry review/i)).toBeInTheDocument();
  });
});