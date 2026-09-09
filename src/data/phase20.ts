import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 20 — Security Automation
// Aligned with CompTIA Security+ SY0-701 (Domain 4: Security Operations)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Python & Automation Fundamentals for Security ----------

const LESSON_20_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p20-l1-s0',
    title: 'Concept — Why Python for Security Automation',
    body:
      'Python is the de facto language of security automation: readable syntax, a huge standard library (re for pattern matching, json for structured data, csv for logs), and a mature ecosystem of security-specific libraries. The exam does not ask you to write Python, but it does expect you to recognise what a script is doing conceptually — parsing, detecting, enriching, reporting, or responding — and to reason about whether it follows secure coding practices. Automation does not replace an analyst\'s judgement; it removes the repetitive first ninety percent of a task so the analyst can focus on the ten percent that requires a human decision.',
  },
  {
    id: 'p20-l1-s1',
    title: 'Concept — JSON as the Lingua Franca of Security APIs',
    body:
      'JSON (JavaScript Object Notation) represents structured data as nested key-value pairs, arrays, and primitive values — readable by humans and trivially parsed by machines. Almost every modern security API (SIEM query results, threat-intelligence lookups, ticketing systems) returns JSON. Reading a JSON response means walking its structure: a top-level object might contain a "results" array, where each element is an object with fields like "ip", "reputation_score", and "last_seen". Understanding this structure is the prerequisite for writing any script that consumes an API response.',
  },
  {
    id: 'p20-l1-s2',
    title: 'Concept — Regular Expressions for Log Parsing',
    body:
      'A regular expression (regex) defines a search pattern used to find and extract specific pieces of structured data from unstructured or semi-structured text — such as pulling an IP address, a timestamp, or a username out of a raw log line. A pattern like \\d{1,3}(\\.\\d{1,3}){3} matches an IPv4-shaped string; a more specific pattern anchors it to word boundaries and validates the octet ranges. Regex is powerful but brittle: a log format change can silently break a parsing script, which is why production log parsers are usually tested against a library of sample lines, not just "it worked on the log I looked at once."',
  },
  {
    id: 'p20-l1-s3',
    title: 'Concept — APIs and Secure Automation Practices',
    body:
      'A REST API exposes functionality over HTTP: a GET request typically retrieves data, a POST request typically submits or creates something, and the response includes a status code (200 success, 401 unauthorised, 429 rate-limited, 500 server error) that a well-written script must handle explicitly rather than assuming every call succeeds. Authentication to an API almost always requires a credential — this is exactly the secrets-management problem from Phase 14 and Phase 16: the credential belongs in an environment variable or a secrets manager, never hardcoded in the script\'s source, because source code is frequently shared, reviewed, or committed to version control where a hardcoded secret becomes permanently exposed.',
  },
  {
    id: 'p20-l1-s4',
    title: 'Concept — SOAR: Security Orchestration, Automation, and Response',
    body:
      'SOAR platforms combine automation (scripted individual tasks) with orchestration (coordinating multiple tools and tasks into a single workflow) into repeatable playbooks — for example, automatically enriching every new alert with threat-intelligence context, but pausing for human approval before taking any destructive action like disabling an account or blocking an IP. The exam\'s key distinction: automation executes one task; orchestration coordinates many; SOAR packages both into a structured, auditable, and — critically — appropriately gated response process.',
  },
  {
    id: 'p20-l1-s5',
    title: 'Example — Reading a failed-login counting script conceptually',
    body:
      'A script reads an authentication log, uses a regex to extract the timestamp, username, and source IP from each line, groups events by source IP within a sliding 10-minute window, and flags any IP with more than five failed attempts in that window. This is the same detection logic a SIEM correlation rule performs, expressed as a standalone script — parsing extracts the fields, and detection applies the threshold. Neither step alone finds the attacker; the extraction has to happen correctly before the threshold logic has anything meaningful to count.',
  },
  {
    id: 'p20-l1-s6',
    title: 'Review — What must stick',
    body:
      'Python is the standard tool for security scripting because of its readability and library ecosystem, not because it is uniquely capable. JSON is the structured-data format nearly every security API returns — understanding its nested key-value structure is a prerequisite skill. Regex extracts structured fields from unstructured log text but is brittle to format changes. API credentials belong in environment variables or a secrets manager, never hardcoded. SOAR = orchestration (coordinating tools) + automation (individual tasks) + response (gated, auditable action).',
  },
];

