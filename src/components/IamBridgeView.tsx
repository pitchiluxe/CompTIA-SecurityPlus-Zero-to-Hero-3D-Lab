import { Component, Suspense, lazy, useMemo, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid, Lock, Unlock } from 'lucide-react';
import {
  IAM_BRIDGE_TOPICS,
  IAM_VENDORS,
  VENDOR_MAPPING_ITEMS,
  getBridgeTopic,
  getVendor,
} from '../data/iamBridge';
import {
  assessTopics,
  bridgeReadiness,
  gradeVendorMapping,
  isVendorMappingComplete,
  vendorGates,
  weakTopics,
  type MappingAnswer,
} from '../lib/iamBridgeEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { isWebGLAvailable } from '../lib/webgl';
import { IamBridgeFallback2D } from '../scenes/IamBridgeFallback2D';
import { Button, Card, MasteryPill, PageHeader, ProgressBar } from './ui';
import { clampLevel } from '../lib/srs';

const IamBridgeScene = lazy(() =>
  import('../scenes/IamBridgeScene').then((m) => ({ default: m.IamBridgeScene }))
);

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

export function IamBridgeView() {
  const [topicId, setTopicId] = useState(IAM_BRIDGE_TOPICS[0].id);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [mappingAnswer, setMappingAnswer] = useState<MappingAnswer>({});
  const [mappingSubmitted, setMappingSubmitted] = useState(false);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const getLevel = useMasteryStore((s) => s.getLevel);

  const assessments = useMemo(() => assessTopics(getLevel), [getLevel]);
  const readiness = bridgeReadiness(assessments);
  const weak = weakTopics(assessments);
  const gates = useMemo(() => vendorGates(getLevel), [getLevel]);

  const topic = getBridgeTopic(topicId)!;
  const topicAssessment = assessments.find((a) => a.topicId === topicId)!;
  const selectedVendor = selectedVendorId ? getVendor(selectedVendorId) : undefined;
  const selectedGate = gates.find((g) => g.vendorId === selectedVendorId);

  const mappingResult = mappingSubmitted ? gradeVendorMapping(mappingAnswer) : null;
  const use2D = force2D || !webglOk;

  const lockedVendorIds = gates.filter((g) => !g.unlocked).map((g) => g.vendorId);
  const weakTopicIds = weak.map((w) => w.topicId);

  const selectNode = (id: string, type: 'topic' | 'vendor') => {
    if (type === 'vendor') {
      setSelectedVendorId(id);
      return;
    }
    if (getBridgeTopic(id)) setTopicId(id);
  };

  return (
    <>
      <PageHeader
        title="Security+ → IAM Career Bridge"
        subtitle="Nine bridge questions connecting concepts you already hold to how identity is implemented, logged, and investigated — then the vendor platforms, each gated behind the concepts it implements."
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
          WebGL is unavailable in this browser or on this hardware. The 2D bridge below shows the
          same three tiers and the same vendor gating, and is fully interactive.
        </div>
      )}

      <div className="canvas-wrap mb-6" style={{ height: '46vh' }}>
        {use2D ? (
          <IamBridgeFallback2D
            selectedId={selectedVendorId ?? topicId}
            onSelect={selectNode}
            lockedVendorIds={lockedVendorIds}
            weakTopicIds={weakTopicIds}
          />
        ) : (
          <CanvasBoundary onError={() => setWebglOk(false)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted">
                  Loading 3D bridge…
                </div>
              }
            >
              <IamBridgeScene
                selectedId={selectedVendorId ?? topicId}
                onSelectNode={(node) => {
                  if (node.type === 'vendor') setSelectedVendorId(node.id);
                  else if (node.type === 'topic') setTopicId(node.id);
                }}
                lockedVendorIds={lockedVendorIds}
                weakTopicIds={weakTopicIds}
                onContextLost={() => setWebglOk(false)}
              />
            </Suspense>
          </CanvasBoundary>
        )}
      </div>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Bridge readiness
        </h2>
        <p className="mt-1 text-xs text-muted">
          {readiness.weak === 0
            ? 'Every bridge topic rests on concepts above the weak-area threshold.'
            : `${readiness.weak} of ${readiness.total} bridge topics rest on concepts that are still weak — revisit those concepts before the implementation detail will stick.`}
        </p>
        <div className="mt-3">
          <ProgressBar
            percent={readiness.percentage}
            label={`Topics on solid concepts — ${readiness.ready}/${readiness.total}`}
          />
        </div>
        {weak.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-warn" data-testid="weak-bridge-topics">
            {weak.map((w) => (
              <li key={w.topicId}>
                {w.question} — concepts: {w.conceptIds.join(', ')}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {IAM_BRIDGE_TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTopicId(t.id);
              setSelectedVendorId(null);
            }}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              t.id === topicId
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {t.question}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">{topic.title}</h2>
            <p className="mt-1 text-xs text-muted">{topic.question}</p>
          </div>
          <MasteryPill level={clampLevel(topicAssessment.averageLevel)} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {topic.conceptIds.map((c) => (
            <span key={c} className="rounded bg-panel-2 px-2 py-0.5 font-mono text-xs text-accent">
              {c}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-4" data-testid="bridge-topic-detail">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              What Security+ teaches
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{topic.examView}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              How it is actually implemented
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{topic.implementation}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              How it appears in logs
            </h3>
            <ul className="mt-1 space-y-1 text-sm text-muted">
              {topic.logEvidence.map((e) => (
                <li key={e} className="font-mono text-xs">
                  · {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              How it is investigated
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{topic.investigation}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Vendor implementations of this one idea
            </h3>
            <ul className="mt-2 space-y-2" data-testid="topic-vendor-mappings">
              {topic.vendors.map((v) => {
                const gate = gates.find((g) => g.vendorId === v.vendorId);
                const vendor = getVendor(v.vendorId);
                return (
                  <li
                    key={`${v.vendorId}-${v.feature}`}
                    className="rounded-md border border-border bg-panel-2 p-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-white">
                      {gate?.unlocked ? (
                        <Unlock size={14} className="text-ok" aria-hidden />
                      ) : (
                        <Lock size={14} className="text-danger" aria-hidden />
                      )}
                      {vendor?.name}
                    </div>
                    {gate?.unlocked ? (
                      <>
                        <p className="mt-1 text-sm text-muted">{v.feature}</p>
                        <p className="mt-1 text-xs text-muted">{v.note}</p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-danger">
                        Concepts first — revisit {gate?.missingConceptIds.join(', ')} before this
                        vendor detail is useful.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Vendor platforms — concepts before vendors
        </h2>
        <p className="mt-1 text-xs text-muted">
          A platform unlocks only once every one of its prerequisite concepts is above the weak-area
          threshold. Not the average — every one, because &ldquo;learn the concept first&rdquo; fails
          if a single prerequisite is missing.
        </p>
        <ul className="mt-3 grid gap-2 lg:grid-cols-2" data-testid="vendor-gates">
          {IAM_VENDORS.map((vendor) => {
            const gate = gates.find((g) => g.vendorId === vendor.id)!;
            return (
              <li key={vendor.id}>
                <button
                  type="button"
                  onClick={() => setSelectedVendorId(vendor.id)}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    selectedVendorId === vendor.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-panel-2 hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{vendor.name}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        gate.unlocked ? 'bg-ok/15 text-ok' : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {gate.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <span className="mt-1 block text-xs text-muted">{vendor.category}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {selectedVendor && selectedGate && (
          <div
            className="mt-4 rounded-md border border-border bg-panel-2 p-4"
            data-testid="vendor-detail"
          >
            <h3 className="text-base font-semibold text-white">{selectedVendor.name}</h3>
            <p className="mt-1 text-xs text-accent">{selectedVendor.category}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {selectedGate.unlocked ? selectedVendor.whatItIs : selectedVendor.conceptFirst}
            </p>
            {!selectedGate.unlocked && (
              <p className="mt-3 text-sm text-danger">
                Locked. Prerequisite concepts still at or below mastery 2:{' '}
                <span className="font-mono">{selectedGate.missingConceptIds.join(', ')}</span>
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedVendor.prerequisiteConceptIds.map((c) => (
                <span
                  key={c}
                  className="rounded bg-panel px-2 py-0.5 font-mono text-xs text-accent"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Concept-before-vendor exercise
        </h2>
        <p className="mt-1 text-xs text-muted">
          Each named vendor feature implements exactly one bridge topic. Classify all ten, then
          submit — the rationale is shown after grading.
        </p>

        {mappingResult && (
          <div className="mt-3">
            <ProgressBar
              percent={mappingResult.percentage}
              label={`Correct — ${mappingResult.correctCount}/${mappingResult.total}`}
            />
          </div>
        )}

        <ul className="mt-3 space-y-3">
          {VENDOR_MAPPING_ITEMS.map((item) => {
            const chosen = mappingAnswer[item.id];
            const result = mappingResult?.items.find((r) => r.itemId === item.id);
            const vendor = getVendor(item.vendorId);

            return (
              <li
                key={item.id}
                className={`rounded-md border p-3 ${
                  result ? (result.correct ? 'border-ok/50' : 'border-danger/50') : 'border-border'
                }`}
              >
                <p className="text-xs text-accent">{vendor?.name}</p>
                <p className="mt-1 text-sm text-white">{item.feature}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {IAM_BRIDGE_TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={mappingSubmitted}
                      onClick={() =>
                        setMappingAnswer((a) => ({
                          ...a,
                          [item.id]: a[item.id] === t.id ? undefined : t.id,
                        }))
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
                        chosen === t.id
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-border bg-panel-2 text-muted hover:text-white'
                      }`}
                    >
                      {t.title.split(' — ')[0]}
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
          {!mappingSubmitted ? (
            <Button
              onClick={() => setMappingSubmitted(true)}
              disabled={!isVendorMappingComplete(mappingAnswer)}
            >
              Submit exercise
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setMappingAnswer({});
                setMappingSubmitted(false);
              }}
            >
              Retry exercise
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
