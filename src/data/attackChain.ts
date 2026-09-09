import type { PathStageId } from './connectionPath';

// ---------------------------------------------------------------------------
// Phase 3 — the safe simulated attack chain.
//
// PROMPT.md asks for: Email -> User -> Credential capture -> Suspicious login
// -> Alert, and explicitly forbids implementing credential theft against real
// users or systems. Nothing here executes, captures, or transmits anything.
// Every stage is a description of what an attack WOULD leave behind, so the
// learner practises recognition and defence.
//
// Each stage cross-links to a Phase 1 connection-path stage and a Phase 2
// defence layer: the chain is those two models seen from the attacker's side.
// ---------------------------------------------------------------------------

export type AttackStageId =
  'delivery' | 'user-action' | 'credential-capture' | 'suspicious-login' | 'execution' | 'alert';

export type AttackStage = {
  id: AttackStageId;
  order: number;
  title: string;
  /** Who acts at this stage. */
  actor: 'attacker' | 'user' | 'defender' | 'system';
  /** World X position in the 3D scene; the chain runs left to right. */
  x: number;
  color: string;
  /** What happens, described defensively. */
  summary: string;
  /** Artifacts a defender could actually go and look at. */
  evidence: string[];
  /** What a defender would look for, specifically. */
  detection: string[];
  /** The control that should have stopped or caught this stage. */
  controlThatShouldCatchIt: string;
  /** Phase 2 defence layer this maps to. */
  defenceLayer: string;
  /** Phase 1 connection-path stage this maps to, where one applies. */
  pathStage?: PathStageId;
  /** MITRE ATT&CK tactic name, for learners moving on to that framework. */
  attackTactic: string;
};