const LESSON_20_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p20-q0',
    type: 'mcq',
    stem: 'What is the primary purpose of a regular expression (regex) in log parsing?',
    options: [
      'To define a search pattern that matches and extracts specific pieces of structured data (like an IP address or timestamp) from unstructured text',
      'To encrypt log files at rest',
      'To compress log files for storage',
      'To automatically delete old log entries',
    ],
    answer: 0,
    explanation:
      'Regex defines a pattern used to locate and extract specific substrings — such as an IP address or timestamp — from otherwise unstructured log text.',
    domain: 'Security Operations',
    conceptId: 'log-parsing',
  },
  {
    id: 'p20-q1',
    type: 'mcq',
    stem: 'What data format do most modern security APIs (SIEM, threat intelligence, ticketing) use to structure their responses?',
    options: ['JSON', 'CSV only', 'Plain unformatted text only', 'Binary-only formats'],
    answer: 0,
    explanation:
      'JSON\'s nested key-value structure is the near-universal format for modern security API responses, readable by both humans and scripts.',
    domain: 'Security Operations',
    conceptId: 'security-apis',
  },
  {
    id: 'p20-q2',
    type: 'mcq',
    stem: 'Why should an automation script load an API credential from an environment variable or secrets manager instead of hardcoding it in the source file?',
    options: [
      'Hardcoded secrets are exposed to anyone who can read the source file or its version-control history',
      'Environment variables make the script run faster',
      'Hardcoding is required by most security frameworks',
      'There is no meaningful difference between the two approaches',
    ],
    answer: 0,
    explanation:
      'Source code is frequently shared, reviewed, or stored in version control — a hardcoded credential in that code becomes permanently exposed to everyone with access to it.',
    domain: 'Security Operations',
    conceptId: 'secure-automation-practices',
  },
  {
    id: 'p20-q3',
    type: 'mcq',
    stem: 'What does SOAR stand for?',
    options: [
      'Security Orchestration, Automation, and Response',
      'Security Operations and Recovery',
      'System Observation and Reporting',
      'Standard Operating Automation Rules',
    ],
    answer: 0,
    explanation:
      'SOAR combines orchestration (coordinating multiple tools), automation (executing individual tasks), and response (taking appropriately gated action) into repeatable playbooks.',
    domain: 'Security Operations',
    conceptId: 'soar',
  },
  {
    id: 'p20-q4',
    type: 'mcq',
    stem: 'What is the key difference between automation and orchestration?',
    options: [
      'Automation performs a single repetitive task; orchestration coordinates multiple automated tasks and tools into one coherent workflow',
      'Orchestration only applies to network devices, never to security tools',
      'Automation and orchestration are the same concept with different names',
      'Orchestration always requires more staff than automation',
    ],
    answer: 0,
    explanation:
      'Automation handles one task at a time; orchestration is the coordination layer that strings multiple automated tasks and tools together into a single workflow.',
    domain: 'Security Operations',
    conceptId: 'soar',
  },
  {
    id: 'p20-q5',
    type: 'mcq',
    stem: 'What does an HTTP status code of 429 typically indicate when returned by a security API?',
    options: [
      'The client has been rate-limited and should slow down or back off before retrying',
      'The request succeeded with no data returned',
      'The server experienced an internal error unrelated to the client',
      'The requested resource does not exist',
    ],
    answer: 0,
    explanation:
      '429 (Too Many Requests) signals the client has exceeded the API\'s rate limit — a well-written script should back off rather than retrying immediately or indefinitely.',
    domain: 'Security Operations',
    conceptId: 'security-apis',
  },
  {
    id: 'p20-q6',
    type: 'scenario',
    stem: 'A script extracts the timestamp, username, and source IP from each line of an authentication log using a regex pattern. Which automation pipeline stage does this represent?',
    options: ['Parsing', 'Enrichment', 'Reporting', 'Response'],
    answer: 0,
    explanation:
      'Extracting structured fields from unstructured raw text is the parsing stage — the prerequisite step before detection logic can run.',
    domain: 'Security Operations',
    conceptId: 'log-parsing',
  },
  {
    id: 'p20-q7',
    type: 'scenario',
    stem: 'A log parsing script that worked perfectly for months suddenly extracts no data at all after a vendor pushed an update changing the log format. What does this illustrate about regex-based parsing?',
    options: [
      'Regex-based parsing is brittle to format changes and should be tested against a library of sample log lines, not assumed permanently stable',
      'This means regex should never be used for log parsing under any circumstances',
      'The script must have been infected with malware',
      'This is expected behaviour and requires no further action',
    ],
    answer: 0,
    explanation:
      'A regex pattern is tied to a specific text structure; any change to that structure — such as a vendor log-format update — can silently break extraction with no error thrown.',
    domain: 'Security Operations',
    conceptId: 'log-parsing',
  },
  {
    id: 'p20-q8',
    type: 'scenario',
    stem: 'A SOAR playbook automatically enriches every new alert with threat-intelligence context, but pauses and requires analyst approval before blocking an IP at the firewall. What principle does this reflect?',
    options: [
      'Human-in-the-loop approval for destructive or high-impact automated actions, even within an otherwise automated workflow',
      'SOAR platforms cannot perform any enrichment automatically',
      'This configuration provides no benefit over a fully manual process',
      'Blocking an IP should always happen automatically with no review'
    ],
    answer: 0,
    explanation:
      'Automating low-risk, reversible steps (enrichment) while gating high-impact, hard-to-reverse actions (blocking) behind human approval is the standard safe SOAR design pattern.',
    domain: 'Security Operations',
    conceptId: 'soar',
  },
  {
    id: 'p20-q9',
    type: 'scenario',
    stem: 'A developer commits a script to a shared code repository with a threat-intelligence API credential written directly in the source file. Six months later, a contractor with read access to the repository is found to have used that credential externally. What was the root cause?',
    options: [
      'The credential was hardcoded in source code that was shared beyond the people who should have had access to that credential',
      'The contractor\'s access to the repository was itself unauthorised',
      'Threat-intelligence APIs should never require any credential',
      'This could not have been prevented by any coding practice',
    ],
    answer: 0,
    explanation:
      'Hardcoding a credential in shared source code exposes it to everyone with read access to that repository — far beyond whoever was intended to use the credential.',
    domain: 'Security Operations',
    conceptId: 'secure-automation-practices',
  },
  {
    id: 'p20-q-pbq',
    type: 'pbq',
    stem: 'Order the safe automation of a high-impact response action.',
    options: [
      'Define the exact trigger conditions and scope',
      'Automate non-destructive enrichment and evidence gathering',
      'Require human approval before the destructive action',
      'Execute the action, then log and validate the outcome',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'A SOAR playbook must be scoped, then gather context, then gate anything that breaks things, then act and verify.',
    domain: 'Security Operations',
    conceptId: 'soar',
  },
];

