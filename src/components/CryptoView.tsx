import { Component, Suspense, lazy, useState, type ReactNode } from 'react';
import { Boxes, LayoutGrid } from 'lucide-react';
import {
  CLASSIFY_ITEMS,
  CRYPTO_CHAIN,
  CRYPTO_OPERATIONS,
  getChainStage,
  getOperation,
  type ChainStageId,
  type CryptoOperationId,
} from '../data/cryptoOperations';
import { TLS_HANDSHAKE, getHandshakeStep } from '../data/tlsHandshake';
import {
  countAnswered,
  gradeClassification,
  isClassificationComplete,
  type ClassifyAnswer,
} from '../lib/cryptoClassify';
import { isWebGLAvailable } from '../lib/webgl';
import { TlsFallback2D } from '../scenes/TlsFallback2D';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

const TlsScene = lazy(() => import('../scenes/TlsScene').then((m) => ({ default: m.TlsScene })));

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

type Tab = 'operations' | 'chain' | 'classify' | 'tls';

const TAB_LABELS: Record<Tab, string> = {
  operations: 'The four operations',
  chain: 'Demonstration chain',
  classify: 'Classify the artifact',
  tls: 'TLS handshake',
};

export function CryptoView() {
  const [tab, setTab] = useState<Tab>('operations');
  const [stageId, setStageId] = useState<ChainStageId>('plaintext');
  const [answer, setAnswer] = useState<ClassifyAnswer>({});
  const [submitted, setSubmitted] = useState(false);
  const [tlsOrder, setTlsOrder] = useState<number | null>(4);
  const [force2D, setForce2D] = useState(false);
  const [webglOk, setWebglOk] = useState(isWebGLAvailable);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const use2D = force2D || !webglOk;
  const stage = getChainStage(stageId);
  const result = submitted ? gradeClassification(answer) : null;
  const tlsStep = tlsOrder ? getHandshakeStep(tlsOrder) : undefined;

  const submitClassification = () => {
    setSubmitted(true);
    const graded = gradeClassification(answer);
    // Credit each operation only if every artifact of that type was placed
    // correctly — partial recognition is not the discrimination skill.
    for (const op of CRYPTO_OPERATIONS) {
      const itemsOfType = CLASSIFY_ITEMS.filter((i) => i.answer === op.id);
      const allRight = itemsOfType.every(
        (i) => graded.items.find((r) => r.itemId === i.id)?.correct
      );
      recordOutcome(op.id, allRight);
    }
  };

  return (
    <>
      <PageHeader
        title="Cryptography Workbench"
        subtitle="Plaintext → hash → encryption → signature → certificate → TLS session. Two questions place any operation: is it reversible, and does it need a key?"
        actions={
          tab === 'tls' ? (
            <button
              type="button"
              onClick={() => setForce2D((v) => !v)}
              disabled={!webglOk}
              className="flex items-center gap-2 rounded-md border border-border bg-panel-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-border disabled:opacity-40"
            >
              {use2D ? <Boxes size={16} aria-hidden /> : <LayoutGrid size={16} aria-hidden />}
              {use2D ? 'Switch to 3D' : 'Switch to 2D'}
            </button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              t === tab
                ? 'border-accent bg-accent/10 text-white'
                : 'border-border bg-panel-2 text-muted hover:text-white'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ------------------------- The four operations ------------------------- */}
      {tab === 'operations' && (
        <div className="grid gap-4 md:grid-cols-2">
          {CRYPTO_OPERATIONS.map((op) => (
            <Card key={op.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold" style={{ color: op.color }}>
                  {op.title}
                </h2>
                <span className="text-xs text-muted">
                  {op.reversible} · {op.needsKey ? 'needs a key' : 'no key'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white">{op.definition}</p>

              <h3 className="mt-4 text-xs uppercase tracking-wider text-ok">Provides</h3>
              <ul className="mt-1 space-y-1 text-sm text-white">
                {op.provides.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>

              <h3 className="mt-3 text-xs uppercase tracking-wider text-danger">
                Does not provide
              </h3>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {op.doesNotProvide.map((d) => (
                  <li key={d}>· {d}</li>
                ))}
              </ul>

              <p className="mt-4 rounded-md border border-warn/40 bg-warn/5 p-3 text-xs text-muted">
                <span className="font-semibold text-warn">Common misuse: </span>
                {op.commonMisuse}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------- Demonstration chain ------------------------- */}
      {tab === 'chain' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {CRYPTO_CHAIN.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageId(s.id)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  s.id === stageId
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-border bg-panel-2 text-muted hover:text-white'
                }`}
              >
                {s.order}. {s.title}
              </button>
            ))}
          </div>

          {stage && (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold" style={{ color: stage.color }}>
                    {stage.order}. {stage.title}
                  </h2>
                  {stage.operation && (
                    <span className="text-xs text-muted">
                      operation: {getOperation(stage.operation)?.title}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white">{stage.summary}</p>

                <dl className="mt-5 space-y-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Input</dt>
                    <dd className="mt-1 break-all rounded bg-soc-bg p-2 font-mono text-xs text-text">
                      {stage.input}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Output</dt>
                    <dd
                      className="mt-1 break-all rounded bg-soc-bg p-2 font-mono text-xs text-text"
                      data-testid="chain-output"
                    >
                      {stage.output}
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="border-accent/40">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
                  What this stage adds
                </h2>
                <p className="mt-2 text-sm text-white">{stage.adds}</p>
              </Card>
            </div>
          )}
        </>
      )}

      {/* --------------------------- Classification --------------------------- */}
      {tab === 'classify' && (
        <>
          <Card className="mb-4">
            <p className="text-sm text-muted">
              For each artifact, name the operation that produced it. This is the distinction the
              exam tests hardest and the one that causes the most expensive real-world mistakes.
            </p>
          </Card>

          {result && (
            <Card className="mb-4">
              <div className="flex flex-wrap items-baseline gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted">Score</div>
                  <div className="text-3xl font-bold text-white" data-testid="classify-score">
                    {result.correctCount}/{result.total}
                  </div>
                </div>
                <div className="min-w-48 flex-1">
                  <ProgressBar percent={result.percentage} label="Correct" />
                </div>
              </div>

              {result.confusedPairs.length > 0 && (
                <div className="mt-4 rounded-md border border-warn/40 bg-warn/5 p-3">
                  <div className="text-xs uppercase tracking-wider text-warn">
                    Confusions to review
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-white">
                    {result.confusedPairs.map((p) => (
                      <li key={`${p.chose}-${p.actual}`}>
                        · You called {getOperation(p.actual)?.title.toLowerCase()}{' '}
                        <span className="text-danger">
                          {getOperation(p.chose)?.title.toLowerCase()}
                        </span>{' '}
                        {p.count} {p.count === 1 ? 'time' : 'times'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          <div className="space-y-3">
            {CLASSIFY_ITEMS.map((item) => {
              const itemResult = result?.items.find((r) => r.itemId === item.id);
              const tone = itemResult
                ? itemResult.correct
                  ? 'border-ok/60'
                  : 'border-danger/60'
                : '';

              return (
                <Card key={item.id} className={tone}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <code className="break-all font-mono text-sm text-white">{item.artifact}</code>
                    {itemResult && (
                      <span
                        className={`shrink-0 text-xs font-semibold ${
                          itemResult.correct ? 'text-ok' : 'text-danger'
                        }`}
                      >
                        {itemResult.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>
                  {item.hint && <p className="mt-1 text-xs text-muted">{item.hint}</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {CRYPTO_OPERATIONS.map((op) => {
                      const chosen = answer[item.id] === op.id;
                      const isCorrect = item.answer === op.id;

                      let style = 'border-border bg-panel-2 text-muted hover:border-accent/60';
                      if (chosen) style = 'border-accent bg-accent/10 text-white';
                      if (submitted && isCorrect) style = 'border-ok bg-ok/10 text-white';
                      if (submitted && chosen && !isCorrect)
                        style = 'border-danger bg-danger/10 text-white';

                      return (
                        <button
                          key={op.id}
                          type="button"
                          disabled={submitted}
                          aria-label={`${item.artifact.slice(0, 32)}: ${op.title}`}
                          onClick={() =>
                            setAnswer((a) => ({
                              ...a,
                              [item.id]: chosen ? undefined : (op.id as CryptoOperationId),
                            }))
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed ${style}`}
                        >
                          {op.title}
                        </button>
                      );
                    })}
                  </div>

                  {itemResult && (
                    <p className="mt-3 rounded-md border border-border bg-panel-2 p-3 text-sm text-muted">
                      {itemResult.rationale}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!submitted ? (
              <>
                <Button onClick={submitClassification} disabled={!isClassificationComplete(answer)}>
                  Submit classification
                </Button>
                <span className="text-sm text-muted">
                  {countAnswered(answer)} of {CLASSIFY_ITEMS.length} classified
                </span>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswer({});
                  setSubmitted(false);
                }}
              >
                Try again
              </Button>
            )}
          </div>
        </>
      )}

      {/* ---------------------------- TLS handshake ---------------------------- */}
      {tab === 'tls' && (
        <>
          {!webglOk && (
            <div className="mb-4 rounded-md border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
              WebGL is unavailable in this browser or on this hardware. The 2D sequence diagram
              below carries the same content and is fully interactive.
            </div>
          )}

          <div className="canvas-wrap" style={{ height: '52vh' }}>
            {use2D ? (
              <TlsFallback2D selectedOrder={tlsOrder} onSelect={setTlsOrder} />
            ) : (
              <CanvasBoundary onError={() => setWebglOk(false)}>
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      Loading 3D environment…
                    </div>
                  }
                >
                  <TlsScene
                    selectedOrder={tlsOrder}
                    onSelect={setTlsOrder}
                    onContextLost={() => setWebglOk(false)}
                  />
                </Suspense>
              </CanvasBoundary>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TLS_HANDSHAKE.map((s) => (
              <button
                key={s.order}
                type="button"
                onClick={() => setTlsOrder(s.order)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  s.order === tlsOrder
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-border bg-panel-2 text-muted hover:text-white'
                }`}
              >
                {s.order}. {s.title}
              </button>
            ))}
          </div>

          {tlsStep && (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                    Step {tlsStep.order} — {tlsStep.title}
                  </h2>
                  <span className="text-xs text-accent">from the {tlsStep.from}</span>
                </div>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Carries</dt>
                    <dd className="mt-1 text-white">{tlsStep.carries}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Establishes</dt>
                    <dd className="mt-1 text-white">{tlsStep.establishes}</dd>
                  </div>
                </dl>
                {tlsStep.note && (
                  <p className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-3 text-sm text-muted">
                    {tlsStep.note}
                  </p>
                )}
              </Card>

              <Card>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Operations used here
                </h2>
                <p className="mt-1 text-xs text-muted">
                  The handshake uses all four across its eight steps.
                </p>
                <ul className="mt-3 space-y-2">
                  {tlsStep.operations.map((opId) => {
                    const op = getOperation(opId);
                    return (
                      <li key={opId} className="text-sm">
                        <span style={{ color: op?.color }}>{op?.title}</span>
                        <span className="block text-xs text-muted">{op?.provides[0] ?? ''}</span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
