import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 22 — Security Troubleshooting Center
// Aligned with CompTIA Security+ SY0-701 (Domain 4: Security Operations)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Structured Security Troubleshooting ----------

const LESSON_22_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p22-l1-s0',
    title: 'Concept — Why Structure Beats Instinct',
    body:
      'The single biggest risk in any investigation is not missing evidence — it is reaching a conclusion before gathering it. Confirmation bias pushes an investigator toward the first plausible story and then reads every subsequent fact as support for it, discarding or explaining away anything that does not fit. A structured methodology counters this by forcing a fixed order: gather evidence from every available source first, form a theory only once that evidence is in front of you, then test the theory against the evidence rather than the other way around. This platform builds that discipline directly into the interface — the diagnosis fields are always the last thing you touch, never the first.',
  },
  {
    id: 'p22-l1-s1',
    title: 'Concept — The Eight-Panel Investigation Interface',
    body:
      'Every scenario in this phase exposes the same eight panels: a network diagram (what path did traffic actually take?), device status (what is each involved system reporting about itself?), logs (the raw, timestamped record of what happened), alerts (what automated detection already flagged, and from which rule?), user information (who is involved, and does their profile support or contradict the activity?), process information (what actually executed, on which host?), a timeline (the same facts as the logs, but ordered into a sequence so the escalation becomes visible), and previous change history (was this the result of an authorised, documented change, or does no record exist?). No single panel tells the whole story — the network diagram might show an impossible path while the logs show a real login, and only combining them reveals a token reused outside its normal route.',
  },
  {
    id: 'p22-l1-s2',
    title: 'Concept — Building and Testing a Theory of Probable Cause',
    body:
      'Once evidence is gathered, a theory of probable cause is a specific, falsifiable claim — "the attacker is reusing a session token obtained separately" — not a vague feeling that something is wrong. A good theory makes a prediction: if it is true, certain evidence should exist (here, a session resumption with no corresponding fresh authentication event) and certain evidence should be absent (a new MFA challenge). Testing the theory means checking both predictions against the actual panels, not just the ones that already seem to support it. A theory that cannot be tested against the available evidence is not yet a diagnosis — it is a guess.',
  },
  {
    id: 'p22-l1-s3',
    title: 'Concept — Root Cause vs. Symptom vs. Contributing Factor',
    body:
      'A symptom is what triggered the alert (an impossible-travel login, a burst of failed authentications). A contributing factor is a condition that made the incident possible or more severe but did not, by itself, cause it (a service account exempted from MFA, a firewall rule missing an expiration date, a 63-day-old unpatched vulnerability). The root cause is the specific action or exploited weakness that produced the symptom (a reused refresh token, a password-spraying attack, an unpatched local-privilege-escalation flaw). Fixing only the symptom (resetting one password) while ignoring the root cause (a still-valid session token) leaves the actual problem completely untouched — and fixing the root cause while ignoring a contributing factor (patching the exploited CVE but leaving the MFA exemption in place) leaves the door open for the next attempt.',
  },
  {
    id: 'p22-l1-s4',
    title: 'Concept — Change History as an Investigative Shortcut',
    body:
      'A striking number of real incidents trace back to a change: a firewall rule broader than intended, an MFA exemption approved once and never reviewed, a patch cycle that landed before a vulnerability existed. Checking change history early answers a decisive question fast — was this activity the result of a known, authorised, documented change, or does no record exist for it? "No record exists" does not always mean malicious, but it always means the activity needs an explanation from somewhere, and the absence of a ticket is itself a fact worth citing in a finding, not a gap to quietly work around.',
  },
  {
    id: 'p22-l1-s5',
    title: 'Example — Working the Eight Panels for One Case',
    body:
      'The network diagram shows a session reaching a SaaS portal directly from an external IP, bypassing the VPN entirely. Device status shows the workstation is clean but the identity provider is flagged for authenticating the session via an existing token. The logs show a normal 08:02 office login followed by a token-only resumption at 08:41 with no new MFA challenge. The alert queue independently flags both the impossible-travel pattern and a new mailbox forwarding rule. User information shows no travel on file. Process information on the workstation is clean — this incident lives at the identity layer, not the endpoint. The timeline orders these into an escalation: login, token reuse, data export, persistence. Change history shows the forwarding rule has no accompanying ticket. Only after all eight panels are reviewed does the root cause — token reuse, not a fresh compromised password — become the only theory the evidence actually supports.',
  },
  {
    id: 'p22-l1-s6',
    title: 'Review — What Must Stick',
    body:
      'Gather evidence before forming a theory, and test a theory against evidence rather than reading evidence to fit a theory. The eight investigation panels are network diagram, device status, logs, alerts, user information, process information, timeline, and change history — no single one is sufficient alone. Distinguish symptom (what triggered the alert), contributing factor (what made it possible or worse), and root cause (what actually produced it) — a correct response addresses the root cause and any contributing factors, not just the symptom. Change history quickly answers whether activity was authorised, and an absent record is itself evidence.',
  },
];