// ---------- Lesson 2: Building Security Automation Projects ----------

const LESSON_20_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p20-l2-s0',
    title: 'Concept — Detecting Repeated Failed Logins',
    body:
      'The classic first security automation project: parse an authentication log, group failed-login events by account or source IP, and apply a threshold within a time window (e.g., more than five failures in ten minutes) to flag likely brute-force or credential-stuffing activity. This is the same logic introduced conceptually in Phase 7\'s SOC console and Phase 8\'s Windows Event ID 4625 analysis, now expressed as a repeatable script instead of a one-time manual review. The threshold and window are tunable — too sensitive and it floods analysts with false positives from users who simply mistyped a password; too loose and it misses a slow, deliberate attack spread out to avoid detection.',
  },
  {
    id: 'p20-l2-s1',
    title: 'Concept — Extracting Indicators of Compromise (IOCs) from Text',
    body:
      'A script can extract IOCs — IP addresses, domains, file hashes, URLs — from free-text sources like incident notes, phishing email bodies, or threat reports, using regex patterns tuned to each indicator\'s shape. An MD5 hash is exactly 32 hexadecimal characters; a SHA-256 hash is 64. A defanged URL (hxxps://malicious-site[.]example/) is deliberately mangled so it cannot be accidentally clicked when shared in a report, and a script must first "re-fang" it before validating or querying it. Correctly typing an indicator matters: submitting an IP where a domain was expected returns meaningless results from most threat-intelligence APIs.',
  },
  {
    id: 'p20-l2-s2',
    title: 'Concept — Automating Report Generation',
    body:
      'A report-generation script turns a list of findings into a structured, consistent artifact: summary, evidence, severity, and recommended remediation for each item — the same structure required throughout this platform\'s labs (Phase 25 formalises this into a GitHub portfolio project). Automating this step ensures every incident report follows an identical structure regardless of which analyst or shift produced it, which matters enormously when reports are later compared, audited, or handed to a different team for follow-up.',
  },
  {
    id: 'p20-l2-s3',
    title: 'Concept — Querying a Simulated Security API',
    body:
      'Querying a threat-intelligence API to check an indicator\'s reputation follows a repeatable pattern: build the request (including authentication, loaded from an environment variable rather than hardcoded), send it, check the response status code, parse the JSON body for the fields needed (reputation score, first/last seen, associated campaigns), and handle failure cases (rate limiting, timeouts, malformed responses) explicitly rather than assuming the call always succeeds. A script that only handles the success path will fail unpredictably in production the first time the API has a bad day.',
  },
  {
    id: 'p20-l2-s4',
    title: 'Concept — Automating Evidence Collection',
    body:
      'An evidence-collection script should record what it collected, when, and a cryptographic hash of the collected artifact at the moment of collection — establishing chain of custody automatically rather than relying on a human to remember to do it. Automation here must remain read-only against the target system: a collection script that modifies timestamps, deletes temporary files it created carelessly, or otherwise alters system state undermines the integrity of the very evidence it is trying to preserve.',
  },
  {
    id: 'p20-l2-s5',
    title: 'Example — A gated SOAR enrichment playbook',
    body:
      'An alert fires for a login from an unfamiliar country. The playbook automatically extracts the source IP, queries a threat-intelligence API for its reputation score, and — only if the score exceeds a defined threshold — opens a ticket for analyst review with the enrichment data attached. If the score is below threshold, the playbook logs the check and takes no further action. No account is disabled and no IP is blocked automatically; those decisions remain with the human analyst reviewing the ticket. This is automation and enrichment fully engaged, with response intentionally left as a human decision.',
  },
  {
    id: 'p20-l2-s6',
    title: 'Review — What must stick',
    body:
      'Failed-login detection is a parsing step (extract fields) followed by a detection step (apply a threshold within a time window) — both must work correctly. IOC extraction requires recognising each indicator type\'s distinct shape (MD5 = 32 hex chars, SHA-256 = 64) and handling defanged formats. Report generation should produce a consistent structure regardless of which analyst ran it. API queries must handle failure paths, not just the success case. Evidence collection scripts must be read-only against the target and must hash evidence at collection time to preserve chain of custody.',
  },
];

