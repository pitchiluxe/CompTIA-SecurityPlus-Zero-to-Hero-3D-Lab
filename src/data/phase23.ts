import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 23 — Full SOC Capstone
// Aligned with CompTIA Security+ SY0-701 (Domain 4: Security Operations)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: The Full Attack Chain, End to End ----------

const LESSON_23_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p23-l1-s0',
    title: 'Concept — Why a Capstone Case Study',
    body:
      'Every earlier phase in this platform taught one skill in isolation: triaging an alert, ordering a timeline, scoping affected assets, choosing a containment action, writing a blameless lessons-learned entry. A real incident does not arrive pre-separated into those pieces — it arrives as one continuous chain, and a responder has to recognise which skill applies at which moment without being told. This phase\'s incident, IR-2026-0909-01, is a second full case built specifically to be worked end to end using every one of those skills together, on an enterprise topology spanning the perimeter, the network, servers, endpoints, identity infrastructure, and the SIEM/EDR layer that ties them together.',
  },
  {
    id: 'p23-l1-s1',
    title: 'Concept — Initial Access Through a Trusted Third Party',
    body:
      'This chain begins not with an employee, but with a third-party support account holding standing VPN access — a supply-chain and vendor-risk pattern distinct from Phase 3\'s employee-targeted phishing. Vendor and contractor accounts are frequently granted broad, long-lived access for convenience and then left outside the security controls (MFA enforcement, access reviews, scoped permissions) applied to employee accounts, precisely because they feel like someone else\'s responsibility. An attacker does not need to breach the organisation\'s own defences if a trusted third party\'s weaker defences reach just as far inside.',
  },
  {
    id: 'p23-l1-s2',
    title: 'Concept — One Missing Control Undoes the Others',
    body:
      'The vendor account authenticates successfully with no MFA challenge at all — not a bypassed MFA, an absent one. Every other control in this environment (network segmentation, EDR, the SIEM) is downstream of that single authentication event and can only react to what happens after it, not prevent it. This is the same lesson Phase 12\'s worked incident taught from the employee side: phishing-resistant MFA would have ended that chain at the login stage. Here, the chain never even gets that far, because MFA was never required for this account category in the first place — a policy gap, not a technology failure.',
  },
  {
    id: 'p23-l1-s3',
    title: 'Concept — Lateral Movement via a Shared Credential',
    body:
      'Once inside, the loader does not need to repeat the phishing/authentication chain to reach a second server — it reuses a shared local administrator credential already present on both machines. This is the exact lateral-movement pattern Phase 22 taught: one credential compromise cascades across every host that shares it. A single compromised vendor account became a two-server ransomware event specifically because that shared credential existed; a unique-per-host credential strategy would have confined the loader to the one server it landed on.',
  },
  {
    id: 'p23-l1-s4',
    title: 'Concept — Correlation Across Log Sources',
    body:
      'No single log source in this incident shows the whole chain: the mail gateway sees only the phishing delivery, the VPN gateway sees only the authentication, EDR sees only the loader execution, Windows Security sees only the SMB authentication and shadow-copy deletion, and the SIEM sees only the final correlated pattern of simultaneous mass file-rename across hosts. This is the Phase 7 lesson applied at capstone scale: a SOC\'s value is in correlating weak signals from many sources into one confident finding, not in any single tool producing a complete answer on its own.',
  },
  {
    id: 'p23-l1-s5',
    title: 'Example — Walking the Eight-Event Chain',
    body:
      'Phishing email delivered (mail gateway) → credentials submitted to a lookalike portal (web proxy) → VPN authentication succeeds with no MFA (VPN gateway) → ransomware loader executes on the file server (EDR) → the loader authenticates to a second server via SMB using a shared credential (Windows Security) → shadow copies are deleted on both servers (Windows Security) → mass file rename begins on both servers (file server audit) → a SIEM correlation rule fires across multiple hosts (SIEM). Each arrow in that chain is a point where an earlier phase\'s control, if present, would have broken it — MFA at arrow three, a unique-per-host credential at arrow five, faster correlation logic before arrow eight.',
  },
  {
    id: 'p23-l1-s6',
    title: 'Review — What Must Stick',
    body:
      'Third-party and vendor accounts are a common initial-access vector precisely because they are frequently exempted from controls applied to employee accounts. One missing control (MFA on one account category) can undo the value of every downstream control, because downstream controls can only react to what already got through. Shared credentials turn one compromise into many; a unique-per-host strategy is the durable fix. No single log source sees a whole attack chain — correlation across sources is the actual skill, and it is the same skill at every phase of this platform, just applied here across a full enterprise topology at once.',
  },
];

