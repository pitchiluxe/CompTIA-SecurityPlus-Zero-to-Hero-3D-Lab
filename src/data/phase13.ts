import type { EvidenceTemplate, Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 13 — Threat Intelligence
// Aligned with CompTIA Security+ SY0-701 (Domain 1.4)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Intelligence Lifecycle and Feed Quality ----------

const LESSON_13_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p13-l1-s0',
    title: 'Concept — The Intelligence Lifecycle',
    body:
      'The intelligence lifecycle consists of six phases: Planning and Direction, Collection, Processing, Analysis and Production, Dissemination, and Feedback. Each phase answers a specific question; the Feedback phase is the one everyone skips, which is why organisations renew feeds nobody has ever acted on.',
  },
  {
    id: 'p13-l1-s1',
    title: 'Concept — STIX and TAXII',
    body:
      'STIX (Structured Threat Information Expression) is the language — structured objects and relationships. TAXII (Trusted Automated Exchange of Intelligence Information) is the transport that moves STIX between parties. Conflating them is the standard exam mistake.',
  },
  {
    id: 'p13-l1-s2',
    title: 'Concept — The Admiralty Code',
    body:
      'Two independent judgements: source reliability (A–F) and information credibility (1–6). A usually‑reliable source can still report something doubtful (B4), and an unreliable source occasionally tells the truth (E1). Collapsing them into a single score destroys the distinction between who said it and whether it is true.',
  },
  {
    id: 'p13-l1-s3',
    title: 'Concept — Feed Triage',
    body:
      'Relevance is checked first and separately: an A‑1 report about a product you do not run is still not actionable. The Admiralty rating and confidence score guide whether to act, corroborate, or disregard. Age is deliberately not part of the verdict — it affects priority, not truth.',
  },
  {
    id: 'p13-l1-s4',
    title: 'Example — Typical intelligence‑cycle failure',
    body:
      'A team subscribes to a commercial feed before stating a requirement. They measure success by volume of indicators, producing many false positives. The requirement makes the other five phases decidable; without it, intelligence is just noise.',
  },
  {
    id: 'p13-l1-s5',
    title: 'Review — What must stick',
    body:
      'The lifecycle is a loop; Feedback is the phase everyone skips. STIX is the language, TAXII the transport. The Admiralty Code uses two independent axes. Relevance is a separate, cheapest filter.',
  },
];

const LESSON_13_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p13-q0',
    type: 'mcq',
    stem: 'Which phase of the intelligence lifecycle is most often skipped and why?',
    options: [
      'Feedback – because it requires follow‑up that is hard to measure',
      'Collection – because it is the easiest to automate',
      'Processing – because it is purely technical',
      'Analysis – because it requires the most expertise',
    ],
    answer: 0,
    explanation:
      'The Feedback phase is the one everyone skips, which is why organisations renew feeds nobody has ever acted on. Without it, the cycle cannot close and the same unhelpful feed gets renewed every year.',
    domain: 'Threats, Vulnerabilities, and Mitigations',
    conceptId: 'intel-lifecycle',
  },
  {
    id: 'p13-q1',
    type: 'scenario',
    stem: 'An analyst receives a feed item with reliability B and credibility 3, and it is relevant to the estate. What is the actionability verdict?',
    options: [
      'Act',
      'Corroborate',
      'Disregard',
      'Escalate',
    ],
    answer: 1,
    explanation:
      'The confidence score = reliability B (4) + credibility 3 (3) = 7, which falls in the "corroborate" band (>=4 and <8).',
    domain: 'Threats, Vulnerabilities, and Mitigations',
    conceptId: 'admiralty-code',
  },
  {
    id: 'p13-q-pbq',
    type: 'pbq',
    stem: 'Order the phases of the intelligence lifecycle from first to last.',
    options: [
      'Define requirements and plan collection',
      'Collect raw data and feeds',
      'Analyze data into actionable intelligence',
      'Disseminate findings and collect feedback',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'The lifecycle begins with direction so collection is targeted, then processing/analysis turns data into insight, and finally the results are shared and the cycle is closed with feedback.',
    domain: 'Threats, Vulnerabilities, and Mitigations',
    conceptId: 'intel-lifecycle',
  },
];

