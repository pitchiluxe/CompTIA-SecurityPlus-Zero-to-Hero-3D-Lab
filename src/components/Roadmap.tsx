import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { PHASE_OUTLINE, PHASES, phaseItemCount } from '../data/curriculum';
import { EXAM_DOMAINS } from '../data/examBlueprint';
import { useProgressStore } from '../store/useProgressStore';
import { Card, PageHeader, ProgressBar } from './ui';

export function Roadmap() {
  const phasePercent = useProgressStore((s) => s.phasePercent);

  return (
    <>
      <PageHeader
        title="Course Roadmap"
        subtitle="Zero to junior cybersecurity professional. Each phase adds curriculum, labs, and a 3D environment. Phases unlock in order."
      />

      <Card className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          SY0-701 exam domains
        </h2>
        <ul className="mt-3 space-y-2">
          {EXAM_DOMAINS.map((d) => (
            <li key={d.id} className="flex items-center gap-3 text-sm">
              <span className="w-10 shrink-0 font-mono text-muted">{d.id}</span>
              <span className="flex-1 text-white">{d.title}</span>
              <span className="w-12 shrink-0 text-right font-mono text-accent">{d.weight}%</span>
            </li>
          ))}
        </ul>
      </Card>

      <ol className="space-y-3">
        {PHASE_OUTLINE.map((outline) => {
          // A phase is only navigable once its curriculum actually exists.
          const built = PHASES.find((p) => p.number === outline.number);
          const percent = built ? phasePercent(built.id, phaseItemCount(built)) : 0;

          return (
            <li key={outline.number}>
              <Card className={built ? 'border-accent/40' : 'opacity-60'}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-panel-2 px-2 py-0.5 font-mono text-xs text-muted">
                        Phase {outline.number}
                      </span>
                      {!built && (
                        <span className="flex items-center gap-1 text-xs text-muted">
                          <Lock size={12} aria-hidden /> Planned
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-semibold text-white">{outline.title}</h3>
                    <p className="text-xs text-muted">{outline.examDomain}</p>
                  </div>

                  {built && (
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className="w-40">
                        <ProgressBar percent={percent} />
                      </div>
                      <Link to="/labs" className="text-sm text-accent hover:underline">
                        Open phase →
                      </Link>
                    </div>
                  )}
                </div>

                {built && (
                  <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted">
                        Lessons ({built.lessons.length})
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {built.lessons.map((l) => (
                          <li key={l.id}>
                            <Link
                              to={`/lesson/${l.id}`}
                              className="text-sm text-white hover:text-accent"
                            >
                              {l.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted">
                        Labs ({built.labs.length})
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {built.labs.map((l) => (
                          <li key={l.id}>
                            <Link
                              to={`/lab/${l.id}`}
                              className="text-sm text-white hover:text-accent"
                            >
                              {l.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ol>
    </>
  );
}