const LESSON_23_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p23-q0',
    type: 'mcq',
    stem: 'Why are third-party or vendor accounts a common initial-access vector in real incidents?',
    options: [
      'They are frequently granted broad, long-lived access for convenience and then exempted from controls (MFA, access reviews) applied to employee accounts',
      'Vendor accounts are never granted any meaningful access to internal systems',
      'Vendor accounts are always more carefully monitored than employee accounts',
      'This is not a realistic or common attack pattern in practice',
    ],
    answer: 0,
    explanation:
      'Vendor and contractor accounts often carry broad standing access precisely because they are treated as someone else\'s responsibility, which is exactly why they end up outside controls the organisation enforces on its own employees.',
    domain: 'Security Operations',
    conceptId: 'vendor-risk',
  },
  {
    id: 'p23-q1',
    type: 'mcq',
    stem: "In this incident, vendor-support authenticated successfully with 'no MFA challenge at all.' How does this differ from an attacker bypassing MFA?",
    options: [
      'No MFA was ever required for this account category — the control was absent, not defeated',
      'The attacker used a stolen physical MFA token',
      'MFA was present but the attacker guessed the one-time code',
      'There is no meaningful difference between an absent control and a bypassed one',
    ],
    answer: 0,
    explanation:
      'An absent control (no MFA policy for this account type) and a defeated control (MFA present but bypassed) point to different root causes and different fixes — here, the fix is enforcing MFA for this account category, not hardening an MFA implementation that was never invoked.',
    domain: 'Security Operations',
    conceptId: 'mfa',
  },
  {
    id: 'p23-q2',
    type: 'mcq',
    stem: 'Why could every other control in this environment (network segmentation, EDR, the SIEM) only react to what happened after the VPN authentication event?',
    options: [
      'Because authentication is the entry point — controls positioned after it can only detect or respond to activity that already has legitimate-looking access',
      'Because EDR and the SIEM were both misconfigured',
      'Because network segmentation is never useful in any incident',
      'Because the SIEM correlation rule fired before the authentication occurred',
    ],
    answer: 0,
    explanation:
      'Once an attacker holds valid authenticated access, every downstream control is working with activity that looks legitimate at first glance — which is exactly why the earliest control (requiring MFA at authentication) has outsized value.',
    domain: 'Security Operations',
    conceptId: 'defense-in-depth',
  },
  {
    id: 'p23-q3',
    type: 'mcq',
    stem: 'What allowed the ransomware loader to reach a second server without repeating the phishing/authentication chain?',
    options: [
      'A shared local administrator credential already present on both servers',
      'A second, independent phishing email sent to a different employee',
      'A previously unknown zero-day vulnerability in the second server\'s operating system',
      'The second server had no authentication requirements at all',
    ],
    answer: 0,
    explanation:
      'Reusing an already-known shared credential is far simpler than repeating an entire initial-access chain — this is exactly the lateral-movement pattern taught in Phase 22.',
    domain: 'Security Operations',
    conceptId: 'lateral-movement',
  },
  {
    id: 'p23-q4',
    type: 'mcq',
    stem: 'What is the durable, systemic fix for the lateral-movement pattern seen in this incident?',
    options: [
      'Replace the shared local administrator credential with a unique-per-host credential strategy',
      'Delete the local administrator account from every server entirely',
      'Increase the password length requirement for the shared account',
      'Disable SMB across the entire network permanently',
    ],
    answer: 0,
    explanation:
      'A unique-per-host credential means compromising one host\'s local administrator credential does not grant access to any other host — this is the fix that actually breaks the lateral-movement pattern, not a longer shared password.',
    domain: 'Security Operations',
    conceptId: 'shared-credentials',
  },
  {
    id: 'p23-q5',
    type: 'mcq',
    stem: 'Why does no single log source in this incident show the entire attack chain?',
    options: [
      'Each source (mail gateway, VPN gateway, EDR, Windows Security, file server audit, SIEM) only observes the specific layer or system it monitors',
      'The logging systems in this environment are all broken',
      'A complete attack chain always appears fully in exactly one log source',
      'This is unique to this incident and does not generalise to other cases',
    ],
    answer: 0,
    explanation:
      'Every log source has a scope — a VPN gateway sees authentication, EDR sees endpoint process activity, and so on. A full attack chain spans layers no single source monitors alone, which is exactly why correlation is the SOC\'s core skill.',
    domain: 'Security Operations',
    conceptId: 'alert-correlation',
  },
  {
    id: 'p23-q6',
    type: 'scenario',
    stem: 'An analyst reviewing this incident insists on finding "the one log entry that proves the whole attack." What is the flaw in this approach?',
    options: [
      'No single entry proves the whole chain — the finding emerges only from correlating multiple sources across time, each contributing one piece',
      'This is the correct and most efficient approach to any investigation',
      'Only the SIEM correlation alert is ever needed; every other log source is irrelevant',
      'The mail gateway log alone is always sufficient to prove any phishing-originated incident',
    ],
    answer: 0,
    explanation:
      'Insisting on one definitive entry ignores how these incidents actually surface — the mail gateway, VPN gateway, EDR, Windows Security, and SIEM logs each show only a fragment, and the full picture requires assembling all of them.',
    domain: 'Security Operations',
    conceptId: 'alert-correlation',
  },
  {
    id: 'p23-q7',
    type: 'scenario',
    stem: 'Comparing this incident to IR-2026-0908-01 (the Phase 12 case), both ultimately trace back to a single decisive missing control. What do the two incidents have in common at that level?',
    options: [
      'In both cases, a stronger or properly enforced authentication control (phishing-resistant MFA) would have ended the chain at the very first authentication attempt',
      'Both incidents involved the exact same compromised host and the exact same attacker infrastructure',
      'Neither incident involved any phishing component at all',
      'Both incidents were ultimately caused by a misconfigured firewall rule',
    ],
    answer: 0,
    explanation:
      'Both chains hinge on a credential working when it should not have: Phase 12\'s incident lacked phishing-resistant MFA, and this incident lacked any MFA requirement at all for a vendor account — different gaps in the same category of control.',
    domain: 'Security Operations',
    conceptId: 'mfa',
  },
  {
    id: 'p23-q8',
    type: 'scenario',
    stem: 'A security leader argues that because the ransomware loader "only" spread to a second server, the lateral-movement risk was minor. Why is this framing misleading?',
    options: [
      'The loader spread to every host reachable via the shared credential; it happened to be limited to two servers here, but the same shared-credential design would have let it spread to every other host sharing that credential',
      'Lateral movement to exactly two hosts is always negligible and requires no remediation',
      'Lateral movement can only ever occur between exactly two hosts, by definition',
      'The number of hosts reached has no bearing on whether the underlying control gap needs to be fixed',
    ],
    answer: 0,
    explanation:
      'The blast radius here was limited by which hosts happened to share the credential and be reachable — the same design flaw could have spread the loader much further, which is exactly why the fix targets the shared-credential pattern itself, not just the two affected hosts.',
    domain: 'Security Operations',
    conceptId: 'shared-credentials',
  },
  {
    id: 'p23-q9',
    type: 'scenario',
    stem: 'Which specific arrow in the eight-event attack chain represents the point where enforcing MFA for vendor accounts would have broken the entire remaining chain?',
    options: [
      'The VPN authentication event — every subsequent event (loader execution, lateral movement, encryption, detection) depends on that authentication having succeeded',
      'The mail gateway delivery event, since blocking the email is the only meaningful control point',
      'The final SIEM correlation alert, since detection is what actually stops an attack',
      'The shadow-copy deletion event, since that is the first sign of actual malicious activity',
    ],
    answer: 0,
    explanation:
      'Every event after the VPN authentication is only possible because that authentication succeeded — a failed authentication attempt (which MFA would have forced) ends the chain there, before any loader ever executes.',
    domain: 'Security Operations',
    conceptId: 'defense-in-depth',
  },
  {
    id: 'p23-q-pbq',
    type: 'pbq',
    stem: 'Order these cyber kill chain phases in a phishing-to-ransomware scenario.',
    options: [
      'Email delivery of the malicious payload',
      'User execution of the payload',
      'Lateral movement to additional hosts',
      'Impact, such as data encryption',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Delivery must happen before execution, execution enables persistence and lateral movement, and only after both can the attacker achieve impact.',
    domain: 'Security Operations',
    conceptId: 'defense-in-depth',
  },
];

