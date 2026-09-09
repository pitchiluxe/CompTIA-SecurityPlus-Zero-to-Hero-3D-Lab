import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 18 — Business Continuity & Disaster Recovery
// Aligned with CompTIA Security+ SY0-701 (Domain 5: Security Program
// Management and Oversight)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: BC/DR Fundamentals & Metrics ----------

const LESSON_18_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p18-l1-s0',
    title: 'Concept — Business Continuity vs Disaster Recovery',
    body:
      'Business Continuity Planning (BCP) is the broader discipline: keeping the entire business operating — people, processes, facilities, and technology — through a disruption. Disaster Recovery (DR) is a subset of BCP focused specifically on restoring IT systems and data after an incident. A BCP might include manual paper-based order processing while systems are down; the DR plan is what restores those systems so the manual process is no longer needed. The exam expects you to recognise DR as IT-focused and BCP as the whole-business umbrella above it.',
  },
  {
    id: 'p18-l1-s1',
    title: 'Concept — RTO and RPO',
    body:
      'Recovery Time Objective (RTO) is the maximum acceptable time a system can be down before the business is unacceptably harmed — it answers "how fast must we be back up?" Recovery Point Objective (RPO) is the maximum acceptable amount of data loss, measured in time — it answers "how much data can we afford to lose?" These are not the same axis: a system could recover quickly (short RTO) but still lose an hour of transactions (longer RPO) if backups only run hourly. Both objectives should trace directly back to the Business Impact Analysis\'s Maximum Tolerable Downtime from Phase 17 — they are not IT\'s own arbitrary numbers.',
  },
  {
    id: 'p18-l1-s2',
    title: 'Concept — MTTR and MTBF',
    body:
      'Mean Time To Repair (MTTR) is the average time it takes to detect, diagnose, and fix a failure and restore the system to service — a measure of recovery efficiency. Mean Time Between Failures (MTBF) is the average time a component is expected to operate before it fails — a measure of reliability. A system with a high MTBF fails rarely; a system with a low MTTR recovers quickly when it does fail. The exam\'s favourite trap is swapping these: MTBF is about failure frequency, MTTR is about repair speed, and neither one is RTO or RPO, which are business-driven targets rather than measured historical averages.',
  },
  {
    id: 'p18-l1-s3',
    title: 'Concept — Backup Strategies and the 3-2-1 Rule',
    body:
      'A full backup copies everything every time — simple to restore, slow and storage-heavy to create. An incremental backup copies only what changed since the last backup of any type — fast to create, but a restore requires the last full backup plus every incremental since. A differential backup copies everything changed since the last full backup — faster to restore than incremental (only full + latest differential needed), but each differential grows larger over time. The 3-2-1 rule is the baseline resilience standard: keep 3 copies of data, on 2 different media types, with 1 copy offsite. A backup that has never been tested for restoration is not a verified control — it is an assumption.',
  },
  {
    id: 'p18-l1-s4',
    title: 'Concept — High Availability and Redundancy',
    body:
      'High availability keeps a system running through component failures without waiting for a full disaster-recovery invocation. Active-active redundancy runs multiple nodes simultaneously handling live traffic, so a failure of one node causes no interruption — the traffic simply continues on the survivors. Active-passive keeps a standby node ready but idle, which takes over only after the active node fails, typically causing a brief interruption during failover. N+1 redundancy means one more unit than the minimum required capacity, so a single failure never drops below what is needed. These are continuity mechanisms that operate continuously, distinct from the alternate-site strategies used in a full disaster invocation.',
  },
  {
    id: 'p18-l1-s5',
    title: 'Example — Setting RTO and RPO for a database outage',
    body:
      'An e-commerce company\'s BIA determines the order database can be down at most 2 hours before daily revenue loss becomes unacceptable — that is the RTO. The same BIA determines the business can tolerate losing at most 15 minutes of order data — that is the RPO. To meet the RPO, the backup strategy must capture changes at least every 15 minutes (transaction log shipping, not just a nightly full backup). To meet the RTO, the recovery architecture must be able to restore and validate the database within 2 hours — which likely requires a warm or hot standby, not a cold site requiring hardware procurement.',
  },
  {
    id: 'p18-l1-s6',
    title: 'Review — What must stick',
    body:
      'BCP is the whole-business umbrella; DR is the IT-focused subset beneath it. RTO answers "how fast," RPO answers "how much data can we lose" — both trace back to the BIA. MTTR measures repair speed; MTBF measures failure frequency — neither is a business target like RTO/RPO. The 3-2-1 backup rule (3 copies, 2 media types, 1 offsite) is the resilience baseline, and an untested backup is unverified. Active-active eliminates failover interruption; active-passive accepts a brief one.',
  },
];

