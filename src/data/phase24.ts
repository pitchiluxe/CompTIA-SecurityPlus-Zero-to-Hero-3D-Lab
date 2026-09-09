import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 24 — Security+ Exam Preparation
// Aligned with CompTIA Security+ SY0-701
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Reading a Question Like the Exam Wants You To ----------

const LESSON_24_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p24-l1-s0',
    title: 'Concept — The Exam Format, and Why It Changes Strategy',
    body:
      'SY0-701 is up to 90 questions in 90 minutes, scored on a 100-900 scale with a passing score of 750. That budget — roughly one minute per question — sounds tight until you notice most questions are recall or single-concept application, answerable in fifteen seconds by someone who knows the material; the budget exists for the handful of longer scenario questions and performance-based questions (PBQs), not to be spent evenly across every question. Spending three minutes deliberating over question four leaves you rushing question eighty-seven, and a rushed guess on a question you actually knew is a worse outcome than a calm guess on one you never would have gotten anyway.',
  },
  {
    id: 'p24-l1-s1',
    title: 'Concept — Recall Questions vs. Scenario Questions',
    body:
      'A recall question asks you to identify a definition or fact directly ("Which protocol operates on port 22?"). A scenario question embeds the same underlying concept inside a short narrative and asks you to apply it ("A server exposes a service on port 22 that a vulnerability scan flags as using outdated key exchange algorithms — what should the administrator do first?"). The exam leans heavily toward scenario questions because CompTIA is explicitly testing application, not memorisation — every quiz question in this platform tagged type scenario is deliberately built in that same shape, so recognising the pattern here is recognising it on exam day too.',
  },
  {
    id: 'p24-l1-s2',
    title: 'Concept — Distractor Elimination as a Primary Strategy',
    body:
      'Most four-option questions contain at least one option that is obviously wrong to anyone who has studied even briefly, one option that sounds plausible but addresses the wrong problem, and one option that is the "feels right but is disproportionate" trap. Eliminating the obviously-wrong option first costs nothing and immediately improves guessing odds from 25% to 33%; eliminating the disproportionate-sounding option (usually the most drastic-sounding action, like "wipe the server" or "disable the account entirely") often gets you to 50-50 or better, because the exam consistently tests whether you can find the option that is scoped correctly to the actual problem, not merely a valid security action in the abstract.',
  },
  {
    id: 'p24-l1-s3',
    title: 'Concept — The "Exam Clue" — What Single Detail Decides the Answer',
    body:
      'Well-written scenario questions contain one detail that is doing all the work — a timestamp, a specific log entry, a word like "immediately" or "eventually," a mention of what a control did or did not do. Learning to spot that detail is a specific, trainable skill distinct from knowing the underlying concept: two learners who both understand containment can disagree on an answer if only one of them notices that the scenario says a host was rebooted, not isolated. Every scenario question in this platform\'s quiz bank that carries an examClue field names that exact detail explicitly, specifically so this skill can be practised deliberately rather than picked up by accident.',
  },
  {
    id: 'p24-l1-s4',
    title: 'Concept — Performance-Based Questions (PBQs)',
    body:
      'PBQs ask you to perform a task rather than select an answer — commonly ordering steps correctly (a process, an incident-response sequence, a configuration sequence) or matching items to categories. They take longer than multiple-choice questions and are usually front-loaded early in the exam, which is deliberate on CompTIA\'s part: a PBQ you skip and never return to costs more than one you attempt and get partially right, since most PBQs award partial credit for partially correct sequences rather than requiring a perfect answer to score anything at all.',
  },
  {
    id: 'p24-l1-s5',
    title: 'Concept — Always Answer, Never Leave a Blank',
    body:
      'There is no penalty for a wrong answer on this exam — an unanswered question and an incorrectly answered question score identically (zero), so a blank is strictly worse than a guess in every single case. Flag genuinely uncertain questions for review if the exam interface allows it, answer your best guess immediately so you never risk running out of time with it blank, and move on — reviewing flagged questions at the end, with the pressure of the earlier easier questions already behind you, is when a guess most often turns into a considered answer.',
  },
  {
    id: 'p24-l1-s6',
    title: 'Review — What Must Stick',
    body:
      'Roughly one minute per question on average, but budget unevenly — recall questions are fast, scenarios and PBQs are not. Distractor elimination (obviously wrong, then disproportionate) reliably improves odds even under uncertainty. The exam clue is one specific detail carrying the whole scenario question — find it deliberately, don\'t rely on general familiarity with the topic. PBQs often award partial credit — attempt every one rather than skipping. Never leave a question blank; a guess and a blank differ, a wrong answer and a blank do not.',
  },
];

