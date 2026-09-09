// ---------------------------------------------------------------------------
// Phase 13 — threat intelligence.
//
// Two published standards anchor this phase so the exercises compute a real
// answer rather than looking up a stored one:
//
//   * Bianco's Pyramid of Pain (2013) — orders indicator types by what it
//     costs the attacker when you burn them.
//   * The Admiralty Code (NATO STANAG 2511) — source reliability A-F crossed
//     with information credibility 1-6.
//
// MITRE ATT&CK technique IDs, names and tactics below were verified against
// attack.mitre.org. They are public reference data; nothing here is a payload
// and nothing describes how to carry an attack out.
// ---------------------------------------------------------------------------

// ----------------------------- Intelligence lifecycle -----------------------

export type IntelPhase =
  | 'direction'
  | 'collection'
  | 'processing'
  | 'analysis'
  | 'dissemination'
  | 'feedback';

export const INTEL_LIFECYCLE: {
  id: IntelPhase;
  name: string;
  question: string;
  failureMode: string;
}[] = [
  {
    id: 'direction',
    name: 'Planning and direction',
    question: 'What do we actually need to know, and who needs to know it?',
    failureMode:
      'Subscribing to feeds before anyone has asked a question. You end up with volume instead of intelligence.',
  },
  {
    id: 'collection',
    name: 'Collection',
    question: 'Where does the data come from?',
    failureMode:
      'Collecting only what is easy to collect, which is rarely what answers the requirement.',
  },
  {
    id: 'processing',
    name: 'Processing',
    question: 'Is it in a form we can work with — parsed, normalised, deduplicated?',
    failureMode:
      'Skipping normalisation, so the same domain appears four times in three formats and nobody can count anything.',
  },
  {
    id: 'analysis',
    name: 'Analysis and production',
    question: 'What does it mean for us, and how confident are we?',
    failureMode:
      'Reporting data as though it were analysis. A list of addresses is not a finding.',
  },
  {
    id: 'dissemination',
    name: 'Dissemination',
    question: 'Does it reach the person who can act, in a form they can act on?',
    failureMode:
      'A perfect report sent to the wrong audience, or in a format nobody can load into a control.',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    question: 'Did it help? What should we ask for next time?',
    failureMode:
      'The phase everyone skips, which is why the same unhelpful feed gets renewed every year.',
  },
];

// ------------------------------ Pyramid of Pain -----------------------------

export type PyramidTier =
  | 'hash'
  | 'ip'
  | 'domain'
  | 'artifact'
  | 'tool'
  | 'ttp';

/**
 * Ordered base to apex. The index IS the difficulty ranking, so the engine
 * derives attacker cost from position rather than storing a second number
 * that could drift out of step with the ordering.
 */
export const PYRAMID_TIERS: {
  id: PyramidTier;
  name: string;
  painToAttacker: string;
  evasionCost: string;
}[] = [
  {
    id: 'hash',
    name: 'Hash values',
    painToAttacker: 'Trivial',
    evasionCost: 'Recompile, or change one byte. The hash is different and your detection is dead.',
  },
  {
    id: 'ip',
    name: 'IP addresses',
    painToAttacker: 'Easy',
    evasionCost: 'Rent another host. Cloud and bulletproof providers make this minutes of work.',
  },
  {
    id: 'domain',
    name: 'Domain names',
    painToAttacker: 'Simple',
    evasionCost: 'Register another domain. Costs money and a little time, but not much of either.',
  },
  {
    id: 'artifact',
    name: 'Network and host artifacts',
    painToAttacker: 'Annoying',
    evasionCost:
      'Change the user agent, the URI pattern, the registry key, the service name. Requires reworking the tooling.',
  },
  {
    id: 'tool',
    name: 'Tools',
    painToAttacker: 'Challenging',
    evasionCost:
      'Find, buy or write a replacement, then learn it. This costs the attacker real time.',
  },
  {
    id: 'ttp',
    name: 'Tactics, techniques and procedures',
    painToAttacker: 'Tough',
    evasionCost:
      'Change how they operate. You are no longer blocking an artifact, you are forcing them to learn a new trade.',
  },
];

