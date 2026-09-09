import { Component, Suspense, lazy, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, LayoutGrid } from 'lucide-react';
import { CAREER_ROLES } from '../data/careerRoles';
import { RESUME_BULLETS } from '../data/resumeBullets';
import { TROUBLESHOOT_SCENARIOS } from '../data/troubleshootScenarios';
import { allQuestions, PHASES } from '../data/curriculum';
import {
  assessRole,
  gapSkills,
  gradeBulletReview,
  interviewQuestionsForRole,
  isBulletReviewComplete,
  recommendLabsForRole,
  troubleshootScenariosForRole,
  type BulletAnswer,
} from '../lib/careerEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { isWebGLAvailable } from '../lib/webgl';
import { CareerFallback2D } from '../scenes/CareerFallback2D';
import { Button, Card, PageHeader, ProgressBar } from './ui';
import type { CareerNode } from '../scenes/CareerScene';

const CareerScene = lazy(() => import('../scenes/CareerScene').then((m) => ({ default: m.CareerScene })));

class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function CareerModeView() {
  const [roleId, setRoleId] = useState(CAREER_ROLES[0].id);
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});
  const [bulletAnswer, setBulletAnswer] = useState<BulletAnswer>({});
  const [bulletSubmitted, setBulletSubmitted] = useState(false);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);

  const getLevel = useMasteryStore((s) => s.getLevel);

  const role = CAREER_ROLES.find((r) => r.id === roleId)!;
  const assessment = useMemo(() => assessRole(role, getLevel), [role, getLevel]);
  const gaps = gapSkills(assessment);
  const labs = useMemo(() => recommendLabsForRole(role, PHASES), [role]);
  const interviewQuestions = useMemo(
    () => interviewQuestionsForRole(role, allQuestions()),
    [role]
  );
  const scenarios = useMemo(
    () => troubleshootScenariosForRole(role, TROUBLESHOOT_SCENARIOS),
    [role]
  );

  const bulletResult = bulletSubmitted ? gradeBulletReview(bulletAnswer) : null;
  const use2D = force2D || !webglOk;

  const selectRole = (id: string) => {
    setRoleId(id);
    setRevealedQuestions({});
  };

  const submitBullets = () => {
    setBulletSubmitted(true);
  };

  const handleNodeSelect = (node: CareerNode) => {
    setSelectedNode(node);
  };

  return (
    <>
      <PageHeader
        title="Career Mode"
        subtitle="Pick a target role: map its skills to concepts, see your own gaps, and get recommended labs, interview questions, troubleshooting rehearsal, and portfolio picks — all from your own mastery data."
        actions={
          <button
            type="button"
            onClick={() => setForce2D((v) => !v)}
            disabled={!webglOk}
            className="flex items-center gap-2 rounded-md border border-border bg-panel-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-border disabled:opacity-40"
          >
            {use2D ? <Boxes size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
            {use2D ? 'Switch to 3D' : 'Switch to 2D'}
          </button>
        }
      />

      {!webglOk && (
        <div className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
          WebGL is unavailable in this browser or on this hardware. The 2D career pathway visualization below is fully interactive.
        </div>
      )}

      <div className="canvas-wrap mb-6" style={{ height: '40vh' }}>
        {use2D ? (
          <CareerFallback2D />
        ) : (
          <CanvasBoundary onError={() => setWebglOk(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Loading 3D career pathway…
                </div>
              }
            >
              <CareerScene
                onSelectNode={handleNodeSelect}
                selectedId={selectedNode?.id}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      {selectedNode && (
        <Card className="mb-4">
          <h3 className="text-base font-semibold text-white">{selectedNode.label}</h3>
          <p className="mt-1 text-sm text-muted">
            {selectedNode.type === 'role' ? 'Target career role' : 'Security+ foundation skill'}
          </p>
          {selectedNode.category && (
            <p className="mt-1 text-xs text-accent">Category: {selectedNode.category}</p>
          )}
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {CAREER_ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => selectRole(r.id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              r.id === roleId
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <h2 className="text-base font-semibold text-white">{role.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{role.summary}</p>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Skill gap analysis
        </h2>
        <p className="mt-1 text-xs text-muted">
          {gaps.length === 0
            ? 'No gaps flagged for this role — every mapped skill is above the weak-area threshold.'
            : `${gaps.length} of ${assessment.length} skills currently flagged as a gap.`}
        </p>
        <ul className="mt-3 space-y-3" data-testid="skill-assessment">
          {assessment.map((s) => (
            <li key={s.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">{s.label}</span>
                {s.gap && (
                  <span className="rounded bg-danger/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger">
                    Gap
                  </span>
                )}
              </div>
              <div className="mt-1">
                <ProgressBar percent={Math.round((s.averageLevel / 6) * 100)} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Recommended labs
          </h2>
          {labs.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No labs matched this role\u2019s concepts yet.</p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="recommended-labs">
              {labs.map(({ lab, phaseTitle }) => (
                <li key={lab.id} className="text-sm">
                  <Link to={`/lab/${lab.id}`} className="text-white hover:text-accent">
                    {lab.title}
                  </Link>
                  <span className="block text-xs text-muted">{phaseTitle}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Troubleshooting rehearsal
          </h2>
          {scenarios.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No troubleshooting scenario closely overlaps this role — try the full Troubleshooting
              Center instead.
            </p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="recommended-scenarios">
              {scenarios.map((s) => (
                <li key={s.id} className="text-sm">
                  <Link to="/troubleshoot-center" className="text-white hover:text-accent">
                    {s.title}
                  </Link>
                  <span className="block text-xs text-muted">{s.category}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Interview questions
        </h2>
        <p className="mt-1 text-xs text-muted">
          Reused from this platform\u2019s scenario quiz bank. Rehearse the answer out loud before
          revealing what a strong answer covers.
        </p>
        {interviewQuestions.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No scenario questions matched this role yet.</p>
        ) : (
          <ul className="mt-3 space-y-3" data-testid="interview-questions">
            {interviewQuestions.map((q) => (
              <li key={q.id} className="rounded-md border border-border bg-panel-2 p-3">
                <p className="text-sm text-white">{q.stem}</p>
                {revealedQuestions[q.id] ? (
                  <p className="mt-2 text-xs text-muted">{q.explanation}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealedQuestions((r) => ({ ...r, [q.id]: true }))}
                    className="mt-2 text-xs text-accent hover:underline"
                  >
                    Reveal what a strong answer covers
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Never fabricate — resume bullet honesty check
        </h2>
        <p className="mt-1 text-xs text-muted">
          Classify each sample bullet as honest or fabricated before submitting.
        </p>

        {bulletResult && (
          <div className="mt-3">
            <ProgressBar
              percent={bulletResult.percentage}
              label={`Correct — ${bulletResult.correctCount}/${bulletResult.total}`}
            />
            {bulletResult.missedFabrications > 0 && (
              <p className="mt-2 text-sm text-danger" data-testid="missed-fabrications">
                Missed fabrications: {bulletResult.missedFabrications}
              </p>
            )}
          </div>
        )}

        <ul className="mt-3 space-y-3">
          {RESUME_BULLETS.map((b) => {
            const decision = bulletAnswer[b.id];
            const result = bulletResult?.bullets.find((r) => r.bulletId === b.id);

            return (
              <li
                key={b.id}
                className={`rounded-md border p-3 ${
                  result ? (result.correct ? 'border-ok/50' : 'border-danger/50') : 'border-border'
                }`}
              >
                <p className="text-sm text-white">{b.text}</p>
                <div className="mt-2 flex gap-1.5">
                  {(['honest', 'fabricated'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={bulletSubmitted}
                      onClick={() =>
                        setBulletAnswer((a) => ({
                          ...a,
                          [b.id]: a[b.id] === d ? undefined : d,
                        }))
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                        decision === d
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-border bg-panel-2 text-muted hover:text-white'
                      }`}
                    >
                      {d === 'honest' ? 'Honest' : 'Fabrication risk'}
                    </button>
                  ))}
                </div>
                {result && (
                  <p className="mt-2 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                    {result.rationale}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap gap-3">
          {!bulletSubmitted ? (
            <Button onClick={submitBullets} disabled={!isBulletReviewComplete(bulletAnswer)}>
              Submit review
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setBulletAnswer({});
                setBulletSubmitted(false);
              }}
            >
              Retry review
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