const LESSON_22_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p22-q0',
    type: 'mcq',
    stem: 'What is the primary risk that a structured troubleshooting methodology is designed to counter?',
    options: [
      'Confirmation bias — reaching a conclusion before gathering evidence, then reading later facts as support for it',
      'Spending too much time collecting evidence',
      'Using automated tools instead of manual review',
      'Documenting findings in too much detail',
    ],
    answer: 0,
    explanation:
      'Structured methodology forces evidence-gathering before theory-forming specifically to prevent an investigator from anchoring on an early, unverified explanation.',
    domain: 'Security Operations',
    conceptId: 'troubleshooting-methodology',
  },
  {
    id: 'p22-q1',
    type: 'mcq',
    stem: 'What question does the network diagram panel of an investigation interface primarily answer?',
    options: [
      'What path did the traffic or session actually take, and does it match the expected/normal route?',
      'Who is the user associated with the account?',
      'What was the exact wording of the change ticket?',
      'What process executed on the endpoint?',
    ],
    answer: 0,
    explanation:
      'The network diagram shows the actual path traffic took — revealing, for example, a session that bypassed the VPN entirely and reached a portal directly from an external IP.',
    domain: 'Security Operations',
    conceptId: 'investigation-interface',
  },
  {
    id: 'p22-q2',
    type: 'mcq',
    stem: 'Device status shows a workstation as fully "UP" with no malware detected. What can be correctly concluded from this alone?',
    options: [
      'Only that this specific device shows no signs of compromise — the incident could still involve a different layer entirely, such as identity or session-level compromise',
      'The entire incident is definitely a false positive',
      'No further investigation panels need to be reviewed',
      'The user associated with the device is cleared of any involvement',
    ],
    answer: 0,
    explanation:
      'A clean endpoint status only clears that specific device — it says nothing about other layers (identity, session tokens, network) where the actual compromise may be occurring.',
    domain: 'Security Operations',
    conceptId: 'investigation-interface',
  },
  {
    id: 'p22-q3',
    type: 'mcq',
    stem: 'In an incident where a stale, MFA-exempt service account password enabled a successful password-spraying attack, what is the "contributing factor" as distinct from the root cause?',
    options: [
      'The MFA exemption and stale password — conditions that made the attack easier to succeed, without themselves being the attack',
      'The password-spraying attempts themselves',
      'The alert that first flagged the failed logins',
      'The specific source IPs used in the attack',
    ],
    answer: 0,
    explanation:
      'The root cause is the spraying attack itself; the MFA exemption and stale password are contributing factors that made that specific account the one where it succeeded.',
    domain: 'Security Operations',
    conceptId: 'root-cause-analysis',
  },
  {
    id: 'p22-q4',
    type: 'mcq',
    stem: 'Why does checking previous change history early in an investigation save time?',
    options: [
      'It quickly answers whether the observed activity was the result of a known, authorised, documented change, narrowing the remaining possibilities',
      'It always definitively proves whether an incident is malicious',
      'It replaces the need to review logs entirely',
      'It only matters for network device configuration, never for accounts',
    ],
    answer: 0,
    explanation:
      'Change history does not always resolve the case, but it quickly separates "there is a ticket explaining this" from "there is no record at all," which reshapes where the rest of the investigation should focus.',
    domain: 'Security Operations',
    conceptId: 'change-management',
  },
  {
    id: 'p22-q5',
    type: 'mcq',
    stem: 'What does ordering evidence into a timeline add that a raw log table alone does not make as visible?',
    options: [
      'The escalation — how each step follows from and depends on the one before it going unnoticed',
      'The exact IP address of the attacker',
      'Whether the evidence came from a real or simulated source',
      'The severity rating assigned by the SIEM',
    ],
    answer: 0,
    explanation:
      'A timeline turns the same facts into a visible sequence — login, then token reuse, then data export, then persistence — making the escalating dependency between steps clear in a way an unordered log table does not.',
    domain: 'Security Operations',
    conceptId: 'timeline-analysis',
  },
  {
    id: 'p22-q6',
    type: 'scenario',
    stem: 'An investigation shows a session was resumed using an existing token, with no corresponding new authentication event in the logs. Why does this specific absence matter more than most present-tense facts in the case?',
    options: [
      'It directly indicates the session was not freshly authenticated — meaning a password reset alone would not have stopped it, since no new password prompt was ever involved',
      'Absences in evidence are never meaningful and should be ignored',
      'It proves the identity provider itself has been compromised',
      'It means the logging system has a bug and cannot be trusted',
    ],
    answer: 0,
    explanation:
      'Noticing what did not happen (a fresh MFA challenge) is what correctly localises this as token reuse rather than a freshly stolen password — a harder but essential investigative skill.',
    domain: 'Security Operations',
    conceptId: 'evidence-analysis',
  },
  {
    id: 'p22-q7',
    type: 'scenario',
    stem: 'An analyst observes a critical, unpatched vulnerability sitting unexploited for weeks, and separately observes an active incident where an attacker exploited that exact vulnerability. How should the analyst describe these two findings?',
    options: [
      'The unpatched vulnerability is a contributing factor (and, on its own, a vulnerability finding); the active exploitation event is the incident whose root cause is the exploit of that vulnerability',
      'They are unrelated and should be tracked as two independent, unconnected findings',
      'The vulnerability finding is more urgent than the confirmed active incident',
      'Only the vulnerability finding needs a response; the active incident requires none',
    ],
    answer: 0,
    explanation:
      'A vulnerability is a weakness (a contributing factor / standalone finding) until it is actually exploited, at which point the exploitation event becomes an incident whose root cause traces back to that same weakness.',
    domain: 'Security Operations',
    conceptId: 'root-cause-analysis',
  },
  {
    id: 'p22-q8',
    type: 'scenario',
    stem: 'Two independent alerts — one flagging impossible-travel geolocation, another flagging an anomalous mailbox rule creation — both reference the same user account within minutes of each other. What does correlating them add beyond treating each alert individually?',
    options: [
      'It turns two moderately suspicious signals from different detection logic into one clear, higher-confidence incident, because independent methods agreeing on the same account and timeframe is stronger evidence than either alone',
      'Correlating alerts from different detection rules is not a valid investigative technique',
      'It proves the two alerts must share the exact same root cause with no further verification needed',
      'It means one of the two alerts must be a false positive'
    ],
    answer: 0,
    explanation:
      'Independent detection logic converging on the same account and timeframe substantially raises confidence — this is a core reason SIEM/alert correlation exists.',
    domain: 'Security Operations',
    conceptId: 'alert-correlation',
  },
  {
    id: 'p22-q9',
    type: 'scenario',
    stem: 'An analyst sees an alert and immediately decides the cause before reviewing device status, user information, or change history — then interprets every subsequent panel as confirming that first guess. What has occurred, and what should the analyst have done instead?',
    options: [
      'Confirmation bias occurred; the analyst should have reviewed all available evidence panels first and formed a theory only after, testing it against the full evidence set',
      'This is the correct and efficient way to conduct any investigation',
      'This is only a problem if the initial guess later turns out to be wrong',
      'Reviewing additional evidence panels after an initial theory is unnecessary extra work',
    ],
    answer: 0,
    explanation:
      'Forming a conclusion before gathering evidence — and then reading subsequent facts as confirmation — is the definition of confirmation bias, which structured methodology exists specifically to prevent.',
    domain: 'Security Operations',
    conceptId: 'troubleshooting-methodology',
  },
  {
    id: 'p22-q-pbq',
    type: 'pbq',
    stem: 'Order the steps of the structured troubleshooting method.',
    options: [
      'Identify and define the reported symptom',
      'Gather evidence from logs, network, and affected users',
      'Generate a hypothesis and test it against the evidence',
      'Implement the fix, then verify and document the result',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'A clear symptom keeps the investigation focused, evidence prevents guessing, a testable hypothesis narrows the cause, and verification proves the fix.',
    domain: 'Security Operations',
    conceptId: 'troubleshooting-methodology',
  },
];