const LESSON_18_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p18-q0',
    type: 'mcq',
    stem: 'What is the key difference between Business Continuity Planning (BCP) and Disaster Recovery (DR)?',
    options: [
      'BCP covers the whole business (people, processes, facilities, IT); DR is the IT-focused subset of BCP that restores systems and data',
      'DR covers the whole business; BCP only covers IT systems',
      'They are the same discipline with different names',
      'BCP only applies to natural disasters; DR only applies to cyberattacks',
    ],
    answer: 0,
    explanation:
      'BCP is the umbrella discipline keeping the entire business operating through a disruption. DR is specifically the IT-focused subset that restores systems and data.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'bcp-vs-dr',
  },
  {
    id: 'p18-q1',
    type: 'mcq',
    stem: 'What does Recovery Time Objective (RTO) define?',
    options: [
      'The maximum acceptable time a system can be down before unacceptable business harm occurs',
      'The maximum acceptable amount of data loss measured in time',
      'The average time between component failures',
      'The average time to repair a failed component',
    ],
    answer: 0,
    explanation:
      'RTO answers "how fast must we be back up?" — it is a business-driven target for downtime, distinct from RPO (data loss tolerance).',
    domain: 'Security Program Management and Oversight',
    conceptId: 'rto-rpo',
  },
  {
    id: 'p18-q2',
    type: 'mcq',
    stem: 'What does Recovery Point Objective (RPO) define?',
    options: [
      'The maximum acceptable amount of data loss, measured in time',
      'The maximum acceptable downtime for a system',
      'The average time a component operates before failing',
      'The physical location of the recovery site',
    ],
    answer: 0,
    explanation:
      'RPO answers "how much data can we afford to lose?" and directly drives backup frequency requirements.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'rto-rpo',
  },
  {
    id: 'p18-q3',
    type: 'mcq',
    stem: 'A hard drive is rated with an average of 1,000,000 hours before failure. Which metric does this describe?',
    options: ['MTBF', 'MTTR', 'RTO', 'RPO'],
    answer: 0,
    explanation:
      'MTBF (Mean Time Between Failures) measures reliability — how long a component is expected to operate before failing.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'mttr-mtbf',
  },
  {
    id: 'p18-q4',
    type: 'mcq',
    stem: 'A post-incident review measures how long it took engineers to detect, diagnose, and fix a failure. Which metric does this describe?',
    options: ['MTTR', 'MTBF', 'RTO', 'RPO'],
    answer: 0,
    explanation:
      'MTTR (Mean Time To Repair) measures recovery efficiency — how quickly a failed system is actually restored to service.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'mttr-mtbf',
  },
  {
    id: 'p18-q5',
    type: 'mcq',
    stem: 'What does the 3-2-1 backup rule require?',
    options: [
      '3 copies of data, on 2 different media types, with 1 copy stored offsite',
      '3 offsite copies with no local copy',
      '2 copies of data on 1 media type stored onsite',
      '1 copy of data backed up 3 times per day',
    ],
    answer: 0,
    explanation:
      '3-2-1 is the standard resilience baseline: 3 total copies, across 2 different media types, with at least 1 copy stored offsite so a single-site disaster cannot destroy every copy.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'backup-strategies',
  },
  {
    id: 'p18-q6',
    type: 'mcq',
    stem: 'What is the key difference between active-active and active-passive high availability?',
    options: [
      'In active-active, all nodes handle live traffic simultaneously; in active-passive, a standby node takes over only after the active node fails',
      'Active-passive is always faster to fail over than active-active',
      'Active-active requires only one node total',
      'They are the same architecture with different marketing names',
    ],
    answer: 0,
    explanation:
      'Active-active eliminates failover interruption because surviving nodes are already handling traffic. Active-passive keeps a standby idle until a failure triggers a cutover, typically causing a brief interruption.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'high-availability',
  },
  {
    id: 'p18-q7',
    type: 'scenario',
    stem: 'A company\'s BIA determines its order database can tolerate at most 15 minutes of lost transaction data. Which recovery objective does this directly define, and what must the backup strategy support?',
    options: [
      'RPO of 15 minutes — the backup strategy must capture changes at least every 15 minutes (e.g., transaction log shipping), not just a nightly full backup',
      'RTO of 15 minutes — the system must be back online within 15 minutes',
      'MTBF of 15 minutes — the database is expected to fail every 15 minutes',
      'MTTR of 15 minutes — repairs must always take exactly 15 minutes',
    ],
    answer: 0,
    explanation:
      'A data-loss tolerance is an RPO. Meeting a 15-minute RPO requires backups or log shipping at least that frequently — a nightly backup alone cannot satisfy it.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'rto-rpo',
  },
  {
    id: 'p18-q8',
    type: 'scenario',
    stem: 'An organisation takes nightly backups but has never attempted to restore from one. What is the risk?',
    options: [
      'The backups are unverified — corruption, misconfiguration, or missing data may only be discovered during an actual disaster, when it is too late',
      'There is no risk as long as backups complete without an error message',
      'Nightly backups do not need to be tested if they are automated',
      'This is only a concern for cloud-based backups'
    ],
    answer: 0,
    explanation:
      'A backup that completes without error is not the same as a backup that can actually be restored. Restoration testing is what verifies the control actually works.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'backup-strategies',
  },
  {
    id: 'p18-q9',
    type: 'scenario',
    stem: 'A payments platform uses two active nodes across two regions, both simultaneously serving live traffic, with automatic load redistribution if one fails. What does this architecture eliminate that active-passive would not?',
    options: [
      'The brief service interruption that occurs during an active-passive failover cutover',
      'The need for any backups at all',
      'The need for a documented DR plan',
      'The possibility of any future outage'
    ],
    answer: 0,
    explanation:
      'Because both nodes already handle live traffic in active-active, losing one causes no cutover delay — traffic simply continues on the survivor(s), unlike active-passive\'s standby activation.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'high-availability',
  },
  {
    id: 'p18-q-pbq',
    type: 'pbq',
    stem: 'Order the actions from business impact analysis to declared recovery.',
    options: [
      'Identify critical business functions and maximum tolerable downtime',
      'Define RTO and RPO targets for each function',
      'Choose backup and failover strategies that meet the targets',
      'Validate the plan with tabletop and live recovery tests',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Business impact analysis sets the requirements, RTO/RPO make them concrete, strategy selection meets the numbers, and testing proves the plan works.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'rto-rpo',
  },
];

