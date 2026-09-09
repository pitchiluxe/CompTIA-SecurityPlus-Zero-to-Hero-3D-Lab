// ---------------------------------------------------------------------------
// Wireshark & Packet Analysis grading engine — Phase 21.
//
// Pure functions that grade the interactive exercises in PacketAnalysisView.
// No side effects, no I/O.
// ---------------------------------------------------------------------------

// ---- Protocol Identification ----

export type PacketProtocol = 'arp' | 'icmp' | 'tcp' | 'udp' | 'dns' | 'dhcp' | 'http' | 'tls';

export type PacketItem = {
  id: string;
  info: string;
  correct: PacketProtocol;
};

export const PACKET_ITEMS: PacketItem[] = [
  { id: 'pk-0', info: 'Who has 192.168.1.1? Tell 192.168.1.50', correct: 'arp' },
  { id: 'pk-1', info: 'Echo (ping) request id=0x0001, seq=1/256', correct: 'icmp' },
  { id: 'pk-2', info: '51502 → 22 [SYN] Seq=0 Win=64240 Len=0', correct: 'tcp' },
  { id: 'pk-3', info: '51000 → 5000 Len=128 (generic datagram, no application dissector)', correct: 'udp' },
  { id: 'pk-4', info: 'Standard query 0x1a2b A www.example.com', correct: 'dns' },
  { id: 'pk-5', info: 'DHCP Discover - Transaction ID 0x3a1f2c4d', correct: 'dhcp' },
  { id: 'pk-6', info: 'GET /login.php HTTP/1.1', correct: 'http' },
  { id: 'pk-7', info: 'Client Hello', correct: 'tls' },
  { id: 'pk-8', info: '56789 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0', correct: 'tcp' },
];

export type PacketResult = {
  itemId: string;
  chosen: PacketProtocol | undefined;
  correct: PacketProtocol;
  isCorrect: boolean;
};