// ---------- Lesson 2: Recognising the Ten Common Alert Categories ----------

const LESSON_22_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p22-l2-s0',
    title: 'Concept — Identity-Related Alerts',
    body:
      'A compromised account typically shows an impossible-travel or anomalous-location pattern, often paired with a session or token resumption that skips a fresh authentication event — the giveaway is usually an absence (no new MFA challenge) rather than a presence. A failed authentication storm can be either a brute-force attack (many attempts concentrated on one account) or a password-spraying attack (few attempts spread across many accounts, specifically designed to stay under per-account lockout thresholds) — the shape of the attempts across accounts is what distinguishes the two, and a spraying attack that succeeds usually does so against the one account with the weakest additional control, such as a missing MFA enrollment.',
  },
  {
    id: 'p22-l2-s1',
    title: 'Concept — Email and Malware Alerts',
    body:
      'A phishing incident is confirmed by a lookalike or spoofed sending domain and delivery to multiple recipients, but the severity of the response should not hinge only on whether one recipient submitted credentials — an email sitting unread or unreported in other inboxes is still exposure. A malware alert frequently arrives as "already contained" (EDR terminated and quarantined the process), which is easy to misread as "resolved" — but automatic containment stops one moment on one host; confirming the actual blast radius (were other systems touched? is the same hash present elsewhere?) is a separate, still-required step.',
  },
  {
    id: 'p22-l2-s2',
    title: 'Concept — Endpoint Activity Alerts',
    body:
      'Suspicious PowerShell typically shows an unusual parent process (a document application rather than an admin\'s interactive session), a hidden window, an encoded command, and in-memory execution with no file written to disk — recognisable as a fileless, living-off-the-land technique rather than by any single element alone. Privilege escalation frequently ends not with continued use of the originally compromised account, but with the creation of a new, less-suspicious privileged account for persistence — meaning disabling only the original account can miss the actual durable foothold.',
  },
  {
    id: 'p22-l2-s3',
    title: 'Concept — Infrastructure Alerts',
    body:
      'A vulnerability finding is a weakness, not yet a confirmed incident — the distinction matters because the correct response (patch or compensating control, prioritised by CVSS score, exposure, and exploit availability) is different from an incident response until (or unless) exploitation is confirmed. A misconfigured firewall finding most often traces back to a change implemented more broadly than the request that authorised it — commonly a "temporary" rule with no expiration date, which is exactly why every temporary exception should carry one.',
  },
  {
    id: 'p22-l2-s4',
    title: 'Concept — Network-Layer Alerts',
    body:
      'A DNS anomaly consistent with tunnelling shows a specific behavioural shape — high query volume, a single external destination, and high-entropy subdomains — that a signature-based tool may not catch at all, since no known-malware hash or pattern needs to be involved. Suspicious network traffic consistent with lateral movement shows a single internal host suddenly connecting to many other internal hosts (commonly via SMB), succeeding on a subset using a shared or reused credential, and then establishing persistence on the hosts it reached — the shared-credential reuse is usually what let a limited number of successes cascade at all.',
  },
  {
    id: 'p22-l2-s5',
    title: 'Example — Matching a Symptom to a Category Before Investigating Further',
    body:
      'An alert reads: "workstation initiating connections to 40+ internal hosts on port 445 within minutes, three authentications succeeded." Before opening any panel, the shape alone (one host, many internal targets, one protocol, a handful of successes) already points to suspicious network traffic / lateral movement rather than, say, a DNS anomaly (which would show one external domain, not many internal hosts) or a compromised account (which would centre on one identity\'s login pattern, not one host\'s outbound connections). Recognising the category from the symptom\'s shape focuses which panels to check first — it does not replace checking them.',
  },
  {
    id: 'p22-l2-s6',
    title: 'Review — What Must Stick',
    body:
      'Compromised accounts are often revealed by an absence (no fresh MFA event) more than a presence. Password spraying is distinguished from brute force by the shape across accounts (many accounts, few attempts each) rather than by volume alone. A malware alert marked "contained" still requires blast-radius verification. Privilege escalation often ends in a new persistent account, not continued use of the original one. A vulnerability finding and a confirmed incident require different responses. Firewall misconfigurations frequently trace to an unscoped "temporary" change. DNS tunnelling is a behavioural pattern a signature match may miss; lateral movement via SMB is frequently enabled by shared or reused credentials.',
  },
];

