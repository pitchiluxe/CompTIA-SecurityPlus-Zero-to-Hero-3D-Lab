import { useMemo, useState } from 'react';
import {
  CLOUD_SERVICES,
  RESPONSIBILITY_ITEMS,
  MISCONFIG_FINDINGS,
  gradeServiceModels,
  gradeResponsibility,
  gradeMisconfigs,
  type ServiceModel,
  type ResponsibilityOwner,
} from '../lib/cloudEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'models' | 'responsibility' | 'misconfigs' | 'containers' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  models: '1. Service Models',
  responsibility: '2. Shared Responsibility',
  misconfigs: '3. Misconfiguration Audit',
  containers: '4. Cloud-Native Security',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const MODEL_LABELS: Record<ServiceModel, string> = {
  iaas: 'IaaS',
  paas: 'PaaS',
  saas: 'SaaS',
};

const MODELS: ServiceModel[] = ['iaas', 'paas', 'saas'];

const OWNER_LABELS: Record<ResponsibilityOwner, string> = {
  provider: 'Provider',
  customer: 'Customer',
  shared: 'Shared',
};

const OWNERS: ResponsibilityOwner[] = ['provider', 'customer', 'shared'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function CloudSecurityView() {
  const [step, setStep] = useState<Step>('models');

  // Service Models
  const [modelAnswers, setModelAnswers] = useState<Record<string, ServiceModel>>({});
  const [modelsSubmitted, setModelsSubmitted] = useState(false);

  // Responsibility
  const [respAnswers, setRespAnswers] = useState<Record<string, ResponsibilityOwner>>({});
  const [respSubmitted, setRespSubmitted] = useState(false);

  // Misconfigs
  const [misconfigAnswers, setMisconfigAnswers] = useState<Record<string, boolean>>({});
  const [misconfigsSubmitted, setMisconfigsSubmitted] = useState(false);

  // Cloud-native knowledge check
  const [nativeAnswers, setNativeAnswers] = useState<Record<string, string>>({});
  const [nativeSubmitted, setNativeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const modelResult = useMemo(
    () => (modelsSubmitted ? gradeServiceModels(modelAnswers) : null),
    [modelAnswers, modelsSubmitted]
  );
  const respResult = useMemo(
    () => (respSubmitted ? gradeResponsibility(respAnswers) : null),
    [respAnswers, respSubmitted]
  );
  const misconfigResult = useMemo(
    () => (misconfigsSubmitted ? gradeMisconfigs(misconfigAnswers) : null),
    [misconfigAnswers, misconfigsSubmitted]
  );

  // Cloud-native questions
  const NATIVE_QUESTIONS = useMemo(
    () => [
      {
        id: 'cn-0',
        stem: 'How do containers differ from virtual machines in terms of isolation?',
        options: [
          'Containers share the host kernel; VMs have their own kernel',
          'Containers are more isolated than VMs',
          'Containers require a hypervisor',
          'VMs share the host kernel',
        ],
        correct: 0,
        conceptId: 'containers',
      },
      {
        id: 'cn-1',
        stem: 'A Kubernetes service account is bound to cluster-admin but only needs to read pods in one namespace. What is the fix?',
        options: [
          'Create a namespace-scoped Role with get/list/watch on pods and bind it to the service account',
          'Delete the service account and use anonymous access',
          'Add a NetworkPolicy to restrict the service account',
          'Rename the ClusterRoleBinding to hide it',
        ],
        correct: 0,
        conceptId: 'k8s-rbac',
      },
      {
        id: 'cn-2',
        stem: 'Where should a Lambda function store its database password?',
        options: [
          'In a secrets manager, referenced by ARN in the function configuration',
          'In the function source code as a constant',
          'In a plaintext environment variable',
          'In the function description field',
        ],
        correct: 0,
        conceptId: 'secrets-management',
      },
      {
        id: 'cn-3',
        stem: 'An API endpoint has no authentication and no rate limiting. What three controls should be added?',
        options: [
          'Authentication (JWT/IAM), rate limiting (usage plan), and a WAF',
          'A larger timeout, more memory, and a custom domain',
          'CORS headers, a favicon, and an SSL certificate',
          'Caching, compression, and a CDN',
        ],
        correct: 0,
        conceptId: 'api-security',
      },
      {
        id: 'cn-4',
        stem: 'A container image is pulled by tag (e.g., "latest") from a public registry. What supply-chain control is missing?',
        options: [
          'Pin the image by SHA-256 digest and restrict pulls to an approved internal registry',
          'Use a larger base image for more security features',
          'Pull images only during business hours',
          'Tag the image as "production" instead of "latest"',
        ],
        correct: 0,
        conceptId: 'containers',
      },
    ],
    []
  );

  const submitModels = () => {
    setModelsSubmitted(true);
    const graded = gradeServiceModels(modelAnswers);
    recordOutcome('cloud-service-models', graded.correctCount === graded.total);
  };

  const submitResp = () => {
    setRespSubmitted(true);
    const graded = gradeResponsibility(respAnswers);
    recordOutcome('shared-responsibility', graded.correctCount === graded.total);
  };

  const submitMisconfigs = () => {
    setMisconfigsSubmitted(true);
    const graded = gradeMisconfigs(misconfigAnswers);
    recordOutcome('cloud-misconfiguration', graded.correctCount === graded.total);
  };

  const submitNative = () => {
    setNativeSubmitted(true);
    const correct = NATIVE_QUESTIONS.filter((q) => nativeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === NATIVE_QUESTIONS.length;
    recordOutcome('containers', allCorrect);
    recordOutcome('k8s-rbac', nativeAnswers['cn-1'] === '0');
    recordOutcome('secrets-management', nativeAnswers['cn-2'] === '0');
    recordOutcome('api-security', nativeAnswers['cn-3'] === '0');
  };

  // Calculate overall progress
  const completedSteps = [modelsSubmitted, respSubmitted, misconfigsSubmitted, nativeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Cloud Security"
        subtitle="Phase 14 — Master cloud service models, shared responsibility, misconfiguration detection, and cloud-native security. Aligned with Security+ SY0-701 Domain 3."
      />

      {/* Progress */}
      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Cloud Security exercises" />
      </Card>

      {/* Step tabs */}
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

      {/* Step 1: Service Models */}
      {step === 'models' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify Cloud Services</h2>
          <p className="mb-4 text-sm text-muted">
            For each service, select whether it is <strong>IaaS</strong>, <strong>PaaS</strong>, or <strong>SaaS</strong>.
          </p>

          <div className="space-y-3">
            {CLOUD_SERVICES.map((svc) => {
              const chosen = modelAnswers[svc.id];
              const result = modelResult?.results.find((r) => r.serviceId === svc.id);
              return (
                <div
                  key={svc.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-1 text-sm font-medium text-white">{svc.name}</div>
                  <div className="mb-3 text-xs text-muted">{svc.description}</div>
                  <div className="flex gap-2">
                    {MODELS.map((m) => (
                      <button
                        key={m}
                        onClick={() => !modelsSubmitted && setModelAnswers((prev) => ({ ...prev, [svc.id]: m }))}
                        disabled={modelsSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === m
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          modelsSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {MODEL_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{MODEL_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!modelsSubmitted ? (
            <Button
              onClick={submitModels}
              disabled={Object.keys(modelAnswers).length < CLOUD_SERVICES.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {modelResult!.correctCount}/{modelResult!.total} ({modelResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                The service model determines the shared responsibility boundary. Misclassifying a service means misunderstanding who patches, who encrypts, and who is accountable.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Shared Responsibility */}
      {step === 'responsibility' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Assign Responsibility</h2>
          <p className="mb-4 text-sm text-muted">
            For each security task, decide if it belongs to the <strong>Provider</strong>, the <strong>Customer</strong>, or is <strong>Shared</strong>.
          </p>

          <div className="space-y-3">
            {RESPONSIBILITY_ITEMS.map((item) => {
              const chosen = respAnswers[item.id];
              const result = respResult?.results.find((r) => r.itemId === item.id);
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
                  <div className="mb-3 text-sm font-medium text-white">{item.task}</div>
                  <div className="flex gap-2">
                    {OWNERS.map((o) => (
                      <button
                        key={o}
                        onClick={() => !respSubmitted && setRespAnswers((prev) => ({ ...prev, [item.id]: o }))}
                        disabled={respSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === o
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          respSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {OWNER_LABELS[o]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{OWNER_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!respSubmitted ? (
            <Button
              onClick={submitResp}
              disabled={Object.keys(respAnswers).length < RESPONSIBILITY_ITEMS.length}
            >
              Submit Assignments
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {respResult!.correctCount}/{respResult!.total} ({respResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                The shared responsibility model is the foundation of every cloud security conversation. If you cannot place a responsibility correctly, you cannot audit, assess risk, or respond to an incident.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Misconfiguration Audit */}
      {step === 'misconfigs' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Misconfiguration Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">misconfiguration</strong> or a <strong className="text-ok">correct configuration</strong>?
          </p>

          <div className="space-y-3">
            {MISCONFIG_FINDINGS.map((f) => {
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
                    <span className="text-xs text-muted">{f.service}</span>
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
              disabled={Object.keys(misconfigAnswers).length < MISCONFIG_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {misconfigResult!.correctCount}/{misconfigResult!.total} ({misconfigResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Cloud misconfiguration is the leading cause of breaches. The ability to distinguish a finding from a correct configuration is the core skill of a cloud security audit.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Cloud-Native Security */}
      {step === 'containers' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Cloud-Native Security Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about containers, Kubernetes, serverless, APIs, and secrets management.
          </p>

          <div className="space-y-4">
            {NATIVE_QUESTIONS.map((q, qi) => {
              const chosen = nativeAnswers[q.id];
              const isCorrect = nativeSubmitted && chosen === String(q.correct);
              const isWrong = nativeSubmitted && chosen !== String(q.correct);
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
                        onClick={() => !nativeSubmitted && setNativeAnswers((prev) => ({ ...prev, [q.id]: String(oi) }))}
                        disabled={nativeSubmitted}
                        className={[
                          'block w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                          chosen === String(oi)
                            ? nativeSubmitted
                              ? oi === q.correct
                                ? 'bg-ok/20 text-ok'
                                : 'bg-danger/20 text-danger'
                              : 'bg-accent/20 text-accent'
                            : nativeSubmitted && oi === q.correct
                              ? 'bg-ok/10 text-ok'
                              : 'bg-panel text-muted hover:text-white',
                          nativeSubmitted ? 'cursor-default' : 'hover:bg-panel-2',
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

          {!nativeSubmitted ? (
            <Button
              onClick={submitNative}
              disabled={Object.keys(nativeAnswers).length < NATIVE_QUESTIONS.length}
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {NATIVE_QUESTIONS.filter((q) => nativeAnswers[q.id] === String(q.correct)).length}/{NATIVE_QUESTIONS.length}
              </div>
              <p className="mt-1 text-xs text-muted">
                Cloud-native workloads trade one set of risks for another. Containers, serverless, and APIs each have distinct security requirements that map back to the same principles: least privilege, defence in depth, and separation of duties.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-white">Cloud Security Summary</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-xs uppercase tracking-wider text-muted">Service Models</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {modelResult ? `${modelResult.percent}%` : '—'}
              </div>
              <div className="mt-1 text-xs text-muted">
                {modelResult ? `${modelResult.correctCount}/${modelResult.total} correct` : 'Not attempted'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-xs uppercase tracking-wider text-muted">Shared Responsibility</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {respResult ? `${respResult.percent}%` : '—'}
              </div>
              <div className="mt-1 text-xs text-muted">
                {respResult ? `${respResult.correctCount}/${respResult.total} correct` : 'Not attempted'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-xs uppercase tracking-wider text-muted">Misconfiguration Audit</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {misconfigResult ? `${misconfigResult.percent}%` : '—'}
              </div>
              <div className="mt-1 text-xs text-muted">
                {misconfigResult ? `${misconfigResult.correctCount}/${misconfigResult.total} correct` : 'Not attempted'}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-xs uppercase tracking-wider text-muted">Cloud-Native Security</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {nativeSubmitted
                  ? `${Math.round((NATIVE_QUESTIONS.filter((q) => nativeAnswers[q.id] === String(q.correct)).length / NATIVE_QUESTIONS.length) * 100)}%`
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-muted">
                {nativeSubmitted
                  ? `${NATIVE_QUESTIONS.filter((q) => nativeAnswers[q.id] === String(q.correct)).length}/${NATIVE_QUESTIONS.length} correct`
                  : 'Not attempted'}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-panel-2 p-4">
            <h3 className="mb-2 text-sm font-semibold text-white">Key Takeaways</h3>
            <ul className="space-y-1 text-xs text-muted">
              <li>• IaaS / PaaS / SaaS determine the shared responsibility boundary.</li>
              <li>• The provider never owns your data classification or access decisions.</li>
              <li>• Misconfiguration is the #1 cloud breach cause — guardrails (SCPs, Azure Policy) prevent it.</li>
              <li>• Containers share the host kernel — scan images, pin by digest, run as non-root.</li>
              <li>• Kubernetes RBAC must follow least privilege per namespace.</li>
              <li>• Serverless removes OS responsibility but not code, dependency, or IAM responsibility.</li>
              <li>• API gateways must enforce authentication, rate limiting, and input validation.</li>
              <li>• Secrets belong in a vault with automatic rotation — never in code or env vars.</li>
            </ul>
          </div>

          <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <h3 className="mb-1 text-sm font-semibold text-accent">Career Connection</h3>
            <p className="text-xs text-muted">
              Cloud Security Analyst / Cloud Engineer — every cloud role starts with the shared responsibility model and misconfiguration detection. The exercises in this phase map directly to what a cloud security auditor does on day one: classify services, assign responsibility, find misconfigurations, and recommend remediations.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
