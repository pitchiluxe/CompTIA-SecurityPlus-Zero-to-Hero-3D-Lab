import type { PreparedCommand } from './types';

// ---------------------------------------------------------------------------
// Phase 24 prepared outputs — Security+ Exam Preparation.
//
// Reference material only — study strategy and scoring mechanics, not
// simulated tool output. Same closed-allowlist contract as every other phase.
// ---------------------------------------------------------------------------

export const PHASE_24_COMMANDS: PreparedCommand[] = [
  {
    match: 'show exam blueprint',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'SY0-701 EXAM BLUEPRINT',
      '',
      'DOMAIN                                          WEIGHT',
      '───────────────────────────────────────────────  ──────',
      '1.0 General Security Concepts                     12%',
      '2.0 Threats, Vulnerabilities, and Mitigations      22%',
      '3.0 Security Architecture                         18%',
      '4.0 Security Operations                           28%',
      '5.0 Security Program Management and Oversight     20%',
      '',
      'Format: up to 90 questions, 90 minutes, scaled 100-900, passing score 750.',
    ].join('\n'),
    teaches:
      'Security Operations alone is worth more than General Security Concepts and Security Architecture combined — domain weight, not just how weak you feel in a domain, should drive study priority.',
  },
  {
    match: 'show scoring formula',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'WEIGHTED SCALED SCORE (practice approximation)',
      '',
      '1. For each domain actually asked, compute accuracy = correct / asked.',
      '2. Weight each domain\'s accuracy by its official exam weight, renormalised',
      '   across only the domains asked (a partial practice set is not penalised',
      '   for domains it never covered).',
      '3. Map the resulting weighted ratio linearly onto the 100-900 scale.',
      '4. Compare against the passing score (750) for a ready / approaching /',
      '   not-ready verdict.',
      '',
      'CompTIA does not publish its exact scaling — this is a declared linear',
      'approximation used only for practice readiness feedback, not a promise',
      'of the real exam\'s scoring curve.',
    ].join('\n'),
    teaches:
      'A domain scoring lower in raw percentage is not automatically the higher priority once weight is applied — the formula exists precisely so accuracy and weight are combined instead of eyeballed separately.',
  },
  {
    match: 'explain time budget',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'EXAM TIME BUDGET',
      '',
      '90 questions / 90 minutes = 1 minute average per question.',
      '',
      'Recommended allocation (not equal per question):',
      '  Recall questions        ~15-30 seconds',
      '  Single-concept scenario ~45-60 seconds',
      '  Multi-detail scenario   ~60-90 seconds',
      '  Performance-based (PBQ) ~2-4 minutes, attempt every one',
      '',
      'Flag genuinely uncertain questions for later review rather than resolving',
      'them immediately — protect the questions that come after.',
    ].join('\n'),
    teaches:
      'The 1-minute average is a budget across the whole exam, not a per-question rule — spending it evenly is itself a strategic mistake, not a neutral default.',
  },
  {
    match: 'explain distractor elimination',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'DISTRACTOR ELIMINATION',
      '',
      'STEP 1: Eliminate the obviously-wrong option (factually impossible, or',
      '         addresses a completely different problem). 25% -> 33% odds.',
      'STEP 2: Eliminate the disproportionate-sounding option — a technically',
      '         valid security action, scoped far more drastically than the',
      '         situation warrants (e.g. "wipe the server", "disable the',
      '         account entirely"). 33% -> 50% odds or better.',
      'STEP 3: Between what remains, look for the exam clue — the one detail',
      '         in the scenario the correct answer actually depends on.',
    ].join('\n'),
    teaches:
      'Each elimination step is a distinct, teachable skill on its own, separate from knowing the underlying security concept — practising them independently improves guessing odds even under partial uncertainty.',
  },
  {
    match: 'explain exam clue',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'FINDING THE EXAM CLUE',
      '',
      'A well-written scenario question has one detail doing all the work:',
      '  - A timestamp or sequence ("isolated, then captured" vs "captured, then isolated")',
      '  - A word like "immediately", "eventually", or "already"',
      '  - What a control did or did NOT do (an absence, not just a presence)',
      '  - A comparison ("47 entitlements" means nothing without "peers hold 12")',
      '',
      'Two learners who both understand the underlying concept can disagree on an',
      'answer if only one of them notices this detail.',
    ].join('\n'),
    teaches:
      'This is the same skill this platform\'s own scenario questions were built to train — every scenario question with an examClue field names this exact detail, so it can be practised deliberately.',
  },
  {
    match: 'explain weak area review',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'WEAK-AREA REVIEW',
      '',
      '1. Every concept sits on a 0-6 mastery ladder; level <= 2 is flagged weak.',
      '2. A weak-area session pulls every quiz question tagged with a currently',
      '   flagged concept — nothing else.',
      '3. Answering correctly advances the concept one level; a miss drops it',
      '   two, so recovering from a miss takes deliberate, repeated practice,',
      '   not one lucky guess.',
      '',
      'This is a targeted subset, not a full lesson retake — it concentrates',
      'entirely on what is currently failing.',
    ].join('\n'),
    teaches:
      'A weak-area session is defined by data (the mastery ladder), not by which lesson the learner feels like revisiting — that is what keeps it efficient rather than a full re-study of already-solid material.',
  },
  {
    match: 'explain adaptive session',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'ADAPTIVE SESSION',
      '',
      '1. Every question in the full bank is grouped into a tier by its concept\'s',
      '   current mastery level (0-6); untagged questions sit in the middle tier.',
      '2. Tiers are ordered weakest-first, so the session surfaces struggling',
      '   concepts ahead of comfortable ones automatically.',
      '3. Within one tier, order is shuffled (deterministically) rather than',
      '   fixed, so repeated sessions do not always ask the same first question.',
      '',
      'This is mastery-driven, cross-domain selection — unlike a domain quiz,',
      'it does not require picking a domain first.',
    ].join('\n'),
    teaches:
      'Adaptive review answers "what should I study next" directly from performance data, which matters most when a learner does not yet know which domain or concept needs attention.',
  },
  {
    match: 'show mock exam checklist',
    tool: 'platform',
    provenance: 'simulated',
    output: [
      'MOCK EXAM CHECKLIST — BEFORE YOU START',
      '',
      '[ ] Set aside the full time budget (1 minute × question count) uninterrupted.',
      '[ ] Commit to attempting every PBQ, even partially.',
      '[ ] Commit to never leaving a question blank — guess and flag, do not skip.',
      '[ ] Treat the result as one data point: read the domain breakdown, not',
      '     just the scaled score.',
      '[ ] Identify the single highest-priority domain (weakest AND most heavily',
      '     weighted) before choosing your next study session.',
    ].join('\n'),
    teaches:
      'The checklist is deliberately ordered so the very last item is an action — "identify the next domain" — rather than ending on the score itself, because the score alone is not a study plan.',
  },
];
