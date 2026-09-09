import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 16 — Application & Data Security
// Aligned with CompTIA Security+ SY0-701 (Domain 3: Security Architecture)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Secure Application Development ----------

const LESSON_16_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p16-l1-s0',
    title: 'Concept — Secure Development Lifecycle (Shift Left)',
    body:
      'Security built in from design is cheaper and more effective than security bolted on after release. "Shift left" means moving security activities — threat modelling, secure coding standards, static analysis, dependency scanning — earlier in the development lifecycle, ideally before a single line of vulnerable code reaches production. A vulnerability caught in code review costs minutes to fix; the same vulnerability found by a customer after a breach costs incident response, legal exposure, and reputation.',
  },
  {
    id: 'p16-l1-s1',
    title: 'Concept — Input Validation and Injection',
    body:
      'Injection occurs whenever untrusted input is interpreted as code or commands instead of data. SQL injection builds a database query by concatenating user input directly into the query string; command injection does the same with an OS shell command. The fix is never "sanitise harder" — it is structural: parameterised queries (prepared statements) that separate the query structure from the data, so user input can never change the query\'s meaning. Allow-list input validation (accept only known-good patterns) is the second layer, not the first.',
  },
  {
    id: 'p16-l1-s2',
    title: 'Concept — Authentication and Session Management',
    body:
      'Broken authentication covers any flaw that lets an attacker assume another user\'s identity: password reset flows without a time-limited token, no account lockout after repeated failures, session tokens that never expire, or session IDs exposed in a URL where they leak through browser history and referrer headers. Session cookies should carry the Secure flag (HTTPS only) and HttpOnly flag (inaccessible to JavaScript, blocking token theft via XSS), and should be invalidated server-side on logout — not just cleared client-side.',
  },
  {
    id: 'p16-l1-s3',
    title: 'Concept — Broken Access Control',
    body:
      'Authentication proves who you are; authorisation decides what you are allowed to do. Broken access control is an authorisation failure, most commonly Insecure Direct Object Reference (IDOR) — changing an ID in a URL or API call (/invoices/1042 to /invoices/1043) and receiving another user\'s data because the server never checked object ownership. The fix must live server-side: every request that touches a specific record must verify the authenticated user owns or is permitted to access that exact record, every time, regardless of what the UI does or does not show.',
  },
  {
    id: 'p16-l1-s4',
    title: 'Concept — OWASP Top 10 Overview',
    body:
      'The OWASP Top 10 is the industry-standard ranking of the most critical web application risks, refreshed periodically from real breach data. The categories most tested on the exam: Broken Access Control, Cryptographic Failures (formerly "Sensitive Data Exposure"), Injection, Insecure Design, Security Misconfiguration, Vulnerable and Outdated Components, Identification and Authentication Failures, Software and Data Integrity Failures, Security Logging and Monitoring Failures, and Server-Side Request Forgery (SSRF). The exam does not expect you to memorise the exact ranking, but it does expect you to recognise which category a described flaw belongs to.',
  },
  {
    id: 'p16-l1-s5',
    title: 'Example — SQL injection login bypass',
    body:
      'A login form builds its query as SELECT * FROM users WHERE username=\'INPUT\' AND password=\'INPUT\'. An attacker enters admin\'-- as the username, which comments out the password check entirely, and the query returns the admin row unconditionally. Root cause: string concatenation instead of parameterisation. The fix: convert the query to a parameterised statement so the database always treats the input as data, never as SQL syntax, regardless of what characters it contains.',
  },
  {
    id: 'p16-l1-s6',
    title: 'Review — What must stick',
    body:
      'Shift security left — it is cheaper before release than after. Injection is fixed structurally with parameterised queries, not by "escaping harder." Authentication proves identity; authorisation must be re-checked server-side on every request, not assumed from the UI. Session cookies need Secure and HttpOnly flags and server-side invalidation on logout. The OWASP Top 10 is a map of categories, not a memorisation exercise.',
  },
];