const LESSON_24_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p24-q0',
    type: 'mcq',
    stem: 'Why should exam time not be spent evenly across all 90 questions?',
    options: [
      'Most questions are quick recall or single-concept application, while a smaller number of scenario and performance-based questions genuinely need more time — spending evenly on all of them rushes the ones that actually need the budget',
      'Every question on the exam takes exactly the same amount of time to answer correctly',
      'Time management has no effect on exam outcomes',
      'The exam has no overall time limit at all',
    ],
    answer: 0,
    explanation:
      'The one-minute-per-question average is a budget across the whole exam, not a per-question allowance — most questions are answerable far faster, freeing time for the scenario and PBQ items that genuinely need it.',
    domain: 'General Security Concepts',
    conceptId: 'exam-time-budget',
  },
  {
    id: 'p24-q1',
    type: 'mcq',
    stem: 'What distinguishes a scenario question from a recall question on this exam?',
    options: [
      'A scenario question embeds a concept inside a short narrative and asks the learner to apply it, rather than asking for a definition or fact directly',
      'Scenario questions never have a single correct answer',
      'Recall questions are always harder than scenario questions',
      'There is no meaningful difference between the two question types',
    ],
    answer: 0,
    explanation:
      'Scenario questions test application of a concept within a situation; recall questions test whether the definition or fact is known directly — the exam leans toward the former because CompTIA is testing applied judgement, not memorisation.',
    domain: 'General Security Concepts',
    conceptId: 'scenario-questions',
  },
  {
    id: 'p24-q2',
    type: 'mcq',
    stem: 'What is the "disproportionate-sounding" distractor pattern that distractor elimination should watch for?',
    options: [
      'An option that is a valid security action in the abstract but is scoped far more drastically than the specific situation actually calls for',
      'An option that is always grammatically incorrect',
      'An option that repeats the question stem word for word',
      'An option that mentions a specific CVE number',
    ],
    answer: 0,
    explanation:
      'The exam consistently tests whether a learner can find the option correctly scoped to the actual problem, not merely any technically valid security action — drastic-sounding options ("wipe the server," "disable the account") are frequently this exact trap.',
    domain: 'General Security Concepts',
    conceptId: 'distractor-elimination',
  },
  {
    id: 'p24-q3',
    type: 'mcq',
    stem: 'What is an "exam clue" in a scenario question?',
    options: [
      'The one specific detail in the scenario — a timestamp, a word like "immediately," what a control did or did not do — that decides which answer is correct',
      'A hint printed directly above the question by the exam software',
      'The domain tag assigned to the question',
      'The total number of options offered for that question',
    ],
    answer: 0,
    explanation:
      'Well-written scenario questions hinge on one specific, often easy-to-miss detail — learning to spot it deliberately is a distinct, trainable skill from knowing the underlying concept.',
    domain: 'General Security Concepts',
    conceptId: 'exam-clue',
  },
  {
    id: 'p24-q4',
    type: 'mcq',
    stem: 'Why are PBQs typically worth attempting fully rather than skipping, even under time pressure?',
    options: [
      'Most PBQs award partial credit for a partially correct sequence or set of matches, rather than requiring a perfect answer to score anything',
      'PBQs are always worth zero points regardless of the answer given',
      'Skipping a PBQ has no effect on the final scaled score',
      'PBQs can only be attempted once per exam session and are never reviewable',
    ],
    answer: 0,
    explanation:
      'Because PBQs generally award partial credit, an attempted-but-imperfect answer typically scores more than a skipped one — the incentive strongly favours attempting every PBQ.',
    domain: 'General Security Concepts',
    conceptId: 'pbq-strategy',
  },
  {
    id: 'p24-q5',
    type: 'mcq',
    stem: 'Why is leaving a question blank always the worst option on this exam?',
    options: [
      'There is no penalty for a wrong answer, so a blank and an incorrect answer both score zero, while a guess has some chance of scoring points',
      'Leaving a question blank costs additional points beyond a wrong answer',
      'Blank questions are automatically marked correct at the end of the exam',
      'The exam does not allow submission if any question is left blank',
    ],
    answer: 0,
    explanation:
      'A blank answer and a wrong answer score identically (zero) on an exam with no guessing penalty, so a best-effort guess is never worse than leaving a question unanswered.',
    domain: 'General Security Concepts',
    conceptId: 'guessing-strategy',
  },
  {
    id: 'p24-q6',
    type: 'scenario',
    stem: 'A learner spends four minutes deliberating over a single early scenario question, wants to be completely certain before moving on, and ends up rushing the final ten questions of the exam as a result. What time-management principle did this violate?',
    options: [
      'The overall time budget should be spent unevenly, saving deliberation time for genuinely difficult scenario/PBQ items rather than any one early question, since rushing later questions risks losing points on material that was actually known',
      'This is the correct and recommended approach to every exam question',
      'Every question should always receive exactly the same amount of time regardless of difficulty',
      'Deliberation time has no bearing on overall exam performance'
    ],
    answer: 0,
    explanation:
      'Over-investing time in one question at the expense of the ones that follow is a common and avoidable failure mode — flagging genuine uncertainty for later review, rather than resolving it immediately, protects the rest of the exam.',
    domain: 'General Security Concepts',
    conceptId: 'exam-time-budget',
  },
  {
    id: 'p24-q7',
    type: 'scenario',
    stem: 'A question describes a workstation being isolated and its memory captured before any other action is taken. Later in the same scenario, the correct answer hinges specifically on the fact that isolation happened before, not after, memory capture. What exam-taking skill does correctly answering this depend on?',
    options: [
      'Spotting the exam clue — the specific detail (the order of isolate-then-capture) that the correct answer actually depends on, rather than answering from general familiarity with containment alone',
      'Guessing based on which option is longest',
      'Selecting the first option listed, since exam answers are usually the first option',
      'Ignoring the scenario narrative entirely and focusing only on the answer options'
    ],
    answer: 0,
    explanation:
      'General familiarity with a topic is not enough when the correct answer depends on one specific detail in the scenario — deliberately identifying that detail is exactly the exam-clue skill this lesson names.',
    domain: 'General Security Concepts',
    conceptId: 'exam-clue',
  },
  {
    id: 'p24-q8',
    type: 'scenario',
    stem: 'Faced with a four-option question, a learner immediately recognises one option as factually impossible and a second as describing a real security action that is far more drastic than the situation warrants. Eliminating both, they are left choosing between the remaining two. What has this process achieved?',
    options: [
      'Distractor elimination has improved the odds of a correct guess from 25% to 50% even without being fully certain of the right answer',
      'This process guarantees the correct answer with total certainty',
      'This process has no effect on the odds of answering correctly',
      'This process is only useful for performance-based questions, never multiple-choice ones'
    ],
    answer: 0,
    explanation:
      'Eliminating an impossible option and a disproportionate one narrows a four-option question to a 50-50 guess at worst — a meaningful, reliable improvement even without full certainty.',
    domain: 'General Security Concepts',
    conceptId: 'distractor-elimination',
  },
  {
    id: 'p24-q-pbq',
    type: 'pbq',
    stem: 'Order the recommended time-management steps for the Security+ exam.',
    options: [
      'Skim every question to identify quick wins',
      'Answer the straightforward questions first',
      'Mark difficult or long questions for review',
      'Return to marked questions and finalize answers',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'A quick pass gathers easy points, returning to hard questions uses remaining time on the items most likely to improve your score.',
    domain: 'General Security Concepts',
    conceptId: 'exam-time-budget',
  },
];