const LESSON_22_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p22-q10',
    type: 'mcq',
    stem: 'What is often the most decisive clue that a login is the result of a reused session or refresh token, rather than a fresh, legitimate authentication?',
    options: [
      'The absence of a new MFA (multi-factor authentication) challenge event at the time of the suspicious session',
      'A high volume of failed login attempts',
      'The presence of a valid corporate device certificate',
      'A slow network connection speed'
    ],
    answer: 0,
    explanation:
      'Fresh authentication normally produces a new MFA event; a session resumed purely via an existing token skips this step entirely, and that absence is the key diagnostic clue.',
    domain: 'Security Operations',
    conceptId: 'account-compromise',
  },
  {
    id: 'p22-q11',
    type: 'mcq',
    stem: 'What distinguishes a password-spraying attack from a traditional brute-force attack?',
    options: [
      'Spraying uses few attempts spread across many different accounts (to avoid per-account lockouts); brute force concentrates many attempts on one account',
      'Spraying only ever targets a single account with unlimited attempts',
      'Brute force always succeeds and spraying never does',
      'There is no meaningful difference between the two techniques'
    ],
    answer: 0,
    explanation:
      'The shape across accounts is the distinguishing feature: spraying stays under individual lockout thresholds by spreading few attempts across many accounts, while brute force repeatedly targets one.',
    domain: 'Security Operations',
    conceptId: 'password-spraying',
  },
  {
    id: 'p22-q12',
    type: 'mcq',
    stem: 'A phishing email reaches 14 mailboxes; only one recipient clicked the link and no credentials were submitted. What is the correct framing of this incident\'s severity?',
    options: [
      'Still a real incident requiring domain blocking and mailbox search-and-purge — the other 13 recipients may not yet have acted on or reported the message',
      'A false alarm requiring no further action since no credentials were submitted',
      'Only the one recipient who clicked needs any follow-up',
      'This can only be classified as an incident if malware was also downloaded'
    ],
    answer: 0,
    explanation:
      'A phishing message delivered broadly remains exposure across every recipient who has not yet reported or acted on it, regardless of what happened with the one recipient who clicked.',
    domain: 'Security Operations',
    conceptId: 'phishing',
  },
  {
    id: 'p22-q13',
    type: 'mcq',
    stem: 'EDR automatically terminates and quarantines a malicious process seconds after it launched. Why is this not, by itself, equivalent to a completed incident response?',
    options: [
      'Automatic containment addresses one moment on one host; confirming the actual blast radius (other systems touched, same indicator seen elsewhere) is a separate required step',
      'EDR containment actions are never actually effective',
      'A quarantined file always still poses an active, ongoing threat',
      'This means the vulnerability that allowed execution has already been patched'
    ],
    answer: 0,
    explanation:
      'Tool-level containment stops the immediate action, but full incident response requires scoping the blast radius, which containment alone does not confirm or provide.',
    domain: 'Security Operations',
    conceptId: 'incident-response',
  },
  {
    id: 'p22-q14',
    type: 'mcq',
    stem: 'What combination of characteristics identifies "suspicious PowerShell" as a fileless, living-off-the-land technique rather than routine administration?',
    options: [
      'An unusual parent process (such as a document application), a hidden window, an encoded command, and execution entirely in memory with no file written to disk',
      'The mere presence of PowerShell running anywhere on a host',
      'A script that writes multiple files to a temporary folder',
      'A process that requests elevated permissions through a standard UAC prompt'
    ],
    answer: 0,
    explanation:
      'No single element proves malicious intent — it is the combination (unexpected parent process, hidden window, encoding, in-memory execution) that distinguishes this from legitimate administrative PowerShell use.',
    domain: 'Security Operations',
    conceptId: 'living-off-the-land',
  },
  {
    id: 'p22-q15',
    type: 'mcq',
    stem: 'Why can disabling only the originally compromised account fail to fully remediate a privilege-escalation incident?',
    options: [
      'The attacker may have already created a new, separate privileged account for persistence, which survives even after the original account is disabled',
      'Disabling any account always automatically removes every other account it created',
      'Privilege escalation incidents never involve creating any new accounts',
      'This action is always fully sufficient and complete on its own'
    ],
    answer: 0,
    explanation:
      'Escalation chains frequently end in creating a new privileged account precisely so the attacker is no longer dependent on the originally compromised identity — disabling only that original account misses this new foothold.',
    domain: 'Security Operations',
    conceptId: 'privilege-escalation',
  },
  {
    id: 'p22-q16',
    type: 'mcq',
    stem: 'Why does a critical, unexploited vulnerability finding require a different response process than a confirmed active incident?',
    options: [
      'A vulnerability finding is a weakness prioritised for patching/compensating controls, while a confirmed incident requires full incident response (containment, investigation, recovery) — conflating the two leads to a mismatched response',
      'Vulnerability findings never require any urgent action of any kind',
      'Confirmed incidents and vulnerability findings always require the exact same response steps',
      'Vulnerability findings should always be treated with lower priority than any confirmed incident, regardless of severity'
    ],
    answer: 0,
    explanation:
      'A vulnerability finding and a confirmed incident sit at different points on the same risk timeline and require correspondingly different processes — treating an unexploited critical finding with full incident-response urgency (or vice-versa) mismatches the response to the situation.',
    domain: 'Security Operations',
    conceptId: 'vulnerability-management',
  },
  {
    id: 'p22-q17',
    type: 'mcq',
    stem: 'A firewall rule described in its change ticket as "temporary access for vendor testing" is later found still active six days later with no expiration date and unrelated external traffic reaching it. What is the systemic lesson?',
    options: [
      'Every temporary rule or exception should carry an explicit expiration date to prevent this exact kind of long-lived, forgotten exposure',
      'Vendor testing access should never be granted under any circumstances',
      'Firewall rules do not need to match the scope described in their change ticket',
      'This risk is unique to this specific vendor and does not generalise to other temporary changes'
    ],
    answer: 0,
    explanation:
      'The recurring root cause across many real-world firewall misconfigurations is exactly this pattern — a "temporary" change with no expiration date that quietly becomes permanent exposure.',
    domain: 'Security Operations',
    conceptId: 'firewall-misconfiguration',
  },
  {
    id: 'p22-q18',
    type: 'scenario',
    stem: 'One alert shows a single host generating high-volume DNS TXT queries to one external domain with high-entropy subdomains. A separate alert shows a different host generating high-volume SMB connections to dozens of internal hosts. How should an analyst distinguish which alert category each represents before investigating further?',
    options: [
      'The DNS pattern (one external domain, high-entropy subdomains) is consistent with DNS tunnelling/data exfiltration; the SMB pattern (one host, many internal targets, a protocol used for file/authentication services) is consistent with lateral movement — the shape and destination type differ meaningfully between the two',
      'Both alerts necessarily represent the exact same category of incident',
      'The DNS pattern always indicates lateral movement, and the SMB pattern always indicates data exfiltration',
      'Neither pattern provides any useful information before opening every investigation panel'
    ],
    answer: 0,
    explanation:
      'The destination pattern (one external domain vs. many internal hosts) and protocol (DNS vs. SMB) are enough to correctly hypothesise DNS tunnelling versus lateral movement before diving into the full evidence set — recognising the shape focuses, but does not replace, the investigation.',
    domain: 'Security Operations',
    conceptId: 'dns-tunnelling',
  },
];

