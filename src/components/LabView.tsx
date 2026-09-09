import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';
import { getLab } from '../data/curriculum';
import { listCommands } from '../sim/commands';
import {
  completionPercent,
  load,
  reset,
  step as runStep,
  transcriptToEvidence,
  verify,
} from '../sim/engine';
import type { LabRunState, SimOutput } from '../sim/types';
import type { Lab } from '../types';
import { useEvidenceStore } from '../store/useEvidenceStore';
import { useProgressStore } from '../store/useProgressStore';
import { Button, Card, EmptyState, PageHeader, ProgressBar, ProvenanceBadge } from './ui';

/** "phase-3" -> 3. Returns undefined for an unexpected id, listing everything. */
function phaseNumberOf(phaseId: string): number | undefined {
  const match = /^phase-(\d+)$/.exec(phaseId);
  return match ? Number(match[1]) : undefined;
}

/**
 * Help is scoped to the lab: this lab's own step commands first, then the rest
 * of the allowlist up to this phase. Listing all 55 commands inside a Phase 0
 * lab is both noise and a spoiler for evidence the learner has not reached.
 */
function buildHelp(lab: Lab): SimOutput {
  const ownCommands = lab.steps
    .map((s) => s.command?.trim().toLowerCase())
    .filter((c): c is string => Boolean(c));
  const own = new Set(ownCommands);

  const available = listCommands(phaseNumberOf(lab.phaseId)).filter((c) => !own.has(c.command));

  const lines = ['Commands for this lab:', ...ownCommands.map((c) => `  * ${c}`)];

  if (available.length > 0) {
    lines.push('', 'Also available at your current phase:');
    for (const c of available) lines.push(`  [${c.tool.padEnd(9)}] ${c.command}`);
  }

  lines.push('', 'This is a closed allowlist. Nothing is executed on your machine.');

  return {
    command: 'help',
    provenance: 'simulated',
    recognised: true,
    output: lines.join('\n'),
  };
}