const LESSON_16_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p16-q0',
    type: 'mcq',
    stem: 'What does "shift left" mean in secure application development?',
    options: [
      'Moving security activities earlier in the development lifecycle, before production release',
      'Moving the application server to a different data centre region',
      'Shifting responsibility for security entirely to the end user',
      'Delaying security testing until after the first production incident',
    ],
    answer: 0,
    explanation:
      'Shift left means integrating threat modelling, secure coding, and scanning earlier in development, where fixing a flaw is far cheaper than after release.',
    domain: 'Security Architecture',
    conceptId: 'secure-sdlc',
  },
  {
    id: 'p16-q1',
    type: 'mcq',
    stem: 'What is the structural fix for SQL injection, as opposed to input sanitisation alone?',
    options: [
      'Parameterised queries (prepared statements) that separate query structure from data',
      'Converting all input to uppercase before querying',
      'Encrypting the database connection string',
      'Increasing the database connection pool size',
    ],
    answer: 0,
    explanation:
      'Parameterised queries ensure user input can never change the meaning of the SQL statement, regardless of what characters it contains. Sanitisation alone is a weaker, incomplete second layer.',
    domain: 'Security Architecture',
    conceptId: 'input-validation',
  },
  {
    id: 'p16-q2',
    type: 'mcq',
    stem: 'What does the HttpOnly flag on a session cookie protect against?',
    options: [
      'Client-side JavaScript (including injected XSS) reading the cookie value',
      'The cookie being sent over an unencrypted connection',
      'The cookie expiring too quickly',
      'The server rejecting the cookie on a different domain',
    ],
    answer: 0,
    explanation:
      'HttpOnly prevents JavaScript from accessing the cookie, which blocks session-token theft even if an XSS vulnerability exists elsewhere on the page. The Secure flag (not HttpOnly) protects against transmission over plain HTTP.',
    domain: 'Security Architecture',
    conceptId: 'session-management',
  },
  {
    id: 'p16-q3',
    type: 'mcq',
    stem: 'A user changes /invoices/1042 to /invoices/1043 in the URL and receives another customer\'s invoice. What is this vulnerability called?',
    options: [
      'Insecure Direct Object Reference (IDOR) — a form of broken access control',
      'Cross-site scripting (XSS)',
      'SQL injection',
      'Cross-site request forgery (CSRF)',
    ],
    answer: 0,
    explanation:
      'IDOR occurs when an application exposes a direct reference to an internal object (like an invoice ID) without verifying the authenticated user is authorised to access that specific object.',
    domain: 'Security Architecture',
    conceptId: 'broken-access-control',
  },
  {
    id: 'p16-q4',
    type: 'mcq',
    stem: 'Which OWASP Top 10 category was previously named "Sensitive Data Exposure"?',
    options: [
      'Cryptographic Failures',
      'Injection',
      'Security Misconfiguration',
      'Broken Access Control',
    ],
    answer: 0,
    explanation:
      'The category was renamed Cryptographic Failures to focus on the root cause (missing or weak cryptography) rather than the symptom (data being exposed).',
    domain: 'Security Architecture',
    conceptId: 'owasp-top-10',
  },
  {
    id: 'p16-q5',
    type: 'scenario',
    stem: 'A password reset endpoint accepts a new password immediately after the user supplies only their email address, with no verification token sent or checked. What is the vulnerability category?',
    options: [
      'Identification and Authentication Failures',
      'Injection',
      'Security Misconfiguration',
      'Insecure Design pattern only, not exploitable',
    ],
    answer: 0,
    explanation:
      'A password reset without a time-limited, single-use verification token lets anyone who knows a victim\'s email take over the account — a textbook authentication failure.',
    domain: 'Security Architecture',
    conceptId: 'broken-auth',
  },
  {
    id: 'p16-q6',
    type: 'scenario',
    stem: 'A developer relies on hiding the "Delete User" button in the UI for non-admin roles, but the /api/users/delete endpoint performs no server-side role check. What is the risk?',
    options: [
      'Any authenticated user can call the endpoint directly (e.g., with a REST client) and delete users, bypassing the UI entirely',
      'The UI will crash for non-admin users',
      'There is no risk because the button is hidden',
      'The endpoint will automatically reject the request due to CORS'
    ],
    answer: 0,
    explanation:
      'Hiding a control in the UI is not an access control — the server must independently verify authorisation on every request, since any client can call the API directly.',
    domain: 'Security Architecture',
    conceptId: 'broken-access-control',
  },
  {
    id: 'p16-q7',
    type: 'scenario',
    stem: 'A production web server still has its default admin console enabled with the framework\'s sample credentials unchanged. Which OWASP category does this fall under?',
    options: [
      'Security Misconfiguration',
      'Cross-site scripting (XSS)',
      'Server-side request forgery (SSRF)',
      'Insecure Direct Object Reference',
    ],
    answer: 0,
    explanation:
      'Leaving default consoles, sample apps, and default credentials enabled in production is the definition of security misconfiguration — an unnecessary attack surface left exposed.',
    domain: 'Security Architecture',
    conceptId: 'owasp-top-10',
  },
  {
    id: 'p16-q8',
    type: 'scenario',
    stem: 'A comment field on a blog echoes user input directly into the page without encoding it, so a submitted <script> tag executes in every visitor\'s browser. What is this vulnerability?',
    options: [
      'Stored cross-site scripting (XSS)',
      'SQL injection',
      'Broken access control',
      'Security misconfiguration',
    ],
    answer: 0,
    explanation:
      'Stored XSS occurs when unsanitised, unencoded user input is persisted and later rendered as executable HTML/JavaScript for other users who view the page.',
    domain: 'Security Architecture',
    conceptId: 'xss',
  },
  {
    id: 'p16-q9',
    type: 'scenario',
    stem: 'A security review recommends threat modelling and static code analysis be added to the CI pipeline before every merge, rather than only during a pre-release audit. What principle does this reflect?',
    options: [
      'Shifting security left — catching flaws as early and cheaply as possible',
      'Zero Trust network architecture',
      'Defense in depth at the network layer',
      'The principle of least privilege',
    ],
    answer: 0,
    explanation:
      'Moving security checks into the CI pipeline, before merge, is the practical implementation of shifting security left in the development lifecycle.',
    domain: 'Security Architecture',
    conceptId: 'secure-sdlc',
  },
  {
    id: 'p16-q-pbq',
    type: 'pbq',
    stem: 'Order these secure development activities from earliest to latest in the SDLC.',
    options: [
      'Threat model the feature before design is fixed',
      'Perform static analysis as code is written',
      'Run dynamic and dependency tests before release',
      'Monitor the running application for new vulnerabilities',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Shifting security left means modeling threats during design, catching implementation flaws with static analysis, validating the running artifact, then continuously monitoring.',
    domain: 'Security Architecture',
    conceptId: 'secure-sdlc',
  },
];