// ---------- Lesson 2: Ransomware Response and the Order-of-Volatility Exception ----------

const LESSON_23_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p23-l2-s0',
    title: 'Concept — What Defines a Ransomware Event',
    body:
      'Ransomware is characterised by a specific, recognisable combination: mass file renaming or encryption across many files in a short window, deletion of Volume Shadow Copies (removing the easiest local recovery path before encryption even completes), and typically a ransom note written to affected directories. Modern ransomware operations very often exfiltrate data before encrypting it — turning what looks like an availability incident into a confidentiality breach as well, whether or not the victim ever pays or successfully restores from backup.',
  },
  {
    id: 'p23-l2-s1',
    title: 'Concept — Why Isolate-First Beats Capture-First Here',
    body:
      'Every other incident category taught on this platform recommends capturing volatile evidence (memory) before isolating a host, because the evidence is more valuable than the minutes lost containing a single, already-static threat. Ransomware inverts that calculation: the threat is not static, it is actively encrypting more files and can actively spread to more hosts every minute containment is delayed. The evidence lost by isolating immediately is outweighed by the additional hosts and data spared from encryption — this is a genuine exception, not a shortcut, and it applies specifically because of ransomware\'s active spread rate.',
  },
  {
    id: 'p23-l2-s2',
    title: 'Concept — Two-Axis Containment Across Multiple Hosts',
    body:
      'The same two-axis test from Phase 12 — does an action stop the attacker, and does it preserve evidence — still applies here, just across more than one host and one identity at once. Isolating both servers and revoking the compromised VPN session together stops the attacker across the whole known scope; isolating only one server while leaving the vendor account\'s session active would leave a channel the attacker could use again immediately. Containment scope, again, follows the investigation — every host and every identity confirmed involved — not just the host the alert happened to name first.',
  },
  {
    id: 'p23-l2-s3',
    title: 'Concept — Why "Restore From Backup" Is Not "Incident Closed"',
    body:
      'Restoring encrypted files from a clean backup addresses the availability impact but answers none of the other questions an incident report requires: how did the attacker get in, what else did they touch, and — critically for ransomware specifically — was any data exfiltrated before encryption began? Since exfiltration commonly precedes encryption in modern ransomware operations, a successful restore can leave an organisation believing it is fully recovered while a confidentiality breach it never investigated remains completely unaddressed.',
  },
  {
    id: 'p23-l2-s4',
    title: 'Concept — Eradication, Recovery, and Blameless Lessons Learned',
    body:
      'Eradication removes the attacker and everything they left behind — the loader, any dropped binaries, and (critically here) the shared credential that let them spread, replaced with a design that cannot repeat the same spread. Recovery restores verified-clean business function and re-enables access only with the gaps closed (MFA enforced, access properly scoped) — restoring a service without closing the gap that let the incident happen simply schedules a repeat. Lessons learned stays blameless throughout: every finding here is a control gap (no MFA policy for vendor accounts, a shared credential, an undetected correlation rule) rather than a description of who clicked a link or who set up the shared account.',
  },
  {
    id: 'p23-l2-s5',
    title: 'Example — Working the Containment Decision',
    body:
      'Faced with an active ransomware spread across two servers via a compromised vendor VPN session, the correct plan combines three actions: isolate both servers and revoke the VPN session immediately (stops the attacker and preserves what evidence remains); disable and revoke the vendor account\'s credentials and any active tokens (closes the identity-level channel); and separately, block the external VPN source address at the firewall (worth doing, though insufficient alone, since it only affects future connection attempts). Paying the ransom, restoring from backup immediately, and hard-powering-off the servers each fail at least one axis of the two-axis test, despite each sounding decisive.',
  },
  {
    id: 'p23-l2-s6',
    title: 'Review — What Must Stick',
    body:
      'Ransomware\'s signature is mass rename/encryption, shadow-copy deletion, and often a ransom note — frequently preceded by undetected exfiltration. Ransomware is the specific, documented exception where isolating immediately outranks capturing evidence first, because active spread rate outweighs evidence order. The two-axis containment test (stops the attacker / preserves evidence) still applies, now across every host and identity the investigation confirms in scope. Restoring from backup addresses availability only — it does not answer how the attacker got in or whether data was exfiltrated first. Lessons learned stays blameless: every entry names a control gap, never a person.',
  },
];

