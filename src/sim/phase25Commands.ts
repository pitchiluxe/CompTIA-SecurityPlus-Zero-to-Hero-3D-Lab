import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 25 prepared outputs — GitHub Cybersecurity Portfolio.
//
// Reference material only — documentation strategy, not simulated tool
// output. Same closed-allowlist contract as every other phase.
// ---------------------------------------------------------------------------

export const PHASE_25_COMMANDS: PreparedCommand[] = [
  {
    match: 'show portfolio folder structure',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'PORTFOLIO REPOSITORY SKELETON',
      '',
      'README.md            The front door — summary, objectives, findings, lessons learned',
      'architecture/        Topology and environment the lab ran in',
      'configs/             Sanitised configuration artifacts (never raw production configs)',
      'screenshots/         Visual evidence, cropped and redacted',
      'logs/                Raw or prepared log excerpts',
      'evidence/            Every artifact captured during the lab, labelled by type',
      'reports/             Findings, remediation, and validation',
      'troubleshooting/     Issues hit and how they were resolved',
      'lessons-learned/     What would change next time',
    ].join('\n'),
    teaches:
      'Nine folders, one job each — a reviewer who has seen this skeleton once recognises it instantly in every other repo that uses it, which is exactly why consistency is worth enforcing.',
  },
  {
    match: 'show readme anatomy',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'README ANATOMY — IN ORDER',
      '',
      '1. Summary        What is this project?',
      '2. Objectives     What was I trying to prove?',
      '3. Architecture   What did the environment look like?',
      '4. Technologies   What tools and concepts were involved?',
      '5. Implementation What did I actually do, step by step?',
      '6. Findings       What did I find?',
      '7. Remediation    What would I recommend?',
      '8. Validation     How did I confirm the fix worked?',
      '9. Lessons learned What would I do differently?',
    ].join('\n'),
    teaches:
      'A reviewer skims top to bottom and rarely searches further down for a missing section — the order here matches that skim pattern deliberately.',
  },
  {
    match: 'explain redaction checklist',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'REDACTION CHECKLIST — APPLY TO EVERY ARTIFACT, EVERY TIME',
      '',
      '[ ] No passwords, API keys, tokens, or private key material',
      '[ ] No real hostnames or internal IP ranges',
      '[ ] No employer, customer, or personal names',
      '[ ] No personally identifiable information',
      '[ ] Screenshots cropped to the relevant window, not a full desktop capture',
      '',
      'Apply this to configs, screenshots, logs, and reports alike — not only to the',
      'artifact type that seems most obviously sensitive.',
    ].join('\n'),
    teaches:
      'The habit of checking every time, even for simulated low-risk content, is what prevents the one real mistake — a checklist applied inconsistently is not a control.',
  },
  {
    match: 'explain findings remediation validation',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'FINDING STRUCTURE',
      '',
      'FINDING:      Specific observation, not a vague impression',
      'SEVERITY:     Critical / High / Medium / Low, with rationale',
      'EVIDENCE:     The specific artifact supporting this finding',
      'REMEDIATION:  A fix scoped to this specific finding, not a generic recommendation',
      'VALIDATION:   How the fix was confirmed to actually work',
      '',
      'Example:',
      'FINDING: SSH permits password authentication on a public-facing host',
      'SEVERITY: High — brute-force/credential-stuffing exposure on an internet-facing service',
      'EVIDENCE: sshd_config excerpt, PasswordAuthentication yes',
      'REMEDIATION: Set PasswordAuthentication no; enforce key-based auth only',
      'VALIDATION: Re-attempted password login post-change; server rejected it, key-based login succeeded',
    ].join('\n'),
    teaches:
      'A findings list without remediation reads as an unfinished audit; a remediation list without validation reads as an unverified claim — both gaps are exactly what a hiring manager\'s eye catches first.',
  },
  {
    match: 'explain portfolio curation',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'PORTFOLIO CURATION',
      '',
      'Feature 5-8 repositories, not every completed lab.',
      '',
      'Select based on:',
      '  - Relevance to the specific target role\'s job description',
      '  - Depth and completeness of the write-up (evidence captured, not just skeleton)',
      '  - Coverage — avoid featuring five labs that all demonstrate the same single skill',
      '',
      'A reviewer given 25 repositories opens none of them thoroughly.',
      'A reviewer given 5 is far more likely to read two or three closely.',
    ].join('\n'),
    teaches:
      'Curation is itself a demonstrated skill — choosing what best represents the target role signals judgement, not just activity.',
  },
  {
    match: 'show portfolio index format',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'PORTFOLIO INDEX FORMAT (PORTFOLIO.md)',
      '',
      '# Security+ Zero-to-Hero Portfolio',
      '',
      '## Summary',
      '<N> labs completed across <M> phases.',
      '',
      '## Coverage by domain',
      '### <Domain Name> (<count> labs)',
      '| Lab | Phase | Repository |',
      '| --- | --- | --- |',
      '| ... | ... | ... |',
      '',
      '(repeated per domain)',
    ].join('\n'),
    teaches:
      'Grouping by exam domain rather than alphabetically highlights coverage and gaps at a glance — exactly the framing a reviewer evaluating role readiness cares about most.',
  },
  {
    match: 'explain provenance labeling in evidence',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'PROVENANCE IN PORTFOLIO CLAIMS',
      '',
      'Every artifact in this platform is labelled: real, simulated, or prepared.',
      'That label must carry through into how the work is described in a portfolio.',
      '',
      'HONEST:    "Completed a structured, simulated SOC investigation covering',
      '            credential compromise, lateral movement, and containment."',
      'DISHONEST: "Responded to a real ransomware incident against enterprise',
      '            infrastructure." (when the work was a platform simulation)',
      '',
      'The honest version is still a genuinely impressive, defensible claim.',
    ].join('\n'),
    teaches:
      'A fabricated claim collapses under one clarifying interview question; an honest, precisely-scoped claim about simulated work does not need to survive scrutiny because it was never overstated.',
  },
  {
    match: 'show sample findings entry',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'SAMPLE FINDINGS ENTRY — prepared reference artifact',
      '',
      '### Finding 1: Overly broad firewall rule permitting internet access to a',
      '### protected subnet',
      '',
      '- **Severity:** Critical',
      '- **Evidence:** Firewall rule diff showing Source=ANY, Destination=protected',
      '  subnet, Port=ANY, Action=ALLOW, added without an expiration date',
      '- **Remediation:** Scope the rule to the specific vendor IP range required;',
      '  add a mandatory expiration date to any future temporary rule',
      '- **Validation:** Re-ran the connectivity test from an unrelated external',
      '  address post-change; the connection was correctly refused',
    ].join('\n'),
    teaches:
      'This is a prepared sample, not a live scan result — labelling it that way is itself the redaction/provenance discipline this phase teaches, applied to the reference material.',
  },
];