// ---------- Lesson 2: Data Security & Protection ----------

const LESSON_16_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p16-l2-s0',
    title: 'Concept — Data Classification',
    body:
      'Data classification assigns a sensitivity tier so that protective controls scale with actual risk instead of being applied uniformly (which is either wasteful or insufficient). A common four-tier model: Public (no harm if disclosed), Internal (routine business data, not for outside release), Confidential (harm to the business if disclosed — trade secrets, customer databases), and Restricted (regulated or maximally sensitive data — SSNs, payment card numbers, health records) requiring the strictest access controls and audit logging. The exam expects you to place a described data asset into the correct tier based on impact, not based on how the data happens to be labelled internally.',
  },
  {
    id: 'p16-l2-s1',
    title: 'Concept — Data States and Protection',
    body:
      'Data exists in three states, each needing a different control. Data at rest (stored on disk, in a database, in backups) is protected by encryption at rest and access controls. Data in transit (moving across a network) is protected by TLS or another transport encryption. Data in use (actively being processed in memory) is the hardest to protect and may require techniques like confidential computing or strict process isolation. A control that protects one state does nothing for the others — encrypting a database file does not protect the same data once it is decrypted and sitting in an API response crossing the internet unencrypted.',
  },
  {
    id: 'p16-l2-s2',
    title: 'Concept — Data Loss Prevention (DLP)',
    body:
      'DLP tools inspect data in motion (email, uploads, chat), at rest (file shares, cloud storage), and in use (clipboard, USB) for patterns matching sensitive data — a credit card number regex, a block of SSNs, a document tagged "Restricted" — and can block, quarantine, or alert on a match. DLP is a detective/preventive control layered on top of classification: without classification telling the DLP engine what counts as sensitive, DLP has nothing meaningful to look for.',
  },
  {
    id: 'p16-l2-s3',
    title: 'Concept — Tokenization, Masking, and Encryption',
    body:
      'These three techniques are frequently confused on the exam. Encryption transforms data reversibly using a key — decrypt it and you get the original value back; lose the key and the data is unrecoverable (by design). Tokenization replaces sensitive data with a non-sensitive placeholder (a token) that has no mathematical relationship to the original value; the mapping is held in a separate secure vault, so even a compromised token is useless without vault access — this is the standard for protecting payment card numbers (PCI DSS scope reduction). Masking (or redaction) permanently or dynamically obscures part of a value for display — "**** **** **** 4242" — without needing to recover the original at all; it is a display-layer control, not a storage-layer one.',
  },
  {
    id: 'p16-l2-s4',
    title: 'Concept — Data Retention and Disposal',
    body:
      'Data minimisation means keeping sensitive data only as long as a legal or business requirement demands, then disposing of it — not indefinitely "just in case." Every record retained past its necessary lifetime is additional breach impact with no corresponding benefit. Disposal must be irreversible: cryptographic erasure (destroying the encryption key rather than the data itself) or physical destruction for media that cannot be securely wiped, with a certificate of destruction for audit purposes.',
  },
  {
    id: 'p16-l2-s5',
    title: 'Example — DLP catches an exfiltration attempt',
    body:
      'An employee, departing for a competitor, attaches a spreadsheet of 10,000 customer records including SSNs to a personal email and hits send. The DLP engine pattern-matches the SSN format across the attachment, blocks the outbound message, and alerts the security team in real time — before the data leaves the organisation. Root enabler: the customer database was correctly classified as Restricted, so the DLP policy for that classification tier was already configured to block, not merely log, before this specific incident occurred.',
  },
  {
    id: 'p16-l2-s6',
    title: 'Review — What must stick',
    body:
      'Classification tiers scale controls to actual impact: Public, Internal, Confidential, Restricted. Data at rest, in transit, and in use each need a distinct control — one does not substitute for another. Tokenization is reversible only via a separate secure vault; masking is a display-layer redaction with nothing to reverse; encryption is reversible with the correct key. DLP needs classification to know what to look for. Retention should have an expiry, and disposal should be irreversible.',
  },
];

