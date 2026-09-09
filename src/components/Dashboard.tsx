import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PHASE_OUTLINE_COUNT } from '../data/phaseOutlineCount';
import { PHASE_INDEX, indexItemCount } from '../data/phaseIndex';
import { EXAM_DURATION_MINUTES, EXAM_MAX_QUESTIONS, EXAM_VERSION } from '../data/examBlueprint';
import { useProgressStore } from '../store/useProgressStore';
import { useMasteryStore } from '../store/useMasteryStore';
import { dueForReview, WEAK_THRESHOLD } from '../lib/srs';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { LiveUsers } from './LiveUsers';
import { Card, MasteryPill, PageHeader, ProgressBar, StatTile } from './ui';

export function Dashboard() {
  const phasePercent = useProgressStore((s) => s.phasePercent);
  const isLessonComplete = useProgressStore((s) => s.isLessonComplete);
  const isLabComplete = useProgressStore((s) => s.isLabComplete);
  const masteryPercent = useMasteryStore((s) => s.overallPercent());
  // Select the stable state slice, not a freshly built array: a selector that
  // returns a new reference every render loops forever under useSyncExternalStore.
  const mastery = useMasteryStore((s) => s.mastery);
  const evidenceCount = useEvidenceStore((s) => s.evidence.length);

  const weakAreas = useMemo(
    () => Object.values(mastery).filter((m) => m.level <= WEAK_THRESHOLD),
    [mastery]
  );
  const due = useMemo(() => dueForReview(Object.values(mastery)), [mastery]);

  // Current phase = the earliest built phase with unfinished work. If every
  // built phase is complete, stay on the last one rather than falling off the end.
  const currentPhase =
    PHASE_INDEX.find(
      (p) =>
        p.lessons.some((l) => !isLessonComplete(p.id, l.id)) ||
        p.labs.some((l) => !isLabComplete(p.id, l.id))
    ) ?? PHASE_INDEX[PHASE_INDEX.length - 1];

  const percent = phasePercent(currentPhase.id, indexItemCount(currentPhase));

  const nextLesson = currentPhase.lessons.find((l) => !isLessonComplete(currentPhase.id, l.id));
  const nextLab = currentPhase.labs.find((l) => !isLabComplete(currentPhase.id, l.id));

  const totalItems = PHASE_INDEX.reduce((sum, p) => sum + indexItemCount(p), 0);
  const totalDone = PHASE_INDEX.reduce(
    (sum, p) =>
      sum +
      p.lessons.filter((l) => isLessonComplete(p.id, l.id)).length +
      p.labs.filter((l) => isLabComplete(p.id, l.id)).length,
    0
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`CompTIA Security+ ${EXAM_VERSION} · ${EXAM_MAX_QUESTIONS} questions · ${EXAM_DURATION_MINUTES} minutes · 750 to pass`}
        actions={<LiveUsers />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Course progress"
          value={`${totalDone}/${totalItems}`}
          hint="Lessons and labs complete"
        />
        <StatTile
          label="Overall mastery"
          value={`${masteryPercent}%`}
          hint="Across tracked concepts"
        />
        <StatTile label="Weak areas" value={weakAreas.length} hint="Mastery level 2 or below" />
        <StatTile
          label="Evidence captured"
          value={evidenceCount}
          hint="Artifacts saved from labs"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Current phase
          </h2>
          <div className="mt-2 text-lg font-bold text-white">
            Phase {currentPhase.number} — {currentPhase.title}
          </div>
          <p className="mt-1 text-sm text-muted">{currentPhase.description}</p>

          <div className="mt-4">
            <ProgressBar percent={percent} label="Phase completion" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {nextLesson && (
              <Link
                to={`/lesson/${nextLesson.id}`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent/85"
              >
                Continue lesson: {nextLesson.title}
              </Link>
            )}
            {nextLab && (
              <Link
                to={`/lab/${nextLab.id}`}
                className="rounded-md border border-border bg-panel-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-border"
              >
                Next lab: {nextLab.title}
              </Link>
            )}
            {!nextLesson && !nextLab && (
              <Link
                to="/quiz"
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent/85"
              >
                All built phases complete — run a practice quiz
              </Link>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Review queue
          </h2>
          {due.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Nothing due. Concepts return on a spaced-repetition schedule after you answer
              questions on them.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {due.slice(0, 6).map((entry) => (
                <li key={entry.conceptId} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-white">{entry.conceptId}</span>
                  <MasteryPill level={entry.level} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Roadmap</h2>
          <p className="mt-2 text-sm text-muted">
            {PHASE_INDEX.length} of {PHASE_OUTLINE_COUNT} phases built. Phases unlock as each is
            completed and approved.
          </p>
          <Link to="/roadmap" className="mt-3 inline-block text-sm text-accent hover:underline">
            View the full roadmap →
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Safety model
          </h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>· All labs are deterministic simulations. No command is executed.</li>
            <li>· Output is always labelled real, simulated, or prepared.</li>
            <li>
              · Scanning and testing only ever apply to systems you own or are authorised to test.
            </li>
            <li>· No real credentials, keys, or personal data appear anywhere in this platform.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
