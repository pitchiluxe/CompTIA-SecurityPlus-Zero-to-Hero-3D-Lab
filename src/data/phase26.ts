import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 26 — Career Mode
// Aligned with CompTIA Security+ SY0-701
// ---------------------------------------------------------------------------

// ---------- Lesson 1: From Job Description to Study Plan ----------

const LESSON_26_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p26-l1-s0',
    title: 'Concept — Target Roles This Platform Prepares You For',
    body:
      'Career Mode targets eight specific entry-to-junior roles: SOC Analyst I, Junior Security Analyst, Cybersecurity Analyst, Security Operations Analyst, IT Security Technician, IAM Analyst, Junior IAM Engineer, and Security Support Specialist. These are deliberately where a Security+ credential plus a demonstrated lab portfolio actually opens doors — a senior or specialist role requires years of production experience this platform cannot manufacture, and pretending otherwise is exactly the fabrication risk this phase exists to warn against.',
  },
  {
    id: 'p26-l1-s1',
    title: 'Concept — Extracting Skills From a Real Job Posting',
    body:
      'A real job posting rarely names a Security+ concept directly — it names vendor products, responsibilities phrased as duties, and vague qualifiers like "familiarity with" or "exposure to." Extracting skills means reading past the vendor names to the underlying responsibility: "experience with SIEM tools like Splunk or Sentinel" is asking about alert correlation and log analysis, not about a specific product\'s user interface; "incident response experience" is asking about the lifecycle and containment judgement this platform has taught since Phase 12, not a specific company\'s runbook.',
  },
  {
    id: 'p26-l1-s2',
    title: 'Concept — Mapping Extracted Skills to Concepts You Already Track',
    body:
      'Once a skill is extracted in plain language, it maps onto one or more concept IDs this platform already tracks mastery for — the same concept IDs behind quiz questions, lesson objectives, and lab evidence. This mapping is deliberately not a new taxonomy: "alert correlation," "incident response," "containment," and every other concept a role needs already has lessons, labs, and a mastery level attached to it from earlier phases. The mapping step is translation, not invention.',
  },
  {
    id: 'p26-l1-s3',
    title: 'Concept — Identifying Gaps From Data, Not Guesswork',
    body:
      'For each mapped skill, averaging the mastery level across its concepts and comparing against the same weak-area threshold used throughout this platform (level 2 or below) turns "am I ready for this role" into a specific, data-backed answer: which named skills are gaps, not a vague overall feeling. A role with two flagged gaps out of five skills is a concrete, two-item study list — far more useful than either false confidence or vague anxiety about being underprepared.',
  },
  {
    id: 'p26-l1-s4',
    title: 'Concept — Building a Targeted Study Plan From the Gaps',
    body:
      'Once gaps are identified, the targeted labs to work are simply the labs from phases whose lessons already cover those exact gap concepts — the same phases and labs that exist throughout this platform, selected specifically rather than worked through in phase order. This is the same principle Phase 24 applied to exam weak-area review, now applied to job-description-driven gaps instead of quiz-driven ones: the underlying data (mastery per concept) is identical, only the selection criterion changes.',
  },
  {
    id: 'p26-l1-s5',
    title: 'Example — Mapping One Posting End to End',
    body:
      'A posting reads: "SOC Analyst I — monitor security alerts, escalate true positives, document incidents, support on-call rotation. Familiarity with SIEM tooling and basic incident response required." Extraction: monitoring/escalating alerts, documenting incidents, SIEM familiarity, basic incident response. Mapping: alert-correlation, evidence-handling, incident-response, containment. If a learner\'s mastery shows alert-correlation at level 4 but incident-response at level 1, the gap is clear and specific — revisit Phase 23\'s capstone (which directly exercises both detect/triage and the full IR lifecycle) rather than restudying material already at a comfortable level.',
  },
  {
    id: 'p26-l1-s6',
    title: 'Review — What Must Stick',
    body:
      'Career Mode targets entry-to-junior roles specifically, where this platform\'s preparation is genuinely sufficient. Extracting skills means translating vendor/product language and vague qualifiers into the actual underlying responsibility being asked about. Mapping skills to concepts reuses this platform\'s existing concept IDs rather than inventing a new taxonomy. Gap analysis reuses the same weak-area threshold as everywhere else, turning readiness into a specific, nameable list rather than a vague feeling. A targeted study plan is simply the existing labs that already cover the identified gap concepts.',
  },
];