// ---------- Lesson 2: Building a Study Plan From Your Own Data ----------

const LESSON_24_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p24-l2-s0',
    title: 'Concept — Domain Weighting Changes What "Weak" Should Worry You Most',
    body:
      'The five SY0-701 domains are not weighted equally: Security Operations is 28% of the exam, Threats/Vulnerabilities/Mitigations is 22%, Security Architecture is 18%, Security Program Management and Oversight is 20%, and General Security Concepts is 12%. A learner at 60% in Security Operations and 90% in General Security Concepts should study Security Operations first not only because it is weaker, but because it is worth more than double the exam weight of the domain they are already strong in — a study plan built purely on "which domain has the lowest score" without factoring in weight can waste time polishing an already-strong, low-weight domain while a weak, high-weight domain stays weak.',
  },
  {
    id: 'p24-l2-s1',
    title: 'Concept — Weak-Area Review and Spaced Repetition Together',
    body:
      'This platform\'s mastery ladder (0-6) and weak-area flag exist specifically to make "what should I study next" an answerable, data-driven question instead of a guess — a concept sitting at level 1 or 2 is flagged weak, and the spaced-repetition schedule surfaces it for review before it is forgotten entirely. A weak-area review session pulls exactly the quiz questions tied to those flagged concepts, which is a fundamentally different (and more efficient) session than retaking an entire lesson\'s quiz from scratch, because it skips the material already at a comfortable mastery level and concentrates entirely on what is actually failing.',
  },
  {
    id: 'p24-l2-s2',
    title: 'Concept — Mock Exam Cadence and What a Verdict Actually Means',
    body:
      'A mock exam under real time pressure (timed, answers withheld until the whole attempt is submitted) tests something a practice quiz cannot: performance under the exact conditions of the real thing, including time management and the fatigue of sustained decision-making. A scaled score and a "ready / approaching / not-ready" verdict are most useful when treated as one data point in a trend, not a single verdict to react to emotionally — a first mock exam scoring "approaching" with a weak domain identified is far more actionable than the number alone, because it points directly at what a weak-area review session should target next.',
  },
  {
    id: 'p24-l2-s3',
    title: 'Concept — Adaptive Review: Letting Performance Drive the Next Question',
    body:
      'An adaptive session orders questions so the learner\'s currently weakest concepts surface first, ahead of material already at a comfortable mastery level — the practical effect is that study time concentrates automatically on what is failing right now, without the learner having to manually decide which lessons to revisit. This does not replace weak-area review or domain-scoped practice; it complements them as a third lens on the same underlying mastery data, useful specifically when a learner does not yet know which domain or concept to target and wants the data to decide for them.',
  },
  {
    id: 'p24-l2-s4',
    title: 'Concept — Closing the Loop: From Wrong Answer Back to the Original Lesson',
    body:
      'A wrong answer on a quiz question is not the end of the loop — it names a specific concept, and that concept traces back to the specific lesson section (or lab) where it was originally taught. The most efficient remediation is not retaking the same quiz question repeatedly until it is memorised by rote, but returning to the original explanation, re-reading the concept in context, and then retesting — memorising one question\'s specific wording risks a false sense of mastery that collapses the moment the exam phrases the same concept differently.',
  },
  {
    id: 'p24-l2-s5',
    title: 'Example — Reading a Domain Breakdown',
    body:
      'A mock exam report shows: General Security Concepts 90% (9/10 asked), Threats/Vulnerabilities/Mitigations 65% (13/20), Security Architecture 80% (12/15), Security Operations 55% (11/20), Security Program Management and Oversight 85% (17/20). Despite Threats/Vulnerabilities/Mitigations having a lower raw score, Security Operations is the higher priority: it is both weaker (55% vs 65%) and worth more exam weight (28% vs 22%) — the weighted scaled score is dragged down more by Security Operations than by any other single domain, and that is exactly what a weak-area or domain-scoped review session should target next.',
  },
  {
    id: 'p24-l2-s6',
    title: 'Review — What Must Stick',
    body:
      'Domain weight matters as much as domain score when prioritising study — a weak, heavily weighted domain outranks a weak, lightly weighted one. Weak-area review targets exactly the concepts flagged by the mastery ladder, which is more efficient than re-running a whole lesson\'s quiz. A mock exam verdict is most useful as one data point in a trend, paired with its domain breakdown, not a single number to react to. Adaptive review lets current mastery data decide what surfaces first, complementing rather than replacing domain-scoped and weak-area review. A wrong answer traces back to a specific concept and lesson — remediate by re-reading the concept, not by memorising the question.',
  },
];