const LESSON_23_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p23-q10',
    type: 'mcq',
    stem: 'Which combination of characteristics is the recognisable signature of a ransomware event?',
    options: [
      'Mass file renaming/encryption across many files in a short window, Volume Shadow Copy deletion, and typically a ransom note',
      'A single failed login followed immediately by a successful one',
      'A slow, gradual increase in normal file access over several weeks',
      'An increase in outbound DNS queries to a single external domain',
    ],
    answer: 0,
    explanation:
      'The combination of rapid mass file changes, shadow-copy deletion (removing easy local recovery), and a ransom note together define the recognisable ransomware signature.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
  {
    id: 'p23-q11',
    type: 'mcq',
    stem: 'Why does ransomware specifically justify isolating a host before capturing memory, unlike most other incident categories on this platform?',
    options: [
      'Because the threat is actively spreading and encrypting more data every minute containment is delayed — evidence lost by isolating first is outweighed by hosts and data spared from further damage',
      'Because memory capture is technically impossible on any host affected by ransomware',
      'Because ransomware never produces any evidence worth preserving in the first place',
      'Because this rule applies to every single incident category equally, with no exceptions',
    ],
    answer: 0,
    explanation:
      'Ransomware\'s active, ongoing spread rate is what makes this a genuine exception — the calculation changes specifically because the threat keeps causing damage with every additional minute of delay.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
  {
    id: 'p23-q12',
    type: 'mcq',
    stem: 'In a multi-host ransomware event, why is isolating only one affected server while leaving a compromised account\'s session active still an incomplete containment plan?',
    options: [
      'The still-active session or account remains a channel the attacker can use again immediately, regardless of how many hosts have been isolated',
      'Containment is only ever judged by how many hosts have been isolated, with the account irrelevant',
      'Isolating a single host always fully removes an attacker\'s access to every other system',
      'Accounts cannot be part of an incident\'s containment scope, only hosts can',
    ],
    answer: 0,
    explanation:
      'Containment must address every confirmed part of the attack chain — a live, still-authenticated account is just as much an open channel as an unisolated host.',
    domain: 'Security Operations',
    conceptId: 'containment',
  },
  {
    id: 'p23-q13',
    type: 'mcq',
    stem: 'Why is "restore the affected files from backup" alone not equivalent to closing a ransomware incident?',
    options: [
      'It addresses the availability impact only — it does not establish how the attacker got in, what else was touched, or whether data was exfiltrated before encryption',
      'Backups can never successfully restore any ransomware-encrypted file',
      'Restoring from backup always removes the attacker\'s access automatically',
      'This is in fact a complete and sufficient response on its own',
    ],
    answer: 0,
    explanation:
      'A restore only reverses the availability impact — the root cause, full scope, and (for ransomware specifically) any exfiltration that occurred before encryption still need to be investigated and addressed separately.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
  {
    id: 'p23-q14',
    type: 'mcq',
    stem: 'Why do modern ransomware incidents often carry a confidentiality impact in addition to an availability impact?',
    options: [
      'Many ransomware operations exfiltrate data before encrypting it, so a successful restore reverses the availability loss but does nothing about data already taken',
      'Ransomware only ever affects file availability and never involves any data exfiltration',
      'Confidentiality impact only occurs if the ransom is actually paid',
      'Restoring from backup automatically reverses any prior data exfiltration',
    ],
    answer: 0,
    explanation:
      'Exfiltration commonly happens before encryption, meaning the confidentiality breach exists independently of whether encryption is later reversed via backup.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
  {
    id: 'p23-q15',
    type: 'mcq',
    stem: 'What is the key difference between eradication and recovery in this incident?',
    options: [
      'Eradication removes the attacker and their persistence/spread mechanisms (including the shared credential); recovery restores verified-clean business function and re-enables access only with the gaps closed',
      'Eradication and recovery describe the exact same set of actions, just performed in a different order',
      'Recovery must always happen before eradication begins',
      'Eradication only applies to malware and never applies to ransomware incidents',
    ],
    answer: 0,
    explanation:
      'Eradication is about removing what the attacker left behind and closing the specific gap they exploited; recovery is about safely returning to normal operation once that removal is verified.',
    domain: 'Security Operations',
    conceptId: 'incident-response',
  },
  {
    id: 'p23-q16',
    type: 'mcq',
    stem: 'Which of the following is a properly blameless lessons-learned entry for this incident?',
    options: [
      'MFA was not enforced for third-party vendor VPN accounts',
      'The vendor-support account owner should have recognised the phishing email',
      'The employee who set up the shared local administrator credential made a careless mistake',
      'Whoever approved vendor VPN access is responsible for this incident'
    ],
    answer: 0,
    explanation:
      'A blameless entry names the control gap (no MFA policy for this account category) rather than describing an individual\'s action or judgement.',
    domain: 'Security Operations',
    conceptId: 'lessons-learned',
  },
  {
    id: 'p23-q17',
    type: 'scenario',
    stem: 'An incident commander proposes: "Pay the ransom, then restore from backup as a backup plan in case the decryptor fails." How should this plan be evaluated against the two-axis containment test and the broader response requirements?',
    options: [
      'Paying does not stop the attacker\'s foothold or guarantee a working decryptor, and does nothing about any data already exfiltrated — it is not a substitute for containment, eradication, or investigating exfiltration',
      'This is the fastest and most complete response available and should be adopted as written',
      'Paying the ransom always guarantees full data recovery with no further action needed',
      'This plan fully satisfies both containment axes and requires no further steps'
    ],
    answer: 0,
    explanation:
      'Paying addresses neither containment axis directly, does not guarantee recovery, and leaves any prior exfiltration completely uninvestigated — it sits outside the technical response entirely, as a business/legal decision at best.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
  {
    id: 'p23-q18',
    type: 'scenario',
    stem: 'Compare "hard power off both servers immediately" against "isolate both servers at the network level, then capture remaining evidence" for this ransomware event. Why is the second option preferred despite both stopping active encryption?',
    options: [
      'Powering off destroys memory (where the loader and any encryption keys may exist only in RAM) and risks filesystem corruption; network isolation stops the spread while preserving what evidence remains available to capture',
      'There is no meaningful difference between the two actions in terms of evidence preservation',
      'Hard power off is always the technically superior choice in every incident category',
      'Network isolation does not actually stop an actively encrypting process'
    ],
    answer: 0,
    explanation:
      'Both actions can stop active encryption, but only network isolation avoids the memory loss and corruption risk that a hard power-off introduces on top of the ransomware\'s own damage.',
    domain: 'Security Operations',
    conceptId: 'ransomware',
  },
];

// ---------- Lab 1: Detect, Triage, Investigate, and Collect Evidence ----------

const LAB_23_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: "Review the VPN gateway authentication log to see how the attacker's session began.",
    command: 'show vpn authentication log',
    expected: 'A successful VPN authentication for vendor-support from an unfamiliar country with no MFA challenge recorded.',
  },
  {
    id: 's1',
    instruction: 'Triage the four alerts associated with this incident: decide escalate or close-as-false-positive for each.',
    expected: 'Two alerts (the VPN anomaly and the SIEM correlation alert) correctly escalated; two (routine maintenance and a normal single mistyped login) correctly closed.',
  },
  {
    id: 's2',
    instruction: 'Reconstruct the eight-event timeline in the order the attack actually occurred.',
    command: 'show capstone timeline',
    expected: 'Phishing delivery, credential submission, VPN authentication, loader execution, SMB lateral movement, shadow-copy deletion, mass file rename, then SIEM correlation — in that order.',
  },
  {
    id: 's3',
    instruction: 'Review the ransomware detection alert and identify which assets are genuinely in scope.',
    command: 'show ransomware detection alert',
    expected: 'vendor-support, FILESRV-02, APPSRV-03, and VPN-GW-01 correctly included in scope; CORE-FW-01 and BACKUP-SRV-01 correctly excluded.',
  },
];

const LAB_23_0: Lab = {
  id: 'p23-lab-0',
  phaseId: 'phase-23',
  title: 'Detect, Triage, Investigate, and Collect Evidence',
  objective:
    'Work the first four stages of the capstone incident response — detect, triage, investigate, and collect evidence — for IR-2026-0909-01, a ransomware event spanning a compromised vendor VPN account and two servers.',
  securityConcepts: [
    'Alert triage and discrimination (Phase 7 skill applied at capstone scale)',
    'Timeline reconstruction across five distinct log sources',
    'Affected-asset scoping across identity, network, and server layers',
    'Evidence-based investigation before any containment decision',
  ],
  environment: 'Deterministic capstone simulator — prepared outputs only; no real VPN, server, or account is touched',
  topology: 'Internet -> perimeter firewall -> VPN gateway -> file server / application server -> identity infrastructure -> SIEM/EDR',
  prerequisites: [
    'Complete Phase 7 (Security Operations / SOC)',
    'Complete Phase 12 (Incident Response)',
    'Complete Phase 22 (Security Troubleshooting Center)',
  ],
  steps: LAB_23_0_STEPS,
  expectedResults: [
    'The VPN authentication anomaly correctly identified as the initial compromise event',
    'All four alerts correctly triaged, with both false positives correctly closed rather than escalated',
    'The full eight-event timeline correctly ordered',
    'Asset scope correctly limited to the four genuinely involved assets',
  ],
  verification: [
    'Learner can explain why the absence of an MFA challenge is the decisive clue at the authentication stage',
    'Learner can state why the two false-positive alerts were correctly closed rather than escalated',
    'Learner can explain why CORE-FW-01 and BACKUP-SRV-01 were correctly excluded from scope',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Tempted to escalate every alert → discrimination is the skill being tested; an analyst who escalates everything is as unhelpful as one who escalates nothing.',
    'Unsure why CORE-FW-01 is excluded → it permitted and logged the VPN session per its normal function; performing its job correctly is not the same as being compromised.',
  ],
  challenge:
    'Write a one-paragraph detection narrative citing the specific log source and finding that first should have raised suspicion, before the SIEM correlation alert ever fired.',
  evidence: [
    {
      id: 'ev0',
      label: 'Detection, triage, and timeline transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript and your triage decisions',
    },
    {
      id: 'ev1',
      label: 'Scoping and evidence summary',
      type: 'report',
      placeholder: 'Final asset scope with rationale for each inclusion and exclusion',
    },
  ],
  securityLesson:
    'Detection, triage, investigation, and evidence collection are four distinct skills that have to work together in sequence — a correct timeline built from a wrongly triaged alert set, or a correct scope built without an accurate timeline, both produce a plausible-looking but wrong foundation for every decision that follows.',
};

// ---------- Lab 2: Contain, Remediate, Recover, and Document ----------

const LAB_23_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the ransomware-specific containment exception before selecting a containment plan.',
    command: 'explain ransomware containment exception',
    expected: 'An explanation of why isolating immediately outranks capturing evidence first specifically for ransomware.',
  },
  {
    id: 's1',
    instruction: 'Review the containment decision-support table and select a full containment plan.',
    command: 'show capstone containment options',
    expected: 'A plan that isolates both servers and the VPN session, disables the vendor account, and blocks the external source — while avoiding paying the ransom, restoring immediately, or a hard power-off.',
  },
  {
    id: 's2',
    instruction: 'Review the eradication checklist and confirm it addresses the shared-credential root cause, not only the two affected hosts.',
    command: 'show capstone eradication checklist',
    expected: 'Confirmation that rotating the shared local administrator credential is included, not just removing the loader.',
  },
  {
    id: 's3',
    instruction: 'Review the recovery plan and the blameless lessons-learned entry, then close the incident.',
    command: 'show capstone recovery plan',
    expected: 'A recovery plan that restores business function only after scope and root cause are confirmed, plus a full blameless lessons-learned list.',
  },
];