const LESSON_13_1: Lesson = {
  id: 'p13-lesson-0',
  phaseId: 'phase-13',
  title: 'Intelligence Lifecycle and Feed Quality',
  objectives: [
    'Explain the six phases of the intelligence lifecycle and why Feedback is the most often skipped',
    'Distinguish STIX (the language) from TAXII (the transport)',
    'Apply the two-axis Admiralty Code to judge source reliability and information credibility',
    'Perform a basic feed triage using relevance, rating, and confidence score',
  ],
  concepts: ['intel-lifecycle', 'stix', 'taxii', 'admiralty-code', 'feed-triage'],
  homework:
    'Take one public threat report and grade it with the Admiralty Code on both axes, justifying each grade. Then state whether it is actionable for a fictional organisation and why.',
  careerConnection:
    'Every SOC analyst is asked about the intelligence lifecycle in interviews. Knowing why Feedback is the missing link separates a candidate who has seen real engagements from one who has only read definitions.',
  sections: LESSON_13_L1_SECTIONS,
  quiz: LESSON_13_L1_QUIZ,
};

// ---------- Lesson 2: From IOCs to TTPs – Building Durable Detections ----------

const LESSON_13_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p13-l2-s0',
    title: 'Concept — Indicators of Compromise vs Indicators of Attack',
    body:
      'An IOC is an artifact: a hash, an IP address, a domain. It is precise, easy to share, and brittle — the attacker can change it for free. An IOA describes behaviour: a sequence, a timing, a parent-child relationship. It is harder to write but durable — the attacker must change their technique to evade.',
  },
  {
    id: 'p13-l2-s1',
    title: 'Concept — The Pyramid of Pain',
    body:
      'Not all indicators are worth the same. The Pyramid of Pain orders indicator types by what it costs the attacker when you burn them: hashes (trivial to evade) at the base, TTPs (tough) at the apex. Most organisations invest at the bottom because that is what feeds sell; behavioural rules buy you the technique.',
  },
  {
    id: 'p13-l2-s2',
    title: 'Concept — MITRE ATT&CK Mapping',
    body:
      'ATT&CK provides a shared vocabulary for techniques and tactics. Mapping an incident to ATT&CK reveals gaps in detection coverage. The mapping is not a score but a coverage report — empty rows show where your detections are invisible.',
  },
  {
    id: 'p13-l2-s3',
    title: 'Concept — Threat Actor Types',
    body:
      'Attribution to a specific group is rarely actionable for a junior analyst. The actor TYPE (nation-state, organised crime, hacktivist, insider, unskilled, shadow-IT) changes your detection strategy. Naming the group changes no control you would deploy.',
  },
  {
    id: 'p13-l2-s4',
    title: 'Example — Applying the Pyramid to the platform incident',
    body:
      'The beacon uses a hash (trivial to evade), an IP address (easy), and a behavioural IOA of PowerShell from explorer.exe with outbound TLS at regular intervals (tough). The IP block list stops working next month; the behavioural rule persists.',
  },
  {
    id: 'p13-l2-s5',
    title: 'Review — What must stick',
    body:
      'IOCs are artifacts and brittle; IOAs are behaviours and durable. The Pyramid is about cost, not difficulty of detection. ATT&CK mapping reveals detection gaps. Attribution to a named group is the least actionable output; the actor TYPE changes strategy.',
  },
];