const LESSON_26_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p26-q0',
    type: 'mcq',
    stem: 'Why does Career Mode target entry-to-junior roles specifically, rather than senior or specialist positions?',
    options: [
      'A Security+ credential plus a demonstrated lab portfolio genuinely opens doors at the entry-to-junior level, while senior roles require years of production experience that cannot be manufactured or substituted',
      'Senior roles never require any technical security knowledge at all',
      'Entry-level roles do not actually exist in the cybersecurity job market',
      'There is no meaningful difference in preparation needed across seniority levels',
    ],
    answer: 0,
    explanation:
      'Targeting the level where this platform\'s preparation is genuinely sufficient avoids implying it can substitute for years of production experience it cannot provide.',
    domain: 'General Security Concepts',
    conceptId: 'career-role-targeting',
  },
  {
    id: 'p26-q1',
    type: 'mcq',
    stem: 'A job posting asks for "experience with SIEM tools like Splunk or Sentinel." What is the underlying skill being extracted from this phrase?',
    options: [
      'Alert correlation and log analysis across sources, not familiarity with a specific product\'s interface',
      'The ability to purchase enterprise software licenses',
      'A specific certification issued by Splunk or Microsoft',
      'General computer literacy unrelated to security'
    ],
    answer: 0,
    explanation:
      'The vendor name in a posting is rarely the actual skill being tested — the underlying responsibility (correlating alerts across log sources) is what matters and what maps onto a concept this platform already tracks.',
    domain: 'General Security Concepts',
    conceptId: 'skill-extraction',
  },
  {
    id: 'p26-q2',
    type: 'mcq',
    stem: 'Why does mapping extracted skills onto this platform\'s existing concept IDs matter, rather than creating a new list of skills for Career Mode?',
    options: [
      'Existing concept IDs already have lessons, labs, and tracked mastery levels behind them, so mapping is translation rather than building a parallel system that would need its own tracking',
      'New skill taxonomies are always more accurate than existing ones',
      'This has no practical effect on how gap analysis or study planning works',
      'Concept IDs and skills are entirely unrelated types of information'
    ],
    answer: 0,
    explanation:
      'Reusing existing concept IDs means a learner\'s mastery data works immediately for Career Mode with no separate tracking system to maintain or keep in sync.',
    domain: 'General Security Concepts',
    conceptId: 'skill-mapping',
  },
  {
    id: 'p26-q3',
    type: 'mcq',
    stem: 'What threshold does Career Mode use to flag a skill as a gap, and where else on this platform is the same threshold used?',
    options: [
      'Average mastery level 2 or below — the same weak-area threshold used by the Progress view and Phase 24\'s exam-prep weak-area review',
      'A skill is only a gap if its mastery level is exactly 0',
      'Career Mode uses a completely different, unrelated threshold from the rest of the platform',
      'Gaps are determined by the learner\'s own subjective feeling, not any numeric threshold'
    ],
    answer: 0,
    explanation:
      'Reusing the same weak-area threshold (level 2 or below) as the rest of the platform keeps gap analysis consistent with how weakness is defined everywhere else the learner has already seen it.',
    domain: 'General Security Concepts',
    conceptId: 'gap-analysis',
  },
  {
    id: 'p26-q4',
    type: 'mcq',
    stem: 'Once a skill gap is identified, how does Career Mode select which labs to recommend for it?',
    options: [
      'It recommends labs from phases whose lessons already cover the exact concepts behind that gap',
      'It recommends labs in strict phase-number order regardless of relevance to the gap',
      'It recommends every lab in the entire platform regardless of the identified gap',
      'It generates entirely new labs specifically for Career Mode that do not exist elsewhere'
    ],
    answer: 0,
    explanation:
      'Targeted lab recommendation reuses the existing phase/lesson/concept structure — no new labs are invented, only an existing, relevant subset is selected.',
    domain: 'General Security Concepts',
    conceptId: 'targeted-study-plan',
  },
  {
    id: 'p26-q5',
    type: 'scenario',
    stem: 'A posting states: "document incidents and support the on-call rotation." Which concept does "document incidents" map onto, given this platform\'s existing concept IDs?',
    options: [
      'evidence-handling',
      'password-spraying',
      'dns-tunnelling',
      'defense-in-depth'
    ],
    answer: 0,
    explanation:
      'Documenting incidents is specifically the evidence-handling concept already taught and tracked since Phase 12\'s incident response lessons.',
    domain: 'General Security Concepts',
    conceptId: 'skill-mapping',
  },
  {
    id: 'p26-q6',
    type: 'scenario',
    stem: 'A learner\'s gap analysis for the SOC Analyst I role shows alert-correlation at mastery level 4 but incident-response at level 1. What should this specifically direct the learner to do next?',
    options: [
      'Focus targeted study on incident-response-related labs and lessons, since alert-correlation is already at a comfortable level and does not need immediate attention',
      'Restudy alert-correlation material first since it is the highest-scoring skill',
      'Study both skills in exactly equal proportion regardless of their current mastery levels',
      'Conclude no further study is needed since one skill scored well'
    ],
    answer: 0,
    explanation:
      'Gap analysis exists precisely to direct limited study time toward the specific weak skill (incident-response) rather than material already at a comfortable level.',
    domain: 'General Security Concepts',
    conceptId: 'gap-analysis',
  },
  {
    id: 'p26-q7',
    type: 'scenario',
    stem: 'A learner reads a job posting requiring "familiarity with IAM platforms (Okta, Microsoft Entra ID)" and concludes they must learn the specific Okta admin console before they can claim any relevant skill. Is this the correct interpretation of the skill-mapping process taught in this lesson?',
    options: [
      'Not quite — the posting is really asking about the underlying identity-provider and federation concepts, which this platform already teaches and tracks, independent of any one vendor\'s specific interface',
      'Yes, vendor-specific tool proficiency is always the actual skill being requested in every posting',
      'This posting cannot be mapped to any concept this platform tracks',
      'Job postings never actually reflect real underlying skill requirements'
    ],
    answer: 0,
    explanation:
      'Skill mapping specifically translates vendor/product names into the underlying concept (identity-provider, federation) rather than treating the vendor tool itself as the skill to be learned.',
    domain: 'General Security Concepts',
    conceptId: 'skill-mapping',
  },
  {
    id: 'p26-q8',
    type: 'scenario',
    stem: 'A learner targeting the IT Security Technician role has never recorded any mastery data for "living-off-the-land" or "privilege-escalation," both mapped to that role\'s skills. How should Career Mode treat these two skills?',
    options: [
      'Both should be flagged as gaps, since a mastery level of 0 (never encountered) falls at or below the weak-area threshold just as a low recorded score would',
      'Skills with no recorded mastery data at all cannot be assessed and should be silently ignored',
      'Skills with no recorded data should be assumed to already be at full mastery',
      'Only skills with at least one prior quiz attempt can ever be flagged as a gap'
    ],
    answer: 0,
    explanation:
      'A concept never encountered sits at mastery level 0, which is at or below the weak-area threshold — gap analysis correctly flags it, treating "never studied" the same as "studied and struggled" for prioritisation purposes.',
    domain: 'General Security Concepts',
    conceptId: 'gap-analysis',
  },
  {
    id: 'p26-q-pbq',
    type: 'pbq',
    stem: 'Order the career-mode workflow for a job posting.',
    options: [
      'Extract required skills and certifications from the posting',
      'Map each skill to the platform\'s concept taxonomy',
      'Identify gaps between current mastery and required mastery',
      'Build a targeted study plan from the gaps',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Start with what the employer asks, translate it into concepts you can study, compare it to your current mastery, and turn the difference into a plan.',
    domain: 'General Security Concepts',
    conceptId: 'skill-mapping',
  },
];