// -------------------------------- Indicators --------------------------------

/**
 * IOC vs IOA is the distinction this phase turns on:
 *
 *   IOC — evidence that something HAS happened. A hash, an address, a file.
 *   IOA — evidence that something IS happening. Behaviour, sequence, intent.
 *
 * The same underlying observation can be either, depending on whether you
 * are matching an artifact or recognising a behaviour.
 */
export type IndicatorKind = 'ioc' | 'ioa';

export type Indicator = {
  id: string;
  value: string;
  kind: IndicatorKind;
  tier: PyramidTier;
  /** Which stage of IR-2026-0908-01 produced it. */
  source: string;
  /** Why it is classified the way it is. */
  rationale: string;
};

export const INDICATORS: Indicator[] = [
  {
    id: 'ind-0',
    value: '203.0.113.55 — command-and-control endpoint',
    kind: 'ioc',
    tier: 'ip',
    source: 'Firewall flow records, Phase 0 triage',
    rationale:
      'An artifact you match against. It tells you a host talked to a known-bad address; it says nothing about what the host was doing. Burning it costs the attacker one server rental.',
  },
  {
    id: 'ind-1',
    value: 'The lookalike domain used in the phishing link',
    kind: 'ioc',
    tier: 'domain',
    source: 'DNS log, 02:41:58',
    rationale:
      'A registered artifact. Blocking it stops this campaign and costs the attacker a registration fee. Newly registered domain age is often a better signal than the domain itself.',
  },
  {
    id: 'ind-2',
    value: 'SHA-256 of the SUID binary /usr/local/bin/backup-helper',
    kind: 'ioc',
    tier: 'hash',
    source: 'Phase 9 filesystem evidence',
    rationale:
      'The most brittle indicator there is. Recompiling changes it. Useful for confirming you found the same file twice, near-useless for detecting the next one.',
  },
  {
    id: 'ind-3',
    value: 'Scheduled task named SystemHealthCheck running an encoded command',
    kind: 'ioc',
    tier: 'artifact',
    source: 'Phase 8 Windows persistence',
    rationale:
      'A host artifact. The specific name is trivially changed, but the shape — a scheduled task launching an encoded interpreter command — is much harder for the attacker to abandon.',
  },
  {
    id: 'ind-4',
    value: 'PowerShell spawned by explorer.exe holding an outbound TLS session',
    kind: 'ioa',
    tier: 'ttp',
    source: 'Phase 0 triage, Windows 4688 and netstat',
    rationale:
      'A behaviour, not an artifact. Nothing here is a value to block — it is a parent-child relationship plus a network property. It detects the technique regardless of address, domain or hash.',
  },
  {
    id: 'ind-5',
    value: 'Regular fixed-interval beaconing to a single external endpoint',
    kind: 'ioa',
    tier: 'ttp',
    source: 'Phase 7 EDR behavioural detection',
    rationale:
      'Timing as a signal. The attacker must change how the implant communicates to defeat it, not merely where it points. This is what caught the incident at 03:02:10.',
  },
  {
    id: 'ind-6',
    value: 'Authentication success from an unfamiliar ASN minutes after failures',
    kind: 'ioa',
    tier: 'ttp',
    source: 'Phase 0 event log correlation',
    rationale:
      'A sequence, not a value. Failures then a success from new infrastructure is the shape of credential compromise regardless of which address was used.',
  },
  {
    id: 'ind-7',
    value: 'A new SUID root binary appearing outside a change window',
    kind: 'ioa',
    tier: 'ttp',
    source: 'Phase 9 Linux persistence',
    rationale:
      'The behaviour of privilege escalation, expressed as a rule rather than a filename. It fires on the next binary too, which the hash never will.',
  },
];

