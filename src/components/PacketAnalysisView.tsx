import { useMemo, useState } from 'react';
import {
  PACKET_ITEMS,
  TCP_STAGE_ITEMS,
  TRAFFIC_FINDINGS,
  gradeProtocolIdentification,
  gradeTcpStage,
  gradeTrafficAudit,
  type PacketProtocol,
  type TcpStage,
} from '../lib/packetEngine';
import { useMasteryStore } from '../store/useMasteryStore';
import { Button, Card, PageHeader, ProgressBar } from './ui';

type Step = 'protocol' | 'tcpstage' | 'traffic' | 'knowledge' | 'summary';

const STEP_LABELS: Record<Step, string> = {
  protocol: '1. Protocol Identification',
  tcpstage: '2. TCP Flag / Stage',
  traffic: '3. Suspicious Traffic Audit',
  knowledge: '4. Packet Analysis Knowledge Check',
  summary: '5. Summary',
};

const STEPS = Object.keys(STEP_LABELS) as Step[];

const PROTOCOL_LABELS: Record<PacketProtocol, string> = {
  arp: 'ARP',
  icmp: 'ICMP',
  tcp: 'TCP',
  udp: 'UDP',
  dns: 'DNS',
  dhcp: 'DHCP',
  http: 'HTTP',
  tls: 'TLS',
};

const PROTOCOLS: PacketProtocol[] = ['arp', 'icmp', 'tcp', 'udp', 'dns', 'dhcp', 'http', 'tls'];

const STAGE_LABELS: Record<TcpStage, string> = {
  syn: 'SYN',
  'syn-ack': 'SYN-ACK',
  ack: 'ACK',
  fin: 'FIN',
  rst: 'RST',
};

const STAGES: TcpStage[] = ['syn', 'syn-ack', 'ack', 'fin', 'rst'];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
};

