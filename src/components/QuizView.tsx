import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { allQuestions, getLesson } from '../data/curriculum';
import { EXAM_PASSING_SCORE, EXAM_SCALE_MAX } from '../data/examBlueprint';
import { buildExamReport, gradeQuestion, recordAnswer, shuffleQuestions } from '../lib/quizEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { useProgressStore } from '../store/useProgressStore';
import { useQuizStore } from '../store/useQuizStore';
import type { QuizQuestion, QuizResult } from '../types';
import { Button, Card, EmptyState, PageHeader, ProgressBar } from './ui';

type Mode = 'practice' | 'exam';

const VERDICT_COPY: Record<string, { title: string; tone: string; body: string }> = {
  ready: {
    title: 'Ready',
    tone: 'text-ok',
    body: 'At this level you would pass. Keep weak domains warm with spaced repetition.',
  },
  approaching: {
    title: 'Approaching ready',
    tone: 'text-warn',
    body: 'Within 100 points of the pass mark. Target your weakest domain before sitting the exam.',
  },
  'not-ready': {
    title: 'Not ready yet',
    tone: 'text-danger',
    body: 'Work the lessons and labs for your weak domains, then retest.',
  },
};

export function QuizView() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLesson(lessonId) : undefined;

  const [mode, setMode] = useState<Mode>('practice');
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  // The deadline is set by the event handler that starts the exam; the effect
  // below only ticks a clock against it, so no setState happens in the effect body.
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState(() => Date.now());
  /** First-answer timestamps, so per-question time is measured rather than guessed. */
  const [answeredAt, setAnsweredAt] = useState<Record<string, number>>({});

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);
  const recordAttempt = useQuizStore((s) => s.record);
  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);

  const questions: QuizQuestion[] = useMemo(() => {
    const pool = lesson ? lesson.quiz : allQuestions();
    // Seeded shuffle keeps exam order stable within a sitting but varied per lesson.
    return mode === 'exam' ? shuffleQuestions(pool, pool.length + 7) : pool;
  }, [lesson, mode]);

  // Exam timer: one minute per question, mirroring the 90/90 exam ratio.
  const durationMs = questions.length * 60_000;
  const remainingMs = deadline === null ? durationMs : Math.max(0, deadline - now);

  useEffect(() => {
    if (deadline === null || submitted) return;
    const id = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      // Auto-submit when time runs out. This lives in the interval callback,
      // not the effect body, so it never causes a cascading render.
      if (tick >= deadline) setSubmitted(true);
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, submitted]);

  if (questions.length === 0) {
    return <EmptyState title="No questions available" body="This lesson has no quiz items yet." />;
  }

  // Per-question time = the gap between consecutive answers, with the session
  // start as the first boundary.
  const timePerQuestion = new Map<string, number>();
  let previousMark = startedAt;
  for (const [id, at] of Object.entries(answeredAt).sort((a, b) => a[1] - b[1])) {
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
    // Feed every graded concept into the spaced-repetition ladder.
    for (const q of questions) {
      if (!q.conceptId || answers[q.id] === undefined) continue;
      recordOutcome(q.conceptId, gradeQuestion(q, answers[q.id]).correct);
    }

    const graded = questions.map((q) => ({
      q,
      correct: answers[q.id] !== undefined && gradeQuestion(q, answers[q.id]).correct,
    }));
    const pbq = graded.filter((g) => g.q.type === 'pbq');
    const correctCount = graded.filter((g) => g.correct).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    recordAttempt({
      kind: 'lesson',
      subjectId: lesson?.id,
      total: questions.length,
      correct: correctCount,
      pbqTotal: pbq.length,
      pbqCorrect: pbq.filter((g) => g.correct).length,
      durationMs: Date.now() - startedAt,
    });

    // A lesson quiz is the evidence that the lesson was actually worked, so a
    // passing attempt records completion and its score. Below the pass mark it
    // deliberately does not — mastery is not awarded for a failed sitting.
    if (lesson && percentage >= 70) {
      markLessonComplete(lesson.phaseId, lesson.id, percentage);
    }
  };

  const restart = (nextMode: Mode) => {
    const start = Date.now();
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setNow(start);
    setStartedAt(start);
    setAnsweredAt({});
    setDeadline(nextMode === 'exam' ? start + durationMs : null);
  };

  const setAnswer = (q: QuizQuestion, optionIndex: number) => {
    if (submitted) return;
    setAnsweredAt((a) => (a[q.id] === undefined ? { ...a, [q.id]: Date.now() } : a));
    if (q.type === 'pbq') {
      // Ordering question: clicking appends to (or removes from) the sequence.
      const current = (answers[q.id] as number[] | undefined) ?? [];
      const next = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      setAnswers((a) => ({ ...a, [q.id]: next }));
      return;
    }
    setAnswers((a) => ({ ...a, [q.id]: optionIndex }));
    if (mode === 'practice') setRevealed((r) => ({ ...r, [q.id]: true }));
  };

  return (
    <>
      <PageHeader
        title={lesson ? `Quiz — ${lesson.title}` : 'Practice Quiz'}
        subtitle={
          mode === 'exam'
            ? 'Mock exam mode: timed, no answers revealed until you submit.'
            : 'Practice mode: answers and explanations reveal as you go.'
        }
        actions={
          <>
            <Button
              variant={mode === 'practice' ? 'primary' : 'ghost'}
              onClick={() => {
                setMode('practice');
                restart('practice');
              }}
            >
              Practice
            </Button>
            <Button
              variant={mode === 'exam' ? 'primary' : 'ghost'}
              onClick={() => {
                setMode('exam');
                restart('exam');
              }}
            >
              Mock exam
            </Button>
          </>
        }
      />

      {mode === 'exam' && !submitted && (
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
            <ul className="mt-2 space-y-2">
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

          <div className="mt-4">
            <Button variant="ghost" onClick={() => restart(mode)}>
              Retake
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
            Submit {mode === 'exam' ? 'exam' : 'quiz'}
          </Button>
          <span className="text-sm text-muted">
            {answeredCount} of {questions.length} answered
          </span>
        </div>
      )}
    </>
  );
}
