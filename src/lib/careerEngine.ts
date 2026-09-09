import type { CareerRole } from '../data/careerRoles';
import type { ResumeBullet, ResumeBulletVerdict } from '../data/resumeBullets';
import { RESUME_BULLETS } from '../data/resumeBullets';
import { WEAK_THRESHOLD } from './srs';
import type { Lab, MasteryLevel, Phase, QuizQuestion } from '../types';
import type { TroubleshootScenario } from '../data/troubleshootScenarios';

// ---------------------------------------------------------------------------
// Phase 26 — Career Mode.
//
// PROMPT.md's seven-step workflow, as pure functions over data this platform
// already has: extract skills (CareerRole.skills, declared), map to concepts
// (each skill already carries real conceptIds), identify gaps (mastery
// lookup), build targeted labs / interview questions / troubleshooting
// scenarios (all reused from existing lesson/lab/quiz/scenario data), and
// recommend portfolio projects (the same lab set, handed to Phase 25's
// generator). Nothing here invents a parallel skill taxonomy.
// ---------------------------------------------------------------------------

export type SkillAssessment = {
  label: string;
  conceptIds: string[];
  averageLevel: number;
  gap: boolean;
};

/** Step 2-3: map each declared skill to its concepts and flag it as a gap. */
export function assessRole(
  role: CareerRole,
  getLevel: (conceptId: string) => MasteryLevel
): SkillAssessment[] {
  return role.skills.map((skill) => {
    const levels = skill.conceptIds.map((id) => getLevel(id));
    const averageLevel = levels.reduce((sum, l) => sum + l, 0 as number) / levels.length;
    return {
      label: skill.label,
      conceptIds: skill.conceptIds,
      averageLevel,
      gap: averageLevel <= WEAK_THRESHOLD,
    };
  });
}

export function gapSkills(assessment: SkillAssessment[]): SkillAssessment[] {
  return assessment.filter((s) => s.gap).sort((a, b) => a.averageLevel - b.averageLevel);
}

function roleConceptIds(role: CareerRole): Set<string> {
  return new Set(role.skills.flatMap((s) => s.conceptIds));
}

/** Step 4: labs from phases whose lessons cover one of the role's concepts. */
export function recommendLabsForRole(
  role: CareerRole,
  phases: Phase[],
  limit = 6
): { lab: Lab; phaseTitle: string }[] {
  const ids = roleConceptIds(role);
  const matches: { lab: Lab; phaseTitle: string }[] = [];

  for (const phase of phases) {
    const phaseCovers = phase.lessons.some((l) => l.concepts.some((c) => ids.has(c)));
    if (!phaseCovers) continue;
    for (const lab of phase.labs) {
      matches.push({ lab, phaseTitle: phase.title });
    }
  }

  return matches.slice(0, limit);
}

/** Step 5: scenario-type quiz questions tagged with a role concept, reframed as interview prompts. */
export function interviewQuestionsForRole(
  role: CareerRole,
  questions: QuizQuestion[],
  limit = 6
): QuizQuestion[] {
  const ids = roleConceptIds(role);
  return questions
    .filter((q) => q.type === 'scenario' && q.conceptId && ids.has(q.conceptId))
    .slice(0, limit);
}

/** Step 6: Phase 22 troubleshooting scenarios ranked by concept overlap with the role. */
export function troubleshootScenariosForRole(
  role: CareerRole,
  scenarios: TroubleshootScenario[],
  limit = 4
): TroubleshootScenario[] {
  const ids = roleConceptIds(role);
  return scenarios
    .map((s) => ({ scenario: s, overlap: s.conceptIds.filter((c) => ids.has(c)).length }))
    .filter((m) => m.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map((m) => m.scenario);
}

// --------------------------- Resume honesty check ---------------------------

export type BulletAnswer = Record<string, ResumeBulletVerdict | undefined>;

export type BulletResult = {
  bulletId: string;
  decision?: ResumeBulletVerdict;
  answered: boolean;
  correct: boolean;
  rationale: string;
};

export type BulletReviewResult = {
  bullets: BulletResult[];
  correctCount: number;
  total: number;
  percentage: number;
  /** Fabricated claims the learner marked honest — the dangerous error. */
  missedFabrications: number;
};

export function gradeBulletReview(
  answer: BulletAnswer,
  bullets: ResumeBullet[] = RESUME_BULLETS
): BulletReviewResult {
  const results: BulletResult[] = bullets.map((b) => {
    const decision = answer[b.id];
    const correct = decision === b.verdict;
    return { bulletId: b.id, decision, answered: Boolean(decision), correct, rationale: b.rationale };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const missedFabrications = bullets.filter(
    (b, i) => b.verdict === 'fabricated' && results[i].decision === 'honest'
  ).length;

  return {
    bullets: results,
    correctCount,
    total: bullets.length,
    percentage: bullets.length > 0 ? Math.round((correctCount / bullets.length) * 100) : 0,
    missedFabrications,
  };
}

export function isBulletReviewComplete(
  answer: BulletAnswer,
  bullets: ResumeBullet[] = RESUME_BULLETS
): boolean {
  return bullets.every((b) => answer[b.id] !== undefined);
}