// ---------- Lab 1: Investigate a Compromised Account Using the Investigation Interface ----------

const LAB_22_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the network diagram to see what path the flagged session actually took.',
    command: 'show network diagram',
    expected: 'A path showing the flagged session reached the SaaS portal directly from an external IP, bypassing the VPN.',
  },
  {
    id: 's1',
    instruction: 'Check device status for both the workstation and the identity provider.',
    command: 'show device status',
    expected: 'The workstation is clean; the identity provider is flagged for authenticating the session via an existing token.',
  },
  {
    id: 's2',
    instruction: 'Review the raw logs for the account in question.',
    command: 'show investigation logs',
    expected: 'A normal office login, followed by a token-only session resumption with no new MFA challenge.',
  },
  {
    id: 's3',
    instruction: 'Check the alert queue for every alert referencing this account.',
    command: 'show alert queue',
    expected: 'Two independent alerts — impossible travel and anomalous mailbox rule creation — both referencing the same account.',
  },
  {
    id: 's4',
    instruction: "Review the user's profile information.",
    command: 'show user account details',
    expected: 'No travel on file and no recent legitimate access-recovery ticket for this user.',
  },
  {
    id: 's5',
    instruction: 'Check process information on the associated workstation.',
    command: 'show process information',
    expected: 'No suspicious process activity on the workstation — the incident does not live at the endpoint layer.',
  },
  {
    id: 's6',
    instruction: 'Review the incident timeline to see the full escalation in sequence.',
    command: 'show incident timeline',
    expected: 'Login, then token reuse, then data export, then persistence, each depending on the step before it.',
  },
  {
    id: 's7',
    instruction: 'Check previous change history for any related authorised change.',
    command: 'show change history',
    expected: 'A mailbox forwarding rule change with no accompanying help-desk ticket or administrator action.',
  },
];

