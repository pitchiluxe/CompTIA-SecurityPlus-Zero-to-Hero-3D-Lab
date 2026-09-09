// ---------------------------------------------------------------------------
// Phase 7 — SOC alerts and log telemetry.
//
// PROMPT.md requires a dashboard showing: alerts, severity, source,
// destination, timestamp, user, host, IOC, investigation status. And an
// investigation lab following:
//   multiple failed logins -> successful login -> unusual location ->
//   suspicious process
//
// That is the incident this platform has carried since Phase 0. Here the
// learner finally works it as an analyst.
//
// Every log entry is keyed by shared indicators (host, user, address, pid) so
// the investigation UI can support genuine PIVOTING — taking an indicator from
// one source and finding it in another — rather than scripted reveals.
//
// All addresses are RFC 5737/1918; all people and hosts are fictional.
// ---------------------------------------------------------------------------

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#38bdf8',
  info: '#64748b',
};

export type InvestigationStatus = 'new' | 'investigating' | 'escalated' | 'closed-tp' | 'closed-fp';

export const STATUS_LABELS: Record<InvestigationStatus, string> = {
  new: 'New',
  investigating: 'Investigating',
  escalated: 'Escalated',
  'closed-tp': 'Closed — true positive',
  'closed-fp': 'Closed — false positive',
};

export type LogSourceId = 'windows' | 'linux' | 'firewall' | 'dns' | 'web' | 'edr';

export const LOG_SOURCES: { id: LogSourceId; name: string; description: string }[] = [
  {
    id: 'windows',
    name: 'Windows Event Log',
    description: 'Authentication and process creation on domain endpoints. 4624/4625/4688.',
  },
  {
    id: 'linux',
    name: 'Linux syslog / auth.log',
    description: 'Authentication, sudo, and service events on Linux hosts.',
  },
  {
    id: 'firewall',
    name: 'Firewall flow log',
    description: 'Permitted and denied flows at the perimeter, with bytes and duration.',
  },
  {
    id: 'dns',
    name: 'DNS query log',
    description: 'Name resolution from endpoints. Often the earliest usable signal.',
  },
  {
    id: 'web',
    name: 'Web proxy log',
    description: 'HTTP/HTTPS requests, categories, and verdicts.',
  },
  {
    id: 'edr',
    name: 'EDR telemetry',
    description: 'Process trees, parent-child relationships, and behavioural detections.',
  },
];

/**
 * One log line. Indicators are extracted rather than buried in the message so
 * the investigation UI can pivot on them.
 */
export type LogEvent = {
  id: string;
  source: LogSourceId;
  /** ISO-like timestamp, all on the same simulated day. */
  timestamp: string;
  message: string;
  /** Indicators present in this event — the pivot keys. */
  host?: string;
  user?: string;
  srcIp?: string;
  dstIp?: string;
  pid?: number;
  domain?: string;
  /** Windows event ID where applicable. */
  eventId?: number;
  /** Marks the events that actually matter to the incident. */
  relevant: boolean;
};