const LESSON_20_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p20-q10',
    type: 'mcq',
    stem: 'A brute-force detection script flags any source IP with more than five failed logins in a ten-minute window. What happens if this threshold is set too low (e.g., two failures in ten minutes)?',
    options: [
      'The script will generate excessive false positives from users who simply mistyped a password',
      'The script will miss all brute-force attacks entirely',
      'A lower threshold has no effect on detection accuracy',
      'The script will stop parsing the log file altogether',
    ],
    answer: 0,
    explanation:
      'An overly sensitive threshold floods analysts with false positives from ordinary user error, reducing the signal-to-noise ratio of the detection.',
    domain: 'Security Operations',
    conceptId: 'failed-login-detection',
  },
  {
    id: 'p20-q11',
    type: 'mcq',
    stem: 'How many hexadecimal characters does a valid MD5 hash contain?',
    options: ['32', '64', '16', '128'],
    answer: 0,
    explanation:
      'MD5 hashes are always exactly 32 hexadecimal characters (128 bits). SHA-256 hashes are 64 hexadecimal characters (256 bits).',
    domain: 'Security Operations',
    conceptId: 'ioc-extraction',
  },
  {
    id: 'p20-q12',
    type: 'mcq',
    stem: 'Why is a URL like hxxps://malicious-site[.]example/ written in "defanged" form in a report?',
    options: [
      'To prevent the link from being accidentally clicked or auto-linked when the report is shared',
      'Because the URL is not actually malicious',
      'Defanging is required by every threat-intelligence API',
      'It has no practical purpose and is purely cosmetic',
    ],
    answer: 0,
    explanation:
      'Defanging mangles the URL just enough that it cannot be clicked or auto-hyperlinked accidentally, while remaining readable and re-constructible by an analyst or script.',
    domain: 'Security Operations',
    conceptId: 'ioc-extraction',
  },
  {
    id: 'p20-q13',
    type: 'mcq',
    stem: 'What is the main benefit of automating security report generation across a team?',
    options: [
      'Every report follows an identical structure regardless of which analyst produced it, making comparison and audit easier',
      'It eliminates the need to record any evidence',
      'It removes the need for a security lesson or remediation section',
      'Automated reports never need any human review',
    ],
    answer: 0,
    explanation:
      'Consistency across reports — same structure, same required sections — is what makes later comparison, audit, and handoff between teams practical.',
    domain: 'Security Operations',
    conceptId: 'report-generation',
  },
  {
    id: 'p20-q14',
    type: 'mcq',
    stem: 'What must an evidence-collection script preserve to maintain chain of custody?',
    options: [
      'A cryptographic hash of each collected artifact and a timestamp, recorded at the moment of collection',
      'A copy of the analyst\'s personal notes only',
      'The original file\'s creation date changed to the collection date',
      'Nothing — automation inherently satisfies chain-of-custody requirements',
    ],
    answer: 0,
    explanation:
      'A hash recorded at collection time is what later proves the evidence was not altered — without it, chain of custody cannot be established.',
    domain: 'Security Operations',
    conceptId: 'evidence-automation',
  },
  {
    id: 'p20-q15',
    type: 'scenario',
    stem: 'An evidence-collection script copies files from a compromised host but also silently updates the files\' last-accessed timestamps in the process. What is the problem?',
    options: [
      'Modifying system state (even metadata) on the target undermines the integrity of the evidence the script is meant to preserve',
      'This is standard practice and causes no issues',
      'Timestamps are irrelevant to forensic evidence',
      'This only matters if the files are later deleted',
    ],
    answer: 0,
    explanation:
      'A collection process must be read-only against the target; altering timestamps or other metadata, even unintentionally, can compromise the evidentiary value of the collected artifacts.',
    domain: 'Security Operations',
    conceptId: 'evidence-automation',
  },
  {
    id: 'p20-q16',
    type: 'scenario',
    stem: 'A script queries a threat-intelligence API and only has code to handle a successful 200 response. During a vendor outage, the API returns a 500 error, and the script crashes with an unhandled exception, silently failing to complete its enrichment step for the rest of the shift. What was missing?',
    options: [
      'Explicit handling for failure status codes (rate limits, server errors, timeouts), not just the success path',
      'A faster internet connection',
      'A larger authentication token',
      'This is expected and acceptable behaviour for any automation script',
    ],
    answer: 0,
    explanation:
      'A script that only handles the success path will fail unpredictably — and often silently — the first time the API has any kind of problem, which real-world APIs eventually do.',
    domain: 'Security Operations',
    conceptId: 'security-apis',
  },
  {
    id: 'p20-q17',
    type: 'scenario',
    stem: 'A SOAR playbook automatically extracts a source IP from an alert, queries its reputation via a threat-intelligence API, and only opens a ticket for analyst review if the reputation score exceeds a defined threshold — taking no further automated action itself. Which two pipeline stages does this playbook combine, and which stage is intentionally left to a human?',
    options: [
      'It combines parsing/detection and enrichment; the response (blocking, disabling) stage is intentionally left to human analyst judgement',
      'It combines reporting and response only, with no parsing or enrichment',
      'It performs every pipeline stage fully automatically with no human involvement',
      'This playbook does not perform any automation at all'
    ],
    answer: 0,
    explanation:
      'The playbook automates extraction/detection and enrichment (querying reputation), but deliberately stops short of an automated response, leaving that judgement call to a human analyst.',
    domain: 'Security Operations',
    conceptId: 'soar',
  },
  {
    id: 'p20-q18',
    type: 'scenario',
    stem: 'A failed-login detection script correctly identifies a source IP exceeding the failure threshold, but the report it generates does not include the source IP as an extracted indicator anywhere in its output. What has gone wrong across the pipeline?',
    options: [
      'The reporting stage failed to surface the key indicator the detection stage identified, breaking the chain from finding to actionable evidence',
      'This is not a problem since the detection logic itself worked correctly',
      'The parsing stage must have failed, even though detection succeeded',
      'IOC extraction and reporting are unrelated pipeline stages with no dependency on each other',
    ],
    answer: 0,
    explanation:
      'Each pipeline stage depends on the output of the one before it being carried forward. A detection finding that never reaches the report is a broken pipeline, even if the detection logic itself was correct.',
    domain: 'Security Operations',
    conceptId: 'report-generation',
  },
];

