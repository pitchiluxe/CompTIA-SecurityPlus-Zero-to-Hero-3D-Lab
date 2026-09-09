import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 26 prepared outputs — Career Mode.
//
// Reference material only — career-preparation strategy, not simulated tool
// output. Same closed-allowlist contract as every other phase.
// ---------------------------------------------------------------------------

export const PHASE_26_COMMANDS: PreparedCommand[] = [
  {
    match: 'show target roles',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'CAREER MODE — TARGET ROLES',
      '',
      '1. SOC Analyst I',
      '2. Junior Security Analyst',
      '3. Cybersecurity Analyst',
      '4. Security Operations Analyst',
      '5. IT Security Technician',
      '6. IAM Analyst',
      '7. Junior IAM Engineer',
      '8. Security Support Specialist',
      '',
      'Each role carries a declared skill set, already mapped to real concepts',
      'tracked by this platform\'s mastery ladder.',
    ].join('\n'),
    teaches:
      'Notice these are entry-to-junior-level roles specifically — Career Mode targets where a Security+ credential and this platform\'s labs actually open doors, not senior positions requiring years of experience this platform cannot fabricate.',
  },
  {
    match: 'explain skill mapping',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'SKILL MAPPING',
      '',
      'A real job posting rarely says "alert correlation" — it says "experience',
      'with SIEM tools" or "familiarity with log analysis across multiple',
      'sources." Mapping means translating vendor/product language into the',
      'underlying concept the posting is actually asking about.',
      '',
      'Example translations:',
      '  "Experience with SIEM tools (Splunk, Sentinel)"  -> alert-correlation',
      '  "Familiarity with IAM platforms (Okta, Entra ID)" -> identity-provider, federation',
      '  "Incident response experience"                    -> incident-response, containment',
    ].join('\n'),
    teaches:
      'The vendor name in a job posting is almost never the actual skill being tested — the underlying concept behind it is, and that concept is what this platform\'s lessons and mastery ladder already track.',
  },
  {
    match: 'explain gap analysis',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'GAP ANALYSIS',
      '',
      'For each skill, average the mastery level (0-6) across its mapped',
      'concepts. A skill averaging level 2 or below is flagged a gap — the',
      'same weak-area threshold used everywhere else on this platform.',
      '',
      'A role with 4 skills and 2 flagged gaps is not "50% ready" in any',
      'simple sense — it means two specific, nameable things to study next,',
      'which is more actionable than a single readiness percentage.',
    ].join('\n'),
    teaches:
      'Reusing the same weak-area threshold as Phase 24\'s exam prep and the Progress view means a learner\'s existing mastery data works here immediately, with no separate tracking system to keep in sync.',
  },
  {
    match: 'show sample job description mapping',
    tool: 'platform',
    provenance: 'prepared',
    output: [
      'SAMPLE JOB DESCRIPTION MAPPING — prepared reference artifact',
      '',
      'POSTING EXCERPT: "SOC Analyst I — monitor security alerts, escalate true',
      'positives, document incidents, and support the on-call rotation.',
      'Familiarity with SIEM tooling and basic incident response required."',
      '',
      'EXTRACTED SKILLS -> CONCEPTS:',
      '  "monitor security alerts, escalate true positives" -> alert-correlation',
      '  "document incidents"                                -> evidence-handling',
      '  "basic incident response"                           -> incident-response, containment',
      '',
      'This maps directly onto the SOC Analyst I role already defined in',
      'Career Mode — no new skill taxonomy was needed.',
    ].join('\n'),
    teaches:
      'This is a prepared, worked example — the actual mapping exercise (a real posting to real concepts) is the skill Lab 0 asks the learner to practise themselves.',
  },
  {
    match: 'explain interview question generation',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'INTERVIEW QUESTION GENERATION',
      '',
      'Career Mode reuses this platform\'s existing scenario-type quiz',
      'questions, filtered to a role\'s mapped concepts, and reframes them as',
      'interview prompts: the quiz stem becomes the question asked verbally,',
      'and the quiz explanation becomes what a strong verbal answer should',
      'cover — evidence cited, distractors ruled out, and the specific clue',
      'that identifies the right call.',
      '',
      'No separate interview-question bank was written — the same scenario',
      'questions that teach a concept also rehearse explaining it aloud.',
    ].join('\n'),
    teaches:
      'A quiz question and an interview question test the same underlying skill in two different formats — writing one bank instead of two is a deliberate reuse decision, not a shortcut.',
  },
  {
    match: 'explain troubleshooting rehearsal',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'TROUBLESHOOTING REHEARSAL',
      '',
      'Career Mode ranks Phase 22\'s ten troubleshooting scenarios by how many',
      'of their tagged concepts overlap with the target role\'s mapped',
      'concepts, and recommends the highest-overlap scenarios as whiteboard-',
      'style rehearsal: talk through the investigation panels out loud, state',
      'a root cause, and justify a recommended action, exactly as a technical',
      'interview\'s scenario question expects.',
    ].join('\n'),
    teaches:
      'A scenario with zero concept overlap for a given role is deliberately not recommended — rehearsal time is scarce, and it should go toward the scenarios actually relevant to the target role.',
  },
  {
    match: 'explain fabrication risk',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'FABRICATION RISK — NEVER FABRICATE PROFESSIONAL EXPERIENCE',
      '',
      'HONEST:      "Completed a structured, simulated SOC investigation..."',
      'FABRICATED:  "Responded to a live ransomware incident against',
      '              production infrastructure..." (when it was a simulation)',
      '',
      'FABRICATED:  A job title, employer, years of experience, or',
      '              certification that was never actually held.',
      '',
      'The honest version survives a follow-up interview question. The',
      'fabricated version does not — and the damage from being caught is',
      'far worse than the honest claim ever having been merely modest.',
    ].join('\n'),
    teaches:
      'This is the same provenance discipline (real/simulated/prepared) from every lab in this platform, applied to how the work is described afterward, not just how it is labelled while doing it.',
  },
  {
    match: 'show portfolio recommendation format',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'PORTFOLIO RECOMMENDATION FORMAT',
      '',
      'For a target role, Career Mode recommends the labs whose phase covers',
      'the role\'s mapped concepts — the same labs recommended for study also',
      'become the recommended portfolio features, since a lab worth studying',
      'for a gap is also a lab worth documenting for that same role.',
      '',
      'Recommended labs feed directly into Phase 25\'s GitHub Portfolio',
      'Generator — no separate portfolio-selection tool was built.',
    ].join('\n'),
    teaches:
      'Study recommendation and portfolio recommendation are the same underlying question — "which labs best demonstrate this role\'s skills" — asked at two different moments, so one function answers both.',
  },
];