const LESSON_13_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p13-q2',
    type: 'mcq',
    stem: 'Which is an indicator of attack rather than an indicator of compromise?',
    options: [
      'The file hash of a known tool',
      'A command-and-control IP address',
      'An interactive shell maintaining regular outbound connections',
      'A malicious domain name',
    ],
    answer: 2,
    explanation:
      'The first, second and fourth are artifacts — IOCs. The third describes behaviour, which is what an IOA captures. Changing the address defeats an IOC; defeating the IOA requires abandoning the technique.',
    domain: 'Threats, Vulnerabilities, and Mitigations',
    conceptId: 'ioa',
  },
  {
    id: 'p13-q3',
    type: 'scenario',
    stem: 'An analyst classifies a detection as an IOC but the attacker simply rents a new host. What kind of detection was this?',
    options: [
      'IOC — an artifact the attacker can change for free',
      'IOA — a behaviour the attacker must change tradecraft to evade',
      'Both are equally durable',
      'Neither applies; the detection is invalid',
    ],
    answer: 0,
    explanation:
      'Because the attacker can achieve the same effect by renting another host, the detection relies on an artifact (IOC) rather than a durable behaviour (IOA).',
    domain: 'Threats, Vulnerabilities, and Mitigations',
    conceptId: 'ioc-ioa',
  },
];

const LESSON_13_2: Lesson = {
  id: 'p13-lesson-1',
  phaseId: 'phase-13',
  title: 'From IOCs to TTPs – Building Durable Detections',
  objectives: [
    'Distinguish an indicator of compromise from an indicator of attack',
    'Explain the Pyramid of Pain and why apex indicators cost the attacker more',
    'Map an incident to MITRE ATT&CK and read the detection gaps',
    'Describe why attribution to a named group is the least actionable output',
  ],
  concepts: ['ioc', 'ioa', 'pyramid-of-pain', 'att&ck-mapping', 'actor-types'],
  homework:
    'Pick one attacker behaviour and write both an IOC-based and a behaviour-based detection for it. Then place each on the Pyramid of Pain and say which you would keep if you could only keep one.',
  careerConnection:
    'In a real SOC, an analyst who only has IOCs is always fighting the previous incident. Building detections on IOAs and TTPs raises the cost for the attacker and improves persistent coverage.',
  sections: LESSON_13_L2_SECTIONS,
  quiz: LESSON_13_L2_QUIZ,
};

// ---------- Lab 1: Triage Threat Intelligence Feeds ----------

const LAB_13_L1_STEPS: LabStep[] = [
  {
    id: 'p13-l1-s0',
    instruction: 'Explain the six phases of the intelligence lifecycle',
    command: 'explain intelligence lifecycle',
    expected:
      'THE INTELLIGENCE LIFECYCLE output showing the six phases and the note that Feedback is the phase everyone skips.',
  },
  {
    id: 'p13-l1-s1',
    instruction: 'Explain the Admiralty Code and why two axes are used',
    command: 'explain admiralty code',
    expected:
      'THE ADMIRALTY CODE output showing source reliability A-F crossed with information credibility 1-6, and the explanation of why collapsing them into one score destroys distinction.',
  },
  {
    id: 'p13-l1-s2',
    instruction: 'Triage a set of feed items using relevance, rating, and confidence',
    command: 'show intel feed report',
    expected:
      'FEED TRIAGE output with rows rating A1, A1, B2 as "Act", B3, C4, D4 as "Corroborate", and E5 as "Disregard" (because irrelevant).',
  },
];

const LAB_13_L1_EXPECTED_RESULTS: string[] = [
  'Learner can name the six lifecycle phases and identify Feedback as the skipped phase',
  'Learner can explain the Admiralty Code axes and compute a confidence score',
  'Learner can read a feed triage table and decide act/correlate/disregard',
];

const LAB_13_L1_VERIFICATION: string[] = [
  'Simulator output contains the lifecycle phases',
  'Simulator output contains the Admiralty Code table',
  'Simulator output contains the feed triage table',
];