// ---------- Lesson 2: Interview Readiness and Professional Honesty ----------

const LESSON_26_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p26-l2-s0',
    title: 'Concept — Reusing Scenario Questions as Interview Rehearsal',
    body:
      'A well-written scenario quiz question and a technical interview question test the same underlying skill in two different formats: both present a situation and ask for a judgement, both reward citing specific evidence over a vague impression, and both expect the responder to explain why the alternatives are wrong, not just state the right answer. Career Mode reuses this platform\'s existing scenario-type questions — filtered to a target role\'s mapped concepts — as interview rehearsal material precisely because rehearsing the explanation out loud, not just selecting the right multiple-choice option, is the actual interview skill.',
  },
  {
    id: 'p26-l2-s1',
    title: 'Concept — Troubleshooting Scenarios as Whiteboard Rehearsal',
    body:
      'A technical interview frequently includes a live, whiteboard-style scenario: "here are some logs and an alert, walk me through how you would investigate this." Phase 22\'s ten troubleshooting scenarios are built for exactly this kind of rehearsal — reviewing every investigation panel, stating a root cause, and justifying a recommended action out loud, under a small amount of real-time pressure, is close practice for the interview format itself, not just for the underlying knowledge being tested.',
  },
  {
    id: 'p26-l2-s2',
    title: 'Concept — Recommending Portfolio Projects for the Target Role',
    body:
      'The same labs recommended to close a skill gap are also the labs worth featuring in a portfolio for that role — a lab worth studying to close a gap is, by the same logic, a lab that demonstrates exactly the skill a role\'s job description asked about. This is a single underlying recommendation ("which labs best demonstrate this role"), asked at two different moments: before the interview (what to study) and for the application itself (what to feature), which is why Career Mode does not need a separate portfolio-curation tool beyond what Phase 25 already built.',
  },
  {
    id: 'p26-l2-s3',
    title: 'Concept — "Never Fabricate Professional Experience," in Concrete Terms',
    body:
      'This platform\'s provenance discipline — real, simulated, or prepared — exists throughout every lab specifically so it can carry forward honestly into how the work is described afterward. Concretely: describing simulated lab work as simulated ("completed a structured, simulated SOC investigation covering X") is honest and still genuinely impressive; describing it as a real-system incident, claiming a job title or employer never held, or claiming a certification never obtained, is fabrication — not an exaggeration of degree, but a claim about something that did not happen at all.',
  },
  {
    id: 'p26-l2-s4',
    title: 'Concept — Why Interviewers Specifically Probe for This',
    body:
      'An experienced technical interviewer asks specific, practical follow-up questions precisely because a fabricated claim cannot survive them: "what was the actual business impact," "who else was on the response team," "what was the production environment" are all questions with real answers for genuine experience and no coherent answer for a fabricated claim. An honest, precisely-scoped claim about simulated work never needs to survive this kind of scrutiny, because it was never overstated in the first place — which is exactly why the honest framing is the professionally safer choice, not merely the more ethical one.',
  },
  {
    id: 'p26-l2-s5',
    title: 'Example — Rehearsing One Interview Question',
    body:
      'A rehearsal prompt (reused from a scenario quiz question) reads: "An analyst sees a TCP segment with SYN and ACK flags set, Seq=0 Ack=1 — what stage of the connection does this represent?" A strong rehearsed answer states the conclusion first (the server\'s reply in the three-way handshake), cites the specific evidence (SYN+ACK together, with an acknowledgement number one greater than the client\'s initial sequence number), and briefly notes what would look different if it were a different stage (a lone SYN would be the client\'s opening request; a lone ACK would be the handshake\'s completion). This is exactly the structure — conclusion, evidence, contrast — a strong verbal interview answer follows.',
  },
  {
    id: 'p26-l2-s6',
    title: 'Review — What Must Stick',
    body:
      'Scenario quiz questions and interview questions test the same skill in different formats — rehearsing the explanation aloud is the actual interview practice, not just picking the right option. Phase 22\'s troubleshooting scenarios double as whiteboard-style interview rehearsal when ranked by relevance to a target role. The same labs recommended to close a gap are the labs worth featuring in a portfolio for that role — one recommendation, two uses. Honest, precisely-scoped claims about simulated work are both ethical and professionally safer, because they never need to survive scrutiny they were never at risk from. Fabricated claims collapse under exactly the specific follow-up questions an experienced interviewer knows to ask.',
  },
];