export function LabView() {
  const { labId = '' } = useParams();
  const lab = getLab(labId);

  const markLabComplete = useProgressStore((s) => s.markLabComplete);
  const isLabComplete = useProgressStore((s) => s.isLabComplete);
  const addEvidence = useEvidenceStore((s) => s.addEvidence);
  const evidenceForLab = useEvidenceStore((s) => s.evidence).filter((e) => e.labId === labId);

  const [runState, setRunState] = useState<LabRunState | null>(() => (lab ? load(lab) : null));
  const [input, setInput] = useState('');
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, string>>({});
  const [verified, setVerified] = useState<ReturnType<typeof verify> | null>(null);

  const percent = useMemo(() => (runState ? completionPercent(runState) : 0), [runState]);

  if (!lab || !runState) {
    return <EmptyState title="Lab not found" body={`No lab matches "${labId}".`} />;
  }

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'help') {
      setRunState({ ...runState, transcript: [...runState.transcript, buildHelp(lab)] });
    } else {
      setRunState(runStep(runState, lab, trimmed).state);
    }
    setInput('');
  };

  const done = isLabComplete(lab.phaseId, lab.id);

  return (
    <>
      <PageHeader
        title={lab.title}
        subtitle={lab.objective}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRunState(reset(lab));
                setVerified(null);
              }}
            >
              Reset lab
            </Button>
            <Button
              onClick={() => {
                const result = verify(runState, lab);
                setVerified(result);
                if (result.passed) markLabComplete(lab.phaseId, lab.id);
              }}
            >
              Verify
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <ProgressBar percent={percent} label="Lab steps complete" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------------- Left: environment, steps, terminal ---------------- */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Environment
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-muted">Environment</dt>
                <dd className="text-white">{lab.environment}</dd>
              </div>
              <div>
                <dt className="text-muted">Topology</dt>
                <dd className="text-white">{lab.topology}</dd>
              </div>
              <div>
                <dt className="text-muted">Prerequisites</dt>
                <dd className="text-white">{lab.prerequisites.join(', ')}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Steps</h2>
            <ol className="mt-3 space-y-3">
              {lab.steps.map((s, i) => {
                const status = runState.stepStatus[i];
                const Icon =
                  status === 'done' ? CheckCircle2 : status === 'active' ? CircleDot : Circle;
                const tone =
                  status === 'done'
                    ? 'text-ok'
                    : status === 'active'
                      ? 'text-accent'
                      : 'text-muted';
                return (
                  <li key={s.id} className="flex gap-3">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden />
                    <div className="min-w-0">
                      <div
                        className={
                          status === 'pending' ? 'text-sm text-muted' : 'text-sm text-white'
                        }
                      >
                        {s.instruction}
                      </div>
                      {s.command && (
                        <code className="mt-1 inline-block rounded bg-panel-2 px-2 py-0.5 font-mono text-xs text-accent">
                          {s.command}
                        </code>
                      )}
                      {s.expected && (
                        <div className="mt-1 text-xs text-muted">Expected: {s.expected}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Simulated terminal
              </h2>
              <span className="text-[11px] text-muted">
                Safe simulator — no command is executed
              </span>
            </div>

            <div
              className="max-h-96 space-y-4 overflow-y-auto bg-soc-bg px-5 py-4 font-mono text-xs"
              data-testid="lab-transcript"
            >
              {runState.transcript.length === 0 && (
                <p className="text-muted">
                  Type a command below, or <span className="text-accent">help</span> to list what
                  this lab understands.
                </p>
              )}
              {runState.transcript.map((t, i) => (
                <div key={`${t.command}-${i}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-accent">$ {t.command}</span>
                    <ProvenanceBadge provenance={t.provenance} />
                  </div>
                  <pre
                    className={`mt-1.5 whitespace-pre-wrap ${t.recognised ? 'text-text' : 'text-warn'}`}
                  >
                    {t.output}
                  </pre>
                  {t.teaches && (
                    <p className="mt-1.5 border-l-2 border-accent/50 pl-2 font-sans text-[11px] text-muted">
                      {t.teaches}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <form
              className="flex gap-2 border-t border-border px-5 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <span className="self-center font-mono text-sm text-accent">$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Simulated command input"
                placeholder="ipconfig /all"
                className="min-w-0 flex-1 rounded border border-border bg-panel-2 px-2 py-1.5 font-mono text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              />
              <Button type="submit">Run</Button>
            </form>
          </Card>
        </div>

        {/* ---------------- Right: results, verification, evidence ---------------- */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Expected results
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {lab.expectedResults.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Verification
            </h2>
            {!verified ? (
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {lab.verification.map((v) => (
                  <li key={v}>· {v}</li>
                ))}
              </ul>
            ) : (
              <>
                <ul className="mt-3 space-y-2 text-sm">
                  {verified.checks.map((c) => (
                    <li key={c.label} className="flex gap-2">
                      <span className={c.passed ? 'text-ok' : 'text-danger'}>
                        {c.passed ? '✓' : '✕'}
                      </span>
                      <span className="min-w-0">
                        <span className="text-white">{c.label}</span>
                        <span className="block text-xs text-muted">{c.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p
                  className={`mt-3 text-sm font-medium ${verified.passed ? 'text-ok' : 'text-warn'}`}
                >
                  {verified.passed
                    ? 'Lab verified and marked complete.'
                    : 'Not yet — finish the outstanding checks.'}
                </p>
              </>
            )}
            {done && <p className="mt-2 text-xs text-ok">This lab is recorded as complete.</p>}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Troubleshooting
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {lab.troubleshooting.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </Card>

          {lab.challenge && (
            <Card className="border-accent/40">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
                Challenge
              </h2>
              <p className="mt-2 text-sm text-white">{lab.challenge}</p>
            </Card>
          )}

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Evidence capture
            </h2>
            <div className="mt-3 space-y-4">
              {lab.evidence.map((template) => (
                <div key={template.id}>
                  <label
                    htmlFor={`ev-${template.id}`}
                    className="block text-xs font-medium text-white"
                  >
                    {template.label}
                    <span className="ml-1 text-muted">({template.type})</span>
                  </label>
                  <textarea
                    id={`ev-${template.id}`}
                    rows={3}
                    value={evidenceDrafts[template.id] ?? ''}
                    placeholder={template.placeholder}
                    onChange={(e) =>
                      setEvidenceDrafts((d) => ({ ...d, [template.id]: e.target.value }))
                    }
                    className="mt-1 w-full rounded border border-border bg-panel-2 p-2 text-xs text-white placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                  <div className="mt-1.5 flex gap-2">
                    <Button
                      variant="ghost"
                      disabled={(evidenceDrafts[template.id] ?? '').trim().length === 0}
                      onClick={() => {
                        addEvidence(
                          lab.id,
                          template.label,
                          template.type,
                          (evidenceDrafts[template.id] ?? '').trim()
                        );
                        setEvidenceDrafts((d) => ({ ...d, [template.id]: '' }));
                      }}
                    >
                      Save
                    </Button>
                    {template.type === 'log' && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setEvidenceDrafts((d) => ({
                            ...d,
                            [template.id]: transcriptToEvidence(runState),
                          }))
                        }
                      >
                        Use transcript
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {evidenceForLab.length > 0 && (
              <p className="mt-4 text-xs text-muted">
                {evidenceForLab.length} artifact(s) saved.{' '}
                <Link to="/evidence" className="text-accent hover:underline">
                  View evidence locker
                </Link>
              </p>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Security lesson
            </h2>
            <p className="mt-2 text-sm text-white">{lab.securityLesson}</p>
            <Link to="/github" className="mt-3 inline-block text-sm text-accent hover:underline">
              Generate the GitHub write-up for this lab →
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