const LESSON_16_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p16-q10',
    type: 'mcq',
    stem: 'A company database of customer names and purchase history, not regulated but damaging to the business if leaked, should be classified as:',
    options: ['Confidential', 'Public', 'Internal', 'Restricted'],
    answer: 0,
    explanation:
      'Business-sensitive data that would harm the company if disclosed, but is not regulated personal data requiring the strictest tier, fits the Confidential classification.',
    domain: 'Security Architecture',
    conceptId: 'data-classification',
  },
  {
    id: 'p16-q11',
    type: 'mcq',
    stem: 'Which control protects data while it is being actively processed in memory, the hardest state to secure?',
    options: [
      'Confidential computing / process isolation techniques',
      'TLS 1.3',
      'Disk-level encryption at rest',
      'A firewall ACL',
    ],
    answer: 0,
    explanation:
      'Data in use (in memory, being processed) requires specialised techniques like confidential computing, since standard at-rest and in-transit encryption do not apply while data is unencrypted for processing.',
    domain: 'Security Architecture',
    conceptId: 'data-states',
  },
  {
    id: 'p16-q12',
    type: 'mcq',
    stem: 'What does a DLP engine need to function effectively?',
    options: [
      'Data classification, so it knows which patterns and labels count as sensitive',
      'A hardware security module only',
      'A firewall with deep packet inspection disabled',
      'Nothing — DLP works identically regardless of classification',
    ],
    answer: 0,
    explanation:
      'DLP policies are built around classification: without knowing what is Confidential or Restricted, DLP has no meaningful basis to decide what to block or alert on.',
    domain: 'Security Architecture',
    conceptId: 'dlp',
  },
  {
    id: 'p16-q13',
    type: 'mcq',
    stem: 'What is the key difference between tokenization and masking?',
    options: [
      'Tokenization is reversible via a separate secure vault; masking is a display-layer redaction with nothing to reverse',
      'Masking is reversible via a vault; tokenization is permanent redaction',
      'They are the same technique with different names',
      'Tokenization only works on numeric data; masking only works on text',
    ],
    answer: 0,
    explanation:
      'Tokenization replaces the value with a token mapped in a secure vault, allowing authorised retrieval of the original. Masking obscures part of a value for display and is not designed to be reversed.',
    domain: 'Security Architecture',
    conceptId: 'tokenization-masking',
  },
  {
    id: 'p16-q14',
    type: 'mcq',
    stem: 'What is the security purpose of a defined data retention schedule?',
    options: [
      'Limiting breach impact by ensuring sensitive data is not kept longer than a legal or business need requires',
      'Improving application performance only',
      'Reducing the number of database tables',
      'Retention schedules have no security purpose',
    ],
    answer: 0,
    explanation:
      'Every record kept beyond its necessary lifetime adds to breach impact with no offsetting benefit — retention schedules and irreversible disposal reduce that exposure.',
    domain: 'Security Architecture',
    conceptId: 'data-retention',
  },
  {
    id: 'p16-q15',
    type: 'scenario',
    stem: 'A support agent needs to confirm the last four digits of a customer\'s card to verify identity, but should never see the full number. Which technique is most appropriate?',
    options: [
      'Masking — display only "**** **** **** 4242"',
      'Tokenization with vault access granted to the agent',
      'Full-disk encryption of the support workstation',
      'Storing the card number in plaintext in the ticketing system',
    ],
    answer: 0,
    explanation:
      'Masking is the right display-layer control here — the agent needs to see a partial value for verification, never the full number and never a reversible token they could retrieve.',
    domain: 'Security Architecture',
    conceptId: 'tokenization-masking',
  },
  {
    id: 'p16-q16',
    type: 'scenario',
    stem: 'A payment processor replaces every card number in its systems with a random-looking value that has no mathematical relationship to the original, storing the real numbers only in a separate PCI-scoped vault. What technique is this?',
    options: [
      'Tokenization',
      'Masking',
      'Hashing',
      'Base64 encoding',
    ],
    answer: 0,
    explanation:
      'Tokenization substitutes a non-sensitive placeholder with no derivable relationship to the original, with the real value recoverable only through the secure vault — this is the PCI DSS-standard approach to reducing scope.',
    domain: 'Security Architecture',
    conceptId: 'tokenization-masking',
  },
  {
    id: 'p16-q17',
    type: 'scenario',
    stem: 'A database backup file is encrypted at rest, but the nightly export job writes an unencrypted CSV copy to a shared network drive for a reporting job. What is the security gap?',
    options: [
      'Encryption at rest for the original database does not protect a separate unencrypted export — each copy and state of the data needs its own control',
      'There is no gap since the original database is encrypted',
      'CSV files cannot contain sensitive data',
      'The shared network drive automatically inherits the database\'s encryption'
    ],
    answer: 0,
    explanation:
      'Protecting one copy or state of data does not protect every copy. The unencrypted export on the shared drive is an independent exposure that needs its own encryption or access control.',
    domain: 'Security Architecture',
    conceptId: 'data-states',
  },
  {
    id: 'p16-q18',
    type: 'scenario',
    stem: 'An employee emails a spreadsheet of 10,000 customer SSNs to a personal address, and the message is blocked in real time with a security alert generated. What made this detection possible?',
    options: [
      'The customer database was classified as Restricted, and a DLP policy for that tier was configured to block matching patterns in outbound mail',
      'The employee\'s email client automatically detects SSNs',
      'The company firewall blocks all outbound email attachments',
      'This kind of detection is not realistically possible'
    ],
    answer: 0,
    explanation:
      'DLP relies on classification to know what to protect and how strictly (block vs. log). Correctly classifying the data as Restricted meant the DLP policy for that tier was already set to block, not just log, before this attempt occurred.',
    domain: 'Security Architecture',
    conceptId: 'dlp',
  },
];