const LAB_22_0: Lab = {
  id: 'p22-lab-0',
  phaseId: 'phase-22',
  title: 'Investigate a Compromised Account Using the Investigation Interface',
  objective:
    'Work through all eight panels of the investigation interface — network diagram, device status, logs, alerts, user information, process information, timeline, and change history — for one confirmed compromised-account case, and reach a root cause only after every panel has been reviewed.',
  securityConcepts: [
    'Structured troubleshooting methodology',
    'Evidence-based root cause analysis',
    'Session and token compromise',
    'Change history review',
  ],
  environment: 'Deterministic investigation-interface simulator — prepared outputs only; no real account, session, or system is touched',
  topology: 'A single SaaS-integrated identity scenario: workstation → VPN → identity provider → SaaS email portal, with a flagged out-of-band session',
  prerequisites: [
    'Complete Phase 5 (Identity & Access Management)',
    'Complete Phase 7 (Security Operations / SOC)',
  ],
  steps: LAB_22_0_STEPS,
  expectedResults: [
    'Every one of the eight investigation panels reviewed before any conclusion is reached',
    'The root cause (session/token reuse, not a freshly stolen password) correctly identified from the evidence',
    'The recommended action addresses both the session/token and the persistence mechanism (the mailbox rule), not just the password',
  ],
  verification: [
    'Learner can state which specific panel(s) ruled out each incorrect theory',
    'Learner can explain why a password reset alone would not have stopped this specific compromise',
    'Learner can identify the absence of a fresh MFA event as the decisive clue',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Tempted to conclude from the alert alone → review all eight panels before forming a theory; the alert only tells you something looked unusual, not what actually happened.',
    'Unsure why device status showing "UP" does not clear the account → a clean endpoint only clears that specific device; this incident lives at the identity/session layer, which endpoint status cannot see.',
  ],
  challenge:
    'Write a one-paragraph root-cause statement citing the specific evidence panel that rules out each of the three incorrect theories (legitimate travel, a false-positive alert, and a platform-wide IdP breach).',
  evidence: [
    {
      id: 'ev0',
      label: 'Investigation interface transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript for all eight panels',
    },
    {
      id: 'ev1',
      label: 'Root cause and remediation report',
      type: 'report',
      placeholder: 'Root cause, evidence cited per ruled-out theory, and recommended containment actions',
    },
  ],
  securityLesson:
    'A conclusion is only as strong as the panels checked before reaching it. The single most important fact in this case is an absence — no fresh MFA event — and absences are only visible to an investigator who checked every panel rather than stopping at the first one that looked interesting.',
};

