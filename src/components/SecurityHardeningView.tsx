import { useMemo, useState } from 'react';
import {
  CONTROL_ITEMS,
  PLATFORM_ITEMS,
  HARDENING_GAP_FINDINGS,
  gradeControlCategory,
  gradePlatformIdentification,
  gradeHardeningGaps,
  type ControlCategory,
  type Platform,
} from '../lib/hardeningEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'category' | 'platform' | 'gaps' | 'knowledge' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  category: '1. Control Category',
  platform: '2. Platform Identification',
  gaps: '3. Hardening Gap Audit',
  knowledge: '4. Hardening Knowledge Check',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const CATEGORY_LABELS: Record<ControlCategory, string> = {
  firewall: 'Firewall',
  patching: 'Patching',
  'access-control': 'Access Control',
  logging: 'Logging',
  'service-minimization': 'Service Minimisation',
};

const CATEGORIES: ControlCategory[] = ['firewall', 'patching', 'access-control', 'logging', 'service-minimization'];

const PLATFORM_LABELS: Record<Platform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  network: 'Network',
};

const PLATFORMS: Platform[] = ['windows', 'linux', 'network'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function SecurityHardeningView() {
  const [step, setStep] = useState<Step>('category');

  const [categoryAnswers, setCategoryAnswers] = useState<Record<string, ControlCategory>>({});
  const [categorySubmitted, setCategorySubmitted] = useState(false);

  const [platformAnswers, setPlatformAnswers] = useState<Record<string, Platform>>({});
  const [platformSubmitted, setPlatformSubmitted] = useState(false);

  const [gapAnswers, setGapAnswers] = useState<Record<string, boolean>>({});
  const [gapsSubmitted, setGapsSubmitted] = useState(false);

  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<string, string>>({});
  const [knowledgeSubmitted, setKnowledgeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const categoryResult = useMemo(
    () => (categorySubmitted ? gradeControlCategory(categoryAnswers) : null),
    [categoryAnswers, categorySubmitted]
  );
  const platformResult = useMemo(
    () => (platformSubmitted ? gradePlatformIdentification(platformAnswers) : null),
    [platformAnswers, platformSubmitted]
  );
  const gapResult = useMemo(
    () => (gapsSubmitted ? gradeHardeningGaps(gapAnswers) : null),
    [gapAnswers, gapsSubmitted]
  );

  const KNOWLEDGE_QUESTIONS = useMemo(
    () => [
      {
        id: 'kq-0',
        stem: 'What does PowerShell Constrained Language Mode restrict?',
        options: [
          'It limits PowerShell to a safe subset of commands and blocks access to sensitive APIs like Win32 calls, even if a script executes',
          'It prevents PowerShell from being used at all',
          'It only restricts the console\'s colour scheme',
          'It disables all logging in PowerShell sessions',
        ],
        correct: 0,
        conceptId: 'powershell-hardening',
      },
      {
        id: 'kq-1',
        stem: 'What is a CIS Benchmark?',
        options: [
          'A vendor-neutral, community-developed configuration hardening standard for a specific OS or application, used as an audit baseline',
          'A proprietary vendor-specific patch schedule',
          'A network performance testing tool',
          'A type of intrusion detection signature',
        ],
        correct: 0,
        conceptId: 'hardening-baseline',
      },
      {
        id: 'kq-2',
        stem: 'What is the primary purpose of a jump host (bastion host) in network management?',
        options: [
          'It is the single, monitored, hardened entry point administrators must pass through to reach management interfaces',
          'It hosts the organisation\'s public website',
          'It replaces the need for any ACLs',
          'It automatically patches every device on the network',
        ],
        correct: 0,
        conceptId: 'secure-management-plane',
      },
      {
        id: 'kq-3',
        stem: 'Why should a network ACL end with an explicit or implicit deny-all rule?',
        options: [
          'It ensures only explicitly permitted traffic is allowed, so any flow not accounted for is blocked by default rather than allowed by omission',
          'It makes the ACL run faster',
          'It is only needed for wireless networks',
          'It removes the need for any permit rules at all',
        ],
        correct: 0,
        conceptId: 'network-acls',
      },
      {
        id: 'kq-4',
        stem: 'Why is patch management considered a continuous process rather than a one-time event?',
        options: [
          'New vulnerabilities are disclosed continuously, so patching must be a recurring, tested cadence (e.g., a pilot ring before fleet-wide deployment)',
          'Patches only need to be applied once when a system is first built',
          'Patch management is only relevant for cloud systems',
          'A single patch permanently secures a system against all future vulnerabilities',
        ],
        correct: 0,
        conceptId: 'patch-management',
      },
    ],
    []
  );

  const submitCategory = () => {
    setCategorySubmitted(true);
    const graded = gradeControlCategory(categoryAnswers);
    recordOutcome('hardening-baseline', graded.correctCount === graded.total);
  };

  const submitPlatform = () => {
    setPlatformSubmitted(true);
    const graded = gradePlatformIdentification(platformAnswers);
    recordOutcome('linux-service-hardening', graded.correctCount === graded.total);
  };

  const submitGaps = () => {
    setGapsSubmitted(true);
    const graded = gradeHardeningGaps(gapAnswers);
    recordOutcome('network-hardening', graded.correctCount === graded.total);
  };

  const submitKnowledge = () => {
    setKnowledgeSubmitted(true);
    const correct = KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === KNOWLEDGE_QUESTIONS.length;
    recordOutcome('powershell-hardening', knowledgeAnswers['kq-0'] === '0');
    recordOutcome('secure-management-plane', knowledgeAnswers['kq-2'] === '0');
    recordOutcome('network-acls', knowledgeAnswers['kq-3'] === '0');
    recordOutcome('patch-management', allCorrect);
  };

  const completedSteps = [categorySubmitted, platformSubmitted, gapsSubmitted, knowledgeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Security Hardening"
        subtitle="Phase 19 — Master cross-platform hardening control categories, patch management, PowerShell security, network attack surface reduction, and the secure management plane. Aligned with Security+ SY0-701 Domain 4."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Security Hardening exercises" />
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              step === s ? 'bg-accent text-black' : 'bg-panel-2 text-muted hover:text-white',
            ].join(' ')}
          >
            {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Step 1: Control Category */}
      {step === 'category' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Control Category</h2>
          <p className="mb-4 text-sm text-muted">
            For each control, select its category: <strong>Firewall</strong>, <strong>Patching</strong>, <strong>Access Control</strong>, <strong>Logging</strong>, or <strong>Service Minimisation</strong>.
          </p>

          <div className="space-y-3">
            {CONTROL_ITEMS.map((c) => {
              const chosen = categoryAnswers[c.id];
              const result = categoryResult?.results.find((r) => r.itemId === c.id);
              return (
                <div
                  key={c.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{c.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => !categorySubmitted && setCategoryAnswers((prev) => ({ ...prev, [c.id]: cat }))}
                        disabled={categorySubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === cat
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          categorySubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{CATEGORY_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!categorySubmitted ? (
            <Button
              onClick={submitCategory}
              disabled={Object.keys(categoryAnswers).length < CONTROL_ITEMS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {categoryResult!.correctCount}/{categoryResult!.total} ({categoryResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                The same five categories recur on every platform. Recognising the category is what lets you audit a platform you have never used before.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Platform Identification */}
      {step === 'platform' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Identify the Platform</h2>
          <p className="mb-4 text-sm text-muted">
            For each control, select which platform it applies to: <strong>Windows</strong>, <strong>Linux</strong>, or <strong>Network</strong>.
          </p>

          <div className="space-y-3">
            {PLATFORM_ITEMS.map((p) => {
              const chosen = platformAnswers[p.id];
              const result = platformResult?.results.find((r) => r.itemId === p.id);
              return (
                <div
                  key={p.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{p.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((pl) => (
                      <button
                        key={pl}
                        onClick={() => !platformSubmitted && setPlatformAnswers((prev) => ({ ...prev, [p.id]: pl }))}
                        disabled={platformSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === pl
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          platformSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {PLATFORM_LABELS[pl]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{PLATFORM_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!platformSubmitted ? (
            <Button
              onClick={submitPlatform}
              disabled={Object.keys(platformAnswers).length < PLATFORM_ITEMS.length}
            >
              Submit Identification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {platformResult!.correctCount}/{platformResult!.total} ({platformResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Exam scenario questions often describe a control without naming the platform explicitly — recognising the tool name tells you the platform immediately.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Hardening Gap Audit */}
      {step === 'gaps' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Hardening Gap Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">gap</strong> or a <strong className="text-ok">correct practice</strong>?
          </p>

          <div className="space-y-3">
            {HARDENING_GAP_FINDINGS.map((f) => {
              const chosen = gapAnswers[f.id];
              const result = gapResult?.results.find((r) => r.findingId === f.id);
              return (
                <div
                  key={f.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase ${SEVERITY_COLORS[f.severity]}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs text-muted">{f.area}</span>
                  </div>
                  <div className="mb-3 text-sm font-medium text-white">{f.description}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !gapsSubmitted && setGapAnswers((prev) => ({ ...prev, [f.id]: true }))}
                      disabled={gapsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === true
                          ? 'bg-danger/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        gapsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Gap
                    </button>
                    <button
                      onClick={() => !gapsSubmitted && setGapAnswers((prev) => ({ ...prev, [f.id]: false }))}
                      disabled={gapsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === false
                          ? 'bg-ok/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        gapsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Correct Practice
                    </button>
                  </div>
                  {result && (
                    <div className={`mt-2 text-xs ${result.isCorrect ? 'text-ok' : 'text-danger'}`}>
                      {result.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!gapsSubmitted ? (
            <Button
              onClick={submitGaps}
              disabled={Object.keys(gapAnswers).length < HARDENING_GAP_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {gapResult!.correctCount}/{gapResult!.total} ({gapResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Every gap here already has a well-known fix. The audit skill is noticing it was never applied, or silently stopped working.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Knowledge Check */}
      {step === 'knowledge' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Hardening Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about PowerShell hardening, CIS Benchmarks, jump hosts, ACLs, and patch management.
          </p>

          <div className="space-y-4">
            {KNOWLEDGE_QUESTIONS.map((q, qi) => {
              const chosen = knowledgeAnswers[q.id];
              const isCorrect = knowledgeSubmitted && chosen === String(q.correct);
              const isWrong = knowledgeSubmitted && chosen !== String(q.correct);
              return (
                <div
                  key={q.id}
                  className={[
                    'rounded-lg border p-4',
                    isCorrect
                      ? 'border-ok/40 bg-ok/5'
                      : isWrong
                        ? 'border-danger/40 bg-danger/5'
                        : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">
                    {qi + 1}. {q.stem}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => !knowledgeSubmitted && setKnowledgeAnswers((prev) => ({ ...prev, [q.id]: String(oi) }))}
                        disabled={knowledgeSubmitted}
                        className={[
                          'block w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                          chosen === String(oi)
                            ? knowledgeSubmitted
                              ? oi === q.correct
                                ? 'bg-ok/20 text-ok'
                                : 'bg-danger/20 text-danger'
                              : 'bg-accent/20 text-accent'
                            : knowledgeSubmitted && oi === q.correct
                              ? 'bg-ok/10 text-ok'
                              : 'bg-panel text-muted hover:text-white',
                          knowledgeSubmitted ? 'cursor-default' : 'hover:bg-panel-2',
                        ].join(' ')}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!knowledgeSubmitted ? (
            <Button
              onClick={submitKnowledge}
              disabled={Object.keys(knowledgeAnswers).length < KNOWLEDGE_QUESTIONS.length}
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length}/{KNOWLEDGE_QUESTIONS.length}
              </div>
              <p className="mt-1 text-xs text-muted">
                None of these controls are exotic. Hardening maturity is almost always about consistent application and periodic re-verification, not undiscovered techniques.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 19 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Control Category</div>
              <div className="text-xs text-muted">
                {categoryResult ? `${categoryResult.correctCount}/${categoryResult.total} (${categoryResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. Platform Identification</div>
              <div className="text-xs text-muted">
                {platformResult ? `${platformResult.correctCount}/${platformResult.total} (${platformResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Hardening Gap Audit</div>
              <div className="text-xs text-muted">
                {gapResult ? `${gapResult.correctCount}/${gapResult.total} (${gapResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. Hardening Knowledge Check</div>
              <div className="text-xs text-muted">
                {knowledgeSubmitted
                  ? `${KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length}/${KNOWLEDGE_QUESTIONS.length}`
                  : 'Not attempted'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
