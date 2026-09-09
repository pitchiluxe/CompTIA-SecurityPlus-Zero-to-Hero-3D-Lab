import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 12 — Incident Response
// Aligned with CompTIA Security+ SY0-701
//
// PROMPT.md names the seven lifecycle phases, eight incident types, and an
// eight-step console workflow. This phase closes the incident the platform has
// carried since Phase 0.
//
// The distinctive teaching is that containment is judged on two axes — does it
// stop the attacker, and does it preserve evidence — because the fastest
// actions usually fail the second.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p12-lesson-0',
    phaseId: 'phase-12',
    title: 'The Incident Response Lifecycle',
    objectives: [
      'Name the seven phases and what each one asks',
      'Explain why preparation decides how the other six go',
      'Distinguish detection from analysis',
      'Explain how lessons learned closes the loop',
    ],
    concepts: ['ir-lifecycle', 'preparation', 'detection', 'analysis'],
    homework:
      'Write the seven IR lifecycle stages from memory with one sentence each on what "done" looks like for that stage. Mark the stage most often skipped under pressure.',
    careerConnection:
      'Every IR interview asks you to walk the lifecycle. The answer that stands out explains why preparation is the phase that decides the others.',
    sections: [
      {
        id: 'p12-l0-s0',
        title: 'Concept — Seven phases, one loop',
        body: 'Preparation, detection, analysis, containment, eradication, recovery, lessons learned. Each asks a different question: are we ready, do we know, what happened, how do we stop it safely, is the attacker gone, are we back, and what do we change. The last feeds the first, which is what makes it a loop rather than a list.',
      },
      {
        id: 'p12-l0-s1',
        title: 'Concept — Preparation decides everything else',
        body: 'It is the only phase that happens before an incident, and almost everything an organisation does badly during a response was decided beforehand. Do the logs exist and are they retained long enough. Does anyone have authority to disconnect a production host at three in the morning without waiting for a manager. Is the contact list current. The Phase 7 investigation succeeded because someone configured DNS logging months earlier, for no particular incident.',
      },
      {
        id: 'p12-l0-s2',
        title: 'Concept — Detection and analysis are different',
        body: 'Detection is knowing something is wrong. Analysis is knowing what. They get conflated because the same person often does both, but they fail differently: detection fails when telemetry is missing, and analysis fails when the telemetry exists and nobody can correlate it. The Phase 7 alert was detection; the pivoting that followed was analysis.',
      },
      {
        id: 'p12-l0-s3',
        title: 'Concept — Why eradication and recovery are separate',
        body: 'Eradication removes the attacker, including every persistence mechanism. Recovery returns the business to service. Treating them as one step is how incidents recur — a host restored to service with a scheduled task still installed is not recovered, it is re-infected on a schedule. And recovery has its own test: business function restored, not merely threat removed.',
      },
      {
        id: 'p12-l0-s4',
        title: 'Concept — Blameless lessons learned',
        body: 'A blameless review is not politeness, it is accuracy. "The user clicked a link" is not a finding, because it is not actionable — people click, and a control set that depends on them never doing so is not a control set. Every item in a useful review names something the organisation can change: a policy not enforced, a logging setting off by default, a rule nobody removed.',
      },
      {
        id: 'p12-l0-s5',
        title: 'Example — Dwell time on the platform incident',
        body: 'The incident began at 02:41:58 with a DNS query and was detected at 03:02:10 — twenty minutes and twelve seconds of uncontested access, and detection arrived at stage five of six. In that window the attacker authenticated, moved to a second host, obtained root, and installed persistence in two places. Dwell time is the number that determines how much of that happens.',
      },
      {
        id: 'p12-l0-s6',
        title: 'Review — What must stick',
        body: 'Seven phases, and the loop closes from lessons learned back to preparation. Preparation is the only one before the incident and it decides the rest. Detection is knowing something is wrong; analysis is knowing what. Eradication removes the attacker, recovery returns the business — separately. Blameless means every finding is a control gap.',
      },
    ],
    quiz: [
      {
        id: 'p12-q0',
        type: 'mcq',
        stem: 'Which incident response phase happens before an incident occurs?',
        options: ['Detection', 'Preparation', 'Analysis', 'Lessons learned'],
        answer: 1,
        explanation:
          'Preparation is the only phase that happens in advance, and it determines how well the other six go — whether the logs exist, whether anyone has authority to act, whether the playbook is current.',
        domain: 'Security Operations',
        conceptId: 'preparation',
      },
      {
        id: 'p12-q1',
        type: 'scenario',
        stem: 'A host is cleaned of malware and returned to service, but reinfects two days later. Which phase most likely failed?',
        options: [
          'Detection — the original alert was wrong',
          'Eradication — a persistence mechanism was left in place',
          'Preparation — the playbook was out of date',
          'Recovery — the restore image was corrupt',
        ],
        answer: 1,
        explanation:
          'Reinfection after cleaning is the signature of incomplete eradication. A scheduled task, service or autostart entry survived and re-established access — which is why eradication and recovery are separate phases.',
        examClue:
          'Recurring incidents on the same host almost always point at eradication rather than detection.',
        domain: 'Security Operations',
        conceptId: 'ir-lifecycle',
      },
      {
        id: 'p12-q2',
        type: 'scenario',
        stem: 'A post-incident review concludes that "the user should not have clicked the link". Why is this an inadequate finding?',
        options: [
          'It is inaccurate — the user did click',
          'It is not actionable; users will eventually click, so a control set depending on them never doing so is not a control set',
          'Blameless reviews are optional for minor incidents',
          'The user should be formally disciplined instead',
        ],
        answer: 1,
        explanation:
          'Blameless is about accuracy rather than kindness. A finding must name something the organisation can change — DMARC not enforced, MFA relayable, logging disabled. "Do not click" changes nothing.',
        domain: 'Security Operations',
        conceptId: 'ir-lifecycle',
      },
    ],
  },

  {
    id: 'p12-lesson-1',
    phaseId: 'phase-12',
    title: 'Evidence, Volatility and Containment',
    objectives: [
      'Order evidence sources by volatility and explain the consequence',
      'Explain chain of custody and why gaps matter',
      'Judge containment actions on both stopping and preserving',
      'Explain why ransomware is the exception to capture-before-contain',
    ],
    concepts: ['evidence-handling', 'order-of-volatility', 'chain-of-custody', 'containment'],
    homework:
      'Write the order of volatility from most to least volatile, then describe one action that destroys the top of that list. Explain why "reboot it" is rarely a first step.',
    careerConnection:
      'The containment decision is the one you will be asked to make under time pressure, and the wrong instinct is the fast one.',
    sections: [
      {
        id: 'p12-l1-s0',
        title: 'Concept — Order of volatility',
        body: 'Collect the most volatile first: CPU registers and cache, then memory, then network state and running processes, then temporary filesystems, then disk, then remote logs, then physical configuration, then backups. The ordering is a constraint rather than a preference — collecting out of order does not delay the volatile items, it loses them.',
      },
      {
        id: 'p12-l1-s1',
        title: 'Concept — Why memory decides living-off-the-land cases',
        body: 'Memory sits at rank two and holds the running process, its full command line, and any keys or tokens in use. For an attack using legitimate tools, that is the entire case: the binary is signed and normal, and only the arguments were hostile. Those arguments existed in memory and, without command-line auditing, nowhere else. Reboot the host and the case is gone.',
      },
      {
        id: 'p12-l1-s2',
        title: 'Concept — Chain of custody',
        body: 'From the first capture onward, record who collected the evidence, when, from where, and every hand it subsequently passed through. Hash the image and record the hash. This matters even when nobody expects litigation, because you rarely know at hour one whether an incident becomes a legal matter — and evidence with a gap in its custody record is evidence that can be excluded.',
      },
      {
        id: 'p12-l1-s3',
        title: 'Concept — Containment on two axes',
        body: 'Every containment action is judged twice: does it stop the attacker, and does it preserve the evidence you need. The difficulty is that the fastest, most decisive-feeling actions usually fail the second test. Capture memory then isolate satisfies both. Blocking the C2 address preserves evidence but does not stop an attacker who can register new infrastructure. Reimaging stops them and destroys everything.',
      },
      {
        id: 'p12-l1-s4',
        title: 'Concept — Rebooting fails both tests',
        body: 'It is worth stating separately because it is the most common instinct. Rebooting destroys memory, and it does not remove the attacker, because the persistence mechanism re-establishes access at startup. It feels like decisive action and achieves the opposite of both goals. If you take one thing from this phase, take this.',
      },
      {
        id: 'p12-l1-s5',
        title: 'Concept — The ransomware exception',
        body: 'The general rule is capture volatile evidence before containing. Ransomware is the exception: encryption spreads faster than you can image a host, so isolation comes first and evidence second. Knowing when a rule does not apply is more useful than knowing the rule — and this is the one case where the usual ordering costs more than it saves.',
      },
      {
        id: 'p12-l1-s6',
        title: 'Scenario — When monitoring is defensible',
        body: 'Continuing to observe rather than containing is a legitimate strategy when the attacker is already contained and you are mapping their infrastructure. It is not legitimate while they hold active root on a second host, because every minute of observation is a minute of uncontested access. The same action is correct or negligent depending entirely on what else is true.',
      },
      {
        id: 'p12-l1-s7',
        title: 'Review — What must stick',
        body: 'Registers, memory, network state, temp files, disk, remote logs, configuration, backups. Memory holds the case in living-off-the-land incidents. Chain of custody from first capture, hashed. Containment is stopping AND preserving; rebooting fails both. Ransomware is the exception — isolate first. Monitoring is defensible only when the attacker is already contained.',
      },
    ],
    quiz: [
      {
        id: 'p12-q3',
        type: 'scenario',
        stem: 'An analyst finds a suspicious PowerShell process beaconing outbound and reboots the host to stop it. What is wrong with this?',
        options: [
          'Nothing — the beacon stops',
          'It destroys memory evidence and does not remove the attacker, because persistence re-establishes the beacon at startup',
          'Rebooting requires change approval',
          'The process would have terminated on its own',
        ],
        answer: 1,
        explanation:
          'Rebooting fails both containment tests. Memory held the command line — the entire case for a living-off-the-land attack — and the scheduled task restores the beacon. Capture memory first, then isolate at the network level.',
        examClue:
          'If an option destroys volatile evidence and does not remove persistence, it is wrong regardless of how decisive it feels.',
        domain: 'Security Operations',
        conceptId: 'containment',
      },
      {
        id: 'p12-q4',
        type: 'pbq',
        stem: 'Order these evidence sources by volatility, most volatile first: [0] Disk, [1] Memory, [2] Archival backups, [3] Network state.',
        options: ['Memory', 'Network state', 'Disk', 'Archival backups'],
        answer: [1, 3, 0, 2],
        explanation:
          'Memory, then network state, then disk, then backups. Collecting out of order does not delay the volatile items — it loses them.',
        domain: 'Security Operations',
        conceptId: 'order-of-volatility',
      },
      {
        id: 'p12-q5',
        type: 'scenario',
        stem: 'Ransomware is actively encrypting files across a file server. Should you capture memory before isolating the host?',
        options: [
          'Yes — order of volatility always applies',
          'No — this is the exception; encryption spreads faster than imaging, so isolate first',
          'Yes, but only if the encryption is slow',
          'It makes no difference either way',
        ],
        answer: 1,
        explanation:
          'The general rule is capture then contain. Ransomware inverts it because every second of delay encrypts more data. Knowing when a rule does not apply matters more than knowing the rule.',
        domain: 'Security Operations',
        conceptId: 'containment',
      },
      {
        id: 'p12-q6',
        type: 'mcq',
        stem: 'Why does chain of custody matter even when litigation is not expected?',
        options: [
          'It is required for insurance claims',
          'You rarely know early whether an incident becomes a legal matter, and a gap in the record cannot be repaired later',
          'It speeds up the investigation',
          'It is required to hash the evidence',
        ],
        answer: 1,
        explanation:
          'Custody records cannot be reconstructed after the fact. Since hour one rarely tells you whether an incident becomes legal, the record has to start at the first capture regardless.',
        domain: 'Security Operations',
        conceptId: 'chain-of-custody',
      },
    ],
  },

  {
    id: 'p12-lesson-2',
    phaseId: 'phase-12',
    title: 'Incident Types and the Response Report',
    objectives: [
      'Recognise the first indicators of each major incident type',
      'Name the containment priority and common mistake for each',
      'Structure an incident report',
      'Explain why stating what was ruled out matters',
    ],
    concepts: ['incident-types', 'incident-reporting', 'scoping'],
    homework:
      'Write a one-page incident report for an invented incident with observation, assessment, scope, action taken, and lessons learned. Keep every claim traceable to stated evidence.',
    careerConnection:
      'The report is the deliverable. An investigation nobody can read or act on has produced nothing.',
    sections: [
      {
        id: 'p12-l2-s0',
        title: 'Concept — Each type has a characteristic first move',
        body: 'Phishing: find everyone else who received it. Malware: isolate, then check whether it spread. Ransomware: isolate immediately. Compromised account: disable and revoke tokens. Privilege escalation: remove the privilege first, because it can undo everything else you do. Suspicious PowerShell: capture memory. Data exfiltration: stop the egress, then establish exactly what left. Unauthorised access: determine malice versus permissions error before acting.',
      },
      {
        id: 'p12-l2-s1',
        title: 'Concept — Each type has a characteristic mistake',
        body: 'The mistakes are as consistent as the responses. Deleting a phishing message before extracting its headers and recipient list. Letting antivirus quarantine the only sample. Restoring from backup and declaring a ransomware incident over, when modern ransomware exfiltrates first. Resetting a password without revoking tokens. Killing a process and losing its memory. Reporting that data "may have been accessed" instead of establishing what left.',
      },
      {
        id: 'p12-l2-s2',
        title: 'Concept — Unauthorised access is often not an attack',
        body: 'Worth separating out. Access to a system outside someone role is frequently a provisioning error rather than an intrusion — the mover process from Phase 5 granted something and never removed it. Establishing which before acting matters, because treating a colleague as an attacker over a permissions defect does real damage and is difficult to undo.',
      },
      {
        id: 'p12-l2-s3',
        title: 'Concept — The report structure',
        body: 'Executive summary in five sentences for someone who will read only that. Timeline with times and sources, facts only. Scope. Root cause — how they got in, not what they did afterwards. Response actions with who and when. Evidence and its custody. Lessons learned, blameless. Recommendations with owners and dates, because a recommendation without an owner is a wish.',
      },
      {
        id: 'p12-l2-s4',
        title: 'Concept — State what you ruled out',
        body: 'The scope section is the one people under-write. An incident report that says what was affected but not what was checked and cleared leaves the scope open indefinitely, and the question "how do you know it was only those two hosts" has no answer. Ruling things out is evidence work and it belongs in the report — without it, "we found it on two hosts" becomes "we do not know how many hosts" within a week.',
      },
      {
        id: 'p12-l2-s5',
        title: 'Review — What must stick',
        body: 'Each incident type has a characteristic first move and a characteristic mistake. Unauthorised access is often a provisioning error, so establish which before acting. Report structure: summary, timeline, scope, root cause, actions, evidence, lessons, recommendations. Root cause is how they got in. Recommendations need owners and dates. State what you ruled out.',
      },
    ],
    quiz: [
      {
        id: 'p12-q7',
        type: 'scenario',
        stem: 'A ransomware incident is resolved by restoring from clean backups. Why might the incident not be over?',
        options: [
          'Backups are never fully trustworthy',
          'Modern ransomware exfiltrates data before encrypting, so a confidentiality breach survives the restore',
          'The encryption keys remain on the system',
          'Restored files must be re-scanned',
        ],
        answer: 1,
        explanation:
          'Double extortion means the availability impact is only half of it. Restoring addresses the encryption and does nothing about the copy the attacker took — which is a reportable disclosure in many jurisdictions.',
        examClue:
          'Ransomware questions mentioning backups usually turn on the exfiltration that preceded the encryption.',
        domain: 'Security Operations',
        conceptId: 'incident-types',
      },
      {
        id: 'p12-q8',
        type: 'scenario',
        stem: 'An employee is found accessing a finance system outside their role. What should be established before treating this as an attack?',
        options: [
          'Whether they have been disciplined before',
          'Whether the access is a provisioning error rather than intentional misuse',
          'Whether the finance system is critical',
          'Whether their manager approves',
        ],
        answer: 1,
        explanation:
          'Access outside a role is frequently a mover-process defect — an entitlement granted and never removed. Treating a colleague as an attacker over a permissions error causes real and lasting damage.',
        domain: 'Security Operations',
        conceptId: 'incident-types',
      },
      {
        id: 'p12-q9',
        type: 'mcq',
        stem: 'Why should an incident report state what was investigated and ruled out?',
        options: [
          'To demonstrate the effort involved',
          'Without it the scope stays open indefinitely and "we found it on two hosts" becomes "we do not know how many"',
          'It is a regulatory requirement in all jurisdictions',
          'To justify the response cost',
        ],
        answer: 1,
        explanation:
          'Ruling things out is evidence work. A report listing only what was affected cannot answer how you know the boundary, so the incident expands in the retelling.',
        domain: 'Security Operations',
        conceptId: 'incident-reporting',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p12-lab-0',
    phaseId: 'phase-12',
    title: 'Work the Lifecycle and Handle Evidence',
    objective:
      'Walk the seven IR phases, order evidence by volatility, and explain why rebooting a compromised host fails on both containment axes.',
    securityConcepts: ['IR lifecycle', 'Order of volatility', 'Chain of custody'],
    environment: 'Deterministic simulator plus the Incident Console',
    topology: 'IR-2026-0908-01 across WS-01, SRV-01, DC-01 and analyst1',
    prerequisites: ['Complete Phase 11'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the seven-phase lifecycle.',
        command: 'explain ir lifecycle',
        expected: 'Seven phases, with preparation identified as the one that decides the others.',
      },
      {
        id: 's1',
        instruction: 'Review the order of volatility and its practical consequence.',
        command: 'explain order of volatility',
        expected: 'Eight ranks, with the reboot warning and chain-of-custody requirement.',
      },
      {
        id: 's2',
        instruction: 'Open the Incident Console and review the incident and evidence steps.',
        expected: 'The incident carried since Phase 0, with the volatility ordering shown.',
      },
    ],
    expectedResults: [
      'Seven phases named with the question each asks',
      'Volatility ordering understood as a constraint rather than a preference',
      'Chain of custody understood as starting at first capture',
      'The reboot instinct identified as failing both axes',
    ],
    verification: [
      'Learner can explain why preparation decides the other phases',
      'Learner can state why memory matters most in living-off-the-land cases',
      'Learner can explain why a custody gap cannot be repaired later',
    ],
    troubleshooting: [
      'Detection versus analysis unclear → detection is knowing something is wrong; analysis is knowing what.',
      'Unsure why custody matters without litigation → you do not know at hour one whether it becomes legal.',
    ],
    challenge:
      'Write the preparation checklist that would have improved this response: the logging, the authority, and the contacts that needed to exist beforehand. Then identify which single preparation item made the Phase 7 investigation possible at all.',
    evidence: [
      {
        id: 'ev0',
        label: 'Evidence handling plan',
        type: 'report',
        placeholder: 'Source, volatility rank, capture method, custody record',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Preparation is the only phase that happens before an incident, and almost everything done badly during a response was decided beforehand. The Phase 7 investigation worked because someone configured DNS logging months earlier for no particular reason.',
  },

  {
    id: 'p12-lab-1',
    phaseId: 'phase-12',
    title: 'Contain Without Destroying Evidence',
    objective:
      'Choose a containment plan that both stops the attacker and preserves evidence, and explain why the fastest options fail.',
    securityConcepts: ['Containment', 'Evidence preservation', 'Scoping'],
    environment: 'Interactive Incident Console with two-axis containment grading',
    topology: 'WS-01 beaconing, SRV-01 with root persistence, analyst1 compromised',
    prerequisites: ['Complete "Work the Lifecycle and Handle Evidence"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the containment trade-off matrix.',
        command: 'explain containment tradeoff',
        expected: 'Every action judged on stopping the attacker and preserving evidence.',
      },
      {
        id: 's1',
        instruction: 'In the Incident Console, reconstruct the timeline from the shuffled events.',
        expected: 'Eleven events across six sources, in chronological order.',
      },
      {
        id: 's2',
        instruction: 'Identify the affected assets, including the second host.',
        expected: 'Four confirmed; FW-01 and SW-01 are not in scope.',
      },
      {
        id: 's3',
        instruction: 'Build the containment plan and submit it.',
        expected: 'Graded on both axes — attacker stopped and evidence intact.',
      },
    ],
    expectedResults: [
      'Timeline reconstructed across six sources',
      'Scope including SRV-01, which the alert did not name',
      'Containment plan that satisfies both axes',
      'Destructive options recognised and avoided',
    ],
    verification: [
      'Learner can explain why capture-then-isolate beats reimage',
      'Learner can explain why blocking the C2 address is insufficient alone',
      'Learner can explain when monitoring instead of containing is defensible',
    ],
    troubleshooting: [
      'Tempted to reimage → it stops this host and destroys the evidence, and the credentials still work.',
      'Forgot SRV-01 → the alert named WS-01. Scope follows the investigation, not the alert.',
    ],
    challenge:
      'Reimaging genuinely stops the attacker on that host and is still usually the wrong early call. Write three sentences explaining to a manager who wants it done immediately why you are asking for twenty minutes first.',
    evidence: [
      {
        id: 'ev0',
        label: 'Containment plan',
        type: 'report',
        placeholder: 'Action, stops attacker?, preserves evidence?, justification',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The fastest, most decisive-feeling containment actions usually destroy the evidence. Rebooting fails both tests at once — it discards memory and the persistence restores the beacon at startup.',
  },

  {
    id: 'p12-lab-2',
    phaseId: 'phase-12',
    title: 'Close the Incident and Write the Report',
    objective:
      'Complete eradication and recovery, run a blameless lessons-learned review, and write the report that closes the incident carried since Phase 0.',
    securityConcepts: ['Eradication', 'Recovery', 'Lessons learned', 'Incident reporting'],
    environment: 'Incident Console plus the deterministic simulator',
    topology: 'Full remediation across both hosts and the compromised identity',
    prerequisites: ['Complete "Contain Without Destroying Evidence"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the eradication checklist for both hosts.',
        command: 'show eradication checklist',
        expected: 'Capture-before-remove on every persistence item, across both hosts.',
      },
      {
        id: 's1',
        instruction: 'Review the blameless lessons-learned findings.',
        command: 'show lessons learned',
        expected: 'Five control gaps, each first identified in an earlier phase.',
      },
      {
        id: 's2',
        instruction: 'Review the reconstructed timeline and dwell time.',
        command: 'show incident timeline',
        expected: 'Twenty minutes twelve seconds from first query to detection.',
      },
      {
        id: 's3',
        instruction: 'Review the report structure.',
        command: 'show ir report template',
        expected: 'Eight sections, with scope requiring what was ruled out.',
      },
      {
        id: 's4',
        instruction: 'Compare the response patterns across all eight incident types.',
        command: 'compare incident types',
        expected:
          'Containment priority and common mistake for each, plus the ransomware exception.',
      },
    ],
    expectedResults: [
      'Eradication covering both hosts and the identity',
      'Recovery distinguished from eradication',
      'Lessons learned framed blamelessly as control gaps',
      'Report structure understood, including ruling out',
    ],
    verification: [
      'Learner can explain why cleaning only WS-01 leaves the incident open',
      'Learner can name the single highest-value control change',
      'Learner can explain why the scope section must state what was ruled out',
    ],
    troubleshooting: [
      'Eradication feels complete after WS-01 → SRV-01 still has a root systemd unit. Scope follows the investigation.',
      'Unsure what belongs in root cause → how they got in, not what they did afterwards.',
    ],
    challenge:
      'Write the executive summary — five sentences, for someone who will read only that. Then state the single control change that would have had the largest effect, and justify why it outranks the other four findings.',
    evidence: [
      {
        id: 'ev0',
        label: 'Incident report',
        type: 'report',
        placeholder:
          'Summary, timeline, scope, root cause, actions, evidence, lessons, recommendations',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'This incident began in Phase 0 as an unexplained PowerShell session and closes here as a documented, remediated, blamelessly reviewed case. Every control gap in the review was a finding from an earlier phase — which is what a security programme looks like when it works.',
  },
];

export const PHASE_12: Phase = {
  id: 'phase-12',
  number: 12,
  title: 'Incident Response',
  description:
    'The seven-phase lifecycle, evidence handling and order of volatility, and containment judged on two axes — stopping the attacker and preserving the evidence. Closes the incident this platform has carried since Phase 0.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: LESSONS,
  labs: LABS,
};
