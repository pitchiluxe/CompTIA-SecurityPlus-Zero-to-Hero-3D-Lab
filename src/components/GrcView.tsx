import { useMemo, useState } from 'react';
import {
  RISK_TREATMENT_SCENARIOS,
  DOCUMENT_ITEMS,
  GRC_GAP_FINDINGS,
  gradeRiskTreatment,
  gradeDocumentHierarchy,
  gradeGrcGaps,
  type RiskTreatment,
  type DocumentType,
} from '../lib/grcEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'treatment' | 'documents' | 'gaps' | 'knowledge' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  treatment: '1. Risk Treatment',
  documents: '2. Document Hierarchy',
  gaps: '3. Governance Gap Audit',
  knowledge: '4. GRC Knowledge Check',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const TREATMENT_LABELS: Record<RiskTreatment, string> = {
  avoid: 'Avoid',
  transfer: 'Transfer',
  mitigate: 'Mitigate',
  accept: 'Accept',
};

const TREATMENTS: RiskTreatment[] = ['avoid', 'transfer', 'mitigate', 'accept'];

const DOC_LABELS: Record<DocumentType, string> = {
  policy: 'Policy',
  standard: 'Standard',
  procedure: 'Procedure',
  guideline: 'Guideline',
};

const DOC_TYPES: DocumentType[] = ['policy', 'standard', 'procedure', 'guideline'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function GrcView() {
  const [step, setStep] = useState<Step>('treatment');

  const [treatmentAnswers, setTreatmentAnswers] = useState<Record<string, RiskTreatment>>({});
  const [treatmentSubmitted, setTreatmentSubmitted] = useState(false);

  const [docAnswers, setDocAnswers] = useState<Record<string, DocumentType>>({});
  const [docSubmitted, setDocSubmitted] = useState(false);

  const [gapAnswers, setGapAnswers] = useState<Record<string, boolean>>({});
  const [gapsSubmitted, setGapsSubmitted] = useState(false);

  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<string, string>>({});
  const [knowledgeSubmitted, setKnowledgeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const treatmentResult = useMemo(
    () => (treatmentSubmitted ? gradeRiskTreatment(treatmentAnswers) : null),
    [treatmentAnswers, treatmentSubmitted]
  );
  const docResult = useMemo(
    () => (docSubmitted ? gradeDocumentHierarchy(docAnswers) : null),
    [docAnswers, docSubmitted]
  );
  const gapResult = useMemo(
    () => (gapsSubmitted ? gradeGrcGaps(gapAnswers) : null),
    [gapAnswers, gapsSubmitted]
  );

  const KNOWLEDGE_QUESTIONS = useMemo(
    () => [
      {
        id: 'kq-0',
        stem: 'A risk has an SLE of $80,000 and an ARO of 0.25. What is the ALE?',
        options: ['$20,000', '$80,000', '$320,000', '$8,000'],
        correct: 0,
        conceptId: 'risk-assessment',
      },
      {
        id: 'kq-1',
        stem: 'What does a Business Impact Analysis identify that a general risk assessment does not?',
        options: [
          'Which business processes are critical and their Maximum Tolerable Downtime (MTD)',
          'The exact firewall rules needed for compliance',
          'The dollar value of every employee\'s laptop',
          'The org chart of the security team',
        ],
        correct: 0,
        conceptId: 'business-impact-analysis',
      },
      {
        id: 'kq-2',
        stem: 'What is the primary purpose of a right-to-audit clause in a vendor contract?',
        options: [
          'It allows the organisation to directly verify a vendor\'s security controls rather than relying solely on the vendor\'s word',
          'It guarantees the vendor will never be breached',
          'It replaces the need for any contract at all',
          'It only applies to government vendors',
        ],
        correct: 0,
        conceptId: 'vendor-risk',
      },
      {
        id: 'kq-3',
        stem: 'A company processes the personal data of EU residents, regardless of where the company itself is headquartered. Which regulation primarily applies?',
        options: ['GDPR', 'HIPAA', 'PCI DSS', 'No regulation applies'],
        correct: 0,
        conceptId: 'compliance-frameworks',
      },
      {
        id: 'kq-4',
        stem: 'Which risk treatment involves paying a third party (such as an insurer) to assume financial responsibility for a risk?',
        options: ['Transfer', 'Avoid', 'Mitigate', 'Accept'],
        correct: 0,
        conceptId: 'risk-treatment',
      },
    ],
    []
  );

  const submitTreatment = () => {
    setTreatmentSubmitted(true);
    const graded = gradeRiskTreatment(treatmentAnswers);
    recordOutcome('risk-treatment', graded.correctCount === graded.total);
  };

  const submitDocuments = () => {
    setDocSubmitted(true);
    const graded = gradeDocumentHierarchy(docAnswers);
    recordOutcome('governance-documents', graded.correctCount === graded.total);
  };

  const submitGaps = () => {
    setGapsSubmitted(true);
    const graded = gradeGrcGaps(gapAnswers);
    recordOutcome('risk-management', graded.correctCount === graded.total);
  };

  const submitKnowledge = () => {
    setKnowledgeSubmitted(true);
    const correct = KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === KNOWLEDGE_QUESTIONS.length;
    recordOutcome('risk-assessment', allCorrect);
    recordOutcome('business-impact-analysis', knowledgeAnswers['kq-1'] === '0');
    recordOutcome('vendor-risk', knowledgeAnswers['kq-2'] === '0');
    recordOutcome('compliance-frameworks', knowledgeAnswers['kq-3'] === '0');
  };

  const completedSteps = [treatmentSubmitted, docSubmitted, gapsSubmitted, knowledgeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Governance, Risk & Compliance"
        subtitle="Phase 17 — Master risk management, risk treatment, governance document hierarchy, compliance frameworks, audits, vendor risk, and business impact analysis. Aligned with Security+ SY0-701 Domain 5."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="GRC exercises" />
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

      {/* Step 1: Risk Treatment */}
      {step === 'treatment' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Match the Risk Treatment</h2>
          <p className="mb-4 text-sm text-muted">
            For each scenario, select the correct treatment: <strong>Avoid</strong>, <strong>Transfer</strong>, <strong>Mitigate</strong>, or <strong>Accept</strong>.
          </p>

          <div className="space-y-3">
            {RISK_TREATMENT_SCENARIOS.map((s) => {
              const chosen = treatmentAnswers[s.id];
              const result = treatmentResult?.results.find((r) => r.scenarioId === s.id);
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
                    {TREATMENTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => !treatmentSubmitted && setTreatmentAnswers((prev) => ({ ...prev, [s.id]: t }))}
                        disabled={treatmentSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === t
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          treatmentSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {TREATMENT_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{TREATMENT_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!treatmentSubmitted ? (
            <Button
              onClick={submitTreatment}
              disabled={Object.keys(treatmentAnswers).length < RISK_TREATMENT_SCENARIOS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {treatmentResult!.correctCount}/{treatmentResult!.total} ({treatmentResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Every risk decision resolves to exactly one of these four treatments. Naming the correct one is what turns "we should do something" into an actionable, accountable decision.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Document Hierarchy */}
      {step === 'documents' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify the Governance Document</h2>
          <p className="mb-4 text-sm text-muted">
            For each statement, select the correct document type: <strong>Policy</strong>, <strong>Standard</strong>, <strong>Procedure</strong>, or <strong>Guideline</strong>.
          </p>

          <div className="space-y-3">
            {DOCUMENT_ITEMS.map((item) => {
              const chosen = docAnswers[item.id];
              const result = docResult?.results.find((r) => r.itemId === item.id);
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
                  <div className="mb-3 text-sm font-medium text-white">{item.statement}</div>
                  <div className="flex flex-wrap gap-2">
                    {DOC_TYPES.map((d) => (
                      <button
                        key={d}
                        onClick={() => !docSubmitted && setDocAnswers((prev) => ({ ...prev, [item.id]: d }))}
                        disabled={docSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === d
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          docSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {DOC_LABELS[d]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{DOC_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!docSubmitted ? (
            <Button
              onClick={submitDocuments}
              disabled={Object.keys(docAnswers).length < DOCUMENT_ITEMS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {docResult!.correctCount}/{docResult!.total} ({docResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Policies answer "why," standards answer "how much/what," procedures answer "how, step by step," and guidelines answer "what is recommended, if not required."
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Governance Gap Audit */}
      {step === 'gaps' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Governance Gap Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">gap</strong> or a <strong className="text-ok">correct practice</strong>?
          </p>

          <div className="space-y-3">
            {GRC_GAP_FINDINGS.map((f) => {
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
              disabled={Object.keys(gapAnswers).length < GRC_GAP_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {gapResult!.correctCount}/{gapResult!.total} ({gapResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Governance gaps rarely look dramatic in isolation — a stale register, an unowned finding, a vendor never assessed. They only become dramatic later, during an incident.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Knowledge Check */}
      {step === 'knowledge' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">GRC Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about ALE, BIA, vendor risk, compliance frameworks, and risk treatment.
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
                GRC turns judgment calls into repeatable, defensible decisions — a dollar figure for risk, a defined downtime tolerance, a contractual right to verify a vendor.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 17 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Risk Treatment</div>
              <div className="text-xs text-muted">
                {treatmentResult ? `${treatmentResult.correctCount}/${treatmentResult.total} (${treatmentResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. Document Hierarchy</div>
              <div className="text-xs text-muted">
                {docResult ? `${docResult.correctCount}/${docResult.total} (${docResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Governance Gap Audit</div>
              <div className="text-xs text-muted">
                {gapResult ? `${gapResult.correctCount}/${gapResult.total} (${gapResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. GRC Knowledge Check</div>
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
