import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PHASE_INDEX, indexItemCount } from '../data/phaseIndex';
import { PROGRESS_TRACKS } from '../data/progressTracks';
import { EXAM_PASSING_SCORE } from '../data/examBlueprint';
import { REVIEW_INTERVAL_DAYS, WEAK_THRESHOLD } from '../lib/srs';
import { useMasteryStore } from '../store/useMasteryStore';
import { useProgressStore } from '../store/useProgressStore';
import { useQuizStore } from '../store/useQuizStore';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { MASTERY_LABELS, type MasteryLevel } from '../types';
import { Button, Card, EmptyState, MasteryPill, PageHeader, ProgressBar, StatTile } from './ui';

const LEVELS: MasteryLevel[] = [0, 1, 2, 3, 4, 5, 6];

/** "N/A" rather than a misleading 0% when nothing has been recorded yet. */
function orNA(value: number | null, suffix = '%'): string {
  return value === null ? 'N/A' : `${value}${suffix}`;
}

export function ProgressView() {
  const progress = useProgressStore((s) => s.progress);
  const isLessonComplete = useProgressStore((s) => s.isLessonComplete);
  const isLabComplete = useProgressStore((s) => s.isLabComplete);
  const resetProgress = useProgressStore((s) => s.resetAll);

  const mastery = useMasteryStore((s) => s.mastery);
  const overall = useMasteryStore((s) => s.overallPercent());
  const resetMastery = useMasteryStore((s) => s.resetAll);

  const attempts = useQuizStore((s) => s.attempts);
  const quizAverage = useQuizStore((s) => s.averagePercent());
  const accuracy = useQuizStore((s) => s.overallAccuracy());
  const pbqScore = useQuizStore((s) => s.pbqPercent());
  const troubleshootScore = useQuizStore((s) => s.troubleshootPercent());
  const latestScaled = useQuizStore((s) => s.latestScaledScore());
  const improvement = useQuizStore((s) => s.improvement());
  const secondsPerQuestion = useQuizStore((s) => s.averageSecondsPerQuestion());
  const resetAttempts = useQuizStore((s) => s.resetAll);

  const evidence = useEvidenceStore((s) => s.evidence);

  // Derived from the stable state slices — a selector returning a fresh array
  // every render loops forever under useSyncExternalStore.
  const entries = useMemo(() => Object.values(mastery), [mastery]);
  const weak = useMemo(
    () => entries.filter((e) => e.level <= WEAK_THRESHOLD).sort((a, b) => a.level - b.level),
    [entries]
  );
  const strong = useMemo(
    () => entries.filter((e) => e.level >= 4).sort((a, b) => b.level - a.level),
    [entries]
  );

  // ---- Per-track completion, across every built phase ----
  const tracks = useMemo(
    () =>
      PROGRESS_TRACKS.map((track) => {
        const phases = PHASE_INDEX.filter((p) => track.phaseNumbers.includes(p.number));
        const total = phases.reduce((sum, p) => sum + indexItemCount(p), 0);
        const done = phases.reduce(
          (sum, p) =>
            sum +
            p.lessons.filter((l) => isLessonComplete(p.id, l.id)).length +
            p.labs.filter((l) => isLabComplete(p.id, l.id)).length,
          0
        );
        return {
          ...track,
          total,
          done,
          percent: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      }),
    [isLessonComplete, isLabComplete]
  );

  const totalItems = tracks.reduce((sum, t) => sum + t.total, 0);
  const totalDone = tracks.reduce((sum, t) => sum + t.done, 0);
  const overallPercent = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const totalLabs = PHASE_INDEX.reduce((sum, p) => sum + p.labs.length, 0);
  const labsCompleted = PHASE_INDEX.reduce(
    (sum, p) => sum + p.labs.filter((l) => isLabComplete(p.id, l.id)).length,
    0
  );

  // A lab becomes a portfolio project once it has captured evidence to document.
  const portfolioReady = new Set(evidence.map((e) => e.labId)).size;

  const completedItems = Object.values(progress).filter((p) => p.completed);

  // ---- Exam readiness ----
  // Driven by a real mock-exam scaled score when one exists, because that is
  // the only signal measured the way the exam measures. Falls back to stating
  // plainly that no exam has been sat rather than inventing a verdict.
  const readiness =
    latestScaled === null
      ? { label: 'NOT ASSESSED', tone: 'text-muted', body: 'Sit a mock exam to get a readiness verdict.' }
      : latestScaled >= EXAM_PASSING_SCORE
        ? {
            label: 'READY',
            tone: 'text-ok',
            body: `Most recent mock exam scored ${latestScaled}, at or above the ${EXAM_PASSING_SCORE} pass mark.`,
          }
        : latestScaled >= EXAM_PASSING_SCORE - 100
          ? {
              label: 'APPROACHING',
              tone: 'text-warn',
              body: `Most recent mock exam scored ${latestScaled}, within 100 points of the ${EXAM_PASSING_SCORE} pass mark.`,
            }
          : {
              label: 'NOT READY',
              tone: 'text-danger',
              body: `Most recent mock exam scored ${latestScaled}, below the ${EXAM_PASSING_SCORE} pass mark.`,
            };

  return (
    <>
      <PageHeader
        title="Progress & Mastery"
        subtitle="Mastery runs 0 to 6. A correct answer advances one level; a miss drops two, because over-confident concepts are the ones that fail on exam day."
        actions={
          <Button
            variant="danger"
            onClick={() => {
              resetProgress();
              resetMastery();
              resetAttempts();
            }}
          >
            Reset all progress
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Overall"
          value={`${overallPercent}%`}
          hint={`${totalDone}/${totalItems} lessons and labs`}
        />
        <StatTile label="Overall mastery" value={`${overall}%`} hint="Across tracked concepts" />
        <StatTile
          label="Labs completed"
          value={`${labsCompleted}/${totalLabs}`}
          hint="Across every built phase"
        />
        <StatTile
          label="Exam readiness"
          value={readiness.label}
          hint={latestScaled === null ? 'No mock exam sat yet' : `Scaled ${latestScaled}/900`}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Quiz average"
          value={orNA(quizAverage)}
          hint={`${attempts.filter((a) => a.kind !== 'troubleshoot').length} sittings recorded`}
        />
        <StatTile label="PBQ score" value={orNA(pbqScore)} hint="Performance-based questions only" />
        <StatTile
          label="Troubleshooting score"
          value={orNA(troubleshootScore)}
          hint="Root cause and action, Phase 22"
        />
        <StatTile
          label="Portfolio projects"
          value={portfolioReady}
          hint="Labs with captured evidence"
        />
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Security+ progress by subject area
          </h2>
          <span className="text-xs text-muted">
            {PHASE_INDEX.length} phases, grouped into {PROGRESS_TRACKS.length} tracks
          </span>
        </div>
        <ul className="mt-4 space-y-3" data-testid="progress-tracks">
          {tracks.map((t) => (
            <li key={t.id}>
              <ProgressBar percent={t.percent} label={`${t.label} — ${t.done}/${t.total}`} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Assessment detail
          </h2>
          <ul className="mt-3 space-y-2 text-sm" data-testid="assessment-detail">
            <li className="flex justify-between gap-3">
              <span className="text-muted">Question-level accuracy</span>
              <span className="font-mono text-white">{orNA(accuracy)}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Improvement (recent vs earliest)</span>
              <span className="font-mono text-white">
                {improvement === null
                  ? 'N/A'
                  : `${improvement > 0 ? '+' : ''}${improvement} pts`}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Average time per question</span>
              <span className="font-mono text-white">{orNA(secondsPerQuestion, 's')}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-muted">Latest mock exam scaled score</span>
              <span className="font-mono text-white">
                {latestScaled === null ? 'N/A' : `${latestScaled}/900`}
              </span>
            </li>
          </ul>
          <p className={`mt-4 text-sm ${readiness.tone}`}>{readiness.body}</p>
          {latestScaled === null && (
            <Link to="/exam-prep" className="mt-2 inline-block text-sm text-accent hover:underline">
              Go to exam preparation →
            </Link>
          )}
          {improvement === null && attempts.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Improvement needs at least four sittings before the comparison means anything.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Mastery ladder
          </h2>
          <ul className="mt-3 space-y-2">
            {LEVELS.map((level) => {
              const count = entries.filter((e) => e.level === level).length;
              return (
                <li key={level} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <MasteryPill level={level} />
                  </span>
                  <span className="text-xs text-muted">
                    review every {REVIEW_INTERVAL_DAYS[level]}d
                  </span>
                  <span className="w-8 text-right font-mono text-white">{count}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Weak areas — study these next
          </h2>
          {weak.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No weak concepts recorded. Take a quiz to start populating this.
            </p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="weak-areas">
              {weak.map((e) => (
                <li key={e.conceptId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-white">{e.conceptId}</span>
                  <span className="shrink-0 text-xs text-muted">{MASTERY_LABELS[e.level]}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Strong areas
          </h2>
          {strong.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing at level 4 or above yet.</p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="strong-areas">
              {strong.map((e) => (
                <li key={e.conceptId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-white">{e.conceptId}</span>
                  <span className="shrink-0 text-xs text-ok">{MASTERY_LABELS[e.level]}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Recent sittings
        </h2>
        {attempts.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No quiz attempts recorded"
              body="Take a lesson quiz or a mock exam and every sitting is recorded here with its score and timing."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2" data-testid="recent-attempts">
            {[...attempts]
              .sort((a, b) => b.completedAt - a.completedAt)
              .slice(0, 8)
              .map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-white">
                    <span className="mr-2 rounded bg-panel-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {a.kind}
                    </span>
                    {a.subjectId ?? `${a.total} questions`}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted">
                    {a.correct}/{a.total} · {a.percentage}%
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Completed items
        </h2>
        {completedItems.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Nothing completed yet"
              body="Finish a lesson or verify a lab and it will be recorded here."
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {completedItems
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 12)
              .map((p) => (
                <li
                  key={`${p.phaseId}-${p.lessonId ?? p.labId}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate text-white">
                    {p.lessonId ? `Lesson · ${p.lessonId}` : `Lab · ${p.labId}`}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted">
                    {p.score ? `${p.score}% · ` : ''}
                    {new Date(p.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </>
  );
}