export const LOG_EVENTS: LogEvent[] = [
  // ---- Stage 1-2: delivery and click (DNS + web) ----
  {
    id: 'e00',
    source: 'dns',
    timestamp: '02:41:58',
    message: 'Query A srv01-portal-login.example -> 203.0.113.90 (no prior history)',
    host: 'WS-01',
    user: 'analyst1',
    domain: 'srv01-portal-login.example',
    relevant: true,
  },
  {
    id: 'e01',
    source: 'web',
    timestamp: '02:42:03',
    message:
      'GET https://srv01-portal-login.example/session/renew — category: Newly Registered Domain — ALLOWED',
    host: 'WS-01',
    user: 'analyst1',
    dstIp: '203.0.113.90',
    domain: 'srv01-portal-login.example',
    relevant: true,
  },
  {
    id: 'e02',
    source: 'web',
    timestamp: '02:42:31',
    message: 'POST https://srv01-portal-login.example/session/renew — 312 bytes — ALLOWED',
    host: 'WS-01',
    user: 'analyst1',
    dstIp: '203.0.113.90',
    domain: 'srv01-portal-login.example',
    relevant: true,
  },

  // ---- Stage 4: failed then successful logins (Windows) ----
  {
    id: 'e10',
    source: 'windows',
    timestamp: '02:44:07',
    message: 'An account failed to log on. Logon Type 3. Status: bad username.',
    host: 'DC-01',
    user: 'analyst',
    srcIp: '198.51.100.77',
    eventId: 4625,
    relevant: true,
  },
  {
    id: 'e11',
    source: 'windows',
    timestamp: '02:44:19',
    message: 'An account failed to log on. Logon Type 3. Status: bad username.',
    host: 'DC-01',
    user: 'a.analyst',
    srcIp: '198.51.100.77',
    eventId: 4625,
    relevant: true,
  },
  {
    id: 'e12',
    source: 'windows',
    timestamp: '02:44:36',
    message: 'An account failed to log on. Logon Type 3. Status: bad username.',
    host: 'DC-01',
    user: 'analyst.1',
    srcIp: '198.51.100.77',
    eventId: 4625,
    relevant: true,
  },
  {
    id: 'e13',
    source: 'windows',
    timestamp: '02:47:02',
    message: 'An account was successfully logged on. Logon Type 3.',
    host: 'DC-01',
    user: 'analyst1',
    srcIp: '198.51.100.77',
    eventId: 4624,
    relevant: true,
  },

  // ---- Stage 5: execution and beaconing (EDR + Windows + firewall + DNS) ----
  {
    id: 'e20',
    source: 'windows',
    timestamp: '02:51:44',
    message: 'A new process has been created: powershell.exe. Parent: explorer.exe.',
    host: 'WS-01',
    user: 'analyst1',
    pid: 6644,
    eventId: 4688,
    relevant: true,
  },
  {
    id: 'e21',
    source: 'edr',
    timestamp: '02:51:45',
    message: 'Process tree: explorer.exe (3120) -> powershell.exe (6644). Interactive session.',
    host: 'WS-01',
    user: 'analyst1',
    pid: 6644,
    relevant: true,
  },
  {
    id: 'e22',
    source: 'dns',
    timestamp: '02:51:52',
    message: 'Query A updates.example.net -> 203.0.113.55',
    host: 'WS-01',
    user: 'analyst1',
    domain: 'updates.example.net',
    relevant: true,
  },
  {
    id: 'e23',
    source: 'firewall',
    timestamp: '02:51:53',
    message:
      'ALLOW tcp 192.168.1.10:52901 -> 203.0.113.55:443 — 4.1 KB — policy trust-to-untrust-web',
    host: 'FW-01',
    srcIp: '192.168.1.10',
    dstIp: '203.0.113.55',
    relevant: true,
  },
  {
    id: 'e24',
    source: 'firewall',
    timestamp: '02:56:53',
    message:
      'ALLOW tcp 192.168.1.10:52944 -> 203.0.113.55:443 — 3.9 KB — policy trust-to-untrust-web',
    host: 'FW-01',
    srcIp: '192.168.1.10',
    dstIp: '203.0.113.55',
    relevant: true,
  },
  {
    id: 'e25',
    source: 'firewall',
    timestamp: '03:01:53',
    message:
      'ALLOW tcp 192.168.1.10:52981 -> 203.0.113.55:443 — 4.0 KB — policy trust-to-untrust-web',
    host: 'FW-01',
    srcIp: '192.168.1.10',
    dstIp: '203.0.113.55',
    relevant: true,
  },
  {
    id: 'e26',
    source: 'edr',
    timestamp: '03:02:10',
    message: 'Behavioural: interactive shell holding long-lived outbound TLS at regular interval.',
    host: 'WS-01',
    user: 'analyst1',
    pid: 6644,
    relevant: true,
  },

  // ---- Benign noise: the false-positive alert and ordinary traffic ----
  {
    id: 'n00',
    source: 'linux',
    timestamp: '03:00:01',
    message: 'CRON[2841]: (root) CMD (/usr/local/bin/backup-nightly.sh)',
    host: 'SRV-01',
    user: 'root',
    relevant: false,
  },
  {
    id: 'n01',
    source: 'firewall',
    timestamp: '03:00:04',
    message: 'ALLOW tcp 192.168.1.30:41022 -> 198.51.100.20:443 — 4.2 GB — policy backup-egress',
    host: 'FW-01',
    srcIp: '192.168.1.30',
    dstIp: '198.51.100.20',
    relevant: false,
  },
  {
    id: 'n02',
    source: 'linux',
    timestamp: '03:41:12',
    message: 'backup-nightly.sh completed successfully. 4.2 GB transferred to offsite store.',
    host: 'SRV-01',
    user: 'root',
    relevant: false,
  },
  {
    id: 'n03',
    source: 'linux',
    timestamp: '08:14:52',
    message: 'sudo: analyst1 : TTY=pts/0 ; COMMAND=/usr/bin/systemctl restart nginx',
    host: 'SRV-01',
    user: 'analyst1',
    relevant: false,
  },
  {
    id: 'n04',
    source: 'dns',
    timestamp: '09:02:11',
    message: 'Query A srv-01.lab.local -> 192.168.1.30',
    host: 'WS-01',
    user: 'analyst1',
    domain: 'srv-01.lab.local',
    relevant: false,
  },
  {
    id: 'n05',
    source: 'web',
    timestamp: '09:14:30',
    message:
      'GET https://srv-01.lab.local/portal — category: Internal Business Application — ALLOWED',
    host: 'WS-01',
    user: 'analyst1',
    domain: 'srv-01.lab.local',
    relevant: false,
  },
  {
    id: 'n06',
    source: 'windows',
    timestamp: '09:15:02',
    message: 'An account was successfully logged on. Logon Type 2 (interactive, console).',
    host: 'WS-01',
    user: 'analyst1',
    eventId: 4624,
    relevant: false,
  },
];

