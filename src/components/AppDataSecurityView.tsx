import { useMemo, useState } from 'react';
import {
  VULN_SCENARIOS,
  DATA_CLASS_ITEMS,
  APP_MISCONFIG_FINDINGS,
  gradeVulnClassification,
  gradeDataClassification,
  gradeAppMisconfigs,
  type VulnCategory,
  type DataClassLevel,
} from '../lib/appDataEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'vulns' | 'classification' | 'misconfigs' | 'protection' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  vulns: '1. Vulnerability Classification',
  classification: '2. Data Classification',
  misconfigs: '3. Misconfiguration Audit',
  protection: '4. Protection Techniques',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const VULN_LABELS: Record<VulnCategory, string> = {
  injection: 'Injection',
  xss: 'XSS',
  'broken-auth': 'Broken Auth',
  'broken-access-control': 'Access Control',
  'security-misconfig': 'Misconfig',
  'sensitive-data-exposure': 'Data Exposure',
};

const VULN_CATEGORIES: VulnCategory[] = [
  'injection',
  'xss',
  'broken-auth',
  'broken-access-control',
  'security-misconfig',
  'sensitive-data-exposure',
];

const CLASS_LABELS: Record<DataClassLevel, string> = {
  public: 'Public',
  internal: 'Internal',
  confidential: 'Confidential',
  restricted: 'Restricted',
};