const LESSON_24_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p24-q9',
    type: 'mcq',
    stem: 'Which SY0-701 domain carries the largest single share of exam weight?',
    options: [
      'Security Operations (28%)',
      'General Security Concepts (12%)',
      'Security Architecture (18%)',
      'Security Program Management and Oversight (20%)',
    ],
    answer: 0,
    explanation:
      'Security Operations is weighted 28%, the largest of the five SY0-701 domains — a weakness there has an outsized effect on the overall scaled score compared with an equally weak but lower-weighted domain.',
    domain: 'General Security Concepts',
    conceptId: 'domain-weighting',
  },
  {
    id: 'p24-q10',
    type: 'mcq',
    stem: 'Why might a learner prioritise a domain scoring 65% over a domain scoring 55%, when deciding what to study next?',
    options: [
      'If the 65% domain carries substantially more exam weight than the 55% domain, improving it can move the overall scaled score more than improving the lower-scoring, lower-weighted domain',
      'A learner should always prioritise strictly by raw score with no regard for domain weight',
      'This can never be the correct choice under any circumstances',
      'Domain weight has no bearing on which domain most affects the overall scaled score',
    ],
    answer: 0,
    explanation:
      'Because the final scaled score is weighted by domain, a moderately weak but heavily weighted domain can matter more to the overall outcome than a weaker but lightly weighted one.',
    domain: 'General Security Concepts',
    conceptId: 'domain-weighting',
  },
  {
    id: 'p24-q11',
    type: 'mcq',
    stem: 'What is the practical advantage of a weak-area review session over retaking an entire lesson\'s quiz?',
    options: [
      'It concentrates entirely on the specific concepts already flagged as weak, skipping material already at a comfortable mastery level',
      'It always contains more questions than a full lesson quiz',
      'It is the only way to ever update a concept\'s mastery level',
      'It disables the spaced-repetition schedule while it runs',
    ],
    answer: 0,
    explanation:
      'A weak-area session is filtered specifically to flagged concepts, making study time proportional to what is actually failing rather than re-covering material already mastered.',
    domain: 'General Security Concepts',
    conceptId: 'weak-area-review',
  },
  {
    id: 'p24-q12',
    type: 'mcq',
    stem: 'Why should a single mock exam score be treated as one data point in a trend rather than a definitive verdict?',
    options: [
      'A single sitting reflects that day\'s question mix, time pressure, and focus — the domain breakdown and change over repeated sittings are more actionable than any one number alone',
      'Mock exam scores are randomly generated and carry no real signal',
      'A single mock exam score always exactly predicts the real exam result',
      'Domain breakdowns are never meaningful and should be ignored entirely',
    ],
    answer: 0,
    explanation:
      'One sitting is a sample, not a certainty — the trend across sittings and the specific domain breakdown point toward what to actually study next, which a single scaled number alone does not.',
    domain: 'General Security Concepts',
    conceptId: 'mock-exam-strategy',
  },
  {
    id: 'p24-q13',
    type: 'mcq',
    stem: 'What does an adaptive review session do differently from a fixed domain-scoped quiz?',
    options: [
      'It orders and selects questions based on the learner\'s current mastery data, surfacing the weakest concepts first regardless of which domain they belong to',
      'It only ever contains performance-based questions',
      'It is identical to a domain-scoped quiz in every respect',
      'It ignores the learner\'s mastery data entirely and selects questions at random',
    ],
    answer: 0,
    explanation:
      'Adaptive review is driven by current mastery levels across concepts, not a fixed domain boundary — it surfaces whatever is weakest right now, wherever it falls.',
    domain: 'General Security Concepts',
    conceptId: 'adaptive-review',
  },
  {
    id: 'p24-q14',
    type: 'mcq',
    stem: 'Why is memorising the exact wording of a missed quiz question a weaker remediation strategy than returning to the original lesson section?',
    options: [
      'Memorising one question\'s specific phrasing creates a false sense of mastery that collapses when the same underlying concept is tested with different wording, as it typically is on the real exam',
      'Returning to a lesson section is never useful once a quiz has already been taken',
      'Quiz questions and lesson content are entirely unrelated to one another',
      'Memorising exact question wording is the single most effective study technique available',
    ],
    answer: 0,
    explanation:
      'Rote memorisation of one question\'s wording does not transfer to a differently-worded question testing the same concept — re-learning the underlying concept is what actually generalises.',
    domain: 'General Security Concepts',
    conceptId: 'remediation-strategy',
  },
  {
    id: 'p24-q15',
    type: 'scenario',
    stem: 'A learner\'s mock exam domain breakdown shows Security Operations at 55% (their lowest raw score) and General Security Concepts at 70%. Given the official domain weights, which domain most affects their overall scaled score, and why?',
    options: [
      'Security Operations — it is both the weakest domain and the most heavily weighted (28% vs 12%), so improving it moves the weighted scaled score more than improving General Security Concepts would',
      'General Security Concepts — because it has a higher raw percentage it must always matter more to the final score',
      'Both domains affect the scaled score identically regardless of their weights',
      'Neither domain has any effect on the final scaled score',
    ],
    answer: 0,
    explanation:
      'Security Operations combines the lowest score with the highest domain weight (28%) among the two — that combination is exactly what drags a weighted scaled score down the most.',
    domain: 'General Security Concepts',
    conceptId: 'domain-weighting',
  },
  {
    id: 'p24-q16',
    type: 'scenario',
    stem: 'After a mock exam, a learner notices three concepts flagged weak all trace back to lessons from three different phases (IAM, incident response, and packet analysis). What is the most efficient next study session, given this information?',
    options: [
      'A weak-area review session built specifically from those three flagged concepts, rather than retaking three entire lessons\' worth of quizzes',
      'Retaking all three lessons\' full quizzes from the very beginning, including material already at high mastery',
      'Ignoring the flagged concepts since they come from different phases and cannot be studied together',
      'Waiting until every concept across every phase is flagged before reviewing anything'
    ],
    answer: 0,
    explanation:
      'A weak-area session pulls exactly the flagged concepts regardless of which phase or lesson they originated from — this is precisely the scenario it is designed for, avoiding wasted time on already-mastered material within those same lessons.',
    domain: 'General Security Concepts',
    conceptId: 'weak-area-review',
  },
  {
    id: 'p24-q17',
    type: 'scenario',
    stem: 'A learner takes the same practice quiz three times in a row, memorises which option letter is correct for each question, and scores 100% on the third attempt. What does this result actually demonstrate, and what is the risk?',
    options: [
      'It demonstrates memorisation of that specific question set, not necessarily mastery of the underlying concept — the risk is a false sense of readiness that fails when the real exam phrases the same concept differently',
      'It conclusively proves full mastery of every underlying concept tested',
      'It guarantees an identical high score on the real certification exam',
      'There is no meaningful difference between memorising answers and understanding concepts'
    ],
    answer: 0,
    explanation:
      'A rising score from repeated attempts at the identical question set reflects memorisation of that set, which does not reliably transfer to differently-worded questions on the real exam testing the same concept.',
    domain: 'General Security Concepts',
    conceptId: 'remediation-strategy',
  },
  {
    id: 'p24-q18',
    type: 'scenario',
    stem: 'A learner has not yet reviewed their progress dashboard and is unsure which domain or concept to study next. Which platform feature is specifically designed to answer that question using their own performance data, without requiring them to manually pick a domain first?',
    options: [
      'An adaptive review session, which orders questions by current mastery level across all concepts regardless of domain',
      'A fixed single-domain quiz for whichever domain happens to be listed first',
      'Retaking the very first lesson\'s quiz from Phase 0',
      'There is no feature that can answer this question using performance data'
    ],
    answer: 0,
    explanation:
      'Adaptive review is built exactly for this situation — it uses current mastery data to decide what to surface first, rather than requiring the learner to already know which domain or concept needs attention.',
    domain: 'General Security Concepts',
    conceptId: 'adaptive-review',
  },
];