// ---------- Lab 1: Find and Fix Injection & Access Control Vulnerabilities ----------

const LAB_16_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the vulnerable sample application\'s code review report.',
    command: 'show vulnerable code review',
    expected: 'A report flagging a SQL injection point and a stored XSS point in the sample application.',
  },
  {
    id: 's1',
    instruction: 'Check the input validation and query construction report.',
    command: 'show input validation report',
    expected: 'A finding showing string-concatenated queries versus parameterised queries across endpoints.',
  },
  {
    id: 's2',
    instruction: 'Inspect the session and cookie configuration.',
    command: 'show session config',
    expected: 'A finding that the session cookie is missing the Secure and HttpOnly flags.',
  },
  {
    id: 's3',
    instruction: 'Run the authorisation test suite against object-level endpoints.',
    command: 'show authz test results',
    expected: 'A finding that /invoices/{id} returns another user\'s invoice with no ownership check (IDOR).',
  },
];

const LAB_16_0: Lab = {
  id: 'p16-lab-0',
  phaseId: 'phase-16',
  title: 'Find and Fix Injection & Access Control Vulnerabilities',
  objective:
    'Review a simulated, intentionally vulnerable sample application for injection, XSS, broken session management, and broken access control. Produce a findings report with specific remediations.',
  securityConcepts: [
    'Input validation',
    'SQL injection',
    'Cross-site scripting',
    'Session management',
    'Broken access control / IDOR',
    'OWASP Top 10',
  ],
  environment: 'Deterministic application security simulator — prepared outputs only, nothing is executed against a real application or database',
  topology: 'Simulated three-tier web application (nginx reverse proxy, application server, PostgreSQL database) deliberately seeded with known vulnerability classes for training',
  prerequisites: ['Complete Phase 4 (Security Architecture)', 'Complete Phase 10 (Vulnerability Management)'],
  steps: LAB_16_0_STEPS,
  expectedResults: [
    'SQL injection point identified in the login query',
    'Stored XSS point identified in the comment field',
    'Session cookie found missing Secure and HttpOnly flags',
    'IDOR identified on the /invoices/{id} endpoint',
  ],
  verification: [
    'Learner can name each vulnerability by its correct OWASP-aligned category',
    'Learner can explain the structural (not superficial) fix for each finding',
    'Learner can distinguish which findings are authentication issues versus authorisation issues',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure whether something is an authentication or authorisation issue → authentication asks "who are you?"; authorisation asks "what are you allowed to do?" IDOR is always an authorisation (access control) issue.',
    'Confused about why "escaping" alone is not the answer to injection → escaping treats symptoms per-input; parameterisation removes the entire class of attack structurally.',
  ],
  challenge:
    'Write a one-page findings report: for each vulnerability, state the finding, its OWASP-aligned category, the risk, and the specific structural remediation (not just "sanitise input").',
  evidence: [
    {
      id: 'ev0',
      label: 'Application security audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Findings report',
      type: 'report',
      placeholder: 'Finding, category, risk, remediation for each vulnerability',
    },
  ],
  securityLesson:
    'Every vulnerability in this lab has existed in real, high-profile breaches for over a decade. The tools and fixes (parameterised queries, output encoding, Secure/HttpOnly cookies, server-side authorisation checks) are not new or exotic — the gap is always that someone assumed the vulnerable pattern would not be exploited.',
};