// ---------- Lesson 2: Recovery Sites, Testing & Disaster Scenarios ----------

const LESSON_18_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p18-l2-s0',
    title: 'Concept — Alternate Site Types',
    body:
      'When an organisation cannot recover in place, it fails over to an alternate site. A hot site is a fully duplicated, continuously synchronised environment that can take over within minutes — the fastest recovery, at the highest ongoing cost. A warm site has basic infrastructure and some pre-installed equipment but needs hours to days of configuration and data restoration — a middle-cost, middle-speed option. A cold site is an empty facility with power and connectivity but no equipment, the cheapest option and the slowest to bring online, often days to weeks. Cloud-based DR provisions recovery infrastructure on demand from a public cloud provider, avoiding the cost of idle standby hardware entirely while still meeting short RTOs if automated well.',
  },
  {
    id: 'p18-l2-s1',
    title: 'Concept — Matching Site Type to RTO and Budget',
    body:
      'Site selection is a direct trade-off between RTO and cost: the shorter the required RTO, the more an organisation must spend on standby readiness. A 15-minute RTO effectively requires a hot site or an active-active architecture; a 3-day RTO can be satisfied by a cold site at a fraction of the cost. The exam expects you to reason from a stated RTO (or business scenario implying one) to the appropriate, cost-justified site type — choosing a hot site for a low-priority system wastes money, and choosing a cold site for a critical system fails the business requirement entirely.',
  },
  {
    id: 'p18-l2-s2',
    title: 'Concept — Testing BC/DR Plans',
    body:
      'A plan that has never been tested is a hypothesis. Testing types increase in rigor and risk: a tabletop exercise has participants talk through a scenario without executing any actual recovery actions — low cost, low disruption, good for finding planning gaps. A walkthrough is a more detailed step-by-step review of the plan\'s procedures. A simulation exercises some real actions in a non-production environment. A full-interruption test actually fails over production to the alternate site — the most rigorous validation, but the highest risk and cost if something goes wrong. Organisations should progress through these levels rather than jumping straight to a full-interruption test with no prior validation.',
  },
  {
    id: 'p18-l2-s3',
    title: 'Concept — Disaster Scenarios: Ransomware, Server, Network, and Cloud Outages',
    body:
      'Each disaster scenario has a distinct recovery consideration. Ransomware recovery must assume the attacker specifically targeted backup systems — restoration is only viable if immutable, offline, or air-gapped backup copies exist and are verified clean before restoring; paying the ransom is a business/legal decision, never a guaranteed technical recovery. A server outage (hardware failure) is typically the most straightforward, resolved through redundancy or restoring from backup to replacement hardware. A network outage may leave servers healthy but unreachable, requiring diverse network paths or providers rather than a compute-focused fix. A cloud provider outage is unique because the organisation has no direct control over the provider\'s recovery timeline — mitigation requires multi-region or multi-provider architecture decided in advance, not something that can be improvised during the outage.',
  },
  {
    id: 'p18-l2-s4',
    title: 'Concept — Continuity of Operations and Communication Plans',
    body:
      'A BC/DR plan is incomplete without a communication plan: who notifies whom, through what channel, and in what order, when a disaster is declared. A common flaw is a plan that depends entirely on the primary email or messaging system to coordinate the response — if that system is what is down, the plan has a single point of failure baked into its own execution. Effective plans specify an out-of-band communication method (a phone tree, a separate messaging platform, a physical call-down list) that does not depend on the systems being recovered.',
  },
  {
    id: 'p18-l2-s5',
    title: 'Example — Ransomware recovery decision',
    body:
      'A manufacturing company detects ransomware encrypting its file servers. The incident response team (Phase 12) contains the spread and confirms the infection\'s scope. The DR team checks backup status: nightly backups are stored on a network share that was also encrypted, but a separate immutable cloud backup taken 6 hours earlier is intact and verified clean. Recovery proceeds from the immutable copy, accepting 6 hours of RPO data loss — within the organisation\'s stated RPO tolerance. Had only the network-share backup existed, the company would have faced a choice between paying the ransom with no guarantee of a working decryption key, or rebuilding from scratch with total data loss.',
  },
  {
    id: 'p18-l2-s6',
    title: 'Review — What must stick',
    body:
      'Hot/warm/cold/cloud site types trade cost against recovery speed — match the site to the RTO, not the other way around. Testing should progress from tabletop through full-interruption, never skipping straight to the highest-risk test. Ransomware recovery requires immutable/offline backups verified clean, because attackers target backup systems directly. Network and cloud outages need their own distinct mitigations (path diversity, multi-region/provider) rather than reusing a server-outage plan. A communication plan must not depend on the very systems the disaster may have taken down.',
  },
];