// ---------- Lab 1: Build a Domain-Weighted Study Plan ----------

const LAB_24_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the official exam blueprint and its domain weights.',
    command: 'show exam blueprint',
    expected: 'Five domains with their official percentage weights, summing to 100%.',
  },
  {
    id: 's1',
    instruction: 'Review how a weighted scaled score is calculated from a domain breakdown.',
    command: 'show scoring formula',
    expected: 'An explanation of how per-domain accuracy is combined with domain weight into a single scaled score.',
  },
  {
    id: 's2',
    instruction: 'Review the recommended exam time budget before taking a domain quiz.',
    command: 'explain time budget',
    expected: 'A breakdown of why time should be spent unevenly, protecting time for scenario and PBQ items.',
  },
  {
    id: 's3',
    instruction: 'Review the distractor-elimination technique before your first domain quiz attempt.',
    command: 'explain distractor elimination',
    expected: 'The two-step elimination pattern (obviously wrong, then disproportionate) and its effect on guessing odds.',
  },
];

const LAB_24_0: Lab = {
  id: 'p24-lab-0',
  phaseId: 'phase-24',
  title: 'Build a Domain-Weighted Study Plan',
  objective:
    'Review the official exam blueprint, scoring formula, and time-management/distractor-elimination strategies, then take a domain-scoped practice quiz for your currently weakest, most heavily weighted domain.',
  securityConcepts: [
    'SY0-701 domain weighting',
    'Weighted scaled scoring',
    'Exam time budgeting',
    'Distractor elimination',
  ],
  environment: 'Deterministic exam-preparation simulator — prepared reference material only; no real exam session is created or submitted',
  topology: 'Not applicable — this lab is a study-planning and practice-quiz exercise',
  prerequisites: ['Complete at least 5 prior phases so mastery and domain data exist to act on'],
  steps: LAB_24_0_STEPS,
  expectedResults: [
    'Learner can state all five domain weights from memory',
    'Learner can explain why domain weight and domain score both matter to prioritisation',
    'Learner completes one domain-scoped practice quiz in the Exam Preparation view',
  ],
  verification: [
    'Learner can identify their own weakest, most heavily weighted domain from their progress data',
    'Learner can explain the two-step distractor-elimination pattern',
    'Learner can explain why the recommended time budget is uneven, not per-question equal',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure which domain to prioritise → compare domain score against domain weight together, not either alone — the Exam Preparation view surfaces both.',
    'No mastery data yet → complete a few lesson quizzes first so weak/strong concepts exist to act on.',
  ],
  challenge:
    'Write a two-sentence study-priority statement: which domain you are targeting first, and why it outranks your other weak domain given both its score and its official weight.',
  evidence: [
    {
      id: 'ev0',
      label: 'Domain quiz transcript',
      type: 'log',
      placeholder: 'Paste your domain-scoped practice quiz results and per-question rationale',
    },
    {
      id: 'ev1',
      label: 'Study-priority statement',
      type: 'report',
      placeholder: 'Weakest, most heavily weighted domain and the reasoning behind targeting it first',
    },
  ],
  securityLesson:
    'A study plan built purely on lowest raw score can waste effort polishing an already-strong, lightly weighted domain while a weak, heavily weighted one stays weak — the same weighting logic behind the exam\'s own scaled score should drive what a learner studies next.',
};