const CLASS_LEVELS: DataClassLevel[] = ['public', 'internal', 'confidential', 'restricted'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function AppDataSecurityView() {
  const [step, setStep] = useState<Step>('vulns');

  const [vulnAnswers, setVulnAnswers] = useState<Record<string, VulnCategory>>({});
  const [vulnSubmitted, setVulnSubmitted] = useState(false);

  const [classAnswers, setClassAnswers] = useState<Record<string, DataClassLevel>>({});
  const [classSubmitted, setClassSubmitted] = useState(false);

  const [misconfigAnswers, setMisconfigAnswers] = useState<Record<string, boolean>>({});
  const [misconfigsSubmitted, setMisconfigsSubmitted] = useState(false);

  const [protectionAnswers, setProtectionAnswers] = useState<Record<string, string>>({});
  const [protectionSubmitted, setProtectionSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const vulnResult = useMemo(
    () => (vulnSubmitted ? gradeVulnClassification(vulnAnswers) : null),
    [vulnAnswers, vulnSubmitted]
  );
  const classResult = useMemo(
    () => (classSubmitted ? gradeDataClassification(classAnswers) : null),
    [classAnswers, classSubmitted]
  );
  const misconfigResult = useMemo(
    () => (misconfigsSubmitted ? gradeAppMisconfigs(misconfigAnswers) : null),
    [misconfigAnswers, misconfigsSubmitted]
  );

  const PROTECTION_QUESTIONS = useMemo(
    () => [
      {
        id: 'pq-0',
        stem: 'A payment processor needs to recover the original card number later, but only through a separate secure vault. Which technique fits?',
        options: [
          'Tokenization',
          'Masking',
          'One-way hashing',
          'Base64 encoding',
        ],
        correct: 0,
        conceptId: 'tokenization-masking',
      },
      {
        id: 'pq-1',
        stem: 'A support UI must show only the last four digits of a card number and never needs the full value recovered from that view. Which technique fits?',
        options: [
          'Masking',
          'Tokenization',
          'Asymmetric encryption',
          'Key exchange',
        ],
        correct: 0,
        conceptId: 'tokenization-masking',
      },
      {
        id: 'pq-2',
        stem: 'Data actively being processed in application memory is protected by which category of control?',
        options: [
          'Confidential computing / process isolation (protects data in use)',
          'TLS (protects data in transit only)',
          'Disk encryption (protects data at rest only)',
          'DLP email rules only',
        ],
        correct: 0,
        conceptId: 'data-states',
      },
      {
        id: 'pq-3',
        stem: 'What must exist before a DLP policy can meaningfully block or alert on sensitive data leaving the organisation?',
        options: [
          'Accurate data classification, so DLP rules know what pattern or label counts as sensitive',
          'A hardware security module',
          'A stricter firewall egress rule with no other configuration',
          'Nothing — DLP works the same regardless of classification',
        ],
        correct: 0,
        conceptId: 'dlp',
      },
      {
        id: 'pq-4',
        stem: 'Why should a retention schedule specify an irreversible disposal method rather than just "delete when convenient"?',
        options: [
          'Data retained past its need increases breach impact with no benefit, and disposal must be provably irreversible for audit purposes',
          'Storage costs are the only concern',
          'Regulators require data to be kept forever',
          'Irreversible disposal is never required for compliance',
        ],
        correct: 0,
        conceptId: 'data-retention',
      },
    ],
    []
  );

  const submitVulns = () => {
    setVulnSubmitted(true);
    const graded = gradeVulnClassification(vulnAnswers);
    recordOutcome('owasp-top-10', graded.correctCount === graded.total);
  };

  const submitClassification = () => {
    setClassSubmitted(true);
    const graded = gradeDataClassification(classAnswers);
    recordOutcome('data-classification', graded.correctCount === graded.total);
  };

  const submitMisconfigs = () => {
    setMisconfigsSubmitted(true);
    const graded = gradeAppMisconfigs(misconfigAnswers);
    recordOutcome('input-validation', graded.correctCount === graded.total);
  };

  const submitProtection = () => {
    setProtectionSubmitted(true);
    const correct = PROTECTION_QUESTIONS.filter((q) => protectionAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === PROTECTION_QUESTIONS.length;
    recordOutcome('tokenization-masking', allCorrect);
    recordOutcome('data-states', protectionAnswers['pq-2'] === '0');
    recordOutcome('dlp', protectionAnswers['pq-3'] === '0');
    recordOutcome('data-retention', protectionAnswers['pq-4'] === '0');
  };

  const completedSteps = [vulnSubmitted, classSubmitted, misconfigsSubmitted, protectionSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Application & Data Security"
        subtitle="Phase 16 — Master secure application development (OWASP Top 10, injection, access control) and data security (classification, tokenization, masking, DLP, retention). Aligned with Security+ SY0-701 Domain 3."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Application / Data Security exercises" />
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

      {/* Step 1: Vulnerability Classification */}
      {step === 'vulns' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Vulnerability</h2>
          <p className="mb-4 text-sm text-muted">
            For each finding, select the correct vulnerability category.
          </p>

          <div className="space-y-3">
            {VULN_SCENARIOS.map((s) => {
              const chosen = vulnAnswers[s.id];
              const result = vulnResult?.results.find((r) => r.scenarioId === s.id);
              return (
                <div
                  key={s.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{s.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {VULN_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => !vulnSubmitted && setVulnAnswers((prev) => ({ ...prev, [s.id]: c }))}
                        disabled={vulnSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === c
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          vulnSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {VULN_LABELS[c]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{VULN_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!vulnSubmitted ? (
            <Button
              onClick={submitVulns}
              disabled={Object.keys(vulnAnswers).length < VULN_SCENARIOS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {vulnResult!.correctCount}/{vulnResult!.total} ({vulnResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Naming the correct OWASP-aligned category is what turns a vague "this looks bad" into an actionable finding with a known, specific remediation.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Data Classification */}
      {step === 'classification' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Data Asset</h2>
          <p className="mb-4 text-sm text-muted">
            For each asset, select the correct classification tier: <strong>Public</strong>, <strong>Internal</strong>, <strong>Confidential</strong>, or <strong>Restricted</strong>.
          </p>

          <div className="space-y-3">
            {DATA_CLASS_ITEMS.map((item) => {
              const chosen = classAnswers[item.id];
              const result = classResult?.results.find((r) => r.itemId === item.id);
              return (
                <div
                  key={item.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{item.asset}</div>
                  <div className="flex flex-wrap gap-2">
                    {CLASS_LEVELS.map((c) => (
                      <button
                        key={c}
                        onClick={() => !classSubmitted && setClassAnswers((prev) => ({ ...prev, [item.id]: c }))}
                        disabled={classSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === c
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          classSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {CLASS_LABELS[c]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{CLASS_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!classSubmitted ? (
            <Button
              onClick={submitClassification}
              disabled={Object.keys(classAnswers).length < DATA_CLASS_ITEMS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {classResult!.correctCount}/{classResult!.total} ({classResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Classification should reflect actual impact if disclosed, not internal habit. Every downstream control — DLP, encryption choice, retention — inherits this decision.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Misconfiguration Audit */}
      {step === 'misconfigs' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Application / Data Misconfiguration Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">misconfiguration</strong> or a <strong className="text-ok">correct configuration</strong>?
          </p>

          <div className="space-y-3">
            {APP_MISCONFIG_FINDINGS.map((f) => {
              const chosen = misconfigAnswers[f.id];
              const result = misconfigResult?.results.find((r) => r.findingId === f.id);
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
                      onClick={() => !misconfigsSubmitted && setMisconfigAnswers((prev) => ({ ...prev, [f.id]: true }))}
                      disabled={misconfigsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === true
                          ? 'bg-danger/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        misconfigsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Misconfiguration
                    </button>
                    <button
                      onClick={() => !misconfigsSubmitted && setMisconfigAnswers((prev) => ({ ...prev, [f.id]: false }))}
                      disabled={misconfigsSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === false
                          ? 'bg-ok/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        misconfigsSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Correct Config
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

          {!misconfigsSubmitted ? (
            <Button
              onClick={submitMisconfigs}
              disabled={Object.keys(misconfigAnswers).length < APP_MISCONFIG_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {misconfigResult!.correctCount}/{misconfigResult!.total} ({misconfigResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Application and data security failures are rarely missing tools — the controls almost always already exist. The audit skill is spotting where enforcement quietly stopped.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Protection Techniques Knowledge Check */}
      {step === 'protection' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Protection Techniques Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about tokenization, masking, data states, DLP, and retention.
          </p>

          <div className="space-y-4">
            {PROTECTION_QUESTIONS.map((q, qi) => {
              const chosen = protectionAnswers[q.id];
              const isCorrect = protectionSubmitted && chosen === String(q.correct);
              const isWrong = protectionSubmitted && chosen !== String(q.correct);
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
                        onClick={() => !protectionSubmitted && setProtectionAnswers((prev) => ({ ...prev, [q.id]: String(oi) }))}
                        disabled={protectionSubmitted}
                        className={[
                          'block w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                          chosen === String(oi)
                            ? protectionSubmitted
                              ? oi === q.correct
                                ? 'bg-ok/20 text-ok'
                                : 'bg-danger/20 text-danger'
                              : 'bg-accent/20 text-accent'
                            : protectionSubmitted && oi === q.correct
                              ? 'bg-ok/10 text-ok'
                              : 'bg-panel text-muted hover:text-white',
                          protectionSubmitted ? 'cursor-default' : 'hover:bg-panel-2',
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

          {!protectionSubmitted ? (
            <Button
              onClick={submitProtection}
              disabled={Object.keys(protectionAnswers).length < PROTECTION_QUESTIONS.length}
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {PROTECTION_QUESTIONS.filter((q) => protectionAnswers[q.id] === String(q.correct)).length}/{PROTECTION_QUESTIONS.length}
              </div>
              <p className="mt-1 text-xs text-muted">
                Encryption, tokenization, and masking solve different problems. Choosing the wrong one for a given field is a common real-world audit finding, not just an exam trick.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 16 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Vulnerability Classification</div>
              <div className="text-xs text-muted">
                {vulnResult ? `${vulnResult.correctCount}/${vulnResult.total} (${vulnResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. Data Classification</div>
              <div className="text-xs text-muted">
                {classResult ? `${classResult.correctCount}/${classResult.total} (${classResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Misconfiguration Audit</div>
              <div className="text-xs text-muted">
                {misconfigResult ? `${misconfigResult.correctCount}/${misconfigResult.total} (${misconfigResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. Protection Techniques Knowledge Check</div>
              <div className="text-xs text-muted">
                {protectionSubmitted
                  ? `${PROTECTION_QUESTIONS.filter((q) => protectionAnswers[q.id] === String(q.correct)).length}/${PROTECTION_QUESTIONS.length}`
                  : 'Not attempted'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