const LESSON_26_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p26-q9',
    type: 'mcq',
    stem: 'Why does Career Mode reuse existing scenario-type quiz questions as interview rehearsal material instead of writing a separate interview-question bank?',
    options: [
      'A scenario quiz question and an interview question test the same underlying skill in different formats, so rehearsing the explanation aloud from the existing question serves the same purpose',
      'Interview questions and quiz questions test entirely unrelated skills',
      'Writing a separate bank would be strictly required by professional standards',
      'Scenario questions cannot be adapted to any other purpose besides quizzing'
    ],
    answer: 0,
    explanation:
      'The underlying skill (applying a concept to a situation, citing evidence, ruling out alternatives) is identical whether it is being tested by a quiz or an interviewer — reuse is a deliberate design decision.',
    domain: 'General Security Concepts',
    conceptId: 'interview-rehearsal',
  },
  {
    id: 'p26-q10',
    type: 'mcq',
    stem: 'Why are Phase 22\'s troubleshooting scenarios well-suited to whiteboard-style interview rehearsal specifically?',
    options: [
      'They require reviewing investigation evidence, stating a root cause, and justifying a recommended action out loud — precisely the format a live technical interview scenario question uses',
      'They are the only quiz content on the entire platform',
      'They require no evidence review or justification of any kind',
      'They are specifically designed to be answered silently and privately'
    ],
    answer: 0,
    explanation:
      'The investigate-then-justify structure of these scenarios mirrors exactly how a live "walk me through this" interview scenario typically unfolds.',
    domain: 'General Security Concepts',
    conceptId: 'interview-rehearsal',
  },
  {
    id: 'p26-q11',
    type: 'mcq',
    stem: 'Why do the same labs recommended to close a skill gap also work as recommended portfolio features for the same role?',
    options: [
      'Both recommendations answer the same underlying question — which labs best demonstrate this role\'s skills — just asked at different moments (before the interview vs. for the application)',
      'Portfolio features and study recommendations are based on completely unrelated criteria',
      'Portfolio features should always be chosen at random, independent of the target role',
      'Study recommendations are only ever used once and never reused for any other purpose'
    ],
    answer: 0,
    explanation:
      'A lab worth closing a gap in is, by the same logic, a lab that demonstrates the exact skill a role\'s posting asked about — one recommendation serves both study planning and portfolio curation.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-recommendation',
  },
  {
    id: 'p26-q12',
    type: 'mcq',
    stem: 'What distinguishes an honest portfolio claim from a fabricated one, according to this lesson?',
    options: [
      'An honest claim accurately scopes work as simulated/lab-based; a fabricated claim describes real-system involvement, a job title, an employer, or a certification that never existed',
      'Honest claims must always be modest and undersell the work performed',
      'Fabricated claims are only a problem if they involve a specific dollar figure',
      'There is no meaningful distinction between honest and fabricated claims in a portfolio'
    ],
    answer: 0,
    explanation:
      'The distinction is about what actually happened versus what is claimed to have happened — accurately scoped simulated work is honest; claiming real-system or professional experience that never existed is fabrication.',
    domain: 'General Security Concepts',
    conceptId: 'fabrication-risk',
  },
  {
    id: 'p26-q13',
    type: 'mcq',
    stem: 'Why is an honestly-framed claim about simulated work described as "professionally safer," not merely more ethical?',
    options: [
      'An honest claim never needs to survive scrutiny it was never at risk from, while a fabricated claim collapses under a specific, ordinary follow-up interview question',
      'Honest claims are never asked follow-up questions at all',
      'Ethical considerations and professional safety are always in direct conflict with each other',
      'Fabricated claims are actually safer because interviewers rarely ask any follow-up questions'
    ],
    answer: 0,
    explanation:
      'A precisely-scoped honest claim withstands scrutiny by design, since it was never overstated — the fabricated version fails the moment a normal clarifying question is asked.',
    domain: 'General Security Concepts',
    conceptId: 'fabrication-risk',
  },
  {
    id: 'p26-q14',
    type: 'scenario',
    stem: 'During an interview, a candidate is asked "what was the production environment and business impact of the incident you described?" after claiming to have responded to a live ransomware attack that was actually a platform simulation. What does this scenario illustrate?',
    options: [
      'Exactly the kind of ordinary, specific follow-up question that a fabricated claim cannot survive, while an honestly-scoped claim about simulated work would have had a straightforward, truthful answer',
      'Interviewers rarely ask questions this specific in practice',
      'This question is unfair and inappropriate for an interviewer to ask',
      'A fabricated claim can always be defended with enough confidence regardless of the question asked'
    ],
    answer: 0,
    explanation:
      'This is precisely the kind of specific, practical follow-up an experienced interviewer asks, and it has no coherent answer for a claim about work that never actually happened.',
    domain: 'General Security Concepts',
    conceptId: 'fabrication-risk',
  },
  {
    id: 'p26-q15',
    type: 'scenario',
    stem: 'A learner rehearsing a scenario question about a TCP handshake states the correct conclusion but cannot explain which specific detail (SYN+ACK together, with a specific acknowledgement number) supports it. How should this rehearsal attempt be evaluated against the standard this lesson sets?',
    options: [
      'Incomplete — reaching the right conclusion without citing the specific supporting evidence does not meet the conclusion-evidence-contrast structure a strong interview answer requires',
      'This is a fully complete and sufficient interview-quality answer',
      'Citing specific evidence is only relevant for written quiz answers, never for verbal interview answers',
      'The correct conclusion alone is worth more than any explanation of how it was reached'
    ],
    answer: 0,
    explanation:
      'A strong answer states the conclusion, cites the specific evidence behind it, and notes the contrast with alternatives — a conclusion alone, without the evidence, falls short of that standard.',
    domain: 'General Security Concepts',
    conceptId: 'interview-rehearsal',
  },
  {
    id: 'p26-q16',
    type: 'scenario',
    stem: 'A learner preparing for a Junior IAM Engineer interview selects two labs to rehearse and feature in their portfolio: an identity-lifecycle lab and a federation/SSO-concepts lab, both directly matching the role\'s mapped skills. What principle does this selection correctly demonstrate?',
    options: [
      'The same relevance criterion — which labs best demonstrate this role\'s mapped skills — correctly drives both the study/rehearsal selection and the portfolio-feature selection',
      'Portfolio features and rehearsal material should always be selected completely independently of one another',
      'Only labs unrelated to the target role should ever be featured in a portfolio',
      'Rehearsal selection has no bearing on which labs should be featured in a portfolio'
    ],
    answer: 0,
    explanation:
      'Choosing the same role-relevant labs for both rehearsal and portfolio features directly reflects the "one recommendation, two uses" principle this lesson describes.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-recommendation',
  },
  {
    id: 'p26-q17',
    type: 'scenario',
    stem: 'A learner writes in their portfolio: "Completed a structured, simulated SOC investigation covering credential compromise, lateral movement, and containment across a five-host lab environment." Is this claim honest or fabricated, and why?',
    options: [
      'Honest — it accurately scopes the work as simulated and lab-based while still describing specific, genuine, demonstrable skills',
      'Fabricated — any mention of "credential compromise" or "lateral movement" implies real-system experience',
      'Fabricated — simulated work should never be described in any detail in a portfolio',
      'This claim cannot be evaluated without additional information'
    ],
    answer: 0,
    explanation:
      'This claim explicitly and accurately scopes the work as simulated and lab-based, which is exactly the honest framing this lesson recommends — specific and impressive without overstating what happened.',
    domain: 'General Security Concepts',
    conceptId: 'fabrication-risk',
  },
  {
    id: 'p26-q18',
    type: 'scenario',
    stem: 'A learner is deciding how to describe their platform experience and considers writing "Worked as a SOC Analyst for two years managing enterprise security operations," even though they have only completed platform labs and never held this job. What should they do instead, based on this lesson?',
    options: [
      'Describe the actual work performed and its actual scope honestly (e.g., specific simulated labs completed and skills demonstrated), since claiming a job title, employer, and duration never held is fabricated professional experience',
      'Write the claim exactly as considered, since portfolio language is not held to the same standard as a resume',
      'Add slightly more caveats to the same claim while keeping the false job title and duration',
      'This phrasing is acceptable as long as the learner privately knows it is not literally true'
    ],
    answer: 0,
    explanation:
      'Claiming a specific job title, employer, and duration of experience that never existed is exactly the fabrication this platform instructs against — the honest alternative (describing actual completed work) remains a legitimate, defensible claim.',
    domain: 'General Security Concepts',
    conceptId: 'fabrication-risk',
  },
];

