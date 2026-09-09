import { useEffect, useState } from 'react';
import { allQuestions } from '../data/curriculum';
import {
  EXAM_DOMAINS,
  EXAM_DURATION_MINUTES,
  EXAM_MAX_QUESTIONS,
  EXAM_PASSING_SCORE,
  EXAM_SCALE_MAX,
  getDomain,
  type ExamDomainId,
} from '../data/examBlueprint';
import {
  buildAdaptiveSession,
  buildExamReport,
  buildMockExam,
  gradeQuestion,
  questionsForConcepts,
  questionsForDomain,
  recordAnswer,
  shuffleQuestions,
  type MockExamShortfall,
} from '../lib/quizEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { useQuizStore } from '../store/useQuizStore';
import type { QuizQuestion, QuizResult } from '../types';
import { Button, Card, EmptyState, PageHeader, ProgressBar } from './ui';

type SessionMode = 'domain' | 'weak' | 'adaptive' | 'mock';
type Screen = 'select' | 'running';

const ADAPTIVE_SESSION_SIZE = 20;

const VERDICT_COPY: Record<string, { title: string; tone: string; body: string }> = {
  ready: {
    title: 'Ready',
    tone: 'text-ok',
    body: 'At this level you would pass. Keep weak domains warm with spaced repetition.',
  },
  approaching: {
    title: 'Approaching ready',
    tone: 'text-warn',
    body: 'Within 100 points of the pass mark. Target your weakest, most heavily weighted domain next.',
  },
  'not-ready': {
    title: 'Not ready yet',
    tone: 'text-danger',
    body: 'Work the lessons and labs for your weak domains, then retest.',
  },
};

const MODE_LABEL: Record<SessionMode, string> = {
  domain: 'Domain Quiz',
  weak: 'Weak-Area Review',
  adaptive: 'Adaptive Session',
  mock: 'Mock Exam',
};