export const ATTACK_CHAIN: AttackStage[] = [
  {
    id: 'delivery',
    order: 1,
    title: 'Delivery',
    actor: 'attacker',
    x: -12.5,
    color: '#ef4444',
    summary:
      'A spear-phishing email reaches analyst1. It spoofs the IT service desk, references a real internal system by name, and links to a lookalike domain registered four days earlier. Targeting one named person with organisation-specific detail is what makes it spear phishing rather than bulk phishing.',
    evidence: [
      'Mail gateway log: sender domain, SPF/DKIM/DMARC result, delivery verdict',
      'Message headers: Return-Path, Received chain, Reply-To mismatch',
      'The URL itself, and the domain registration date',
    ],
    detection: [
      'Authentication failures (SPF softfail, DMARC none) on a sender claiming to be internal',
      'Display name says IT Service Desk but the envelope domain does not match',
      'Newly registered domain — days-old registration is a strong signal on its own',
    ],
    controlThatShouldCatchIt: 'Mail gateway filtering and DMARC enforcement',
    defenceLayer: 'Perimeter',
    attackTactic: 'Initial Access',
  },
  {
    id: 'user-action',
    order: 2,
    title: 'User action',
    actor: 'user',
    x: -7.5,
    color: '#f59e0b',
    summary:
      'The user clicks the link. This is not a failure of intelligence — the message exploited urgency and authority, two of the classic social-engineering principles. Blaming the user here produces no control improvement; assuming someone will always click produces several.',
    evidence: [
      'Proxy or DNS log showing the lookalike domain resolved and fetched',
      'Endpoint browser history',
      'Time gap between delivery and click',
    ],
    detection: [
      'DNS query for a domain with no prior history in the organisation',
      'Web proxy category "newly registered domain"',
      'A very short delivery-to-click interval suggests a convincing pretext',
    ],
    controlThatShouldCatchIt: 'Web proxy category blocking, DNS filtering, awareness training',
    defenceLayer: 'Endpoint',
    pathStage: 'endpoint',
    attackTactic: 'Initial Access',
  },
  {
    id: 'credential-capture',
    order: 3,
    title: 'Credential capture (simulated)',
    actor: 'attacker',
    x: -2.5,
    color: '#a855f7',
    summary:
      'The lookalike page presents a login form styled like the real portal. The user submits credentials, which the attacker records. SIMULATED ONLY — this platform describes what such a page produces in the logs; it does not implement, host, or capture anything. There is no credential-handling code anywhere in this project.',
    evidence: [
      'POST request to the lookalike domain in proxy logs',
      'Absence of a corresponding successful login to the real portal at that moment',
      'The page itself, if preserved by the mail or proxy sandbox',
    ],
    detection: [
      'Credentials submitted to a domain that is not the identity provider',
      'A login form served from a domain with no TLS certificate history',
      'Password manager did not autofill — a real signal users can be trained to notice',
    ],
    controlThatShouldCatchIt:
      'Phishing-resistant MFA (FIDO2/WebAuthn), which binds authentication to the real origin',
    defenceLayer: 'Application',
    attackTactic: 'Credential Access',
  },
  {
    id: 'suspicious-login',
    order: 4,
    title: 'Suspicious login',
    actor: 'attacker',
    x: 2.5,
    color: '#eab308',
    summary:
      'The attacker authenticates to the real portal with the captured credentials. The login succeeds because the password is genuine — nothing is broken, which is exactly why this stage is hard to catch. What distinguishes it is context: the source, the time, and the device are all wrong for this user.',
    evidence: [
      'Authentication log: Windows 4624 success, logon type, source address',
      'Preceding 4625 failures if the attacker fumbled the username',
      'Sign-in geography, ASN, and device fingerprint',
    ],
    detection: [
      'Impossible travel — two logins too far apart to be the same person',
      'Authentication from an ASN the user has never used',
      'Login outside the user established working hours',
    ],
    controlThatShouldCatchIt: 'Conditional access policy and impossible-travel detection',
    defenceLayer: 'Application',
    pathStage: 'user',
    attackTactic: 'Initial Access',
  },
  {
    id: 'execution',
    order: 5,
    title: 'Execution and beaconing',
    actor: 'attacker',
    x: 7.5,
    color: '#f97316',
    summary:
      'Using the session, the attacker runs PowerShell on WS-01, which opens an outbound TLS session to 203.0.113.55:443 and checks in at regular intervals. Using a built-in administrative tool rather than dropping a binary is living off the land — there is no malware file for antivirus to find.',
    evidence: [
      'Windows 4688 process creation for powershell.exe',
      'netstat -ano showing PID 6644 ESTABLISHED to an external address',
      'DNS cache entry resolving updates.example.net to 203.0.113.55',
      'Firewall flow log with a regular, low-volume beacon pattern',
    ],
    detection: [
      'Interactive PowerShell holding a long-lived outbound TLS session',
      'Regular beacon interval — human traffic is not metronomic',
      'Process-to-connection attribution: the PID links the two halves of the evidence',
    ],
    controlThatShouldCatchIt:
      'EDR behavioural detection and egress filtering; TLS hides content, so detection is on metadata',
    defenceLayer: 'Endpoint',
    pathStage: 'network',
    attackTactic: 'Command and Control',
  },
  {
    id: 'alert',
    order: 6,
    title: 'Alert and triage',
    actor: 'defender',
    x: 12.5,
    color: '#38bdf8',
    summary:
      'The SIEM correlates the DNS query, the process creation, and the firewall flow into one alert. No single one of those events is remarkable. Correlation across sources is what turns three unremarkable events into an incident — and it is why centralised logging exists.',
    evidence: [
      'Correlated SIEM alert with the contributing events',
      'The full timeline from delivery to beacon',
      'Analyst triage notes and escalation record',
    ],
    detection: [
      'Correlation rule joining DNS, process creation, and egress flow',
      'Threat intelligence match on the destination address',
      'Baseline deviation for this user and this host',
    ],
    controlThatShouldCatchIt: 'SIEM correlation, alerting, and the incident response process',
    defenceLayer: 'Policy',
    pathStage: 'controls',
    attackTactic: 'Detection (defender)',
  },
];

export function getAttackStage(id: AttackStageId): AttackStage | undefined {
  return ATTACK_CHAIN.find((s) => s.id === id);
}

/**
 * Stages ordered by how early a defender could have intervened. The teaching
 * point is that the earliest catch is the cheapest one, and the chain offers
 * six of them.
 */
export function detectionOpportunityCount(): number {
  return ATTACK_CHAIN.reduce((sum, s) => sum + s.detection.length, 0);
}