// ---------- Lab 1: Map a Job Description to a Targeted Study Plan ----------

const LAB_26_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the eight target roles Career Mode prepares you for.',
    command: 'show target roles',
    expected: 'A list of eight entry-to-junior roles, each with a declared skill set.',
  },
  {
    id: 's1',
    instruction: 'Review how skills are extracted and translated from vendor/product language.',
    command: 'explain skill mapping',
    expected: 'Example translations from job-posting phrases to underlying concepts.',
  },
  {
    id: 's2',
    instruction: 'Review how gap analysis turns mapped concepts into a specific study list.',
    command: 'explain gap analysis',
    expected: 'The weak-area threshold applied to averaged skill mastery levels.',
  },
  {
    id: 's3',
    instruction: 'Review a fully worked sample job description mapping.',
    command: 'show sample job description mapping',
    expected: 'A real posting excerpt mapped end-to-end to existing platform concepts.',
  },
];

const LAB_26_0: Lab = {
  id: 'p26-lab-0',
  phaseId: 'phase-26',
  title: 'Map a Job Description to a Targeted Study Plan',
  objective:
    'Select a target role in Career Mode, review its skill-to-concept mapping, run a gap analysis against your own mastery data, and identify the specific labs it recommends to close the biggest gap.',
  securityConcepts: [
    'Job description skill extraction',
    'Skill-to-concept mapping',
    'Gap analysis against mastery data',
    'Targeted study plan selection',
  ],
  environment: 'Deterministic career-preparation tool — reference material and mastery-data lookups only; no real job application or employer system is involved',
  topology: 'Not applicable — this lab is a career-planning exercise',
  prerequisites: ['Complete at least 5 prior phases so mastery data exists to run a gap analysis against'],
  steps: LAB_26_0_STEPS,
  expectedResults: [
    'Learner selects one of the eight target roles in Career Mode',
    'Learner reviews the skill-to-concept mapping for that role',
    'Learner identifies their own biggest flagged skill gap for that role',
    'Learner names the specific recommended lab(s) that address that gap',
  ],
  verification: [
    'Learner can state which of their mapped skills is currently flagged as a gap and why',
    'Learner can explain how a job-posting phrase maps to an underlying concept, using their own example',
    'Learner can name at least one recommended lab and the concept it addresses',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'No gaps flagged for any role → this is a legitimate outcome if mastery is already strong across every mapped concept; review the role\'s interview questions and troubleshooting scenarios instead.',
    'Unsure how a posting phrase maps to a concept → compare against the sample job description mapping command output first.',
  ],
  challenge:
    'Find one real, publicly posted job description for one of the eight target roles and write your own skill extraction and concept mapping for it, following the sample format.',
  evidence: [
    {
      id: 'ev0',
      label: 'Role selection and gap analysis',
      type: 'log',
      placeholder: 'Which role you selected and the skill assessment it produced',
    },
    {
      id: 'ev1',
      label: 'Study plan and real job description mapping',
      type: 'report',
      placeholder: 'Your biggest gap, the recommended lab(s), and your own real-posting mapping',
    },
  ],
  securityLesson:
    'A job posting is not a mystery to be guessed at — it is a text to be translated, phrase by phrase, into concepts you can actually check your own readiness against. That translation step, done deliberately, is what turns "am I qualified" from a feeling into a specific, checkable list.',
};