// ---------- Lab 1: Parse Authentication Logs and Detect Failed Login Patterns ----------

const LAB_20_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the raw authentication log sample to be parsed.',
    command: 'show raw auth log',
    expected: 'A raw log sample containing a mix of successful and failed login lines across several source IPs.',
  },
  {
    id: 's1',
    instruction: 'Review the log parsing script logic (as pseudocode/annotated Python) that extracts structured fields.',
    command: 'show log parsing script',
    expected: 'An annotated script showing the regex pattern used and which fields it extracts from each line.',
  },
  {
    id: 's2',
    instruction: 'Review the failed-login threshold analysis produced from the parsed data.',
    command: 'show failed login analysis',
    expected: 'A report showing one source IP exceeding the failure threshold within the time window, with the IP itself as the flagged indicator.',
  },
];

const LAB_20_0: Lab = {
  id: 'p20-lab-0',
  phaseId: 'phase-20',
  title: 'Parse Authentication Logs and Detect Failed Login Patterns',
  objective:
    'Review a raw authentication log, the parsing logic used to extract structured fields from it, and the resulting failed-login threshold analysis, then identify the flagged indicator and justify the detection threshold.',
  securityConcepts: [
    'Regex-based log parsing',
    'Failed-login threshold detection',
    'IOC extraction',
    'Pipeline stage dependency (parsing → detection)',
  ],
  environment: 'Deterministic automation simulator — prepared outputs only; no script is actually executed',
  topology: 'A simulated authentication log covering 4 source IPs and 3 user accounts over a 30-minute window',
  prerequisites: ['Complete Phase 7 (Security Operations / SOC)', 'Complete Phase 8 (Windows Security)'],
  steps: LAB_20_0_STEPS,
  expectedResults: [
    'The regex pattern and extracted fields (timestamp, username, source IP) correctly identified',
    'The source IP exceeding the failed-login threshold correctly identified',
    'The learner can explain why the threshold and time window were chosen and what changing them would do',
  ],
  verification: [
    'Learner can describe what the parsing script extracts and from what raw input',
    'Learner can identify the flagged IP and the exact count/window that triggered the flag',
    'Learner can explain the risk of setting the threshold too high or too low',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure how the regex works → focus on which parts of a raw log line change per event (timestamp, IP, username) versus which parts are fixed text — those changing parts are what the pattern captures.',
    'Confused about "false positive" in this context → a legitimate user who mistypes a password five times in ten minutes would also trigger this rule; that is the trade-off a fixed threshold always carries.',
  ],
  challenge:
    'Propose an improved detection rule: instead of a flat threshold, describe a rule that also considers whether the source IP has ever successfully authenticated before, and explain why that additional context reduces false positives.',
  evidence: [
    {
      id: 'ev0',
      label: 'Log parsing and detection transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Detection findings summary',
      type: 'report',
      placeholder: 'Flagged IP, failure count, window, and threshold justification',
    },
  ],
  securityLesson:
    'A detection script is only as good as the field extraction it depends on. If the parsing step silently misses or mislabels a field, the detection logic downstream will confidently produce a wrong answer — which is more dangerous than producing no answer at all, because a wrong answer is trusted.',
};