export function PacketAnalysisView() {
  const [step, setStep] = useState<Step>('protocol');

  const [protocolAnswers, setProtocolAnswers] = useState<Record<string, PacketProtocol>>({});
  const [protocolSubmitted, setProtocolSubmitted] = useState(false);

  const [stageAnswers, setStageAnswers] = useState<Record<string, TcpStage>>({});
  const [stageSubmitted, setStageSubmitted] = useState(false);

  const [trafficAnswers, setTrafficAnswers] = useState<Record<string, boolean>>({});
  const [trafficSubmitted, setTrafficSubmitted] = useState(false);

  const [knowledgeAnswers, setKnowledgeAnswers] = useState<Record<string, string>>({});
  const [knowledgeSubmitted, setKnowledgeSubmitted] = useState(false);

  const recordOutcome = useMasteryStore((s) => s.recordOutcome);

  const protocolResult = useMemo(
    () => (protocolSubmitted ? gradeProtocolIdentification(protocolAnswers) : null),
    [protocolAnswers, protocolSubmitted]
  );
  const stageResult = useMemo(
    () => (stageSubmitted ? gradeTcpStage(stageAnswers) : null),
    [stageAnswers, stageSubmitted]
  );
  const trafficResult = useMemo(
    () => (trafficSubmitted ? gradeTrafficAudit(trafficAnswers) : null),
    [trafficAnswers, trafficSubmitted]
  );

  const KNOWLEDGE_QUESTIONS = useMemo(
    () => [
      {
        id: 'kq-0',
        stem: 'What is the purpose of the TCP three-way handshake?',
        options: [
          'It establishes a reliable, synchronised connection between client and server before any application data is exchanged',
          'It encrypts all data for the rest of the connection',
          'It only applies to UDP-based protocols',
          'It replaces the need for IP addressing entirely',
        ],
        correct: 0,
        conceptId: 'tcp-handshake',
      },
      {
        id: 'kq-1',
        stem: 'What is the defining characteristic of ARP spoofing (poisoning) visible in a packet capture?',
        options: [
          'Two different MAC addresses respond as the owner of the same IP address, letting an attacker intercept traffic intended for that IP',
          'An ARP request that receives no reply',
          'ARP traffic that is encrypted',
          'A single MAC consistently claiming one IP over time',
        ],
        correct: 0,
        conceptId: 'arp',
      },
      {
        id: 'kq-2',
        stem: 'In a packet capture of a TLS session, what can an analyst see versus what remains encrypted?',
        options: [
          'The ClientHello/ServerHello handshake (including the SNI hostname) is visible, but the application data exchanged after the handshake is encrypted',
          'Absolutely nothing is visible in a TLS session',
          'The entire session, including credentials, is fully readable',
          'Only the destination IP is visible; nothing else',
        ],
        correct: 0,
        conceptId: 'tls-capture',
      },
      {
        id: 'kq-3',
        stem: 'What packet-level pattern indicates a SYN flood attack?',
        options: [
          'A large volume of SYN packets, often from many different or spoofed source IPs, with few or no completed three-way handshakes',
          'A single completed three-way handshake followed by normal traffic',
          'A high volume of DNS TXT queries to one domain',
          'Two MAC addresses claiming the same IP address',
        ],
        correct: 0,
        conceptId: 'tcp-handshake',
      },
      {
        id: 'kq-4',
        stem: 'What does Wireshark\'s "Follow TCP Stream" feature do?',
        options: [
          'It reassembles all packets belonging to one TCP conversation into a single, readable view of the full exchange',
          'It automatically decrypts any TLS traffic in the capture',
          'It permanently deletes all other packets from the file',
          'It blocks the selected conversation at the firewall',
        ],
        correct: 0,
        conceptId: 'follow-stream',
      },
    ],
    []
  );

  const submitProtocol = () => {
    setProtocolSubmitted(true);
    const graded = gradeProtocolIdentification(protocolAnswers);
    recordOutcome('packet-capture-basics', graded.correctCount === graded.total);
  };

  const submitStage = () => {
    setStageSubmitted(true);
    const graded = gradeTcpStage(stageAnswers);
    recordOutcome('tcp-flags', graded.correctCount === graded.total);
  };

  const submitTraffic = () => {
    setTrafficSubmitted(true);
    const graded = gradeTrafficAudit(trafficAnswers);
    recordOutcome('arp', graded.correctCount === graded.total);
  };

  const submitKnowledge = () => {
    setKnowledgeSubmitted(true);
    const correct = KNOWLEDGE_QUESTIONS.filter((q) => knowledgeAnswers[q.id] === String(q.correct)).length;
    const allCorrect = correct === KNOWLEDGE_QUESTIONS.length;
    recordOutcome('tcp-handshake', allCorrect);
    recordOutcome('tls-capture', knowledgeAnswers['kq-2'] === '0');
    recordOutcome('follow-stream', knowledgeAnswers['kq-4'] === '0');
  };

  const completedSteps = [protocolSubmitted, stageSubmitted, trafficSubmitted, knowledgeSubmitted].filter(Boolean).length;
  const overallPercent = Math.round((completedSteps / 4) * 100);

  return (
    <div>
      <PageHeader
        title="Wireshark & Packet Analysis"
        subtitle="Phase 21 — Master reading a packet capture: protocol identification, TCP flags and the handshake, and spotting suspicious traffic. Aligned with Security+ SY0-701 Domain 4."
      />

      <Card className="mb-6">
        <ProgressBar percent={overallPercent} label="Packet Analysis exercises" />
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

      {/* Step 1: Protocol Identification */}
      {step === 'protocol' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Identify the Protocol</h2>
          <p className="mb-4 text-sm text-muted">
            For each packet Info summary, select the protocol it represents.
          </p>

          <div className="space-y-3">
            {PACKET_ITEMS.map((p) => {
              const chosen = protocolAnswers[p.id];
              const result = protocolResult?.results.find((r) => r.itemId === p.id);
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
                  <div className="mb-3 break-all font-mono text-sm font-medium text-white">{p.info}</div>
                  <div className="flex flex-wrap gap-2">
                    {PROTOCOLS.map((pr) => (
                      <button
                        key={pr}
                        onClick={() => !protocolSubmitted && setProtocolAnswers((prev) => ({ ...prev, [p.id]: pr }))}
                        disabled={protocolSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === pr
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          protocolSubmitted ? 'cursor-default' : '',
                        ].join(' ')}
                      >
                        {PROTOCOL_LABELS[pr]}
                      </button>
                    ))}
                  </div>
                  {result && !result.isCorrect && (
                    <div className="mt-2 text-xs text-danger">
                      Correct: <strong>{PROTOCOL_LABELS[result.correct]}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!protocolSubmitted ? (
            <Button
              onClick={submitProtocol}
              disabled={Object.keys(protocolAnswers).length < PACKET_ITEMS.length}
            >
              Submit Classification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {protocolResult!.correctCount}/{protocolResult!.total} ({protocolResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Wireshark labels a frame by the highest-layer protocol it recognises — a DNS query over UDP is shown as DNS, not UDP.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: TCP Flag / Stage */}
      {step === 'tcpstage' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Identify the TCP Flag / Stage</h2>
          <p className="mb-4 text-sm text-muted">
            For each segment description, select which stage of the connection lifecycle it represents.
          </p>

          <div className="space-y-3">
            {TCP_STAGE_ITEMS.map((t) => {
              const chosen = stageAnswers[t.id];
              const result = stageResult?.results.find((r) => r.itemId === t.id);
              return (
                <div
                  key={t.id}
                  className={[
                    'rounded-lg border p-4',
                    result
                      ? result.isCorrect
                        ? 'border-ok/40 bg-ok/5'
                        : 'border-danger/40 bg-danger/5'
                      : 'border-border bg-panel-2',
                  ].join(' ')}
                >
                  <div className="mb-3 text-sm font-medium text-white">{t.description}</div>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => !stageSubmitted && setStageAnswers((prev) => ({ ...prev, [t.id]: s }))}
                        disabled={stageSubmitted}
                        className={[
                          'rounded px-3 py-1 text-xs font-medium transition-colors',
                          chosen === s
                            ? 'bg-accent text-black'
                            : 'bg-panel text-muted hover:text-white',
                          stageSubmitted ? 'cursor-default' : '',
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

          {!stageSubmitted ? (
            <Button
              onClick={submitStage}
              disabled={Object.keys(stageAnswers).length < TCP_STAGE_ITEMS.length}
            >
              Submit Identification
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {stageResult!.correctCount}/{stageResult!.total} ({stageResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Reading the flag combination on a segment tells you exactly what stage of the connection lifecycle you are looking at — establishment, data transfer, graceful close, or abrupt reset.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 3: Suspicious Traffic Audit */}
      {step === 'traffic' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Suspicious Traffic Audit</h2>
          <p className="mb-4 text-sm text-muted">
            Review each finding and decide: is it <strong className="text-danger">suspicious</strong> or <strong className="text-ok">normal traffic</strong>?
          </p>

          <div className="space-y-3">
            {TRAFFIC_FINDINGS.map((f) => {
              const chosen = trafficAnswers[f.id];
              const result = trafficResult?.results.find((r) => r.findingId === f.id);
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
                      onClick={() => !trafficSubmitted && setTrafficAnswers((prev) => ({ ...prev, [f.id]: true }))}
                      disabled={trafficSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === true
                          ? 'bg-danger/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        trafficSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Suspicious
                    </button>
                    <button
                      onClick={() => !trafficSubmitted && setTrafficAnswers((prev) => ({ ...prev, [f.id]: false }))}
                      disabled={trafficSubmitted}
                      className={[
                        'rounded px-3 py-1 text-xs font-medium transition-colors',
                        chosen === false
                          ? 'bg-ok/80 text-white'
                          : 'bg-panel text-muted hover:text-white',
                        trafficSubmitted ? 'cursor-default' : '',
                      ].join(' ')}
                    >
                      Normal Traffic
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

          {!trafficSubmitted ? (
            <Button
              onClick={submitTraffic}
              disabled={Object.keys(trafficAnswers).length < TRAFFIC_FINDINGS.length}
            >
              Submit Audit
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">
                Score: {trafficResult!.correctCount}/{trafficResult!.total} ({trafficResult!.percent}%)
              </div>
              <p className="mt-1 text-xs text-muted">
                Every anomaly here has a normal counterpart shown alongside it — the skill is recognising the specific pattern that departs from ordinary traffic, not treating an entire protocol as suspicious.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 4: Knowledge Check */}
      {step === 'knowledge' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Packet Analysis Knowledge Check</h2>
          <p className="mb-4 text-sm text-muted">
            Answer these questions about the handshake, ARP spoofing, TLS visibility, SYN floods, and stream following.
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
                A finding is only as strong as the specific packet-level evidence cited for it — "this looks odd" convinces no one; a cited timestamp, IP, and flag combination does.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Summary */}
      {step === 'summary' && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-white">Phase 21 Summary</h2>
          <p className="mb-4 text-sm text-muted">
            Review your progress across all four exercises.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">1. Protocol Identification</div>
              <div className="text-xs text-muted">
                {protocolResult ? `${protocolResult.correctCount}/${protocolResult.total} (${protocolResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">2. TCP Flag / Stage</div>
              <div className="text-xs text-muted">
                {stageResult ? `${stageResult.correctCount}/${stageResult.total} (${stageResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">3. Suspicious Traffic Audit</div>
              <div className="text-xs text-muted">
                {trafficResult ? `${trafficResult.correctCount}/${trafficResult.total} (${trafficResult.percent}%)` : 'Not attempted'}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-panel-2 p-4">
              <div className="text-sm font-medium text-white">4. Packet Analysis Knowledge Check</div>
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
