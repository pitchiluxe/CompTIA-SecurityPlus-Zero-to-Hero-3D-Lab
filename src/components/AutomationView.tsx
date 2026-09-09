import { useMemo, useState } from 'react';
import {
  IOC_ITEMS,
  PIPELINE_ITEMS,
  AUTOMATION_GAP_FINDINGS,
  gradeIocClassification,
  gradePipelineStage,
  gradeAutomationGaps,
  type IocType,
  type PipelineStage,
} from '../lib/automationEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'ioc' | 'pipeline' | 'gaps' | 'knowledge' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  ioc: '1. IOC Classification',
  pipeline: '2. Pipeline Stage',
  gaps: '3. Automation Gap Audit',
  knowledge: '4. Automation Knowledge Check',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const IOC_LABELS: Record<IocType, string> = {
  ip: 'IP Address',
  domain: 'Domain',
  md5: 'MD5 Hash',
  sha256: 'SHA-256 Hash',
  url: 'URL',
};

const IOC_TYPES: IocType[] = ['ip', 'domain', 'md5', 'sha256', 'url'];

const STAGE_LABELS: Record<PipelineStage, string> = {
  parsing: 'Parsing',
  detection: 'Detection',
  enrichment: 'Enrichment',
  reporting: 'Reporting',
  response: 'Response',
};