// ---------- Lab 2: Run a Weak-Area Review and a Full Mock Exam ----------

const LAB_24_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review how weak-area review sessions are built from flagged mastery data.',
    command: 'explain weak area review',
    expected: 'An explanation of how weak/due concepts are turned into a targeted question pool.',
  },
  {
    id: 's1',
    instruction: 'Review how an adaptive session orders questions by current mastery tier.',
    command: 'explain adaptive session',
    expected: 'An explanation of tiered, mastery-driven question ordering.',
  },
  {
    id: 's2',
    instruction: 'Review the mock-exam checklist before starting a timed attempt.',
    command: 'show mock exam checklist',
    expected: 'A pre-exam checklist covering time budgeting, PBQ attempts, and never leaving a blank.',
  },
];

const LAB_24_1: Lab = {
  id: 'p24-lab-1',
  phaseId: 'phase-24',
  title: 'Run a Weak-Area Review and a Full Mock Exam',
  objective:
    'Run a weak-area review session targeting your currently flagged concepts, then complete a full timed mock exam and interpret its scaled score, domain breakdown, and readiness verdict.',
  securityConcepts: [
    'Weak-area review',
    'Adaptive review ordering',
    'Timed mock exam conditions',
    'Readiness verdict interpretation',
  ],
  environment: 'Deterministic exam-preparation simulator — prepared reference material only; no real exam session is created or submitted',
  topology: 'Not applicable — this lab is a study-planning and practice-quiz exercise',
  prerequisites: ['Complete Phase 24 Lab 0 (Build a Domain-Weighted Study Plan)'],
  steps: LAB_24_1_STEPS,
  expectedResults: [
    'Learner completes a weak-area review session covering every currently flagged concept',
    'Learner completes a full timed mock exam without leaving any question blank',
    'Learner can correctly interpret their scaled score, domain breakdown, and readiness verdict',
  ],
  verification: [
    'Learner can explain the difference between a weak-area session and an adaptive session',
    'Learner can state their own mock exam scaled score and verdict',
    'Learner can name the single domain their next study session should target, based on the breakdown',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'No weak concepts flagged yet → weak-area review has nothing to pull from until at least one quiz question has been answered incorrectly somewhere in the platform.',
    'Ran out of time mid-exam → this is expected the first time; treat it as data, not failure, and revisit the time-budgeting lesson before the next attempt.',
  ],
  challenge:
    'Write the closing paragraph of your own study plan: your mock exam verdict, the one domain you are prioritising next, and the specific review mode (domain quiz, weak-area review, or adaptive session) you will use to target it.',
  evidence: [
    {
      id: 'ev0',
      label: 'Weak-area review and mock exam transcript',
      type: 'log',
      placeholder: 'Paste your weak-area review results and full mock exam report',
    },
    {
      id: 'ev1',
      label: 'Study plan closing statement',
      type: 'report',
      placeholder: 'Verdict, priority domain, and chosen next review mode',
    },
  ],
  securityLesson:
    'A mock exam score is most useful paired with its domain breakdown, not read alone — the breakdown is what turns "not ready yet" into an actual next action, the same way this platform\'s own labs always pair a finding with a recommended remediation rather than stopping at the finding.',
};