// ---------- Lab 2: Rehearse Interview Questions and Check Portfolio Honesty ----------

const LAB_26_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review how existing scenario quiz questions double as interview rehearsal material.',
    command: 'explain interview question generation',
    expected: 'An explanation of reusing scenario questions, filtered by role concept, as interview prompts.',
  },
  {
    id: 's1',
    instruction: 'Review how Phase 22\'s troubleshooting scenarios are ranked for interview rehearsal.',
    command: 'explain troubleshooting rehearsal',
    expected: 'An explanation of concept-overlap ranking for whiteboard-style rehearsal.',
  },
  {
    id: 's2',
    instruction: 'Review the fabrication-risk guidance before writing any portfolio claim.',
    command: 'explain fabrication risk',
    expected: 'Honest versus fabricated example claims, side by side.',
  },
];

const LAB_26_1: Lab = {
  id: 'p26-lab-1',
  phaseId: 'phase-26',
  title: 'Rehearse Interview Questions and Check Portfolio Honesty',
  objective:
    'Rehearse the interview questions and troubleshooting scenarios recommended for a target role, then complete the resume-bullet honesty check to practise distinguishing honest claims from fabricated ones.',
  securityConcepts: [
    'Interview rehearsal from scenario questions',
    'Troubleshooting-scenario rehearsal',
    'Portfolio and resume honesty',
    'Fabrication-risk recognition',
  ],
  environment: 'Deterministic career-preparation tool — reference material and a discrimination exercise only; no real resume or job application is submitted',
  topology: 'Not applicable — this lab is a career-preparation exercise',
  prerequisites: ['Complete Phase 26 Lab 0 (Map a Job Description to a Targeted Study Plan)'],
  steps: LAB_26_1_STEPS,
  expectedResults: [
    'Learner rehearses at least 3 recommended interview questions for their chosen role out loud',
    'Learner rehearses at least 1 recommended troubleshooting scenario as a whiteboard exercise',
    'Learner completes the resume-bullet honesty check with every bullet correctly classified',
  ],
  verification: [
    'Learner can explain why a rehearsed answer needs cited evidence, not just a stated conclusion',
    'Learner can identify which troubleshooting scenario was recommended and why it overlaps their target role',
    'Learner can correctly classify every sample resume bullet as honest or fabricated, with rationale',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'No troubleshooting scenario recommended for a role → this can happen for concept sets with little overlap with Phase 22\'s ten scenarios; rehearse the interview questions instead.',
    'Unsure why a bullet is fabricated despite sounding modest → check specifically for a claimed job title, employer, real-system incident, or certification that was never actually held — modesty does not offset fabrication.',
  ],
  challenge:
    'Write one honest, accurately-scoped portfolio bullet for a lab you have completed, and one clearly fabricated version of the same claim, labelling which is which and why.',
  evidence: [
    {
      id: 'ev0',
      label: 'Interview and troubleshooting rehearsal notes',
      type: 'log',
      placeholder: 'Questions/scenarios rehearsed and your spoken-answer notes',
    },
    {
      id: 'ev1',
      label: 'Resume-bullet honesty check results',
      type: 'report',
      placeholder: 'Your classification of every sample bullet, plus your own honest/fabricated pair',
    },
  ],
  securityLesson:
    'The same provenance discipline this platform applies to every lab (real/simulated/prepared) is the discipline a career depends on afterward — an honest, precisely-scoped claim is both the ethical choice and the one that survives an interviewer\'s first good follow-up question.',
};