// ---------- Lab 2: Classify and Protect Sensitive Data ----------

const LAB_16_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the organisation\'s data inventory across systems.',
    command: 'show data inventory',
    expected: 'A list of data assets (customer DB, HR records, marketing content, source code) with their current classification.',
  },
  {
    id: 's1',
    instruction: 'Check which protection method (encryption, tokenization, masking) is applied to each sensitive field.',
    command: 'show data protection methods',
    expected: 'A report showing at least one field using the wrong or no protection method for its classification.',
  },
  {
    id: 's2',
    instruction: 'Review recent DLP alerts and any missed exfiltration attempts.',
    command: 'show dlp alerts',
    expected: 'A finding showing an outbound transfer of restricted data that was not blocked due to a misconfigured policy.',
  },
  {
    id: 's3',
    instruction: 'Check the data retention and disposal schedule.',
    command: 'show retention schedule',
    expected: 'A finding that one data class has no defined retention period and is kept indefinitely.',
  },
];

const LAB_16_1: Lab = {
  id: 'p16-lab-1',
  phaseId: 'phase-16',
  title: 'Classify and Protect Sensitive Data',
  objective:
    'Review a simulated data inventory for classification accuracy, correct use of encryption/tokenization/masking, DLP policy gaps, and missing retention schedules.',
  securityConcepts: [
    'Data classification',
    'Data states (at rest, in transit, in use)',
    'Encryption vs tokenization vs masking',
    'Data loss prevention',
    'Data retention and disposal',
  ],
  environment: 'Deterministic data governance simulator — prepared outputs only',
  topology: 'Simulated data inventory across a customer database, HR system, marketing CMS, and source code repository',
  prerequisites: ['Complete Lab 1 (Find and Fix Injection & Access Control Vulnerabilities)'],
  steps: LAB_16_1_STEPS,
  expectedResults: [
    'At least one data asset found misclassified relative to its actual sensitivity',
    'A sensitive field identified using the wrong protection method (e.g., masking instead of tokenization for a stored card number)',
    'A DLP policy gap identified that let a restricted-data transfer through undetected',
    'A data class identified with no retention/disposal schedule',
  ],
  verification: [
    'Learner can justify the correct classification tier for each data asset',
    'Learner can explain which of encryption, tokenization, or masking is appropriate for each use case and why',
    'Learner can recommend a specific DLP policy change and a retention schedule for the gap found',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure which protection method applies → ask: does this value need to be recovered later (tokenization/encryption) or only partially displayed (masking)? That answers it.',
    'Confused about classification tiers → ask what happens if this specific asset is disclosed publicly; the impact answers the tier.',
  ],
  challenge:
    'Propose a corrected data governance table: for each data asset, state the classification, the correct protection method per state (at rest / in transit), the DLP policy action (block/alert/log), and the retention period with disposal method.',
  evidence: [
    {
      id: 'ev0',
      label: 'Data governance audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Corrected data governance table',
      type: 'report',
      placeholder: 'Classification, protection method, DLP action, and retention period per data asset',
    },
  ],
  securityLesson:
    'Data protection fails most often not from a missing technology, but from a governance gap: no one classified the asset correctly in the first place, so every downstream control (DLP, encryption choice, retention) inherited the wrong starting point.',
};