// ---------- Lab 2: Diagnose All Ten Troubleshooting Center Scenarios ----------

const LAB_22_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Open the Troubleshooting Center and select the first scenario.',
    expected: 'The Compromised Account scenario loads with its own network diagram, device status, logs, alerts, user, process, timeline, and change history.',
  },
  {
    id: 's1',
    instruction: 'For each of the ten scenarios, review every investigation panel before selecting a root cause.',
    command: 'show alert queue',
    expected: 'A full understanding of what was flagged and why, before any diagnosis field is touched.',
  },
  {
    id: 's2',
    instruction: 'Select a root cause and a recommended action for the current scenario, then submit to see the graded result and debrief.',
    command: 'show incident timeline',
    expected: 'A graded diagnosis (root cause correct/incorrect, action correct/incorrect) with a rationale for each.',
  },
  {
    id: 's3',
    instruction: 'Repeat for all ten scenarios: compromised account, phishing incident, malware alert, suspicious PowerShell, failed authentication storm, privilege escalation, vulnerability finding, misconfigured firewall, DNS anomaly, and suspicious network traffic.',
    command: 'show change history',
    expected: 'All ten scenarios diagnosed, each with its own root cause and recommended action selected and graded.',
  },
];

const LAB_22_1: Lab = {
  id: 'p22-lab-1',
  phaseId: 'phase-22',
  title: 'Diagnose All Ten Troubleshooting Center Scenarios',
  objective:
    'Work through all ten Security Troubleshooting Center scenarios — spanning identity, email, endpoint, infrastructure, and network-layer alert categories — diagnosing a root cause and a recommended action for each from its own investigation evidence.',
  securityConcepts: [
    'Root cause vs. symptom vs. contributing factor',
    'Evidence-based diagnosis across ten distinct alert categories',
    'Recommended-action scoping (matching the response to the confirmed cause and scope)',
  ],
  environment: 'Interactive Troubleshooting Center — ten independent, deterministic investigation scenarios; no real system is touched',
  topology: 'Ten unrelated environments (identity platform, email gateway, endpoint, build server, VPN gateway, DMZ web server, perimeter firewall, DNS resolver, internal file-sharing network), one per scenario',
  prerequisites: ['Complete Phase 22 Lab 0 (Investigate a Compromised Account Using the Investigation Interface)'],
  steps: LAB_22_1_STEPS,
  expectedResults: [
    'A root cause and recommended action selected for all ten scenarios',
    'At least 8 of 10 scenarios diagnosed correctly on root cause before reviewing the debrief',
    'Each incorrect selection understood via its rationale before moving to the next scenario',
  ],
  verification: [
    'Learner can explain, for at least three scenarios, why the root cause option they rejected was wrong',
    'Learner can state the recommended action for each scenario and why a narrower or broader action would be incorrect',
    'Learner can name which of the eight investigation panels was most decisive for at least three scenarios',
  ],
  troubleshooting: [
    'Diagnosis field will not submit → both a root cause and a recommended action must be selected before submitting.',
    'Unsure why an action option is wrong despite addressing the incident → check whether it matches the confirmed scope — an action addressing more or less than the evidence supports is graded incorrect even if it sounds reasonable.',
    'Command not recognised → type help for the available commands.',
  ],
  challenge:
    'For the three scenarios you found hardest, write one sentence each identifying the specific piece of evidence that ruled out your first instinct.',
  evidence: [
    {
      id: 'ev0',
      label: 'Troubleshooting Center diagnosis transcript',
      type: 'log',
      placeholder: 'Paste your root cause and action selection, with grading result, for all ten scenarios',
    },
    {
      id: 'ev1',
      label: 'Cross-scenario lessons-learned note',
      type: 'report',
      placeholder: 'For each of the ten categories, one sentence on its most reliable diagnostic clue',
    },
  ],
  securityLesson:
    'Ten different alert categories, ten different technical domains, and one identical discipline underneath all of them: gather the evidence, form a theory that the evidence actually supports, and scope the response to match — no broader, no narrower.',
};