export function ExamPrepView() {
  const [screen, setScreen] = useState<Screen>('select');
  const [sessionMode, setSessionMode] = useState<SessionMode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [sessionSeed, setSessionSeed] = useState(1);
  const [shortfalls, setShortfalls] = useState<MockExamShortfall[]>([]);
  /** Wall-clock ms the learner spent on the session, recorded on submit. */
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const getLevel = useMasteryStore((s) => s.getLevel);
  const getWeakAreas = useMasteryStore((s) => s.getWeakAreas);
  const recordAttempt = useQuizStore((s) => s.record);
  /**
   * When each question was first answered. Answering is the only moment we can
   * observe, so per-question time is the gap between consecutive answers —
   * measured, not invented, and good enough to report pacing honestly.
   */
  const [answeredAt, setAnsweredAt] = useState<Record<string, number>>({});

  const timed = sessionMode === 'mock';
  const durationMs = questions.length * 60_000;
  const remainingMs = deadline === null ? durationMs : Math.max(0, deadline - now);

  useEffect(() => {
    if (deadline === null || submitted) return;
    const id = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= deadline) setSubmitted(true);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, submitted]);

  const beginSession = (
    mode: SessionMode,
    pool: QuizQuestion[],
    startTimed: boolean,
    mockShortfalls: MockExamShortfall[] = []
  ) => {
    const start = Date.now();
    setSessionMode(mode);
    setQuestions(pool);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setNow(start);
    setStartedAt(start);
    setAnsweredAt({});
    setShortfalls(mockShortfalls);
    setDeadline(startTimed ? start + pool.length * 60_000 : null);
    setScreen('running');
  };

  const startDomainQuiz = (domainId: ExamDomainId) => {
    const domain = getDomain(domainId);
    if (!domain) return;
    beginSession('domain', questionsForDomain(allQuestions(), domain.title), false);
  };

  const startWeakAreaReview = () => {
    const weakIds = getWeakAreas().map((e) => e.conceptId);
    beginSession('weak', questionsForConcepts(allQuestions(), weakIds), false);
  };

  const startAdaptiveSession = () => {
    const nextSeed = sessionSeed + 1;
    setSessionSeed(nextSeed);
    const pool = buildAdaptiveSession(allQuestions(), getLevel, ADAPTIVE_SESSION_SIZE, nextSeed);
    beginSession('adaptive', pool, false);
  };

  /**
   * Full scope builds a blueprint-weighted paper capped at the real exam size.
   * A single-domain scope is a timed drill, not an exam, so it is capped at the
   * same length but drawn only from that domain — and it deliberately does not
   * claim to be blueprint-shaped.
   */
  const startMockExam = (scope: 'full' | ExamDomainId) => {
    const nextSeed = sessionSeed + 1;
    setSessionSeed(nextSeed);

    if (scope === 'full') {
      const exam = buildMockExam(allQuestions(), EXAM_MAX_QUESTIONS, nextSeed);
      beginSession('mock', exam.questions, true, exam.shortfalls);
      return;
    }

    const pool = questionsForDomain(allQuestions(), getDomain(scope)?.title ?? '');
    beginSession('mock', shuffleQuestions(pool, nextSeed).slice(0, EXAM_MAX_QUESTIONS), true);
  };

  const backToMenu = () => {
    setScreen('select');
    setSessionMode(null);
  };

  if (screen === 'select') {
    const weakAreas = getWeakAreas();

    return (
      <>
        <PageHeader
          title="Security+ Exam Preparation"
          subtitle="Domain quizzes, weak-area review, an adaptive session driven by your own mastery data, and full timed mock exams with a weighted scaled score."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Domain Quiz
            </h2>
            <p className="mt-1 text-xs text-muted">
              Practice one SY0-701 domain at a time. Answers reveal as you go.
            </p>
            <ul className="mt-3 space-y-1.5">
              {EXAM_DOMAINS.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => startDomainQuiz(d.id)}
                    className="flex w-full items-center justify-between rounded-md border border-border bg-panel-2 px-3 py-2 text-left text-sm text-white transition-colors hover:border-accent/60"
                  >
                    <span>
                      {d.id} {d.title}
                    </span>
                    <span className="font-mono text-xs text-muted">{d.weight}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Weak-Area Review
            </h2>
            <p className="mt-1 text-xs text-muted">
              Every question tagged with a concept currently at mastery level 2 or below.
            </p>
            <p className="mt-3 text-2xl font-bold text-white" data-testid="weak-area-count">
              {weakAreas.length}
            </p>
            <p className="text-xs text-muted">concepts flagged weak</p>
            <div className="mt-4">
              <Button onClick={startWeakAreaReview} disabled={weakAreas.length === 0}>
                Start weak-area review
              </Button>
            </div>
            {weakAreas.length === 0 && (
              <p className="mt-2 text-xs text-muted">
                No weak concepts recorded yet. Take a few lesson quizzes first.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Adaptive Session
            </h2>
            <p className="mt-1 text-xs text-muted">
              A {ADAPTIVE_SESSION_SIZE}-question session ordered by your current mastery data —
              weakest concepts first, across every domain at once.
            </p>
            <div className="mt-4">
              <Button onClick={startAdaptiveSession}>Start adaptive session</Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Mock Exam
            </h2>
            <p className="mt-1 text-xs text-muted">
              {EXAM_MAX_QUESTIONS} questions in {EXAM_DURATION_MINUTES} minutes, sampled to the
              official domain weights — the same shape as the real exam. Each attempt draws a new
              paper. No answers revealed until you submit.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => startMockExam('full')}>Full exam</Button>
              {EXAM_DOMAINS.map((d) => (
                <Button key={d.id} variant="ghost" onClick={() => startMockExam(d.id)}>
                  {d.id} only
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <PageHeader title={`Security+ Exam Preparation — ${MODE_LABEL[sessionMode!]}`} />
        <EmptyState
          title="No questions available for this session"
          body="Try a different domain, or take a few lesson quizzes first so mastery and domain data exist to build a session from."
        />
        <div className="mt-4">
          <Button variant="ghost" onClick={backToMenu}>
            Back to menu
          </Button>
        </div>
      </>
    );
  }

  // Per-question time: the gap between this question's answer and the previous
  // one in answer order, with the session start as the first boundary.
  const timeline = Object.entries(answeredAt).sort((a, b) => a[1] - b[1]);
  const timePerQuestion = new Map<string, number>();
  let previousMark = startedAt;
  for (const [id, at] of timeline) {
    timePerQuestion.set(id, Math.max(0, at - previousMark));
    previousMark = at;
  }

  const results: QuizResult[] = questions
    .filter((q) => answers[q.id] !== undefined)
    .map((q) => recordAnswer(q, answers[q.id], timePerQuestion.get(q.id) ?? 0));

  const report = submitted ? buildExamReport(questions, results) : null;
  const answeredCount = Object.keys(answers).length;

  const submit = () => {
    setSubmitted(true);
    for (const q of questions) {
      if (!q.conceptId || answers[q.id] === undefined) continue;
      recordOutcome(q.conceptId, gradeQuestion(q, answers[q.id]).correct);
    }

    const graded = questions.map((q) => ({
      q,
      correct: answers[q.id] !== undefined && gradeQuestion(q, answers[q.id]).correct,
    }));
    const pbq = graded.filter((g) => g.q.type === 'pbq');

    recordAttempt({
      kind: sessionMode ?? 'domain',
      total: questions.length,
      correct: graded.filter((g) => g.correct).length,
      pbqTotal: pbq.length,
      pbqCorrect: pbq.filter((g) => g.correct).length,
      scaledScore: buildExamReport(questions, results).scaledScore,
      durationMs: Date.now() - startedAt,
    });
  };

  const setAnswer = (q: QuizQuestion, optionIndex: number) => {
    if (submitted) return;
    setAnsweredAt((a) => (a[q.id] === undefined ? { ...a, [q.id]: Date.now() } : a));
    if (q.type === 'pbq') {
      const current = (answers[q.id] as number[] | undefined) ?? [];
      const next = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      setAnswers((a) => ({ ...a, [q.id]: next }));
      return;
    }
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
    if (!timed) setRevealed((r) => ({ ...r, [q.id]: true }));
  };

  return (
    <>
      <PageHeader
        title={`Security+ Exam Preparation — ${MODE_LABEL[sessionMode!]}`}
        subtitle={
          timed
            ? 'Timed session: no answers revealed until you submit.'
            : 'Answers and explanations reveal as you go.'
        }
        actions={
          <Button variant="ghost" onClick={backToMenu}>
            Back to menu
          </Button>
        }
      />

      {shortfalls.length > 0 && (
        <div
          className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn"
          data-testid="mock-shortfall"
        >
          <p className="font-medium">This paper under-samples the blueprint.</p>
          <ul className="mt-1 space-y-0.5 text-xs">
            {shortfalls.map((s) => (
              <li key={s.domainId}>
                {s.domainId} {s.title}: {s.available} question{s.available === 1 ? '' : 's'}{' '}
                available, {s.quota} needed for a weighted paper.
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">
            Your scaled score still weights each domain correctly, but the short domains rest on
            fewer questions than the real exam would use — treat that part of the verdict as less
            reliable.
          </p>
        </div>
      )}

      {timed && !submitted && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">
              Time remaining{' '}
              <span className="ml-2 font-mono text-lg text-white">
                {String(Math.floor(remainingMs / 60000)).padStart(2, '0')}:
                {String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}
              </span>
            </div>
            <div className="w-48">
              <ProgressBar
                percent={Math.round((answeredCount / questions.length) * 100)}
                label="Answered"
              />
            </div>
          </div>
        </Card>
      )}

      {report && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Scaled score</div>
              <div className="text-4xl font-bold text-white" data-testid="scaled-score">
                {report.scaledScore}
                <span className="ml-1 text-base font-normal text-muted">/ {EXAM_SCALE_MAX}</span>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Raw</div>
              <div className="text-xl font-semibold text-white">
                {report.raw.correctCount}/{report.raw.total} ({report.raw.percentage}%)
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted">Verdict</div>
              <div className={`text-xl font-semibold ${VERDICT_COPY[report.verdict].tone}`}>
                {VERDICT_COPY[report.verdict].title}
              </div>
            </div>
          </div>

          <p className="mt-2 text-sm text-muted">
            {VERDICT_COPY[report.verdict].body} Pass mark is {EXAM_PASSING_SCORE}. The scaled score
            here is a declared linear approximation — CompTIA does not publish its scaling.
          </p>

          <div className="mt-5">
            <h3 className="text-xs uppercase tracking-wider text-muted">Domain breakdown</h3>
            <ul className="mt-2 space-y-2" data-testid="domain-breakdown">
              {report.domains
                .filter((d) => d.asked > 0)
                .map((d) => (
                  <li key={d.domainId} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-white">
                        {d.domainId} {d.title}
                      </span>
                      <span className="font-mono text-muted">
                        {d.correct}/{d.asked}
                      </span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar percent={Math.round(d.ratio * 100)} />
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="ghost" onClick={backToMenu}>
              Choose another session
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {questions.map((q, qi) => {
          const given = answers[q.id];
          const show = submitted || revealed[q.id];
          const graded = given !== undefined ? gradeQuestion(q, given) : null;

          return (
            <Card key={q.id}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-muted">
                  Q{qi + 1} · {q.type.toUpperCase()}
                  {q.domain && ` · ${q.domain}`}
                </span>
                {show && graded && (
                  <span
                    className={`text-xs font-semibold ${graded.correct ? 'text-ok' : 'text-danger'}`}
                  >
                    {graded.correct ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-white">{q.stem}</p>

              {q.type === 'pbq' && (
                <p className="mt-1 text-xs text-muted">
                  Click the options in the correct order. Click again to remove.
                </p>
              )}

              <ul className="mt-3 space-y-2">
                {(q.options ?? []).map((opt, oi) => {
                  const selectedOrder =
                    q.type === 'pbq' && Array.isArray(given) ? given.indexOf(oi) : -1;
                  const isSelected = q.type === 'pbq' ? selectedOrder >= 0 : given === oi;

                  const correctIndices = Array.isArray(q.answer) ? q.answer : [q.answer];
                  const isCorrectOption = q.type === 'pbq' ? false : correctIndices.includes(oi);

                  let tone = 'border-border bg-panel-2 text-muted hover:border-accent/60';
                  if (isSelected) tone = 'border-accent bg-accent/10 text-white';
                  if (show && isCorrectOption) tone = 'border-ok bg-ok/10 text-white';
                  if (show && isSelected && !isCorrectOption && q.type !== 'pbq')
                    tone = 'border-danger bg-danger/10 text-white';

                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        onClick={() => setAnswer(q, oi)}
                        disabled={submitted}
                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${tone}`}
                      >
                        {q.type === 'pbq' && selectedOrder >= 0 && (
                          <span className="mr-2 font-mono text-accent">{selectedOrder + 1}.</span>
                        )}
                        {opt}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {show && (
                <div className="mt-3 rounded-md border border-border bg-panel-2 p-3">
                  <p className="text-sm text-muted">{q.explanation}</p>
                  {q.examClue && (
                    <p className="mt-2 text-xs text-accent">Exam clue: {q.examClue}</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {!submitted && (
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={submit} disabled={answeredCount === 0}>
            Submit {timed ? 'exam' : 'session'}
          </Button>
          <span className="text-sm text-muted">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      )}
    </>
  );
}
