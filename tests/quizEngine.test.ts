import { describe, expect, it } from 'vitest';
import {
  buildAttempt,
  buildExamReport,
  gradeQuestion,
  gradeQuiz,
  recordAnswer,
  shuffleQuestions,
  submitAttempt,
} from '../src/lib/quizEngine';
import { EXAM_PASSING_SCORE } from '../src/data/examBlueprint';
import type { QuizQuestion } from '../src/types';

const mcq: QuizQuestion = {
  id: 'q-mcq',
  type: 'mcq',
  stem: 'Pick B',
  options: ['A', 'B', 'C'],
  answer: 1,
  explanation: 'B is correct.',
  domain: 'General Security Concepts',
  conceptId: 'concept-a',
};

const scenario: QuizQuestion = {
  id: 'q-scenario',
  type: 'scenario',
  stem: 'Pick C',
  options: ['A', 'B', 'C'],
  answer: 2,
  explanation: 'C is correct.',
  domain: 'Security Operations',
  conceptId: 'concept-b',
};

const pbq: QuizQuestion = {
  id: 'q-pbq',
  type: 'pbq',
  stem: 'Order them',
  options: ['A', 'B', 'C'],
  answer: [2, 0, 1],
  explanation: 'C, A, B.',
  domain: 'Security Architecture',
  conceptId: 'concept-c',
};

describe('gradeQuestion', () => {
  it('grades a correct single-answer question', () => {
    expect(gradeQuestion(mcq, 1)).toEqual({ correct: true, score: 1 });
  });

  it('grades an incorrect single-answer question', () => {
    expect(gradeQuestion(mcq, 0)).toEqual({ correct: false, score: 0 });
  });

  it('accepts a single answer supplied as a one-element array', () => {
    expect(gradeQuestion(scenario, [2]).correct).toBe(true);
  });

  it('grades an ordered PBQ answer in the exact sequence required', () => {
    expect(gradeQuestion(pbq, [2, 0, 1]).correct).toBe(true);
    expect(gradeQuestion(pbq, [0, 1, 2]).correct).toBe(false);
  });

  it('rejects a PBQ answer of the wrong length', () => {
    expect(gradeQuestion(pbq, [2, 0]).correct).toBe(false);
  });
});

describe('gradeQuiz', () => {
  const questions = [mcq, scenario, pbq];

  it('counts correct answers and computes a percentage', () => {
    const results = [recordAnswer(mcq, 1), recordAnswer(scenario, 0), recordAnswer(pbq, [2, 0, 1])];
    const grade = gradeQuiz(questions, results);
    expect(grade.correctCount).toBe(2);
    expect(grade.total).toBe(3);
    expect(grade.percentage).toBe(67);
  });

  it('collects missed concepts as weak areas', () => {
    const results = [recordAnswer(mcq, 0), recordAnswer(scenario, 2)];
    const grade = gradeQuiz(questions, results);
    expect(grade.weakConcepts).toEqual(['concept-a']);
    expect(grade.strongConcepts).toEqual(['concept-b']);
  });

  it('returns zero rather than NaN for an empty quiz', () => {
    expect(gradeQuiz([], []).percentage).toBe(0);
  });
});

describe('submitAttempt', () => {
  // Regression: submitAttempt previously passed `attempt.results` where
  // `questions` was expected, so weakConcepts was always empty.
  it('populates weak concepts from the attempt questions', () => {
    const attempt = buildAttempt([mcq, scenario]);
    const submitted = submitAttempt(attempt, [recordAnswer(mcq, 0), recordAnswer(scenario, 2)]);

    expect(submitted.weakConcepts).toEqual(['concept-a']);
    expect(submitted.score).toBe(50);
    expect(submitted.endedAt).toBeGreaterThan(0);
  });
});

describe('buildExamReport', () => {
  it('reports per-domain results only for domains that were asked', () => {
    const report = buildExamReport(
      [mcq, scenario],
      [recordAnswer(mcq, 1), recordAnswer(scenario, 2)]
    );
    const asked = report.domains.filter((d) => d.asked > 0);

    expect(asked).toHaveLength(2);
    expect(asked.every((d) => d.ratio === 1)).toBe(true);
  });

  it('passes a perfect attempt and fails an empty one', () => {
    const perfect = buildExamReport([mcq], [recordAnswer(mcq, 1)]);
    expect(perfect.scaledScore).toBe(900);
    expect(perfect.passed).toBe(true);
    expect(perfect.verdict).toBe('ready');

    const wrong = buildExamReport([mcq], [recordAnswer(mcq, 0)]);
    expect(wrong.scaledScore).toBe(100);
    expect(wrong.passed).toBe(false);
    expect(wrong.verdict).toBe('not-ready');
  });

  it('weights domains by their official exam weight', () => {
    // Security Operations (28%) correct, General Security Concepts (12%) wrong.
    // Weighted ratio = 28 / 40 = 0.7 -> above a flat 50% average.
    const report = buildExamReport(
      [mcq, scenario],
      [recordAnswer(mcq, 0), recordAnswer(scenario, 2)]
    );
    expect(report.raw.percentage).toBe(50);
    expect(report.weightedRatio).toBeCloseTo(0.7, 5);
    expect(report.scaledScore).toBeGreaterThan(EXAM_PASSING_SCORE - 200);
  });

  it('lists a fully missed domain as weak', () => {
    const report = buildExamReport(
      [mcq, scenario],
      [recordAnswer(mcq, 0), recordAnswer(scenario, 2)]
    );
    expect(report.weakDomains.map((d) => d.domainId)).toContain('1.0');
    expect(report.strongDomains.map((d) => d.domainId)).toContain('4.0');
  });
});

describe('shuffleQuestions', () => {
  it('is deterministic for a given seed and preserves every item', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffleQuestions(input, 42);
    const b = shuffleQuestions(input, 42);

    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(input);
  });

  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4];
    shuffleQuestions(input, 9);
    expect(input).toEqual([1, 2, 3, 4]);
  });
});