const STAGES: PipelineStage[] = ['parsing', 'detection', 'enrichment', 'reporting', 'response'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function AutomationView() {
  const [step, setStep] = useState<Step>('ioc');

  const [iocAnswers, setIocAnswers] = useState<Record<string, IocType>>({});
  const [iocSubmitted, setIocSubmitted] = useState(false);

  const [pipelineAnswers, setPipelineAnswers] = useState<Record<string, PipelineStage>>({});
  const [pipelineSubmitted, setPipelineSubmitted] = useState(false);

  const [gapAnswers, setGapAnswers] = useState<Record<string, boolean>>({});
  const [gapsSubmitted, setGapsSubmitted] = useState(false);

  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<string, string>>({});
  const [knowledgeSubmitted, setKnowledgeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const iocResult = useMemo(
    () => (iocSubmitted ? gradeIocClassification(iocAnswers) : null),
    [iocAnswers, iocSubmitted]
  );
  const pipelineResult = useMemo(
    () => (pipelineSubmitted ? gradePipelineStage(pipelineAnswers) : null),
    [pipelineAnswers, pipelineSubmitted]
  );
  const gapResult = useMemo(
    () => (gapsSubmitted ? gradeAutomationGaps(gapAnswers) : null),
    [gapAnswers, gapsSubmitted]
  );

  const KNOWLEDGE_QUESTIONS = useMemo(
    () => [
      {
        id: 'kq-0',
        stem: 'What does re.findall (or an equivalent regex function) do conceptually?',
        options: [
          'It scans text and returns every substring matching a defined search pattern',
          'It permanently deletes matching text from a file',
          'It encrypts every line of a file',
          'It sends an email for every match found',
        ],
        correct: 0,
        conceptId: 'log-parsing',
      },
      {
        id: 'kq-1',
        stem: 'Why should a script store its API credential in an environment variable rather than the source file?',
        options: [
          'Source code is often shared or version-controlled, so a hardcoded credential becomes exposed to everyone with access to it',
          'Environment variables make API calls faster',
          'This has no real security benefit',
          'Environment variables are required by every programming language',
        ],
        correct: 0,
        conceptId: 'secure-automation-practices',
      },
      {
        id: 'kq-2',
        stem: 'What does SOAR stand for and what is its core purpose?',
        options: [
          'Security Orchestration, Automation, and Response — combining tools and automated actions into repeatable, appropriately gated playbooks',
          'Security Operations and Reporting — a type of dashboard only',
          'System Output and Alerting Rules — a logging format',
          'Standard Operating Automated Recovery — a backup technique',
        ],
        correct: 0,
        conceptId: 'soar',
      },
      {
        id: 'kq-3',
        stem: 'Why is human-in-the-loop approval important before a script executes a destructive remediation action, like disabling an account?',
        options: [
          'An automated false positive could otherwise cause unnecessary business disruption; human review adds a safety check before an irreversible action',
          'Scripts are incapable of taking destructive actions',
          'Human approval is only needed for network changes, never account changes',
          'This slows down response with no corresponding benefit',
        ],
        correct: 0,
        conceptId: 'soar',
      },
      {
        id: 'kq-4',
        stem: 'What is the key difference between automation and orchestration?',
        options: [
          'Automation performs a single repetitive task; orchestration coordinates multiple automated tasks and tools together into one workflow',
          'They are identical concepts with different marketing names',
          'Orchestration only applies to cloud infrastructure',
          'Automation always requires more code than orchestration',
        ],
        correct: 0,
        conceptId: 'soar',
      },
    ],
    []
  );

  const submitIoc = () => {
    setIocSubmitted(true);
    const graded = gradeIocClassification(iocAnswers);
    recordOutcome('ioc-extraction', graded.correctCount === graded.total);
  };

  const submitPipeline = () => {
    setPipelineSubmitted(true);
    const graded = gradePipelineStage(pipelineAnswers);
    recordOutcome('log-parsing', graded.correctCount === graded.total);
  };

  const submitGaps = () => {
    setGapsSubmitted(true);
    const graded = gradeAutomationGaps(gapAnswers);
    recordOutcome('secure-automation-practices', graded.correctCount === graded.total);
  };

  const submitKnowledge = () => {
    setKnowledgeSubmitted(true);
    const correct = KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === KNOWLEDGE_QUESTIONS.length;
    recordOutcome('soar', allCorrect);
    recordOutcome('evidence-automation', knowledgeAnswers['kq-3'] === '0');
  };

  const completedSteps = [iocSubmitted, pipelineSubmitted, gapsSubmitted, knowledgeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Security Automation"
        subtitle="Phase 20 — Master Python/JSON fundamentals, log parsing, IOC extraction, secure automation practices, and SOAR concepts. Aligned with Security+ SY0-701 Domain 4."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Security Automation exercises" />
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

      {/* Step 1: IOC Classification */}
      {step === 'ioc' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Indicator Type</h2>
          <p className="mb-4 text-sm text-muted">
            For each value, select its indicator type: <strong>IP</strong>, <strong>Domain</strong>, <strong>MD5</strong>, <strong>SHA-256</strong>, or <strong>URL</strong>.
          </p>

          <div className="space-y-3">
            {IOC_ITEMS.map((i) => {
              const chosen = iocAnswers[i.id];
              const result = iocResult?.results.find((r) => r.itemId === i.id);
              return (
                <div
                  key={i.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 break-all font-mono text-sm font-medium text-white">{i.value}</div>
                  <div className="flex flex-wrap gap-2">
                    {IOC_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => !iocSubmitted && setIocAnswers((prev) => ({ ...prev, [i.id]: t }))}
                        disabled={iocSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === t
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          iocSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {IOC_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{IOC_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!iocSubmitted ? (
            <Button
              onClick={submitIoc}
              disabled={Object.keys(iocAnswers).length < IOC_ITEMS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {iocResult!.correctCount}/{iocResult!.total} ({iocResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Submitting the wrong indicator type to a threat-intelligence API (e.g., an IP where a domain was expected) returns meaningless results — recognising the shape of each type is a prerequisite skill.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Pipeline Stage */}
      {step === 'pipeline' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Identify the Pipeline Stage</h2>
          <p className="mb-4 text-sm text-muted">
            For each script action, select its pipeline stage: <strong>Parsing</strong>, <strong>Detection</strong>, <strong>Enrichment</strong>, <strong>Reporting</strong>, or <strong>Response</strong>.
          </p>

          <div className="space-y-3">
            {PIPELINE_ITEMS.map((p) => {
              const chosen = pipelineAnswers[p.id];
              const result = pipelineResult?.results.find((r) => r.itemId === p.id);
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
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => !pipelineSubmitted && setPipelineAnswers((prev) => ({ ...prev, [p.id]: s }))}
                        disabled={pipelineSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === s
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          pipelineSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {STAGE_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{STAGE_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!pipelineSubmitted ? (
            <Button
              onClick={submitPipeline}
              disabled={Object.keys(pipelineAnswers).length < PIPELINE_ITEMS.length}
            >
              Submit Identification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {pipelineResult!.correctCount}/{pipelineResult!.total} ({pipelineResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Every automation project in this phase is built from the same five stages. Recognising which stage a described action belongs to is what lets you debug where a pipeline actually broke.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Automation Gap Audit */}
      {step === 'gaps' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Automation Security Gap Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">gap</strong> or a <strong className="text-ok">correct practice</strong>?
          </p>

          <div className="space-y-3">
            {AUTOMATION_GAP_FINDINGS.map((f) => {
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
              disabled={Object.keys(gapAnswers).length < AUTOMATION_GAP_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {gapResult!.correctCount}/{gapResult!.total} ({gapResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Automation scripts are code, and code needs the same security review as any other software: secrets management, error handling, human-in-the-loop gating, and evidentiary integrity.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Knowledge Check */}
      {step === 'knowledge' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Automation Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about regex, credential handling, SOAR, and human-in-the-loop approval.
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
                Automation removes the repetitive first ninety percent of a task; the analyst&apos;s judgement is still what the last ten percent — and every destructive decision — depends on.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 20 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. IOC Classification</div>
              <div className="text-xs text-muted">
                {iocResult ? `${iocResult.correctCount}/${iocResult.total} (${iocResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. Pipeline Stage</div>
              <div className="text-xs text-muted">
                {pipelineResult ? `${pipelineResult.correctCount}/${pipelineResult.total} (${pipelineResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Automation Gap Audit</div>
              <div className="text-xs text-muted">
                {gapResult ? `${gapResult.correctCount}/${gapResult.total} (${gapResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. Automation Knowledge Check</div>
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