// ------------------------------- MITRE ATT&CK -------------------------------

export type AttackTechnique = {
  id: string;
  name: string;
  tactic: string;
  /** The stage of IR-2026-0908-01 this maps to. */
  incidentStage: string;
  /** What detecting at this technique level buys you. */
  detectionNote: string;
};

/**
 * IR-2026-0908-01 mapped to ATT&CK. Every ID, name and tactic here was checked
 * against attack.mitre.org — a learner who looks one up must find it correct.
 */
export const ATTACK_MAPPING: AttackTechnique[] = [
  {
    id: 'T1566.002',
    name: 'Phishing: Spearphishing Link',
    tactic: 'Initial Access',
    incidentStage: 'The lookalike link delivered at 02:41:58',
    detectionNote:
      'Detecting here is cheapest and earliest. DMARC enforcement and newly-registered-domain blocking both operate at this technique.',
  },
  {
    id: 'T1078',
    name: 'Valid Accounts',
    tactic: 'Initial Access, Persistence, Privilege Escalation, Defense Evasion',
    incidentStage: 'The successful logon at 02:47:02 using phished credentials',
    detectionNote:
      'The technique that makes the rest hard: nothing is malware, the account is real, and the authentication succeeded legitimately. Phishing-resistant MFA defeats it outright.',
  },
  {
    id: 'T1059.001',
    name: 'Command and Scripting Interpreter: PowerShell',
    tactic: 'Execution',
    incidentStage: 'PowerShell created from explorer.exe at 02:51:44',
    detectionNote:
      'Script block logging is the control that makes this technique visible. It was disabled here, which is why the investigation depended on network telemetry.',
  },
  {
    id: 'T1071.001',
    name: 'Application Layer Protocol: Web Protocols',
    tactic: 'Command and Control',
    incidentStage: 'The outbound beacon to 203.0.113.55 from 02:51:53',
    detectionNote:
      'Port 443 is chosen precisely because it blends in. Detection comes from timing and destination reputation, not from the protocol.',
  },
  {
    id: 'T1053.005',
    name: 'Scheduled Task/Job: Scheduled Task',
    tactic: 'Execution, Persistence, Privilege Escalation',
    incidentStage: 'The SystemHealthCheck task on WS-01',
    detectionNote:
      'Task creation is a logged, low-volume event on most estates. This is one of the cheapest high-value detections available.',
  },
  {
    id: 'T1098',
    name: 'Account Manipulation',
    tactic: 'Persistence, Privilege Escalation',
    incidentStage: 'analyst1 added to the local Administrators group',
    detectionNote:
      'Group membership change outside a change window is a rule, not an indicator list. It survives every change of infrastructure.',
  },
  {
    id: 'T1548.003',
    name: 'Abuse Elevation Control Mechanism: Sudo and Sudo Caching',
    tactic: 'Privilege Escalation',
    incidentStage: 'Root shell obtained on SRV-01 at 02:53:02',
    detectionNote:
      'The Phase 9 finding: an over-broad sudo grant made this a single command rather than an exploit.',
  },
  {
    id: 'T1548.001',
    name: 'Abuse Elevation Control Mechanism: Setuid and Setgid',
    tactic: 'Privilege Escalation',
    incidentStage: 'SUID root binary written to /usr/local/bin at 02:54:00',
    detectionNote:
      'auditd watching the directory would have fired. It was not configured — a Phase 9 control gap.',
  },
  {
    id: 'T1543.002',
    name: 'Create or Modify System Process: Systemd Service',
    tactic: 'Persistence, Privilege Escalation',
    incidentStage: 'cloud-sync.service created at 02:55:00',
    detectionNote:
      'The persistence that survives on the host everyone forgot, because the alert named the workstation.',
  },
];

// ------------------------------ Threat actors -------------------------------

/**
 * SY0-701 objective 2.1 tests actor TYPES and their attributes, not named
 * groups. That is also the honest scope: attribution to a specific group is
 * rarely something a junior analyst can or should do.
 */