const LESSON_18_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p18-q10',
    type: 'mcq',
    stem: 'Which alternate site type offers the fastest recovery at the highest ongoing cost?',
    options: ['Hot site', 'Warm site', 'Cold site', 'Cloud-based DR only'],
    answer: 0,
    explanation:
      'A hot site is fully duplicated and continuously synchronised, enabling near-instant failover — at the highest cost of any option.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'alternate-sites',
  },
  {
    id: 'p18-q11',
    type: 'mcq',
    stem: 'Which alternate site type is an empty facility with power and connectivity but no pre-installed equipment?',
    options: ['Cold site', 'Hot site', 'Warm site', 'Active-active site'],
    answer: 0,
    explanation:
      'A cold site is the cheapest and slowest option — everything must be procured and configured after the disaster is declared.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'alternate-sites',
  },
  {
    id: 'p18-q12',
    type: 'mcq',
    stem: 'What type of BC/DR test has participants talk through a scenario without executing any actual recovery actions?',
    options: ['Tabletop exercise', 'Full-interruption test', 'Simulation', 'Parallel test'],
    answer: 0,
    explanation:
      'A tabletop exercise is the lowest-risk, lowest-cost test type — useful for finding planning gaps before attempting more disruptive test types.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'bcdr-testing',
  },
  {
    id: 'p18-q13',
    type: 'mcq',
    stem: 'Why must ransomware recovery plans specifically consider immutable or offline backup copies?',
    options: [
      'Ransomware attackers frequently target backup systems directly, so ordinary network-accessible backups may be encrypted along with production data',
      'Immutable backups are required by law in every jurisdiction',
      'Ransomware never affects backup systems, so this is unnecessary',
      'Offline backups are always faster to restore than online backups',
    ],
    answer: 0,
    explanation:
      'Modern ransomware specifically seeks out and encrypts backup systems to eliminate the victim\'s recovery option. Immutable or offline copies cannot be reached or altered by the attacker.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'disaster-scenarios',
  },
  {
    id: 'p18-q14',
    type: 'mcq',
    stem: 'What makes a cloud provider outage a distinct disaster scenario compared to an organisation\'s own server outage?',
    options: [
      'The organisation has no direct control over the provider\'s recovery timeline and must rely on the provider\'s SLA and its own multi-region/multi-provider contingency',
      'Cloud outages never actually occur in practice',
      'Cloud outages are always resolved faster than an on-premises server outage',
      'A cloud outage only affects the provider, never the customer',
    ],
    answer: 0,
    explanation:
      'Unlike an in-house server, the organisation cannot directly repair a cloud provider\'s infrastructure — mitigation must be planned in advance via multi-region or multi-provider architecture.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'disaster-scenarios',
  },
  {
    id: 'p18-q15',
    type: 'scenario',
    stem: 'A trading platform requires an RTO of 15 minutes. Which alternate site strategy is realistically capable of meeting this?',
    options: [
      'A hot site or active-active architecture with continuous synchronisation',
      'A cold site with equipment procured after the disaster is declared',
      'A warm site requiring a full day of configuration',
      'No site can meet a 15-minute RTO'
    ],
    answer: 0,
    explanation:
      'Only a hot site or an active-active architecture can realistically restore service within minutes; warm and cold sites require hours to days.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'alternate-sites',
  },
  {
    id: 'p18-q16',
    type: 'scenario',
    stem: 'A company\'s incident communication plan relies entirely on the corporate email system to notify the response team. During a ransomware incident, email itself is down. What is the flaw?',
    options: [
      'The communication plan has a single point of failure baked into its own execution — it depends on the very system likely to be affected by the disaster',
      'Email is always the most reliable communication channel during any incident',
      'This is not a flaw since ransomware never affects email systems',
      'The flaw is unrelated to the communication plan itself',
    ],
    answer: 0,
    explanation:
      'An effective communication plan requires an out-of-band channel that does not depend on the systems most likely to be impacted by the disaster being planned for.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'continuity-communications',
  },
  {
    id: 'p18-q17',
    type: 'scenario',
    stem: 'A company has only ever performed tabletop exercises for its DR plan and is now considering its next step to increase confidence in the plan. What should it do?',
    options: [
      'Progress to a more rigorous test type, such as a simulation, before attempting a full-interruption test',
      'Immediately perform a full-interruption test on production with no intermediate step',
      'Stop testing since tabletop exercises are sufficient for any organisation',
      'Replace the DR plan entirely rather than test it further',
    ],
    answer: 0,
    explanation:
      'Testing rigor should increase gradually — tabletop, then walkthrough or simulation, then full-interruption — rather than jumping straight to the highest-risk test with no intermediate validation.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'bcdr-testing',
  },
  {
    id: 'p18-q18',
    type: 'scenario',
    stem: 'During a ransomware recovery, the team discovers the only available backups are on a network share that was also encrypted by the attack. What should have existed to prevent this single point of failure?',
    options: [
      'An immutable or offline/air-gapped backup copy that the ransomware could not reach or alter',
      'A faster network connection to the backup share',
      'A stronger password on the network share',
      'Antivirus software on the backup server only',
    ],
    answer: 0,
    explanation:
      'Network-accessible backups are exactly what modern ransomware targets. An immutable or offline copy, isolated from the production network, is the specific control that prevents this failure mode.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'disaster-scenarios',
  },
];

