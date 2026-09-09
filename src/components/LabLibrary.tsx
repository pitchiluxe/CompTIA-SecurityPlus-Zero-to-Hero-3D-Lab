import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { PHASES } from '../data/curriculum';
import { useProgressStore } from '../store/useProgressStore';
import { Card, PageHeader } from './ui';

export function LabLibrary() {
  const isLabComplete = useProgressStore((s) => s.isLabComplete);
  const isLessonComplete = useProgressStore((s) => s.isLessonComplete);

  return (
    <>
      <PageHeader
        title="Lab Library"
        subtitle="Every lab is a deterministic simulation. Nothing here executes on your machine or touches a live system."
      />

      {PHASES.map((phase) => (
        <section key={phase.id} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Phase {phase.number} — {phase.title}
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            {phase.lessons.map((lesson) => {
              const done = isLessonComplete(phase.id, lesson.id);
              return (
                <Card key={lesson.id}>
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                    ) : (
                      <Circle size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted">Lesson</div>
                      <Link
                        to={`/lesson/${lesson.id}`}
                        className="font-semibold text-white hover:text-accent"
                      >
                        {lesson.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {lesson.sections.length} sections · {lesson.quiz.length} quiz questions
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}

            {phase.labs.map((lab) => {
              const done = isLabComplete(phase.id, lab.id);
              return (
                <Card key={lab.id}>
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                    ) : (
                      <Circle size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-accent">Lab</div>
                      <Link
                        to={`/lab/${lab.id}`}
                        className="font-semibold text-white hover:text-accent"
                      >
                        {lab.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted">{lab.objective}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lab.securityConcepts.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-panel-2 px-2 py-0.5 text-[11px] text-muted"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