export type ActorType = {
  id: string;
  name: string;
  sophistication: 'low' | 'moderate' | 'high' | 'very high';
  resources: 'minimal' | 'moderate' | 'substantial' | 'state-level';
  location: 'internal' | 'external' | 'either';
  motivations: string[];
  typicalTargets: string;
  tell: string;
};

export const ACTOR_TYPES: ActorType[] = [
  {
    id: 'nation-state',
    name: 'Nation-state / APT',
    sophistication: 'very high',
    resources: 'state-level',
    location: 'external',
    motivations: ['Espionage', 'War', 'Service disruption', 'Political or philosophical beliefs'],
    typicalTargets: 'Government, defence, critical infrastructure, and their suppliers',
    tell: 'Long dwell time and patience. They do not need the money this quarter, so they wait.',
  },
  {
    id: 'organised-crime',
    name: 'Organised crime',
    sophistication: 'high',
    resources: 'substantial',
    location: 'external',
    motivations: ['Financial gain', 'Blackmail', 'Data exfiltration'],
    typicalTargets: 'Anyone who will pay — chosen by ability to pay rather than by identity',
    tell: 'Professionalised operations: support desks, affiliate programs, negotiated pricing.',
  },
  {
    id: 'hacktivist',
    name: 'Hacktivist',
    sophistication: 'moderate',
    resources: 'moderate',
    location: 'external',
    motivations: ['Political or philosophical beliefs', 'Disruption or chaos', 'Revenge'],
    typicalTargets: 'Organisations symbolising a position they oppose',
    tell: 'They want it seen. Defacement and public leaks are the point, not a side effect.',
  },
  {
    id: 'insider',
    name: 'Insider threat',
    sophistication: 'moderate',
    resources: 'moderate',
    location: 'internal',
    motivations: ['Revenge', 'Financial gain', 'Espionage', 'Data exfiltration'],
    typicalTargets: 'Their own employer, using access they were legitimately granted',
    tell: 'No intrusion to detect. The access is authorised; only the purpose is not.',
  },
  {
    id: 'unskilled',
    name: 'Unskilled attacker',
    sophistication: 'low',
    resources: 'minimal',
    location: 'external',
    motivations: ['Disruption or chaos', 'Revenge', 'Ethical curiosity'],
    typicalTargets: 'Whatever a scanner found exposed',
    tell: 'Uses tools they did not write and do not fully understand. Noisy, and rarely persistent.',
  },
  {
    id: 'shadow-it',
    name: 'Shadow IT',
    sophistication: 'low',
    resources: 'moderate',
    location: 'internal',
    motivations: ['Ethical', 'Getting the job done despite the process'],
    typicalTargets: 'Not an attacker at all — an unmanaged system inside your estate',
    tell: 'Well-intentioned. The risk is the absence of patching, logging and backup, not malice.',
  },
];

// ------------------------------ Admiralty Code ------------------------------

/** Source reliability, A (best) to F (cannot be judged). */
export type SourceReliability = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

/** Information credibility, 1 (confirmed) to 6 (cannot be judged). */
export type InfoCredibility = 1 | 2 | 3 | 4 | 5 | 6;

export const RELIABILITY_LABELS: Record<SourceReliability, string> = {
  A: 'Completely reliable',
  B: 'Usually reliable',
  C: 'Fairly reliable',
  D: 'Not usually reliable',
  E: 'Unreliable',
  F: 'Reliability cannot be judged',
};

export const CREDIBILITY_LABELS: Record<InfoCredibility, string> = {
  1: 'Confirmed by other sources',
  2: 'Probably true',
  3: 'Possibly true',
  4: 'Doubtful',
  5: 'Improbable',
  6: 'Truth cannot be judged',
};