// ---------- Lab 1: Calculate Recovery Objectives and Choose a Recovery Site ----------

const LAB_18_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the current backup schedule for the company\'s critical systems.',
    command: 'show backup schedule',
    expected: 'A schedule showing backup frequency per system, with at least one system\'s frequency insufficient for its stated RPO.',
  },
  {
    id: 's1',
    instruction: 'Review the recovery objectives derived from the Business Impact Analysis.',
    command: 'show recovery objectives',
    expected: 'A table of RTO and RPO per critical process, sourced directly from the Phase 17 BIA.',
  },
  {
    id: 's2',
    instruction: 'Review the available alternate site options and their cost/speed trade-offs.',
    command: 'show site options',
    expected: 'A comparison of hot, warm, cold, and cloud-based site options with cost and typical recovery time for each.',
  },
];

const LAB_18_0: Lab = {
  id: 'p18-lab-0',
  phaseId: 'phase-18',
  title: 'Calculate Recovery Objectives and Choose a Recovery Site',
  objective:
    'Review a simulated company\'s backup schedule and BIA-derived recovery objectives, identify a backup-frequency gap relative to RPO, and recommend the most cost-appropriate alternate site for each critical system\'s RTO.',
  securityConcepts: [
    'RTO and RPO',
    'Backup strategies and the 3-2-1 rule',
    'Alternate site types (hot/warm/cold/cloud)',
    'Cost vs recovery speed trade-off',
  ],
  environment: 'Deterministic BC/DR simulator — prepared outputs only, no real infrastructure is provisioned or restored',
  topology: 'Same fictional company from Phase 17 (Meridian Retail Co.) with a payment system, order database, and payroll system, each with a stated BIA-derived RTO/RPO',
  prerequisites: ['Complete Phase 17 (Governance, Risk & Compliance)'],
  steps: LAB_18_0_STEPS,
  expectedResults: [
    'A system identified where backup frequency does not meet its stated RPO',
    'RTO/RPO values correctly traced back to the BIA for each critical process',
    'A specific, cost-justified alternate site type recommended per system based on its RTO',
  ],
  verification: [
    'Learner can explain why a nightly backup fails to meet a 15-minute RPO',
    'Learner can match each system\'s RTO to the appropriate site type with a cost/speed justification',
    'Learner can explain the relationship between the BIA (Phase 17) and RTO/RPO (this phase)',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure how to pick a site type → shorter RTO needs faster (and costlier) recovery; match the site type to the tightest RTO among the systems it must support.',
    'Confused about RPO vs backup frequency → RPO is the requirement; backup frequency is the mechanism. Backup frequency must be at least as tight as the RPO, never looser.',
  ],
  challenge:
    'Write a one-page recovery design memo: for the payment system, state its RTO and RPO, the current backup frequency gap (if any), the recommended alternate site type, and the estimated cost trade-off versus a cheaper option.',
  evidence: [
    {
      id: 'ev0',
      label: 'Recovery objectives and site selection transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Recovery design memo',
      type: 'report',
      placeholder: 'RTO, RPO, backup gap, recommended site type, cost trade-off',
    },
  ],
  securityLesson:
    'RTO and RPO are business requirements, not IT preferences. A backup schedule or a site choice that does not trace back to a specific number from the BIA is a guess dressed up as a plan.',
};