// ---------- Lab 2: Automate a Security Report and Query a Simulated API ----------

const LAB_20_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review a sample JSON response from a simulated threat-intelligence API.',
    command: 'show api response sample',
    expected: 'A JSON structure showing a reputation score, first/last seen dates, and associated campaign tags for a queried IP.',
  },
  {
    id: 's1',
    instruction: 'Review the enrichment script that queries the API and processes the response.',
    command: 'show enrichment script',
    expected: 'An annotated script showing credential handling, request construction, and status-code handling — with one intentional security gap.',
  },
  {
    id: 's2',
    instruction: 'Review the automatically generated security report produced from the enrichment results.',
    command: 'show generated report',
    expected: 'A structured report with summary, evidence, severity, and remediation sections built from the enrichment data.',
  },
  {
    id: 's3',
    instruction: 'Review the evidence collection log for chain-of-custody completeness.',
    command: 'show evidence collection log',
    expected: 'A log showing collected artifacts, timestamps, and hashes — with one entry missing a hash.',
  },
];

const LAB_20_1: Lab = {
  id: 'p20-lab-1',
  phaseId: 'phase-20',
  title: 'Automate a Security Report and Query a Simulated API',
  objective:
    'Review a simulated threat-intelligence API response, the enrichment script that consumes it, the auto-generated report, and the evidence collection log — identifying a credential-handling gap in the script and a chain-of-custody gap in the evidence log.',
  securityConcepts: [
    'JSON API responses',
    'Secure credential handling in scripts',
    'Automated report generation',
    'Evidence collection and chain of custody',
  ],
  environment: 'Deterministic automation simulator — prepared outputs only; no script is actually executed and no real API is contacted',
  topology: 'A simulated threat-intelligence API and case-management report pipeline, continuing from Lab 1\'s flagged IP',
  prerequisites: ['Complete Lab 1 (Parse Authentication Logs and Detect Failed Login Patterns)'],
  steps: LAB_20_1_STEPS,
  expectedResults: [
    'The JSON response structure correctly parsed into named fields',
    'A hardcoded credential identified as a security gap in the enrichment script',
    'The generated report correctly reflecting the enrichment findings in a structured format',
    'A missing evidence hash identified as a chain-of-custody gap',
  ],
  verification: [
    'Learner can name the specific fields extracted from the JSON response and their meaning',
    'Learner can identify and explain the fix for the hardcoded-credential gap',
    'Learner can explain why the missing hash in the evidence log is a finding, not a cosmetic detail',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure how to read the JSON structure → identify the outer object first, then walk into each nested field one level at a time.',
    'Confused about why a hardcoded credential in a script matters if the script is not shared publicly → any repository access, backup, or code review still exposes it; "not shared publicly" is not the same as "never exposed to anyone."',
  ],
  challenge:
    'Rewrite the enrichment script\'s credential handling in pseudocode: show how it should load its credential from an environment variable, and describe the one line of code that changes.',
  evidence: [
    {
      id: 'ev0',
      label: 'API enrichment and reporting transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Automation security findings',
      type: 'report',
      placeholder: 'Credential-handling gap, chain-of-custody gap, and the fix for each',
    },
  ],
  securityLesson:
    'Automation scripts are code, and code is subject to the exact same security review any other software should receive: secrets management, error handling, and evidentiary integrity are not optional just because a script is "just a quick internal tool."',
};