// ---------------------------------------------------------------------------
// Alerts — the dashboard rows. Columns match PROMPT.md exactly.
// ---------------------------------------------------------------------------

export type Alert = {
  id: string;
  timestamp: string;
  title: string;
  /** The severity the SIEM assigned. The learner may disagree — that is triage. */
  severity: Severity;
  source: string;
  destination: string;
  user: string;
  host: string;
  /** Indicator of compromise, where the rule produced one. */
  ioc?: string;
  /** Which log source raised it. */
  raisedBy: LogSourceId;
  /** Correct verdict, revealed after the learner triages. */
  correctVerdict: 'true-positive' | 'false-positive';
  /** Why — the teaching payload. */
  verdictRationale: string;
  /** Events a learner should find when pivoting on this alert. */
  relatedEventIds: string[];
};

export const ALERTS: Alert[] = [
  {
    id: 'a0',
    timestamp: '02:44:36',
    title: 'Multiple failed logons from a single external source',
    severity: 'medium',
    source: '198.51.100.77',
    destination: 'DC-01',
    user: 'multiple',
    host: 'DC-01',
    ioc: '198.51.100.77',
    raisedBy: 'windows',
    correctVerdict: 'true-positive',
    verdictRationale:
      'Three 4625 failures against username variants from one external address, followed three minutes later by a 4624 success for analyst1 from the same address. The username fumbling is the tell — an attacker guessing the account naming convention. Escalate.',
    relatedEventIds: ['e10', 'e11', 'e12', 'e13'],
  },
  {
    id: 'a1',
    timestamp: '02:47:02',
    title: 'Successful authentication from an unfamiliar ASN at an unusual hour',
    severity: 'high',
    source: '198.51.100.77',
    destination: 'DC-01',
    user: 'analyst1',
    host: 'DC-01',
    ioc: '198.51.100.77',
    raisedBy: 'windows',
    correctVerdict: 'true-positive',
    verdictRationale:
      'A successful logon with valid credentials — nothing is technically broken, which is what makes this hard. The context is wrong: an ASN this user has never used, at 02:47 local time, immediately following failed attempts from the same address. Escalate.',
    relatedEventIds: ['e13', 'e10', 'e11', 'e12'],
  },
  {
    id: 'a2',
    timestamp: '02:51:53',
    title: 'Interactive PowerShell with sustained outbound TLS',
    severity: 'critical',
    source: 'WS-01 (192.168.1.10)',
    destination: '203.0.113.55:443',
    user: 'analyst1',
    host: 'WS-01',
    ioc: '203.0.113.55',
    raisedBy: 'edr',
    correctVerdict: 'true-positive',
    verdictRationale:
      'PowerShell spawned from explorer.exe in an interactive session, holding outbound TLS with a regular five-minute interval and near-constant payload size. That regularity is the beacon signature — human traffic is not metronomic. Escalate immediately.',
    relatedEventIds: ['e20', 'e21', 'e22', 'e23', 'e24', 'e25', 'e26'],
  },
  {
    id: 'a3',
    timestamp: '03:00:04',
    title: 'Large outbound data transfer to an external host',
    severity: 'high',
    source: 'SRV-01 (192.168.1.30)',
    destination: '198.51.100.20:443',
    user: 'root',
    host: 'SRV-01',
    ioc: '198.51.100.20',
    raisedBy: 'firewall',
    correctVerdict: 'false-positive',
    verdictRationale:
      'FALSE POSITIVE. 4.2 GB outbound looks alarming, but pivot on the host and time: a cron job started backup-nightly.sh four seconds earlier, the destination matches the documented offsite backup store, the policy that permitted it is named backup-egress, and the Linux log records a successful completion. Volume alone is not evidence — close as a false positive and tune the rule to exclude the backup egress policy.',
    relatedEventIds: ['n00', 'n01', 'n02'],
  },
  {
    id: 'a4',
    timestamp: '08:14:52',
    title: 'Privilege escalation via sudo on a production server',
    severity: 'medium',
    source: 'SRV-01',
    destination: 'SRV-01',
    user: 'analyst1',
    host: 'SRV-01',
    raisedBy: 'linux',
    correctVerdict: 'false-positive',
    verdictRationale:
      'FALSE POSITIVE. analyst1 holds one scoped sudo grant for exactly this command, it ran during working hours from an interactive session, and it matches the documented least-privilege configuration. A rule that alerts on every sudo invocation produces noise that trains analysts to ignore it. Close and tune.',
    relatedEventIds: ['n03'],
  },
];

export function getAlert(id: string): Alert | undefined {
  return ALERTS.find((a) => a.id === id);
}

/** Events matching any of the given indicator values — the pivot operation. */
export function pivot(indicator: string): LogEvent[] {
  const needle = indicator.trim().toLowerCase();
  if (!needle) return [];
  return LOG_EVENTS.filter((e) =>
    [e.host, e.user, e.srcIp, e.dstIp, e.domain, e.pid?.toString()]
      .filter(Boolean)
      .some((v) => v!.toLowerCase() === needle)
  );
}

/** Events from one source, in time order. */
export function eventsFrom(source: LogSourceId): LogEvent[] {
  return LOG_EVENTS.filter((e) => e.source === source).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}

/** The incident timeline: every relevant event, in order. */
export function incidentTimeline(): LogEvent[] {
  return LOG_EVENTS.filter((e) => e.relevant).sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );
}

/** Indicators worth pivoting on, for the investigation UI's suggestions. */
export const PIVOT_SUGGESTIONS = [
  'WS-01',
  'analyst1',
  '198.51.100.77',
  '203.0.113.55',
  '6644',
  'SRV-01',
  '198.51.100.20',
];