const LAB_13_L1_TROUBLESHOOTING: string[] = [
  'Command not recognised -> the simulator is a closed allowlist; type help for the supported set.',
  'Output looks static -> it is. Prepared artifacts are deterministic on purpose so findings are reproducible.',
];

const LAB_13_L1_CHALLENGE: string = 'Write a one-sentence summary of each lifecycle phase and say which one you would skip first and why. Then triage three new feed items using the Admiralty Code.';

const LAB_13_L1_EVIDENCE: EvidenceTemplate[] = [
  {
    id: 'ev0',
    label: 'Lifecycle summary',
    type: 'text',
    placeholder: 'One sentence per lifecycle phase',
  },
  {
    id: 'ev1',
    label: 'Admiralty ratings',
    type: 'report',
    placeholder: 'Feed item, reliability, credibility, rating (act/correlate/disregard)',
  },
];

const LAB_13_L1_SECURITY_LESSON: string =
  'The intelligence lifecycle is only useful if the Feedback phase is acted on. The Admiralty Code\'s two-axis discipline prevents collapsing reliable source and credible claim into a single number that can mislead. Relevance is the cheapest filter you have.';

const LAB_13_L1: Lab = {
  id: 'p13-lab-0',
  phaseId: 'phase-13',
  title: 'Triage Threat Intelligence Feeds',
  objective:
    'Apply the intelligence lifecycle, STIX/TAXII, and Admiralty Code to determine whether feed items are actionable for this estate.',
  securityConcepts: ['Threat intelligence lifecycle', 'STIX/TAXII', 'Admiralty Code', 'Feed quality'],
  environment: 'Deterministic simulator -- prepared reference artifacts, nothing is executed',
  topology: 'Threat intelligence feed triage over the IR-2026-0908-01 incident',
  prerequisites: ['Complete "The Intelligence Lifecycle and Feed Quality"'],
  steps: LAB_13_L1_STEPS,
  expectedResults: LAB_13_L1_EXPECTED_RESULTS,
  verification: LAB_13_L1_VERIFICATION,
  troubleshooting: LAB_13_L1_TROUBLESHOOTING,
  challenge: LAB_13_L1_CHALLENGE,
  evidence: LAB_13_L1_EVIDENCE,
  securityLesson: LAB_13_L1_SECURITY_LESSON,
};

// ---------- Lab 2: Classify Indicators and Map the Incident ----------

const LAB_13_L2_STEPS: LabStep[] = [
  {
    id: 'p13-l2-s0',
    instruction: 'Explain IOC vs IOA using the platform incident',
    command: 'explain ioc vs ioa',
    expected:
      'INDICATOR OF COMPROMISE vs INDICATOR OF ATTACK output listing IOCs (hash, IP, domain) and IOAs (PowerShell from explorer.exe with outbound TLS, fixed-interval beaconing, failures then success from new ASN, new SUID binary outside change window).',
  },
  {
    id: 'p13-l2-s1',
    instruction: 'Show the Pyramid of Pain and apply it to the incident',
    command: 'show pyramid of pain',
    expected:
      'THE PYRAMID OF PAIN output listing TTPs, Tools, Network/host artifacts, Domain names, IP addresses, Hash values from base to apex, and the teaching about cost vs difficulty of detection.',
  },
  {
    id: 'p13-l2-s2',
    instruction: 'Map the incident to MITRE ATT&CK techniques',
    command: 'show attack mapping',
    expected:
      'IR-2026-0908-01 MAPPED TO MITRE ATT&CK output showing technique IDs (T1566.002, T1078, T1059.001, T1071.001, T1053.005, T1098, T1548.003, T1548.001, T1543.002) with name, tactic, and the gap analysis.',
  },
  {
    id: 'p13-l2-s3',
    instruction: 'Compare threat actor types and why attribution is least actionable',
    command: 'compare threat actors',
    expected:
      'THREAT ACTOR TYPES output with Nation-state/APT, Organised crime, Hacktivist, Insider threat, Unskilled attacker, Shadow IT, and the note that attribution to a named group changes no control you would deploy.',
  },
];