// ---------- Lab 2: Design Recovery Plans for Four Disaster Scenarios ----------

const LAB_18_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the prepared ransomware disaster scenario and its recovery considerations.',
    command: 'show disaster scenario ransomware',
    expected: 'A scenario walkthrough showing backup verification requirements before restoration.',
  },
  {
    id: 's1',
    instruction: 'Review the prepared server outage scenario.',
    command: 'show disaster scenario server outage',
    expected: 'A scenario walkthrough showing redundancy and restore-to-replacement-hardware steps.',
  },
  {
    id: 's2',
    instruction: 'Review the prepared network outage scenario.',
    command: 'show disaster scenario network outage',
    expected: 'A scenario walkthrough distinguishing a network outage from a server outage and requiring path diversity.',
  },
  {
    id: 's3',
    instruction: 'Review the prepared cloud provider outage scenario.',
    command: 'show disaster scenario cloud outage',
    expected: 'A scenario walkthrough highlighting reliance on provider SLA and the need for multi-region contingency.',
  },
  {
    id: 's4',
    instruction: 'Review the BC/DR test log for evidence of prior validation.',
    command: 'show bcdr test log',
    expected: 'A log showing which test types have and have not been performed for each scenario.',
  },
];

const LAB_18_1: Lab = {
  id: 'p18-lab-1',
  phaseId: 'phase-18',
  title: 'Design Recovery Plans for Four Disaster Scenarios',
  objective:
    'Review four simulated disaster scenarios (ransomware, server outage, network outage, cloud outage) and the BC/DR test log, then design a specific recovery response for each scenario and identify untested gaps.',
  securityConcepts: [
    'Disaster scenario response',
    'Ransomware recovery and immutable backups',
    'High availability and redundancy',
    'BC/DR testing types',
    'Continuity of operations and communications',
  ],
  environment: 'Deterministic BC/DR simulator — prepared outputs only',
  topology: 'Same fictional company (Meridian Retail Co.) with documented recovery procedures for four distinct disaster types',
  prerequisites: ['Complete Lab 1 (Calculate Recovery Objectives and Choose a Recovery Site)'],
  steps: LAB_18_1_STEPS,
  expectedResults: [
    'A specific recovery response designed for each of the four disaster scenarios',
    'The ransomware scenario\'s backup-immutability requirement correctly identified',
    'The cloud outage scenario\'s dependency on provider SLA correctly identified as distinct from a server outage',
    'At least one scenario identified as never having been tested at any level',
  ],
  verification: [
    'Learner can explain why the ransomware and server-outage scenarios require different recovery assumptions about backup availability',
    'Learner can explain why a network outage may require a different fix than a server outage even when the end-user symptom (system unreachable) looks the same',
    'Learner can recommend the next appropriate test type for the untested scenario found in the test log',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure how a network outage differs from a server outage → the server may be perfectly healthy; the path to reach it is what failed. The fix is path diversity, not server redundancy.',
    'Confused about test progression → tabletop → walkthrough/simulation → full-interruption. Recommend the next step up from whatever level the log shows, not the most rigorous test outright.',
  ],
  challenge:
    'Design a one-page recovery runbook for the ransomware scenario: detection, containment (cross-reference Phase 12 IR), backup verification steps, restoration order, and the specific test type that should validate this runbook next.',
  evidence: [
    {
      id: 'ev0',
      label: 'Disaster scenario review transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Recovery runbook',
      type: 'report',
      placeholder: 'Detection, containment, backup verification, restoration order, recommended next test',
    },
  ],
  securityLesson:
    'Four different disasters can produce the identical symptom — "the system is down" — but each has a different root cause and a different correct response. Treating every outage the same way is how a server-outage runbook gets used, ineffectively, against a ransomware attack.',
};