export type FeedItem = {
  id: string;
  headline: string;
  sourceName: string;
  sourceType: 'commercial' | 'open-source' | 'government' | 'sharing-community' | 'internal';
  reliability: SourceReliability;
  credibility: InfoCredibility;
  /** Days since publication. */
  ageDays: number;
  /** Does the claim apply to this estate at all? */
  relevantToEstate: boolean;
  note: string;
};

export const FEED_ITEMS: FeedItem[] = [
  {
    id: 'feed-0',
    headline: '203.0.113.55 reported as an active C2 endpoint',
    sourceName: 'Sector sharing community',
    sourceType: 'sharing-community',
    reliability: 'B',
    credibility: 2,
    ageDays: 1,
    relevantToEstate: true,
    note: 'Matches an address seen in our own firewall logs, which is corroboration from a second source.',
  },
  {
    id: 'feed-1',
    headline: 'Campaign using scheduled tasks named after health-check utilities',
    sourceName: 'Commercial intelligence provider',
    sourceType: 'commercial',
    reliability: 'B',
    credibility: 3,
    ageDays: 6,
    relevantToEstate: true,
    note: 'Describes a technique rather than a value, so it stays useful after the infrastructure rotates.',
  },
  {
    id: 'feed-2',
    headline: 'National advisory: phishing-resistant MFA guidance updated',
    sourceName: 'National cyber authority',
    sourceType: 'government',
    reliability: 'A',
    credibility: 1,
    ageDays: 12,
    relevantToEstate: true,
    note: 'Highest-grade source and directly addresses the control gap this estate has.',
  },
  {
    id: 'feed-3',
    headline: 'Anonymous forum post claiming a zero-day in a firewall we do not run',
    sourceName: 'Open-source forum scrape',
    sourceType: 'open-source',
    reliability: 'E',
    credibility: 5,
    ageDays: 2,
    relevantToEstate: false,
    note: 'Unreliable source, improbable claim, and about a product not in the estate. Three reasons to disregard.',
  },
  {
    id: 'feed-4',
    headline: 'Bulk list of 40,000 "malicious" IP addresses, no context',
    sourceName: 'Aggregated open feed',
    sourceType: 'open-source',
    reliability: 'D',
    credibility: 4,
    ageDays: 0,
    relevantToEstate: true,
    note: 'Fresh, large and nearly worthless. Volume without provenance produces false positives, not intelligence.',
  },
  {
    id: 'feed-5',
    headline: 'Internal detection: fixed-interval beaconing pattern on the estate',
    sourceName: 'Our own EDR telemetry',
    sourceType: 'internal',
    reliability: 'A',
    credibility: 1,
    ageDays: 0,
    relevantToEstate: true,
    note: 'The most under-rated intelligence source in any organisation is its own telemetry.',
  },
  {
    id: 'feed-6',
    headline: 'Vendor blog attributing the campaign to a named nation-state group',
    sourceName: 'Vendor marketing blog',
    sourceType: 'commercial',
    reliability: 'C',
    credibility: 4,
    ageDays: 20,
    relevantToEstate: true,
    note: 'Attribution is the least actionable output of intelligence. Knowing the name changes no control you would deploy.',
  },
];

// ------------------------------- STIX / TAXII -------------------------------

/**
 * STIX is the language; TAXII is the transport. Learners routinely conflate
 * them, and the exam tests exactly that distinction.
 */
export const STIX_OBJECT_TYPES: { type: string; purpose: string }[] = [
  { type: 'indicator', purpose: 'A detection pattern plus the window it is valid for' },
  { type: 'malware', purpose: 'A family or instance, with its capabilities' },
  { type: 'attack-pattern', purpose: 'A technique — this is where ATT&CK IDs live' },
  { type: 'threat-actor', purpose: 'Who, with motivation and sophistication' },
  { type: 'identity', purpose: 'An organisation or sector, used for targeting and for sourcing' },
  { type: 'observed-data', purpose: 'Raw observations, without the claim that they are malicious' },
  { type: 'relationship', purpose: 'The edges — indicator "indicates" malware, actor "uses" technique' },
];