// ---------- Lessons ----------

const LESSON_24_L1: Lesson = {
  id: 'p24-lesson-0',
  phaseId: 'phase-24',
  title: 'Reading a Question Like the Exam Wants You To',
  objectives: [
    'Explain the SY0-701 exam format and why time should be budgeted unevenly',
    'Distinguish recall questions from scenario questions',
    'Apply distractor elimination to improve guessing odds under uncertainty',
    'Identify the "exam clue" — the specific detail a scenario question depends on',
    'Explain why PBQs should always be attempted and blanks always avoided',
  ],
  sections: LESSON_24_L1_SECTIONS,
  quiz: LESSON_24_L1_QUIZ,
  concepts: [
    'exam-time-budget',
    'scenario-questions',
    'distractor-elimination',
    'exam-clue',
    'pbq-strategy',
    'guessing-strategy',
  ],
  homework:
    'Take five questions you got wrong recently and, for each, write the exam clue in the stem that pointed at the right answer. Missing the clue is a different problem from missing the concept.',
  careerConnection:
    'Certification is the gate, not the job — but the habits this lesson teaches (finding the one decisive detail, eliminating disproportionate options) are the same habits a SOC analyst uses reading a real alert under time pressure.',
};

const LESSON_24_L2: Lesson = {
  id: 'p24-lesson-1',
  phaseId: 'phase-24',
  title: 'Building a Study Plan From Your Own Data',
  objectives: [
    'Prioritise study using both domain score and official domain weight',
    'Explain how weak-area review differs from retaking a full lesson quiz',
    'Interpret a mock exam scaled score, domain breakdown, and readiness verdict',
    'Explain how an adaptive review session selects its questions',
    'Explain why remediation should return to the original lesson, not the exact quiz wording',
  ],
  sections: LESSON_24_L2_SECTIONS,
  quiz: LESSON_24_L2_QUIZ,
  concepts: [
    'domain-weighting',
    'weak-area-review',
    'mock-exam-strategy',
    'adaptive-review',
    'remediation-strategy',
  ],
  homework:
    'Build a two-week study plan from your own weak-area list, allocating time in proportion to domain weight rather than to how interesting each topic is.',
  careerConnection:
    'This is also how a working analyst keeps skills current after certification — a data-driven "what am I weakest at, and does it matter" loop replaces "what do I feel like reviewing today."',
};

// ---------------------------------------------------------------------------
// Phase 24 export
// ---------------------------------------------------------------------------

export const PHASE_24: Phase = {
  id: 'phase-24',
  number: 24,
  title: 'Security+ Exam Preparation',
  description:
    'Build and use an exam-preparation toolkit: domain-scoped quizzes, weak-area review, adaptive sessions, and full timed mock exams with a weighted scaled score and readiness verdict.',
  examDomain: 'All domains',
  scene: 'exam-prep',
  lessons: [LESSON_24_L1, LESSON_24_L2],
  labs: [LAB_24_0, LAB_24_1],
};