// ---------- Lessons ----------

const LESSON_22_L1: Lesson = {
  id: 'p22-lesson-0',
  phaseId: 'phase-22',
  title: 'Structured Security Troubleshooting',
  objectives: [
    'Explain why a structured methodology counters confirmation bias in security investigations',
    "Use the eight-panel investigation interface (network diagram, device status, logs, alerts, user information, process information, timeline, change history)",
    'Build and test a theory of probable cause against evidence rather than the reverse',
    'Distinguish root cause, symptom, and contributing factor',
    'Use change history as an early investigative shortcut',
  ],
  sections: LESSON_22_L1_SECTIONS,
  quiz: LESSON_22_L1_QUIZ,
  concepts: [
    'troubleshooting-methodology',
    'investigation-interface',
    'root-cause-analysis',
    'change-management',
    'timeline-analysis',
    'evidence-analysis',
    'alert-correlation',
  ],
  homework:
    'Write your own troubleshooting checklist: the order you will work evidence panels in, and the question you will ask before choosing any action. Keep it to one page.',
  careerConnection:
    'SOC Analyst / Incident Responder — the discipline of gathering evidence before concluding, and citing the specific panel that supports a finding, is what separates a defensible incident report from a guess that happened to be right.',
};

const LESSON_22_L2: Lesson = {
  id: 'p22-lesson-1',
  phaseId: 'phase-22',
  title: 'Recognising the Ten Common Alert Categories',
  objectives: [
    'Recognise the diagnostic signature of a compromised account and a failed authentication storm',
    'Recognise the diagnostic signature of a phishing incident and a malware alert',
    'Recognise the diagnostic signature of suspicious PowerShell and privilege escalation',
    'Distinguish a vulnerability finding from a confirmed incident, and recognise a misconfigured firewall finding',
    'Recognise the diagnostic signature of a DNS anomaly and suspicious network traffic',
  ],
  sections: LESSON_22_L2_SECTIONS,
  quiz: LESSON_22_L2_QUIZ,
  concepts: [
    'account-compromise',
    'password-spraying',
    'phishing',
    'incident-response',
    'living-off-the-land',
    'privilege-escalation',
    'vulnerability-management',
    'firewall-misconfiguration',
    'dns-tunnelling',
  ],
  homework:
    'For each of the ten alert categories, write the single log source you would open first. Then mark the two categories where that first choice is easiest to get wrong.',
  careerConnection:
    'Tier 1/2 SOC Analyst — triage speed comes from recognising a category from the shape of the symptom, then confirming it with evidence, rather than treating every alert as an unfamiliar puzzle from scratch.',
};

// ---------------------------------------------------------------------------
// Phase 22 export
// ---------------------------------------------------------------------------

export const PHASE_22: Phase = {
  id: 'phase-22',
  number: 22,
  title: 'Security Troubleshooting Center',
  description:
    'Investigate ten realistic security scenarios through a structured, eight-panel investigation interface — diagnosing root cause and recommended action from evidence rather than instinct.',
  examDomain: 'Security Operations',
  scene: 'troubleshoot-center',
  lessons: [LESSON_22_L1, LESSON_22_L2],
  labs: [LAB_22_0, LAB_22_1],
};