// ---------- Lessons ----------

const LESSON_26_L1: Lesson = {
  id: 'p26-lesson-0',
  phaseId: 'phase-26',
  title: 'From Job Description to Study Plan',
  objectives: [
    'Name the eight target roles Career Mode prepares a learner for',
    'Extract skills from job-posting language, past vendor names and vague qualifiers',
    'Map extracted skills onto this platform\'s existing tracked concepts',
    'Run a gap analysis using the same weak-area threshold used elsewhere on this platform',
    'Build a targeted study plan from the labs that already cover an identified gap',
  ],
  sections: LESSON_26_L1_SECTIONS,
  quiz: LESSON_26_L1_QUIZ,
  concepts: [
    'career-role-targeting',
    'skill-extraction',
    'skill-mapping',
    'gap-analysis',
    'targeted-study-plan',
  ],
  homework:
    'Find one real posting for a target role and write your own skill extraction and concept mapping for it. Then list which of those concepts are currently gaps for you.',
  careerConnection:
    'This is the literal job-search skill: reading a posting and knowing exactly what to study before applying, rather than guessing or assuming a credential alone is sufficient.',
};

const LESSON_26_L2: Lesson = {
  id: 'p26-lesson-1',
  phaseId: 'phase-26',
  title: 'Interview Readiness and Professional Honesty',
  objectives: [
    'Use existing scenario quiz questions as interview rehearsal material',
    'Use Phase 22\'s troubleshooting scenarios as whiteboard-style interview rehearsal',
    'Recommend portfolio projects using the same relevance criterion as study recommendations',
    'State the concrete difference between an honest and a fabricated portfolio claim',
    'Explain why honest claims are professionally safer, not just more ethical',
  ],
  sections: LESSON_26_L2_SECTIONS,
  quiz: LESSON_26_L2_QUIZ,
  concepts: [
    'interview-rehearsal',
    'portfolio-recommendation',
    'fabrication-risk',
  ],
  homework:
    'Rehearse three scenario questions out loud, stating conclusion, evidence, and contrast each time. Then write one honest portfolio bullet and one fabricated version of the same claim, and label which is which.',
  careerConnection:
    'This is the interview itself, and the honesty standard that has to hold up under it — the two things a job search actually comes down to after the application is submitted.',
};

// ---------------------------------------------------------------------------
// Phase 26 export
// ---------------------------------------------------------------------------

export const PHASE_26: Phase = {
  id: 'phase-26',
  number: 26,
  title: 'Career Mode',
  description:
    'Map a target role\'s job description to Security+ concepts, run a gap analysis against your own mastery data, rehearse interview and troubleshooting questions, and recommend portfolio projects — while never fabricating professional experience.',
  examDomain: 'Career',
  scene: 'career-mode',
  lessons: [LESSON_26_L1, LESSON_26_L2],
  labs: [LAB_26_0, LAB_26_1],
};
