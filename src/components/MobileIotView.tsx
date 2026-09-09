import { useMemo, useState } from 'react';
import {
  OWNERSHIP_SCENARIOS,
  SEGMENT_ITEMS,
  MOBILE_MISCONFIG_FINDINGS,
  gradeOwnershipModels,
  gradeSegmentation,
  gradeMobileMisconfigs,
  type OwnershipModel,
  type SegmentZone,
} from '../lib/mobileIotEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'ownership' | 'segmentation' | 'misconfigs' | 'iot' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  ownership: '1. Ownership Models',
  segmentation: '2. IoT Segmentation',
  misconfigs: '3. Misconfiguration Audit',
  iot: '4. IoT/Embedded Security',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const OWNERSHIP_LABELS: Record<OwnershipModel, string> = {
  byod: 'BYOD',
  cobo: 'COBO',
  cope: 'COPE',
  cyod: 'CYOD',
};

const OWNERSHIP_MODELS: OwnershipModel[] = ['byod', 'cobo', 'cope', 'cyod'];

const ZONE_LABELS: Record<SegmentZone, string> = {
  corporate: 'Corporate',
  iot: 'IoT',
  guest: 'Guest',
  management: 'Management',
};

const ZONES: SegmentZone[] = ['corporate', 'iot', 'guest', 'management'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function MobileIotView() {
  const [step, setStep] = useState<Step>('ownership');

  // Ownership models
  const [ownerAnswers, setOwnerAnswers] = useState<Record<string, OwnershipModel>>({});
  const [ownerSubmitted, setOwnerSubmitted] = useState(false);

  // Segmentation
  const [segAnswers, setSegAnswers] = useState<Record<string, SegmentZone>>({});
  const [segSubmitted, setSegSubmitted] = useState(false);

  // Misconfigs
  const [misconfigAnswers, setMisconfigAnswers] = useState<Record<string, boolean>>({});
  const [misconfigsSubmitted, setMisconfigsSubmitted] = useState(false);

  // IoT/embedded knowledge check
  const [iotAnswers, setIotAnswers] = useState<Record<string, string>>({});
  const [iotSubmitted, setIotSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const ownerResult = useMemo(
    () => (ownerSubmitted ? gradeOwnershipModels(ownerAnswers) : null),
    [ownerAnswers, ownerSubmitted]
  );
  const segResult = useMemo(
    () => (segSubmitted ? gradeSegmentation(segAnswers) : null),
    [segAnswers, segSubmitted]
  );
  const misconfigResult = useMemo(
    () => (misconfigsSubmitted ? gradeMobileMisconfigs(misconfigAnswers) : null),
    [misconfigAnswers, misconfigsSubmitted]
  );

  const IOT_QUESTIONS = useMemo(
    () => [
      {
        id: 'iq-0',
        stem: 'Why can embedded/IoT devices rarely be patched like a typical laptop OS?',
        options: [
          'Firmware updates are infrequent, may need vendor involvement or physical access, and many devices reach end-of-life while still deployed',
          'IoT devices automatically update themselves every night',
          'Embedded devices do not run software at all',
          'Patching an IoT device always requires no downtime',
        ],
        correct: 0,
        conceptId: 'embedded-firmware',
      },
      {
        id: 'iq-1',
        stem: 'What does issuing a unique X.509 certificate per IoT device primarily prevent?',
        options: [
          'A spoofed or cloned device impersonating a trusted device, and lets a single compromised device be revoked individually',
          'The device from ever losing power',
          'The need for any network segmentation',
          'Firmware from ever becoming outdated',
        ],
        correct: 0,
        conceptId: 'device-identity',
      },
      {
        id: 'iq-2',
        stem: 'Why is network segmentation especially critical for IoT devices?',
        options: [
          'IoT devices often have weak security controls, so isolating them limits the blast radius if one is compromised',
          'Segmentation makes IoT devices patch themselves automatically',
          'IoT devices do not use IP networking',
          'Segmentation is only relevant for corporate laptops',
        ],
        correct: 0,
        conceptId: 'iot-segmentation',
      },
      {
        id: 'iq-3',
        stem: 'A vendor discontinues support (EOL) for a fleet of building-automation controllers. What is the primary risk?',
        options: [
          'Any future vulnerability discovered in the firmware will remain exploitable forever since no further updates will be released',
          'The controllers will stop working immediately',
          'The risk disappears since no one is looking for new vulnerabilities',
          'EOL only affects the vendor\'s revenue, not security',
        ],
        correct: 0,
        conceptId: 'embedded-firmware',
      },
      {
        id: 'iq-4',
        stem: 'What is the main security risk of a jailbroken/rooted BYOD device connecting to corporate email?',
        options: [
          'It bypasses OS sandboxing and MDM compliance controls, exposing corporate data to unvetted apps',
          'It uses more mobile data than a normal device',
          'It voids the device manufacturer warranty only',
          'There is no additional risk if a passcode is still set',
        ],
        correct: 0,
        conceptId: 'mobile-os-security',
      },
    ],
    []
  );

  const submitOwnership = () => {
    setOwnerSubmitted(true);
    const graded = gradeOwnershipModels(ownerAnswers);
    recordOutcome('device-ownership-models', graded.correctCount === graded.total);
  };

  const submitSegmentation = () => {
    setSegSubmitted(true);
    const graded = gradeSegmentation(segAnswers);
    recordOutcome('iot-segmentation', graded.correctCount === graded.total);
  };

  const submitMisconfigs = () => {
    setMisconfigsSubmitted(true);
    const graded = gradeMobileMisconfigs(misconfigAnswers);
    recordOutcome('mobile-app-security', graded.correctCount === graded.total);
  };

  const submitIot = () => {
    setIotSubmitted(true);
    const correct = IOT_QUESTIONS.filter((q) => iotAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === IOT_QUESTIONS.length;
    recordOutcome('embedded-firmware', allCorrect);
    recordOutcome('device-identity', iotAnswers['iq-1'] === '0');
    recordOutcome('iot-risks', iotAnswers['iq-3'] === '0');
  };

  const completedSteps = [ownerSubmitted, segSubmitted, misconfigsSubmitted, iotSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Mobile / IoT / Embedded Security"
        subtitle="Phase 15 — Master device ownership models, MDM/MAM, mobile app security, IoT risk, firmware lifecycle, device identity, and segmentation. Aligned with Security+ SY0-701 Domain 3."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Mobile / IoT Security exercises" />
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

      {/* Step 1: Ownership Models */}
      {step === 'ownership' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Classify Device Ownership</h2>
          <p className="mb-4 text-sm text-muted">
            For each scenario, select the correct ownership model: <strong>BYOD</strong>, <strong>COBO</strong>, <strong>COPE</strong>, or <strong>CYOD</strong>.
          </p>

          <div className="space-y-3">
            {OWNERSHIP_SCENARIOS.map((s) => {
              const chosen = ownerAnswers[s.id];
              const result = ownerResult?.results.find((r) => r.scenarioId === s.id);
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
                    {OWNERSHIP_MODELS.map((m) => (
                      <button
                        key={m}
                        onClick={() => !ownerSubmitted && setOwnerAnswers((prev) => ({ ...prev, [s.id]: m }))}
                        disabled={ownerSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === m
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          ownerSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {OWNERSHIP_LABELS[m]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{OWNERSHIP_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!ownerSubmitted ? (
            <Button
              onClick={submitOwnership}
              disabled={Object.keys(ownerAnswers).length < OWNERSHIP_SCENARIOS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {ownerResult!.correctCount}/{ownerResult!.total} ({ownerResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Ownership model answers two independent questions: who owns the device, and who may use it personally. Getting this right determines what MDM/MAM policy is even legally and practically enforceable.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Segmentation */}
      {step === 'segmentation' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Assign Network Segments</h2>
          <p className="mb-4 text-sm text-muted">
            For each asset, decide which VLAN it belongs on: <strong>Corporate</strong>, <strong>IoT</strong>, <strong>Guest</strong>, or <strong>Management</strong>.
          </p>

          <div className="space-y-3">
            {SEGMENT_ITEMS.map((item) => {
              const chosen = segAnswers[item.id];
              const result = segResult?.results.find((r) => r.itemId === item.id);
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
                    {ZONES.map((z) => (
                      <button
                        key={z}
                        onClick={() => !segSubmitted && setSegAnswers((prev) => ({ ...prev, [item.id]: z }))}
                        disabled={segSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === z
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          segSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {ZONE_LABELS[z]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{ZONE_LABELS[result.correct]}</strong> — {result.explanation}
                    </div>
                  )}
                  {result && result.isCorrect && (
                    <div className="mt-2 text-xs text-ok">{result.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

          {!segSubmitted ? (
            <Button
              onClick={submitSegmentation}
              disabled={Object.keys(segAnswers).length < SEGMENT_ITEMS.length}
            >
              Submit Assignments
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {segResult!.correctCount}/{segResult!.total} ({segResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                IoT devices cannot run an endpoint agent, so segmentation is often the only practical control. Guest and IoT traffic must never share a broadcast domain.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Misconfiguration Audit */}
      {step === 'misconfigs' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Mobile / IoT Misconfiguration Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it a <strong className="text-danger">misconfiguration</strong> or a <strong className="text-ok">correct configuration</strong>?
          </p>

          <div className="space-y-3">
            {MOBILE_MISCONFIG_FINDINGS.map((f) => {
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
              disabled={Object.keys(misconfigAnswers).length < MOBILE_MISCONFIG_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {misconfigResult!.correctCount}/{misconfigResult!.total} ({misconfigResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Mobile and IoT misconfigurations rarely require new tooling to fix — MDM and segmentation controls usually already exist. The gap is almost always in enforcement.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: IoT/Embedded Knowledge Check */}
      {step === 'iot' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">IoT/Embedded Security Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about firmware lifecycle, device identity, segmentation, and jailbreak risk.
          </p>

          <div className="space-y-4">
            {IOT_QUESTIONS.map((q, qi) => {
              const chosen = iotAnswers[q.id];
              const isCorrect = iotSubmitted && chosen === String(q.correct);
              const isWrong = iotSubmitted && chosen !== String(q.correct);
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
                        onClick={() => !iotSubmitted && setIotAnswers((prev) => ({ ...prev, [q.id]: String(oi) }))}
                        disabled={iotSubmitted}
                        className={[
                          'block w-full rounded-md px-3 py-2 text-left text-xs transition-colors',
                          chosen === String(oi)
                            ? iotSubmitted
                              ? oi === q.correct
                                ? 'bg-ok/20 text-ok'
                                : 'bg-danger/20 text-danger'
                              : 'bg-accent/20 text-accent'
                            : iotSubmitted && oi === q.correct
                              ? 'bg-ok/10 text-ok'
                              : 'bg-panel text-muted hover:text-white',
                          iotSubmitted ? 'cursor-default' : 'hover:bg-panel-2',
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

          {!iotSubmitted ? (
            <Button
              onClick={submitIot}
              disabled={Object.keys(iotAnswers).length < IOT_QUESTIONS.length}
            >
              Submit Answers
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {IOT_QUESTIONS.filter((q) => iotAnswers[q.id] === String(q.correct)).length}/{IOT_QUESTIONS.length}
              </div>
              <p className="mt-1 text-xs text-muted">
                IoT and embedded devices trade patchability for purpose-built simplicity. The security response has to be architectural — segmentation and identity — rather than waiting for the device itself to improve.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 15 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Ownership Models</div>
              <div className="text-xs text-muted">
                {ownerResult ? `${ownerResult.correctCount}/${ownerResult.total} (${ownerResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. IoT Segmentation</div>
              <div className="text-xs text-muted">
                {segResult ? `${segResult.correctCount}/${segResult.total} (${segResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Misconfiguration Audit</div>
              <div className="text-xs text-muted">
                {misconfigResult ? `${misconfigResult.correctCount}/${misconfigResult.total} (${misconfigResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. IoT/Embedded Knowledge Check</div>
              <div className="text-xs text-muted">
                {iotSubmitted
                  ? `${IOT_QUESTIONS.filter((q) => iotAnswers[q.id] === String(q.correct)).length}/${IOT_QUESTIONS.length}`
                  : 'Not attempted'}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