const LAB_23_1: Lab = {
  id: 'p23-lab-1',
  phaseId: 'phase-23',
  title: 'Contain, Remediate, Recover, and Document',
  objective:
    'Work the final four stages of the capstone incident response — contain, recommend remediation, recover, and document lessons learned — for IR-2026-0909-01, applying the ransomware isolate-first exception and a blameless review.',
  securityConcepts: [
    'The ransomware order-of-volatility exception (isolate before capture)',
    'Two-axis containment across multiple hosts and one identity',
    'Eradication vs. recovery as distinct response stages',
    'Blameless lessons-learned documentation',
  ],
  environment: 'Deterministic capstone simulator — prepared outputs only; no real VPN, server, or account is touched',
  topology: 'Internet -> perimeter firewall -> VPN gateway -> file server / application server -> identity infrastructure -> SIEM/EDR',
  prerequisites: ['Complete Phase 23 Lab 0 (Detect, Triage, Investigate, and Collect Evidence)'],
  steps: LAB_23_1_STEPS,
  expectedResults: [
    'A containment plan that stops the attacker across every confirmed asset and identity while preserving remaining evidence',
    'An eradication checklist that closes the shared-credential root cause, not only the two affected hosts',
    'A recovery plan that restores business function only after root cause and scope are confirmed',
    'A fully blameless lessons-learned list with a clearly stated key lesson',
  ],
  verification: [
    'Learner can explain why "capture memory first" would be the wrong call specifically for this incident category',
    'Learner can distinguish which containment options are recommended despite not stopping the attacker on their own',
    'Learner can state the single control change that would have kept the incident to one host',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Tempted to select "restore from backup" as containment → restoring is a recovery action, not containment, and does not stop an active attacker session on its own.',
    'Unsure why powering off the servers is wrong → it stops encryption but destroys memory and risks filesystem corruption; network isolation achieves containment without that cost.',
  ],
  challenge:
    'Write the closing paragraph of the incident report: the key lesson, the single control change that would have prevented lateral movement, and one sentence on what "resolved" means for this specific incident beyond the ransomware process being removed.',
  evidence: [
    {
      id: 'ev0',
      label: 'Containment and eradication transcript',
      type: 'log',
      placeholder: 'Paste your containment selections, eradication checklist review, and rationale',
    },
    {
      id: 'ev1',
      label: 'Closing incident report',
      type: 'report',
      placeholder: 'Containment plan, eradication, recovery, blameless lessons learned, and key lesson',
    },
  ],
  securityLesson:
    'Ransomware is the one incident category on this platform where the usual evidence-first order is deliberately reversed — recognising when a general rule has a documented exception, and why, is a more advanced skill than applying the general rule correctly every time.',
};