// ---------- Lessons ----------

const LESSON_20_L1: Lesson = {
  id: 'p20-lesson-0',
  phaseId: 'phase-20',
  title: 'Python & Automation Fundamentals for Security',
  objectives: [
    'Explain why Python is the standard language for security automation',
    'Read and reason about a JSON API response structure',
    'Explain how regular expressions extract structured data from log text',
    'Explain secure credential handling for API-driven automation',
    'Distinguish automation, orchestration, and SOAR',
  ],
  sections: LESSON_20_L1_SECTIONS,
  quiz: LESSON_20_L1_QUIZ,
  concepts: [
    'log-parsing',
    'security-apis',
    'secure-automation-practices',
    'soar',
  ],
  homework:
    'Write a short script that reads a log file and counts failed logins per user. Test it against a sample file you create, not against production data.',
  careerConnection:
    'Security Automation / Detection Engineer — teams increasingly expect analysts to read and lightly modify Python detection and enrichment scripts, not just operate a SIEM\'s point-and-click interface.',
};

const LESSON_20_L2: Lesson = {
  id: 'p20-lesson-1',
  phaseId: 'phase-20',
  title: 'Building Security Automation Projects',
  objectives: [
    'Explain failed-login detection using threshold and time-window logic',
    'Extract and correctly type IOCs (IP, domain, MD5, SHA-256, URL) from text',
    'Explain the value of automated, consistent report generation',
    'Explain secure and resilient API-querying practices',
    'Explain evidence collection automation and chain-of-custody requirements',
  ],
  sections: LESSON_20_L2_SECTIONS,
  quiz: LESSON_20_L2_QUIZ,
  concepts: [
    'failed-login-detection',
    'ioc-extraction',
    'report-generation',
    'evidence-automation',
  ],
  homework:
    'Extend your log parser to output a summary report and flag any user above a threshold. Then write down the one log-format change that would silently break it.',
  careerConnection:
    'SOC Automation Engineer — the analyst who can build (or safely modify) the six named PROMPT.md projects — log parsing, failed-login detection, IOC extraction, report generation, API querying, and evidence collection — directly reduces the repetitive workload of an entire SOC team.',
};

// ---------- Phase export ----------

export const PHASE_20: Phase = {
  id: 'phase-20',
  number: 20,
  title: 'Security Automation',
  description:
    'Master Python and JSON fundamentals for security scripting, regex-based log parsing, secure API credential handling, and SOAR concepts, then apply them to the core automation projects: failed-login detection, IOC extraction, automated report generation, threat-intelligence API querying, and evidence collection with chain of custody.',
  examDomain: 'Security Operations',
  scene: 'soc',
  lessons: [LESSON_20_L1, LESSON_20_L2],
  labs: [LAB_20_0, LAB_20_1],
};