// ---------- Lessons ----------

const LESSON_18_L1: Lesson = {
  id: 'p18-lesson-0',
  phaseId: 'phase-18',
  title: 'BC/DR Fundamentals & Metrics',
  objectives: [
    'Distinguish Business Continuity Planning (BCP) from Disaster Recovery (DR)',
    'Explain RTO and RPO and how they trace back to the Business Impact Analysis',
    'Distinguish MTTR from MTBF',
    'Explain backup strategies and the 3-2-1 rule',
    'Explain high availability concepts including active-active, active-passive, and N+1 redundancy',
  ],
  sections: LESSON_18_L1_SECTIONS,
  quiz: LESSON_18_L1_QUIZ,
  concepts: [
    'bcp-vs-dr',
    'rto-rpo',
    'mttr-mtbf',
    'backup-strategies',
    'high-availability',
  ],
  homework:
    'Set RTO and RPO for three systems you rely on, then describe the backup and recovery approach each target actually requires. Note where the targets are unaffordable and what you would negotiate.',
  careerConnection:
    'Business Continuity Analyst — organisations facing any regulatory scrutiny need someone who can turn a BIA\'s MTD into a concrete RTO/RPO, then verify the backup schedule and architecture actually satisfy it.',
};

const LESSON_18_L2: Lesson = {
  id: 'p18-lesson-1',
  phaseId: 'phase-18',
  title: 'Recovery Sites, Testing & Disaster Scenarios',
  objectives: [
    'Distinguish hot, warm, cold, and cloud-based alternate site strategies',
    'Match a stated RTO and budget to the appropriate site type',
    'Explain BC/DR testing types from tabletop exercise through full-interruption test',
    'Design recovery responses for ransomware, server outage, network outage, and cloud outage scenarios',
    'Explain the requirements of an effective continuity communication plan',
  ],
  sections: LESSON_18_L2_SECTIONS,
  quiz: LESSON_18_L2_QUIZ,
  concepts: [
    'alternate-sites',
    'bcdr-testing',
    'disaster-scenarios',
    'continuity-communications',
  ],
  homework:
    'Write a one-page recovery plan for losing your primary laptop today: what you would restore, from where, in what order, and how long each step takes. Then test one step for real.',
  careerConnection:
    'Disaster Recovery Engineer — the analyst who can design a distinct, correct recovery runbook per disaster type (rather than one generic "restore from backup" plan) is the one an organisation trusts to lead the response when a real incident hits.',
};

// ---------- Phase export ----------

export const PHASE_18: Phase = {
  id: 'phase-18',
  number: 18,
  title: 'Business Continuity & Disaster Recovery',
  description:
    'Master BCP vs DR, RTO/RPO, MTTR/MTBF, backup strategies and the 3-2-1 rule, high availability, then alternate site selection, BC/DR testing, and disaster-specific recovery design for ransomware, server, network, and cloud outages.',
  examDomain: 'Security Program Management and Oversight',
  scene: 'soc',
  lessons: [LESSON_18_L1, LESSON_18_L2],
  labs: [LAB_18_0, LAB_18_1],
};