// ---------- Lessons ----------

const LESSON_16_L1: Lesson = {
  id: 'p16-lesson-0',
  phaseId: 'phase-16',
  title: 'Secure Application Development',
  objectives: [
    'Explain shifting security left in the development lifecycle',
    'Explain injection vulnerabilities and their structural fix (parameterisation)',
    'Distinguish authentication failures from authorisation (access control) failures',
    'Identify broken access control including IDOR',
    'Recognise categories from the OWASP Top 10',
  ],
  sections: LESSON_16_L1_SECTIONS,
  quiz: LESSON_16_L1_QUIZ,
  concepts: [
    'secure-sdlc',
    'input-validation',
    'session-management',
    'broken-auth',
    'broken-access-control',
    'owasp-top-10',
    'xss',
  ],
  homework:
    'Take one input field in any application and write down every validation rule it should enforce. Then explain why allow-listing beats deny-listing for that field.',
  careerConnection:
    'Application Security Engineer — the analyst who can read a code review finding and name the exact OWASP category and structural fix, rather than saying "sanitise the input," moves directly into AppSec and DevSecOps roles.',
};

const LESSON_16_L2: Lesson = {
  id: 'p16-lesson-1',
  phaseId: 'phase-16',
  title: 'Data Security & Protection',
  objectives: [
    'Classify data assets into public, internal, confidential, and restricted tiers',
    'Explain the distinct controls needed for data at rest, in transit, and in use',
    'Explain how DLP relies on classification to function',
    'Distinguish encryption, tokenization, and masking and when to use each',
    'Explain the security purpose of data retention and disposal schedules',
  ],
  sections: LESSON_16_L2_SECTIONS,
  quiz: LESSON_16_L2_QUIZ,
  concepts: [
    'data-classification',
    'data-states',
    'dlp',
    'tokenization-masking',
    'data-retention',
  ],
  homework:
    'Classify the data in one system you know into three sensitivity tiers, and write the protection each tier requires at rest and in transit.',
  careerConnection:
    'Data Protection / Privacy Analyst — organisations facing PCI DSS, HIPAA, or GDPR obligations need someone who can correctly classify data and choose the right protection technique per field, not apply the same control everywhere.',
};

// ---------- Phase export ----------

export const PHASE_16: Phase = {
  id: 'phase-16',
  number: 16,
  title: 'Application & Data Security',
  description:
    'Master secure application development (shift left, input validation, authentication vs authorisation, OWASP Top 10), then data security: classification tiers, data states, DLP, tokenization vs masking vs encryption, and retention — applied to a simulated vulnerable application and data inventory.',
  examDomain: 'Security Architecture',
  scene: 'soc',
  lessons: [LESSON_16_L1, LESSON_16_L2],
  labs: [LAB_16_0, LAB_16_1],
};