const LAB_13_L2_EXPECTED_RESULTS: string[] = [
  'Learner can classify an indicator as IOC or IOA',
  'Learner can place an indicator on the correct Pyramid tier and explain the cost to the attacker',
  'Learner can read an ATT&CK mapping and name at least one detection gap',
  'Learner can describe why actor-type matters more than group name',
];

const LAB_13_L2_VERIFICATION: string[] = [
  'Simulator output contains IOC/IOA comparison',
  'Simulator output contains the Pyramid of Pain tiers',
  'Simulator output contains the ATT&CK mapping table',
  'Simulator output contains the threat actor type table',
];

const LAB_13_L2_TROUBLESHOOTING: string[] = [
  'Command not recognised -> type help for the supported command set.',
  'Output dense -> read one WHERE clause at a time and ask what each excludes.',
];

const LAB_13_L2_CHALLENGE: string =
  'The attacker abandons 203.0.113.55 and registers new infrastructure. State which of your detections still fire and which are now useless, then write one additional IOA for a technique from the Phase 3 chain that currently has no behavioural detection.';

const LAB_13_L2_EVIDENCE: EvidenceTemplate[] = [
  {
    id: 'ev0',
    label: 'IOC/IOA assessment',
    type: 'report',
    placeholder: 'Indicator, type (IOC/IOA), survives infrastructure change?, proposed IOA',
  },
  {
    id: 'ev1',
    label: 'Detection gaps',
    type: 'report',
    placeholder: 'ATT&CK technique, mapping status, gap note',
  },
];

const LAB_13_L2_SECURITY_LESSON: string =
  'An IOC tells you a specific attacker was here. An IOA tells you something is happening regardless of where. Building detections the attacker cannot cheaply evade is the difference between chasing indicators and actually raising their cost. Attribution to a named group changes no control you would deploy; the actor TYPE changes strategy.';

const LAB_13_L2: Lab = {
  id: 'p13-lab-1',
  phaseId: 'phase-13',
  title: 'Classify Indicators and Map the Incident',
  objective:
    'Classify indicators as IOC or IOA, place them on the Pyramid of Pain, map the IR-2026-0908-01 incident to ATT&CK, and explain why actor type matters more than group name.',
  securityConcepts: ['IOC', 'IOA', 'Pyramid of Pain', 'MITRE ATT&CK', 'Threat actor types'],
  environment: 'Deterministic simulator -- prepared reference artifacts, nothing is executed',
  topology: 'Threat intelligence exercise over the IR-2026-0908-01 incident',
  prerequisites: ['Complete "From IOCs to TTPs - Building Durable Detections"'],
  steps: LAB_13_L2_STEPS,
  expectedResults: LAB_13_L2_EXPECTED_RESULTS,
  verification: LAB_13_L2_VERIFICATION,
  troubleshooting: LAB_13_L2_TROUBLESHOOTING,
  challenge: LAB_13_L2_CHALLENGE,
  evidence: LAB_13_L2_EVIDENCE,
  securityLesson: LAB_13_L2_SECURITY_LESSON,
};

// ---------- Phase 13 export ----------

export const PHASE_13: Phase = {
  id: 'phase-13',
  number: 13,
  title: 'Threat Intelligence',
  description:
    'Turn artifacts into actionable intelligence: intelligence lifecycle, IOC/IOA, Pyramid of Pain, ATT&CK mapping, threat actor types, feed quality, STIX/TAXII, and Admiralty Code.',
  examDomain: 'Threats, Vulnerabilities, and Mitigations',
  scene: 'soc',
  lessons: [LESSON_13_1, LESSON_13_2],
  labs: [LAB_13_L1, LAB_13_L2],
};