export type PacketGrade = {
  results: PacketResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeProtocolIdentification(answers: Record<string, PacketProtocol>): PacketGrade {
  const results: PacketResult[] = PACKET_ITEMS.map((p) => ({
    itemId: p.id,
    chosen: answers[p.id],
    correct: p.correct,
    isCorrect: answers[p.id] === p.correct,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- TCP Flag / Handshake Stage Identification ----

export type TcpStage = 'syn' | 'syn-ack' | 'ack' | 'fin' | 'rst';

export type TcpStageItem = {
  id: string;
  description: string;
  correct: TcpStage;
  explanation: string;
};

export const TCP_STAGE_ITEMS: TcpStageItem[] = [
  { id: 'tc-0', description: 'Client sends Seq=0 [SYN] Win=64240 — the first segment of a new connection attempt', correct: 'syn', explanation: 'A lone SYN flag with no ACK is the first step of the three-way handshake, initiated by the client.' },
  { id: 'tc-1', description: 'Server responds Seq=0 Ack=1 [SYN, ACK] Win=65535 — acknowledging the client while proposing its own sequence number', correct: 'syn-ack', explanation: 'SYN+ACK together is the server\'s reply — it acknowledges the client\'s SYN and proposes its own initial sequence number.' },
  { id: 'tc-2', description: 'Client responds Seq=1 Ack=1 [ACK] Win=64240 — completing the exchange with no SYN flag set', correct: 'ack', explanation: 'A bare ACK completing the exchange is the third step of the three-way handshake — the connection is now established.' },
  { id: 'tc-3', description: 'Client sends Seq=450 Ack=900 [FIN, ACK] Win=64240 — signalling it has no more data to send', correct: 'fin', explanation: 'FIN signals a graceful connection close request from one side.' },
  { id: 'tc-4', description: 'Server responds Seq=900 Ack=451 [ACK] Win=65535 — acknowledging the FIN without yet closing its own side', correct: 'ack', explanation: 'An ACK acknowledging a FIN is a normal part of the four-way graceful teardown, distinct from the handshake\'s initial ACK.' },
  { id: 'tc-5', description: 'Server sends Seq=0 Ack=0 [RST] Win=0 in response to a connection attempt on a closed port', correct: 'rst', explanation: 'RST abruptly terminates or refuses a connection, commonly seen when a port is closed or a connection is forcibly reset.' },
  { id: 'tc-6', description: 'A host receives dozens of [SYN] segments from many different, likely spoofed source IPs, but never completes a handshake with any of them', correct: 'syn', explanation: 'A flood of unanswered SYN segments with no completed handshake is the classic SYN flood pattern.' },
  { id: 'tc-7', description: 'A client sends [FIN, ACK] to close a connection but receives [RST] back instead of the expected acknowledgement', correct: 'rst', explanation: 'Receiving RST instead of an ACK to a FIN indicates an abrupt, non-graceful termination rather than a normal close.' },
];

export type TcpStageResult = {
  itemId: string;
  chosen: TcpStage | undefined;
  correct: TcpStage;
  isCorrect: boolean;
  explanation: string;
};

export type TcpStageGrade = {
  results: TcpStageResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeTcpStage(answers: Record<string, TcpStage>): TcpStageGrade {
  const results: TcpStageResult[] = TCP_STAGE_ITEMS.map((t) => ({
    itemId: t.id,
    chosen: answers[t.id],
    correct: t.correct,
    isCorrect: answers[t.id] === t.correct,
    explanation: t.explanation,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}

// ---- Suspicious Traffic Audit ----

export type TrafficFindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type TrafficFinding = {
  id: string;
  area: string;
  description: string;
  severity: TrafficFindingSeverity;
  isSuspicious: boolean;
  explanation: string;
};

export const TRAFFIC_FINDINGS: TrafficFinding[] = [
  { id: 'tf-0', area: 'ARP', description: 'Two different MAC addresses respond to ARP requests for the same gateway IP within the same capture', severity: 'critical', isSuspicious: true, explanation: 'Conflicting ARP replies for the same IP is the signature of ARP spoofing/poisoning, letting an attacker intercept traffic bound for that IP.' },
  { id: 'tf-1', area: 'ARP', description: 'A single, consistent MAC address responds to ARP requests for the gateway IP throughout the entire capture', severity: 'low', isSuspicious: false, explanation: 'This is normal, expected ARP behaviour with no conflicting claims.' },
  { id: 'tf-2', area: 'DNS', description: 'A workstation sends an unusually high volume of DNS TXT record queries to one external domain, each with long, random-looking subdomains', severity: 'high', isSuspicious: true, explanation: 'This pattern — high-volume TXT queries with random-looking subdomains — is a classic indicator of DNS tunnelling used for covert data exfiltration or C2.' },
  { id: 'tf-3', area: 'DNS', description: 'DNS queries in the capture are a normal mix of A and AAAA record lookups to common, human-readable domains', severity: 'low', isSuspicious: false, explanation: 'This is ordinary DNS resolution traffic with no anomalous pattern.' },
  { id: 'tf-4', area: 'HTTP', description: 'An HTTP POST request in cleartext contains a username and password visible directly in the request body', severity: 'critical', isSuspicious: true, explanation: 'Cleartext credentials in an HTTP POST body are trivially readable by anyone who can capture the traffic — a critical finding regardless of intent.' },
  { id: 'tf-5', area: 'TLS', description: 'Login traffic in the capture uses TLS, with only the encrypted Application Data visible, not the credentials themselves', severity: 'low', isSuspicious: false, explanation: 'This is the expected, secure behaviour — TLS protects the credentials from being visible in the capture.' },
  { id: 'tf-6', area: 'TCP', description: 'The capture shows a rapid burst of SYN packets from many different source IPs to one destination port, with no corresponding SYN-ACK completions', severity: 'high', isSuspicious: true, explanation: 'A high volume of unanswered SYN packets from many sources to one target is the classic SYN flood denial-of-service pattern.' },
  { id: 'tf-7', area: 'TCP', description: 'The capture shows a normal number of completed three-way handshakes proportional to the overall traffic volume', severity: 'low', isSuspicious: false, explanation: 'This is expected, healthy TCP connection behaviour.' },
  { id: 'tf-8', area: 'DHCP', description: 'A DHCP Offer is received from a server address that does not match the organisation\'s known, authorised DHCP server', severity: 'high', isSuspicious: true, explanation: 'An unexpected DHCP Offer source suggests a rogue DHCP server, which can redirect clients to a malicious gateway or DNS server.' },
  { id: 'tf-9', area: 'TLS', description: 'TLS ClientHello negotiates TLS 1.3 with modern cipher suites', severity: 'low', isSuspicious: false, explanation: 'This is correct, current, secure TLS configuration with no downgrade or weak-cipher concern.' },
];

export type TrafficResult = {
  findingId: string;
  description: string;
  chosen: boolean | undefined;
  correct: boolean;
  isCorrect: boolean;
  explanation: string;
  severity: TrafficFindingSeverity;
};

export type TrafficGrade = {
  results: TrafficResult[];
  correctCount: number;
  total: number;
  percent: number;
};

export function gradeTrafficAudit(answers: Record<string, boolean>): TrafficGrade {
  const results: TrafficResult[] = TRAFFIC_FINDINGS.map((f) => ({
    findingId: f.id,
    description: `${f.area}: ${f.description}`,
    chosen: answers[f.id],
    correct: f.isSuspicious,
    isCorrect: answers[f.id] === f.isSuspicious,
    explanation: f.explanation,
    severity: f.severity,
  }));
  const correctCount = results.filter((r) => r.isCorrect).length;
  return { results, correctCount, total: results.length, percent: Math.round((correctCount / results.length) * 100) };
}
