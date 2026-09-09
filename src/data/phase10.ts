import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 10 — Vulnerability Management
// Aligned with CompTIA Security+ SY0-701
//
// Phases 8 and 9 found misconfigurations by hand. This phase covers finding
// them systematically — and the central lesson is that a scanner's output is
// not a work list. CVSS measures the vulnerability; it does not measure your
// exposure to it.
//
// PROMPT.md lists tools (Nmap, OpenVAS, Nessus, Wireshark). They are taught by
// what they produce and how to read it, never by executing anything, and every
// artifact states the authorisation constraint.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p10-lesson-0',
    phaseId: 'phase-10',
    title: 'Vulnerabilities, CVE and CVSS',
    objectives: [
      'Distinguish a vulnerability from a threat and from a risk',
      'Explain what a CVE identifier is and is not',
      'Read a CVSS v3.1 vector and compute its severity band',
      'Explain what CVSS deliberately does not measure',
    ],
    concepts: ['vulnerabilities', 'cve', 'cvss', 'risk-prioritization'],
    homework:
      'Look up one real CVE, read its CVSS vector, and write out what each metric contributed to the score. Then state one environmental fact that would make it less urgent for you than the base score implies.',
    careerConnection:
      'Reading a CVSS vector aloud and saying what would lower it is a standard interview question, and the answer shows whether you understand scoring or just quote it.',
    sections: [
      {
        id: 'p10-l0-s0',
        title: 'Concept — Vulnerability, threat, risk, revisited',
        body: 'Phase 2 established the vocabulary and this phase applies it at scale. A vulnerability is the weakness — yours to fix. A threat is the actor who might exploit it. Risk combines likelihood and impact. A vulnerability scanner finds vulnerabilities and nothing else: it cannot tell you who is targeting you or what the business impact would be, which is why its output is an input to risk assessment rather than a substitute for one.',
      },
      {
        id: 'p10-l0-s1',
        title: 'Concept — What a CVE is',
        body: 'A CVE identifier is a unique name for a publicly disclosed vulnerability, in the form CVE-YEAR-NUMBER. That is all it is — a shared label so that everyone discussing an issue means the same one. A CVE carries no severity of its own, no exploitability judgement, and no indication of whether you are affected. Scoring comes from CVSS, and applicability comes from you checking your own estate.',
      },
      {
        id: 'p10-l0-s2',
        title: 'Concept — The CVSS base metrics',
        body: 'Eight base metrics split into two groups. Exploitability: Attack Vector (network, adjacent, local, physical), Attack Complexity, Privileges Required, and User Interaction. Impact: Confidentiality, Integrity and Availability, each high, low or none. Plus Scope, which is neither — it records whether the vulnerability can affect resources beyond the component it lives in, and it raises the score substantially when it changes.',
      },
      {
        id: 'p10-l0-s3',
        title: 'Concept — The severity bands',
        body: '0.0 is None, 0.1 to 3.9 is Low, 4.0 to 6.9 Medium, 7.0 to 8.9 High, and 9.0 to 10.0 Critical. Memorise the boundaries; the exam asks. But note what the bands describe: the vulnerability in the abstract, scored as though every affected system were reachable and important. Nothing in the formula knows about your network.',
      },
      {
        id: 'p10-l0-s4',
        title: 'Concept — What CVSS does not measure',
        body: 'Three things the base score cannot know. Whether the service is reachable in your network — the vector assumes it is. Whether the affected asset matters to your business. And whether a compensating control already blocks the attack path. This is why a 10.0 on a loopback-bound database can legitimately rank below a 9.8 on an internet-facing service, and why sorting a scan report by score is not prioritisation.',
      },
      {
        id: 'p10-l0-s5',
        title: 'Example — Mitigation moves the metrics',
        body: 'The score is not a fixed property of the software. Putting a service behind a VPN changes Attack Vector from Network to Adjacent and the score falls. Requiring authentication changes Privileges Required from None to Low. This is worth internalising because it reframes what controls do: they do not sit beside the vulnerability, they change the terms of the vector.',
      },
      {
        id: 'p10-l0-s6',
        title: 'Review — What must stick',
        body: 'A CVE is a name, not a severity. CVSS base has eight metrics in two groups plus Scope. Bands: 3.9, 6.9, 8.9, then Critical. CVSS scores the vulnerability, not your exposure — it cannot know reachability, asset value, or compensating controls. Controls change the metrics rather than sitting beside them.',
      },
    ],
    quiz: [
      {
        id: 'p10-q0',
        type: 'mcq',
        stem: 'What does a CVE identifier tell you about a vulnerability?',
        options: [
          'Its severity score',
          'Only that it is a uniquely identified, publicly disclosed vulnerability',
          'Whether your systems are affected',
          'How to exploit it',
        ],
        answer: 1,
        explanation:
          'A CVE is a shared name so everyone means the same issue. Severity comes from CVSS, and applicability comes from checking your own estate.',
        domain: 'Security Operations',
        conceptId: 'cve',
      },
      {
        id: 'p10-q1',
        type: 'scenario',
        stem: 'A finding scores CVSS 10.0, but the affected service is bound to 127.0.0.1 and unreachable from the network. How should it be prioritised?',
        options: [
          'First — a 10.0 always takes priority',
          'Below reachable findings with lower scores, because CVSS assumes network reachability the environment does not provide',
          'Closed as a false positive',
          'Escalated to executive management immediately',
        ],
        answer: 1,
        explanation:
          'The vulnerability is genuinely present, so it is not a false positive — but the vector assumes AV:N and no network attacker can reach it. Patch it in the normal cycle rather than ahead of exposed findings.',
        examClue:
          'When a question contrasts a score with an environmental constraint, the constraint decides the priority.',
        domain: 'Security Operations',
        conceptId: 'risk-prioritization',
      },
      {
        id: 'p10-q2',
        type: 'mcq',
        stem: 'In CVSS, what does Scope: Changed indicate?',
        options: [
          'The vulnerability was recently rescored',
          'The vulnerability can affect resources beyond the vulnerable component itself',
          'The affected software has changed version',
          'The score varies by environment',
        ],
        answer: 1,
        explanation:
          'Scope changed means impact crosses a security boundary — a container escape or a browser sandbox break. It raises the score substantially, which is why a scope-changed medium can outrank a scope-unchanged high.',
        domain: 'Security Operations',
        conceptId: 'cvss',
      },
      {
        id: 'p10-q3',
        type: 'scenario',
        stem: 'A service scored AV:N is moved behind a VPN so only internal users can reach it. What happens to the CVSS base score?',
        options: [
          'It is unchanged — base scores are fixed',
          'Attack Vector becomes Adjacent and the score falls',
          'It rises because the VPN adds complexity',
          'The finding becomes a false positive',
        ],
        answer: 1,
        explanation:
          'Controls change the metrics rather than sitting beside them. Restricting reachability moves Attack Vector from Network to Adjacent, which lowers exploitability and therefore the score.',
        domain: 'Security Operations',
        conceptId: 'cvss',
      },
    ],
  },

  {
    id: 'p10-lesson-1',
    phaseId: 'phase-10',
    title: 'Vulnerability Scanning, False Positives and Verification',
    objectives: [
      'Distinguish unauthenticated, authenticated and agent-based scanning',
      'Explain why authenticated scans produce fewer false positives',
      'Verify a finding before reporting it',
      'State the authorisation requirement for any scanning activity',
    ],
    concepts: ['vulnerability-scanning', 'false-positives', 'validation', 'authorisation'],
    homework:
      'Explain in writing how you would confirm a scanner finding is real before raising it, and what evidence would let you close it as a false positive.',
    careerConnection:
      'Reporting an unverified finding to an operations team is a fast way to lose their trust, and getting it back takes far longer than the verification would have.',
    sections: [
      {
        id: 'p10-l1-s0',
        title: 'Concept — Authorisation comes first',
        body: 'Scanning is intrusive. It generates traffic, it can destabilise fragile services, and against systems you do not own it may be unlawful. Scan only what you own or are contracted to test, with written scope and an agreed window. This is not a technical constraint to work around — it is the difference between a security assessment and an offence, and it belongs at the top of every scan plan.',
      },
      {
        id: 'p10-l1-s1',
        title: 'Concept — Three kinds of scan',
        body: 'An unauthenticated scan sees what an attacker sees from the network and infers software from banners. An authenticated or credentialed scan logs in and reads the actual installed packages, configuration and patch level. An agent-based scan runs continuously on the host and works even when the machine is off the network. Accuracy increases down that list, and so does deployment effort.',
      },
      {
        id: 'p10-l1-s2',
        title: 'Concept — Where false positives come from',
        body: 'Most false positives are version inference. An unauthenticated scanner reads Server: nginx/1.18.0 and matches it against affected ranges — but the banner can be wrong, back-ported patches leave version strings unchanged, and generic response fingerprints match software that is not installed. Credentialed scanning removes most of this by reading the package database instead of guessing.',
      },
      {
        id: 'p10-l1-s3',
        title: 'Concept — Verification is cheap and mandatory',
        body: 'Verifying a finding usually takes a few commands. Does the software actually exist on the host? Is the service actually reachable? Does the configuration actually say what the scanner inferred? Four commands settled a reported 9.8 Struts vulnerability on a host with no Java runtime at all. The cost of skipping that is a wasted maintenance window and a server team that discounts your next report.',
      },
      {
        id: 'p10-l1-s4',
        title: 'Concept — Confirmed-but-constrained is not a false positive',
        body: 'This distinction matters and gets conflated. A false positive means the vulnerability is not there. Confirmed-but-constrained means it is genuinely present but your environment limits exploitability — a vulnerable database bound to loopback, for instance. The first is suppressed with justification; the second is patched on a normal timeline. Dismissing the second as a false positive is how real findings quietly stay open.',
      },
      {
        id: 'p10-l1-s5',
        title: 'Concept — Suppression, done properly',
        body: 'When you confirm a false positive, suppress the plugin for that host and record why. Suppression without justification becomes indistinguishable from ignoring findings, and the next person cannot tell whether it was investigated or buried. Review suppressions periodically — the host that had no Java in March may run a Java application by September.',
      },
      {
        id: 'p10-l1-s6',
        title: 'Review — What must stick',
        body: 'Authorisation first: own it or be contracted, with written scope. Unauthenticated infers, authenticated reads, agent-based is continuous. Most false positives are version inference. Verify before reporting — it takes minutes. False positive and confirmed-but-constrained are different categories. Suppress with recorded justification, and review suppressions.',
      },
    ],
    quiz: [
      {
        id: 'p10-q4',
        type: 'mcq',
        stem: 'Why do authenticated scans produce substantially fewer false positives?',
        options: [
          'They run more slowly and carefully',
          'They read the actual installed package versions instead of inferring from banners',
          'They only report critical findings',
          'They skip network services entirely',
        ],
        answer: 1,
        explanation:
          'Unauthenticated scanning infers software from banners and response fingerprints, which is a guess. Credentialed scanning reads the package database, which is not.',
        domain: 'Security Operations',
        conceptId: 'vulnerability-scanning',
      },
      {
        id: 'p10-q5',
        type: 'scenario',
        stem: 'A scanner reports a critical Apache Struts vulnerability. The host runs nginx serving static content and has no Java runtime installed. What is the correct action?',
        options: [
          'Patch Struts immediately',
          'Confirm it as a false positive, suppress the plugin for this host, and record the justification',
          'Ignore the finding without documentation',
          'Escalate to the incident response team',
        ],
        answer: 1,
        explanation:
          'Struts is a Java framework and there is no Java on the host, so the software cannot be present. Suppress with recorded justification — undocumented suppression is indistinguishable from ignoring findings.',
        examClue:
          'When the reported software could not run on the platform described, the answer is false positive.',
        domain: 'Security Operations',
        conceptId: 'false-positives',
      },
      {
        id: 'p10-q6',
        type: 'scenario',
        stem: 'A vulnerable database version is confirmed installed, but the service is bound to loopback only. How should the finding be recorded?',
        options: [
          'False positive — it is not exploitable',
          'Confirmed, with the environmental constraint noted and a normal-cycle remediation timeline',
          'Critical, escalated immediately',
          'Suppressed permanently',
        ],
        answer: 1,
        explanation:
          'The vulnerability is genuinely present, so it is not a false positive — a local attacker or a compromised application could still reach it. What changes is priority, not validity.',
        domain: 'Security Operations',
        conceptId: 'validation',
      },
      {
        id: 'p10-q7',
        type: 'mcq',
        stem: 'What must be established before any vulnerability scan of a system?',
        options: [
          'A backup of the target system',
          'Written authorisation and defined scope, because scanning is intrusive and unauthorised scanning may be unlawful',
          'Agreement from the scanner vendor',
          'A penetration test report',
        ],
        answer: 1,
        explanation:
          'Scan only what you own or are contracted to test, with written scope and an agreed window. This is a permission question rather than a technical one.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'authorisation',
      },
    ],
  },

  {
    id: 'p10-lesson-2',
    phaseId: 'phase-10',
    title: 'Prioritisation, Remediation and Validation',
    objectives: [
      'Prioritise findings by exposure rather than raw score',
      'Apply the four risk treatments to vulnerability findings',
      'Explain patch and configuration management as ongoing processes',
      'Validate a remediation on both dimensions',
    ],
    concepts: [
      'risk-prioritization',
      'remediation',
      'patch-management',
      'configuration-management',
    ],
    homework:
      'Take five invented findings and order them for remediation, justifying the order with exposure and exploitability rather than score alone. State how you would validate each fix.',
    careerConnection:
      'Producing a prioritised, verified remediation plan is the deliverable that distinguishes a vulnerability management programme from a scanner subscription.',
    sections: [
      {
        id: 'p10-l2-s0',
        title: 'Concept — A scan report is not a work list',
        body: 'Handing raw scanner output to an operations team is the most common failure in this discipline. The report contains false positives, findings constrained by your environment, and an ordering that reflects the abstract vulnerability rather than your exposure. What operations needs is a verified, prioritised, actionable list — and producing that is the job.',
      },
      {
        id: 'p10-l2-s1',
        title: 'Concept — Prioritising by exposure',
        body: 'Start from the score, then adjust for what the score cannot know. Is the service actually reachable, and from where? How valuable is the asset? Is a compensating control already in place? Is there evidence this is being exploited in the wild, or already under attack in your own logs? In the lab estate this reordering is decisive: a 10.0 on loopback ranks below a 9.8 on a service the logs show already receiving attacks.',
      },
      {
        id: 'p10-l2-s2',
        title: 'Concept — The four treatments, again',
        body: 'Phase 2 named them and they apply here unchanged. Remediate: fix it. Mitigate: reduce likelihood or impact without fixing the underlying issue, such as restricting reachability. Transfer: move the financial consequence, usually contractually. Accept: decide formally to live with it. Acceptance is legitimate when documented and authorised by someone with the standing to authorise it — an undocumented shrug is not acceptance.',
      },
      {
        id: 'p10-l2-s3',
        title: 'Concept — Patch and configuration management',
        body: 'Patch management is the process that gets fixes deployed: inventory, testing, scheduling, deployment, verification. Configuration management is its counterpart for settings — a defined baseline, drift detection, and correction. Note that many findings are configuration rather than software: of the verified findings in this estate, more are config changes than patches. A programme that only patches leaves most of its findings open.',
      },
      {
        id: 'p10-l2-s4',
        title: 'Concept — Validation has two halves',
        body: 'Confirming the vulnerability is closed is the obvious half. The half people skip is confirming the service still works. A fix that breaks the application gets rolled back under pressure, the vulnerability returns, and you have spent the maintenance window for nothing. Capture evidence of both — the finding no longer reproduces, and the thing still does its job.',
      },
      {
        id: 'p10-l2-s5',
        title: 'Concept — Scan versus penetration test',
        body: 'They answer different questions. A scan asks what known weaknesses exist: automated, broad, repeatable, and prone to false positives. A penetration test asks what an attacker could actually achieve: manual, deep, and able to chain findings. That chaining is the capability automation lacks — a tester notices that a low-severity disclosure reveals a path that makes a medium-severity weakness exploitable, and reports one critical finding where the scanner reported two unremarkable rows.',
      },
      {
        id: 'p10-l2-s6',
        title: 'Review — What must stick',
        body: 'Scanner output is an input, not a work list. Prioritise by reachability, asset value, compensating controls and active exploitation. Four treatments: remediate, mitigate, transfer, accept — accept must be documented and authorised. Patch management covers software, configuration management covers settings, and most findings are settings. Validate both that it is fixed and that it still works. Pentests chain findings; scans do not.',
      },
    ],
    quiz: [
      {
        id: 'p10-q8',
        type: 'scenario',
        stem: 'A remediation closes the vulnerability but breaks the application. What is the likely outcome?',
        options: [
          'The vulnerability stays closed regardless',
          'The change is rolled back under pressure and the vulnerability returns',
          'The application is decommissioned',
          'The finding is automatically reclassified as accepted risk',
        ],
        answer: 1,
        explanation:
          'A fix that breaks the service does not survive contact with the business. Validation has two halves — the vulnerability is gone and the service still works — and skipping the second wastes the maintenance window.',
        examClue:
          'Validation questions usually turn on whether the answer checks that the system still functions.',
        domain: 'Security Operations',
        conceptId: 'remediation',
      },
      {
        id: 'p10-q9',
        type: 'mcq',
        stem: 'Which capability distinguishes a penetration test from a vulnerability scan?',
        options: [
          'It uses more scanners',
          'It chains multiple findings together to demonstrate real attack paths',
          'It runs continuously',
          'It produces more findings',
        ],
        answer: 1,
        explanation:
          'Chaining is what automation cannot do. A tester combines a minor disclosure with a weak permission into one critical finding; a scanner reports two unremarkable rows.',
        domain: 'Security Operations',
        conceptId: 'remediation',
      },
      {
        id: 'p10-q10',
        type: 'scenario',
        stem: 'An organisation formally decides not to fix a low-severity finding on an isolated legacy system. What is required for this to be legitimate risk acceptance?',
        options: [
          'Nothing — low severity findings can be ignored',
          'Documentation of the decision, the rationale, and authorisation by someone with the standing to accept it',
          'Approval from the scanner vendor',
          'A penetration test confirming exploitability',
        ],
        answer: 1,
        explanation:
          'Acceptance is a legitimate treatment when documented and authorised. Undocumented inaction is not acceptance — it is an unmanaged risk that nobody has agreed to carry.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'risk-prioritization',
      },
      {
        id: 'p10-q11',
        type: 'pbq',
        stem: 'Order the vulnerability management cycle: [0] Prioritise by exposure, [1] Scan within authorised scope, [2] Validate the fix and the service, [3] Verify findings and remove false positives, [4] Remediate.',
        options: [
          'Scan within authorised scope',
          'Verify findings and remove false positives',
          'Prioritise by exposure',
          'Remediate',
          'Validate the fix and the service',
        ],
        answer: [1, 3, 0, 4, 2],
        explanation:
          'Scan, verify, prioritise, remediate, validate. Verification comes before prioritisation because ranking false positives is wasted effort, and validation closes the loop by confirming both that the finding is gone and that the service still works.',
        domain: 'Security Operations',
        conceptId: 'patch-management',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p10-lab-0',
    phaseId: 'phase-10',
    title: 'Score Vulnerabilities with CVSS',
    objective:
      'Use the CVSS v3.1 base metrics to score findings, and show how a control changes the vector rather than sitting beside it.',
    securityConcepts: ['CVSS', 'Severity bands', 'Scope', 'Mitigation'],
    environment: 'Interactive CVSS calculator implementing the published v3.1 formula',
    topology: 'Findings from the Northwind lab estate',
    prerequisites: ['Complete Phase 9'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the CVSS base metrics and the severity bands.',
        command: 'explain cvss',
        expected: 'Eight base metrics in two groups plus Scope, and the five severity bands.',
      },
      {
        id: 's1',
        instruction:
          'Open the CVSS calculator and score a network-reachable RCE: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H.',
        expected: '9.8, Critical.',
      },
      {
        id: 's2',
        instruction:
          'Change Attack Vector to Adjacent — the effect of putting the service behind a VPN — and note the new score.',
        expected: 'The score falls; exploitability dropped without the impact changing.',
      },
      {
        id: 's3',
        instruction: 'Change Scope to Changed on the original vector and note the effect.',
        expected: 'The score rises to 10.0 — scope change raises impact beyond the component.',
      },
    ],
    expectedResults: [
      'Base metrics understood in both groups',
      'Severity bands memorised',
      'The effect of a control observed as a metric change',
      'Scope understood as crossing a security boundary',
    ],
    verification: [
      'Learner can read a CVSS vector aloud and state the severity band',
      'Learner can name a control that changes Attack Vector',
      'Learner can explain what Scope: Changed means',
    ],
    troubleshooting: [
      'Score seems wrong → check Scope, which changes both the Privileges Required weights and the impact formula.',
      'Unsure of a band boundary → 3.9, 6.9, 8.9 are the three you need.',
    ],
    challenge:
      'Take a finding scored 9.8 and describe three different controls that would each lower it, naming the metric each one changes and estimating the resulting score. Then say which of the three you would actually deploy and why.',
    evidence: [
      {
        id: 'ev0',
        label: 'CVSS scoring exercise',
        type: 'report',
        placeholder: 'Vector, score, severity, control applied, resulting vector and score',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'CVSS scores the vulnerability, not your exposure to it. The base score assumes the affected system is reachable and matters — and controls work by changing the metrics rather than sitting alongside them.',
  },

  {
    id: 'p10-lab-1',
    phaseId: 'phase-10',
    title: 'Scan an Isolated Lab System',
    objective:
      'Read a vulnerability scan report of the lab estate, understand what the scan type could and could not see, and confirm the authorisation constraints.',
    securityConcepts: ['Vulnerability scanning', 'Scan types', 'Authorisation', 'Scan reports'],
    environment:
      'Deterministic simulator — prepared scan output for the platform own simulated estate. Nothing is executed and no live host is contacted.',
    topology: 'Authorised scope 192.168.1.0/24 — the owned lab environment',
    prerequisites: ['Complete "Score Vulnerabilities with CVSS"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the scan types and the authorisation requirement.',
        command: 'explain vulnerability scanning',
        expected:
          'Unauthenticated, authenticated and agent-based, plus the authorisation constraint.',
      },
      {
        id: 's1',
        instruction: 'Read the scan report for the lab estate.',
        command: 'show scan report',
        expected: 'Eight findings — described explicitly as scanner output, not a work list.',
      },
      {
        id: 's2',
        instruction: 'Cross-reference the Phase 1 network scan of the same range.',
        command: 'nmap -sv 192.168.1.0/24',
        expected: 'The same three hosts and services, at the port level.',
      },
      {
        id: 's3',
        instruction: 'Compare scanning with penetration testing.',
        command: 'compare scan pentest',
        expected: 'Different questions; chaining is what a scan cannot do.',
      },
    ],
    expectedResults: [
      'Scan types distinguished by what each can see',
      'Authorisation constraint stated before any scanning discussion',
      'Scan report read as an input rather than a work list',
      'Scan and penetration test distinguished by capability',
    ],
    verification: [
      'Learner can state what must be established before scanning anything',
      'Learner can explain why authenticated scans see more',
      'Learner can name the capability that distinguishes a pentest',
    ],
    troubleshooting: [
      'Scan report seems to contradict the nmap output → they see different layers. Ports versus inferred software versions.',
      'Unsure whether scanning is permitted → if you cannot point to written authorisation and a scope, the answer is no.',
    ],
    challenge:
      'Write the authorisation section of a scan plan: the scope in CIDR, the window, the scan type, who authorised it, and the escalation contact if a scan destabilises a service. Then say what you would do differently for a system you did not own.',
    evidence: [
      {
        id: 'ev0',
        label: 'Scan plan',
        type: 'report',
        placeholder: 'Scope, window, scan type, authorisation, escalation contact',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Scanning is intrusive and, against systems you do not own, may be unlawful. Written authorisation and defined scope come before any technical consideration — that is the difference between an assessment and an offence.',
  },

  {
    id: 'p10-lab-2',
    phaseId: 'phase-10',
    title: 'Verify Findings and Eliminate False Positives',
    objective:
      'Verify each scan finding against the real estate, separate false positives from confirmed issues, and distinguish confirmed-but-constrained from either.',
    securityConcepts: ['False positives', 'Verification', 'Evidence', 'Suppression'],
    environment: 'Interactive findings triage plus the deterministic simulator',
    topology: 'Eight findings across SRV-01, WS-01, FW-01 and SW-01',
    prerequisites: ['Complete "Scan an Isolated Lab System"'],
    steps: [
      {
        id: 's0',
        instruction: 'Verify the highest-scoring finding on SRV-01.',
        command: 'verify finding struts',
        expected: 'False positive — no Java runtime on the host at all.',
      },
      {
        id: 's1',
        instruction: 'Verify the PostgreSQL finding and note the distinction it teaches.',
        command: 'verify finding postgres',
        expected: 'Confirmed, but bound to loopback — constrained rather than false.',
      },
      {
        id: 's2',
        instruction: 'Confirm the loopback binding independently.',
        command: 'ss -tulpn',
        expected: 'postgres on 127.0.0.1 only.',
      },
      {
        id: 's3',
        instruction:
          'Open the Vulnerability Management view and triage all eight findings as confirmed or false positive.',
        expected: 'Six confirmed and two false positives, graded in both error directions.',
      },
    ],
    expectedResults: [
      'Two false positives identified and justified',
      'Confirmed-but-constrained distinguished from false positive',
      'Verification performed with evidence rather than assumption',
      'Both error directions understood',
    ],
    verification: [
      'Learner can explain why the Struts finding cannot be real on that host',
      'Learner can explain why the PostgreSQL finding is not a false positive',
      'Learner can state what suppression requires',
    ],
    troubleshooting: [
      'Tempted to call the constrained finding a false positive → the software is genuinely installed. Only the priority changes.',
      'Unsure how to verify → ask whether the software exists, whether the service is reachable, and whether the config says what was inferred.',
    ],
    challenge:
      'Write the suppression justification for both false positives, in the form a colleague could audit in a year: what was checked, what was found, and what would invalidate the suppression.',
    evidence: [
      {
        id: 'ev0',
        label: 'Verification record',
        type: 'report',
        placeholder: 'CVE, scanner basis, checks performed, conclusion, action',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Verification takes minutes and protects both the maintenance window and your credibility. And false positive is not the same as confirmed-but-constrained — conflating them is how genuine findings quietly stay open.',
  },

  {
    id: 'p10-lab-3',
    phaseId: 'phase-10',
    title: 'Prioritise, Remediate and Validate',
    objective:
      'Produce the full deliverable: prioritised findings with severity, evidence, risk, remediation and validation.',
    securityConcepts: ['Prioritisation', 'Remediation', 'Validation', 'Risk treatment'],
    environment: 'Interactive prioritisation view plus the deterministic simulator',
    topology: 'Verified findings across the lab estate',
    prerequisites: ['Complete "Verify Findings and Eliminate False Positives"'],
    steps: [
      {
        id: 's0',
        instruction:
          'Open the Prioritisation tab and compare the raw-score ordering against the exposure-aware one.',
        expected: 'The top finding differs between the two orderings.',
      },
      {
        id: 's1',
        instruction: 'Review the sequenced remediation plan.',
        command: 'show remediation plan',
        expected: 'Verified findings only, ordered by exposure, with suppressions recorded.',
      },
      {
        id: 's2',
        instruction: 'Review what validation must demonstrate.',
        command: 'validate remediation',
        expected: 'The finding is gone AND the service still works.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the SSH configuration this remediation changes.',
        command: 'show sshd config',
        expected: 'The pre-remediation state from Phase 9.',
      },
    ],
    expectedResults: [
      'Two orderings compared and the difference explained',
      'Remediation plan containing verified findings only',
      'Suppressions recorded with justification',
      'Validation understood as two-sided',
    ],
    verification: [
      'Learner can explain why the 10.0 finding is not first',
      'Learner can name the four risk treatments',
      'Learner can state both halves of validation',
    ],
    troubleshooting: [
      'Ordering feels wrong → check reachability first. A vulnerability nothing can reach is not the most urgent one.',
      'Unsure how to record acceptance → it needs a documented rationale and an authoriser with the standing to accept it.',
    ],
    challenge:
      'Produce the complete report for this estate in the six-part structure: findings, severity, evidence, risk, remediation, validation. Then write the one paragraph you would put at the top for a manager who will read only that.',
    evidence: [
      {
        id: 'ev0',
        label: 'Vulnerability management report',
        type: 'report',
        placeholder: 'Finding, severity, evidence, risk, remediation, validation',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The deliverable is a verified, prioritised, actionable plan — not a scanner export. Ordering by exposure rather than by score is what makes it useful to the people who have to action it.',
  },
];

export const PHASE_10: Phase = {
  id: 'phase-10',
  number: 10,
  title: 'Vulnerability Management',
  description:
    'Finding weaknesses systematically rather than by hand. CVE and CVSS, scan types and why false positives happen, verification before reporting, and prioritisation by real exposure rather than by the number the scanner printed.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: LESSONS,
  labs: LABS,
};