// ---------- Lessons ----------

const LESSON_23_L1: Lesson = {
  id: 'p23-lesson-0',
  phaseId: 'phase-23',
  title: 'The Full Attack Chain, End to End',
  objectives: [
    'Explain why third-party and vendor accounts are a common initial-access vector',
    'Explain how one missing control (MFA) can undo the value of every downstream control',
    'Recognise lateral movement via a shared credential and its systemic fix',
    'Explain why correlation across multiple log sources is required to see a full attack chain',
  ],
  sections: LESSON_23_L1_SECTIONS,
  quiz: LESSON_23_L1_QUIZ,
  concepts: [
    'vendor-risk',
    'mfa',
    'defense-in-depth',
    'lateral-movement',
    'shared-credentials',
    'alert-correlation',
  ],
  homework:
    'Write the full attack chain from the capstone incident as a timeline, and mark every point where a control did fire and every point where one should have. The gaps are the finding.',
  careerConnection:
    'SOC Analyst / Incident Responder — a capstone case is what an interview panel actually asks about: not "do you know what MFA is," but "walk me through how you would have caught this, stage by stage."',
};

const LESSON_23_L2: Lesson = {
  id: 'p23-lesson-1',
  phaseId: 'phase-23',
  title: 'Ransomware Response and the Order-of-Volatility Exception',
  objectives: [
    'Recognise the defining characteristics of a ransomware event',
    'Explain why ransomware justifies isolating before capturing volatile evidence',
    'Apply two-axis containment across multiple hosts and one compromised identity',
    'Explain why exfiltration risk means a successful restore does not close a ransomware incident',
    'Distinguish eradication, recovery, and blameless lessons learned',
  ],
  sections: LESSON_23_L2_SECTIONS,
  quiz: LESSON_23_L2_QUIZ,
  concepts: [
    'ransomware',
    'containment',
    'incident-response',
    'lessons-learned',
  ],
  homework:
    'Write the ransomware containment sequence in order and justify the one place where preserving evidence yields to stopping the spread. State who makes that call in a real organisation.',
  careerConnection:
    'Incident Responder — ransomware is the incident category most likely to be encountered in a real career, and it is the one general rule (capture before isolate) that a competent responder must know when to break.',
};

// ---------------------------------------------------------------------------
// Phase 23 export
// ---------------------------------------------------------------------------

export const PHASE_23: Phase = {
  id: 'phase-23',
  number: 23,
  title: 'Full SOC Capstone',
  description:
    'Work a second full incident — an enterprise ransomware event via a compromised vendor VPN account — through detect, triage, investigate, collect evidence, contain, remediate, recover, and document, across the full enterprise topology.',
  examDomain: 'Security Operations',
  scene: 'soc-capstone',
  lessons: [LESSON_23_L1, LESSON_23_L2],
  labs: [LAB_23_0, LAB_23_1],
};
