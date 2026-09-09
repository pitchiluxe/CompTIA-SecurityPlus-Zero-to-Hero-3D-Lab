import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 25 — GitHub Cybersecurity Portfolio
// Aligned with CompTIA Security+ SY0-701
// ---------------------------------------------------------------------------

// ---------- Lesson 1: What Makes a Security Portfolio Repo Credible ----------

const LESSON_25_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p25-l1-s0',
    title: 'Concept — Why a Repo Beats a Certificate Alone',
    body:
      'A certification proves you passed an exam under timed conditions; a well-documented repository proves you can perform, investigate, and explain the work itself — two different claims, and hiring managers weigh the second one more heavily precisely because it is harder to fake convincingly. This platform generates a structured repository for every completed lab specifically so certification study produces a second, independent artifact along the way, rather than leaving all the evidence of the work trapped inside a quiz score.',
  },
  {
    id: 'p25-l1-s1',
    title: 'Concept — The Folder Structure and What Each Piece Is For',
    body:
      'A credible security lab repo follows a consistent skeleton: README.md (the front door), architecture/ (topology and environment), configs/ (sanitised configuration artifacts), screenshots/ (visual evidence), logs/ (raw or prepared log excerpts), evidence/ (everything captured during the lab, labelled by type), reports/ (findings, remediation, validation), troubleshooting/ (issues hit and how they were resolved), and lessons-learned/ (what would change next time). A reviewer who has seen this skeleton once recognises it instantly in every other repo that uses it — consistency itself is a signal of professionalism, separate from the content inside any one folder.',
  },
  {
    id: 'p25-l1-s2',
    title: 'Concept — README Anatomy for a Security Project',
    body:
      'A strong security README answers, in order: what is this (project summary), what was I trying to prove (objectives), what did the environment look like (architecture), what tools and concepts were involved (technologies), what did I actually do (implementation/steps), what did I find (findings), what would I recommend (remediation), how did I confirm the fix worked (validation), and what would I do differently (lessons learned). Missing any one of these sections is what makes a repo read like an unfinished school assignment rather than a professional artifact — the order matters too, since a reviewer skims top to bottom and rarely searches for a missing section further down.',
  },
  {
    id: 'p25-l1-s3',
    title: 'Concept — Redaction Discipline, Every Single Time',
    body:
      'Every artifact — a config file, a screenshot, a log excerpt, a report — must be checked for real hostnames, internal IP ranges, credentials, tokens, API keys, and personally identifiable information before it is committed, with no exceptions for "it is just a lab." The habit of checking every time, even when the content is simulated and therefore low-risk, is what prevents the one real mistake: pasting an actual production credential into a public repository because the redaction check was skipped "just this once." A checklist applied inconsistently is not a control.',
  },
  {
    id: 'p25-l1-s4',
    title: 'Concept — Findings, Remediation, and Validation Like a Real Report',
    body:
      'A professional finding is not a bare sentence — it pairs a specific observation with its severity, the evidence that supports it, a recommended fix scoped to that specific finding, and a validation step confirming the fix actually worked, exactly the finding-severity-evidence-remediation-validation structure taught since Phase 10\'s vulnerability reports and reused in every incident report since. A findings list without a remediation column reads as an unfinished audit; a remediation list without a validation step reads as an unverified claim — both gaps are exactly what a hiring manager\'s eye catches first, because both gaps exist constantly in real, rushed work.',
  },
  {
    id: 'p25-l1-s5',
    title: 'Concept — How a Reviewer Actually Reads a Repo',
    body:
      'In practice, a hiring manager or technical interviewer opens a repository, reads the README top to bottom in under a minute, glances at the folder structure to confirm it matches what the README claims, and opens exactly one or two files that catch their interest — they very rarely read every file in every folder. This means the README\'s summary and findings sections carry disproportionate weight, and a repo with a weak README but excellent supporting detail buried three folders deep will still be judged by the README alone.',
  },
  {
    id: 'p25-l1-s6',
    title: 'Review — What Must Stick',
    body:
      'A repo and a certificate prove different things; both matter, but a repo is harder to fake. The nine-folder skeleton (README, architecture, configs, screenshots, logs, evidence, reports, troubleshooting, lessons-learned) is a recognisable, repeatable structure, not a suggestion. A README answers summary, objectives, architecture, technologies, implementation, findings, remediation, validation, and lessons learned, in that order. Redaction is a checklist applied every single time, not a judgement call made under time pressure. Findings need severity, evidence, remediation, and validation together — any one missing weakens the whole report. A reviewer reads the README first and most; it deserves the most editing effort.',
  },
];

const LESSON_25_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p25-q0',
    type: 'mcq',
    stem: 'Why do hiring managers often weigh a documented project repository more heavily than a certification alone?',
    options: [
      'A repository demonstrates the ability to perform, investigate, and explain actual work, which is harder to fake convincingly than passing a timed exam',
      'Certifications provide no useful signal to employers whatsoever',
      'Repositories are always more difficult to create than passing a certification exam',
      'There is no meaningful difference between a certificate and a documented repository',
    ],
    answer: 0,
    explanation:
      'A certificate proves exam performance; a repository proves the underlying work was actually done and can be explained — a distinct and generally harder-to-fake claim.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-value',
  },
  {
    id: 'p25-q1',
    type: 'mcq',
    stem: 'What is the primary benefit of using the same folder structure across every project repository in a portfolio?',
    options: [
      'A reviewer who recognises the structure in one repo can navigate every other repo just as quickly, making consistency itself a signal of professionalism',
      'It is required by GitHub\'s terms of service',
      'It automatically improves the technical quality of the underlying work',
      'It has no practical benefit and is purely cosmetic',
    ],
    answer: 0,
    explanation:
      'A consistent, recognisable skeleton lets a reviewer navigate quickly and signals professionalism independent of any one repo\'s specific content.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-structure',
  },
  {
    id: 'p25-q2',
    type: 'mcq',
    stem: 'In what order should a strong security project README present its sections?',
    options: [
      'Summary, objectives, architecture, technologies, implementation, findings, remediation, validation, lessons learned',
      'Lessons learned first, followed by everything else in any order',
      'Only findings and remediation are necessary; every other section can be omitted',
      'Order does not matter as long as all sections eventually appear somewhere in the repository',
    ],
    answer: 0,
    explanation:
      'This order mirrors how a reviewer actually reads top to bottom — establishing context before findings, and findings before what to do about them.',
    domain: 'General Security Concepts',
    conceptId: 'readme-anatomy',
  },
  {
    id: 'p25-q3',
    type: 'mcq',
    stem: 'Why must redaction be applied consistently to every artifact, even ones from a clearly simulated lab?',
    options: [
      'A checklist applied inconsistently is not a real control — the one time it is skipped "because it is just a lab" is the one time a real credential could slip through',
      'Redaction is only necessary for artifacts from real, non-simulated systems',
      'Redaction slows down publishing and provides no meaningful security benefit',
      'Simulated lab content can never contain anything sensitive under any circumstances',
    ],
    answer: 0,
    explanation:
      'Consistency is what makes a check a control — an inconsistently applied habit fails exactly when it matters most, on the one occasion it is skipped.',
    domain: 'General Security Concepts',
    conceptId: 'redaction-discipline',
  },
  {
    id: 'p25-q4',
    type: 'mcq',
    stem: 'What four elements does a professional finding pair together, according to this lesson?',
    options: [
      'A specific observation, its severity, the supporting evidence, a scoped recommended fix, and a validation step confirming the fix worked',
      'Only a severity rating and nothing else',
      'A screenshot and a timestamp, with no further explanation required',
      'The name of the person who discovered the issue',
    ],
    answer: 0,
    explanation:
      'Observation, severity, evidence, remediation, and validation together form a complete, professional finding — any one missing weakens the whole report.',
    domain: 'General Security Concepts',
    conceptId: 'findings-remediation-validation',
  },
  {
    id: 'p25-q5',
    type: 'mcq',
    stem: 'Given how a reviewer typically reads a repository, which section deserves disproportionate editing effort?',
    options: [
      'The README, since most reviewers read it in full but open only one or two other files',
      'A file buried three folders deep, since reviewers always read every file in every folder',
      'The commit history, since reviewers never read the README at all',
      'No single section deserves more effort than any other'
    ],
    answer: 0,
    explanation:
      'Because a reviewer reads the README closely but samples only a couple of other files, the README carries disproportionate weight in how the whole repo is judged.',
    domain: 'General Security Concepts',
    conceptId: 'reviewer-behavior',
  },
  {
    id: 'p25-q6',
    type: 'scenario',
    stem: 'A learner publishes a lab repository with an excellent, detailed reports/ folder but a two-sentence README that only says "this is a lab I did." A reviewer opens the repo, reads the README, and moves on without exploring further. What does this scenario illustrate?',
    options: [
      'A reviewer\'s judgement is disproportionately shaped by the README, so even excellent supporting detail elsewhere may go unseen if the README does not represent it',
      'The reports/ folder content was clearly not worth including in the first place',
      'This outcome is unrelated to how repositories are typically reviewed',
      'A short README always indicates the underlying work was of low quality',
    ],
    answer: 0,
    explanation:
      'Because reviewers weigh the README heavily and sample only a file or two beyond it, a weak README can hide genuinely strong work located elsewhere in the repo.',
    domain: 'General Security Concepts',
    conceptId: 'reviewer-behavior',
  },
  {
    id: 'p25-q7',
    type: 'scenario',
    stem: 'A learner\'s findings section lists "SSH allows password authentication" with no severity, no evidence, and no recommended fix. How should this be evaluated against professional reporting standards?',
    options: [
      'Incomplete — a professional finding needs severity, supporting evidence, a scoped remediation, and a validation step, none of which are present here',
      'This is a complete, professional-quality finding exactly as written',
      'Findings never need a recommended fix, only an observation',
      'Severity information is optional and rarely included in real security reports',
    ],
    answer: 0,
    explanation:
      'A bare observation without severity, evidence, remediation, and validation is exactly the incomplete pattern this lesson warns against.',
    domain: 'General Security Concepts',
    conceptId: 'findings-remediation-validation',
  },
  {
    id: 'p25-q8',
    type: 'scenario',
    stem: 'While preparing a screenshot for a lab repository, a learner notices their terminal prompt shows their real personal username and a real home-network IP address in the background of the capture. What should happen before this screenshot is committed?',
    options: [
      'The screenshot should be cropped or redacted to remove the real username and IP address, following the same redaction checklist applied to every other artifact type',
      'It can be committed as-is since the lab itself was simulated',
      'Only credentials need to be redacted from screenshots; usernames and IP addresses are never sensitive',
      'Screenshots are exempt from the redaction checklist that applies to logs and configs',
    ],
    answer: 0,
    explanation:
      'Redaction applies to every artifact type equally — a real username or IP address visible in a screenshot is exactly the kind of leak the checklist exists to catch.',
    domain: 'General Security Concepts',
    conceptId: 'redaction-discipline',
  },
  {
    id: 'p25-q-pbq',
    type: 'pbq',
    stem: 'Order the steps to turn a completed lab into a portfolio repo entry.',
    options: [
      'Capture commands, output, and screenshots as evidence',
      'Redact any real usernames, IPs, or credentials',
      'Write the finding with severity, evidence, and remediation',
      'Add a README and push the project to a public repo',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Evidence comes first, then redaction protects privacy, then the write-up explains the work, and finally the repo makes it portable and verifiable.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-structure',
  },
];

// ---------- Lesson 2: Building the Portfolio, Lab by Lab ----------

const LESSON_25_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p25-l2-s0',
    title: 'Concept — Curating a Portfolio Is Not Publishing Every Lab',
    body:
      'This platform can generate a repository for every completed lab across every phase, but a strong portfolio features five to eight of the strongest, most relevant write-ups rather than all of them — a reviewer given twenty-five repositories opens none of them thoroughly, while a reviewer given five is far more likely to actually read two or three closely. Curation is itself a skill being demonstrated: choosing which work best represents the target role signals judgement, not just activity.',
  },
  {
    id: 'p25-l2-s1',
    title: 'Concept — Tailoring Selection to a Target Role',
    body:
      'A portfolio aimed at a SOC Analyst I role should foreground the SOC console, incident response, and troubleshooting-center labs; a portfolio aimed at an IAM-track role should foreground the identity lifecycle, IAM troubleshooting, and access-review labs instead — the same underlying body of completed work supports different curated selections depending on the job description being targeted. This selection process is exactly what Career Mode (a later capability) formalises by mapping a specific job description to the concepts and labs that best demonstrate it; the underlying principle — curate toward the role, not toward everything you have done — applies even without that tooling.',
  },
  {
    id: 'p25-l2-s2',
    title: 'Concept — One Consistent Skeleton Across Every Featured Repo',
    body:
      'A reviewer comparing three of a candidate\'s repositories back to back should recognise the same skeleton in all three — README anatomy, folder structure, and findings format identical each time — because that consistency is what lets the reviewer compare the content instead of re-learning a new structure with every repo. This platform\'s generator enforces that consistency automatically; a hand-written portfolio has to enforce it manually, and the discipline required to do so by hand is itself worth practising.',
  },
  {
    id: 'p25-l2-s3',
    title: 'Concept — Turning Captured Evidence Into Portfolio Content',
    body:
      'Every lab in this platform includes an evidence step producing specific artifacts (a transcript, a report, a screenshot placeholder) — the portfolio generator pulls a lab\'s structural content (objective, steps, expected results, verification, troubleshooting) automatically, but the evidence captured while actually performing the lab is what a learner adds themselves, and it is what turns a generated skeleton into a genuine, personal artifact rather than a templated one. A repo with only the generated skeleton and no captured evidence reads as unfinished; the evidence is the proof of work, not the structure around it.',
  },
  {
    id: 'p25-l2-s4',
    title: 'Concept — The Portfolio Index: One File, Many Repos',
    body:
      'A portfolio index (a single top-level document listing every featured repository, grouped by domain, with a short description and a link) solves a discovery problem a flat list of repository names does not: it lets a reviewer see the shape of a candidate\'s coverage — how many labs per domain, which domains are strongest — in the time it takes to skim one page, before ever opening an individual repo. Grouping by exam domain rather than alphabetically or by phase number specifically highlights domain coverage, which is exactly the framing a reviewer evaluating security-role readiness cares about most.',
  },
  {
    id: 'p25-l2-s5',
    title: 'Concept — Never Fabricate; the Provenance Labels Are the Whole Point',
    body:
      'Everything in this platform is labelled real, simulated, or prepared for a specific reason that becomes most important here: a portfolio entry must never claim simulated lab work as a real-system finding or a live incident response, because that claim collapses the moment a technical interviewer asks one clarifying question. The correct, entirely legitimate framing is straightforward — "I completed a structured, simulated SOC investigation covering X, Y, and Z" is a true and still-impressive claim; "I responded to a real ransomware incident" when the work was a platform simulation is not, and the difference is exactly what an interviewer is listening for.',
  },
  {
    id: 'p25-l2-s6',
    title: 'Review — What Must Stick',
    body:
      'Curate five to eight strong repositories rather than publishing every completed lab. Tailor the selection to the target role\'s job description. Keep the same skeleton across every featured repo so a reviewer can compare content, not structure. Captured evidence, not the generated skeleton alone, is what makes a repo genuine. A portfolio index grouped by domain lets a reviewer see coverage in the time it takes to skim one page. Never claim simulated work as real — the honest framing is still a legitimate, impressive claim on its own.',
  },
];

const LESSON_25_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p25-q9',
    type: 'mcq',
    stem: 'Why does a portfolio featuring five to eight strong repositories typically outperform one featuring all twenty-five-plus completed labs?',
    options: [
      'A reviewer given a large number of repositories is unlikely to open more than a couple thoroughly, while a curated, smaller set is more likely to receive genuine attention',
      'GitHub imposes a hard limit on the number of repositories a portfolio can contain',
      'Additional completed labs always indicate lower-quality work',
      'There is no difference in reviewer behaviour between five repositories and twenty-five',
    ],
    answer: 0,
    explanation:
      'Reviewer attention is limited regardless of how much material is offered — curation increases the odds that the strongest work actually gets read closely.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-curation',
  },
  {
    id: 'p25-q10',
    type: 'mcq',
    stem: 'How should the labs featured in a portfolio change based on the target job description?',
    options: [
      'The featured selection should foreground the labs most relevant to that specific role, even though the same underlying body of completed work supports multiple different curated selections',
      'The same fixed set of labs should always be featured regardless of the target role',
      'Only labs completed in the most recent phase should ever be featured',
      'Job descriptions have no bearing on which labs should be featured'
    ],
    answer: 0,
    explanation:
      'Tailoring the selection to the role — foregrounding SOC/IR labs for a SOC role, IAM labs for an IAM role — demonstrates judgement about relevance, not just activity.',
    domain: 'General Security Concepts',
    conceptId: 'role-tailored-portfolio',
  },
  {
    id: 'p25-q11',
    type: 'mcq',
    stem: 'Why does keeping the same skeleton across every featured repository matter to a reviewer comparing several of them?',
    options: [
      'It lets the reviewer compare the actual content across repos, rather than re-learning a new structure with each one',
      'It has no effect on how a reviewer evaluates multiple repositories',
      'It is only relevant if all repositories are hosted in the same GitHub organisation',
      'It is required by GitHub\'s platform rules'
    ],
    answer: 0,
    explanation:
      'A consistent skeleton removes the overhead of re-learning structure, letting a reviewer focus entirely on comparing the substance of each repo.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-structure',
  },
  {
    id: 'p25-q12',
    type: 'mcq',
    stem: 'What turns a generated repository skeleton into a genuine, personal artifact rather than a templated one?',
    options: [
      'The evidence actually captured while performing the lab — transcripts, reports, and screenshots the learner produced themselves',
      'Adding more headings to the README without any additional content',
      'Renaming the generated folders to different names',
      'Nothing distinguishes a templated skeleton from a genuine artifact'
    ],
    answer: 0,
    explanation:
      'The generated structure provides the skeleton every lab shares; the captured evidence is what proves the specific work was actually performed.',
    domain: 'General Security Concepts',
    conceptId: 'evidence-as-proof',
  },
  {
    id: 'p25-q13',
    type: 'mcq',
    stem: 'What problem does a portfolio index grouped by exam domain solve that a flat, unsorted list of repository names does not?',
    options: [
      'It lets a reviewer see the shape and depth of domain coverage in the time it takes to skim one page, before opening any individual repository',
      'It automatically fixes any quality issues within the individual repositories',
      'It removes the need for any individual repository to have its own README',
      'It has no advantage over an alphabetically sorted list',
    ],
    answer: 0,
    explanation:
      'Domain grouping directly surfaces coverage — how many labs per domain — which is exactly the framing a reviewer evaluating role readiness cares about most.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-index',
  },
  {
    id: 'p25-q14',
    type: 'mcq',
    stem: 'Why is claiming simulated lab work as a real-system incident response a serious problem for a portfolio, beyond simply being inaccurate?',
    options: [
      'The claim collapses under one clarifying technical interview question, damaging credibility far more than an honest, still-impressive description of simulated work would have',
      'Simulated work is never impressive enough to describe honestly in a portfolio',
      'Interviewers never ask clarifying questions about portfolio claims',
      'There is no practical difference between describing work as real versus simulated'
    ],
    answer: 0,
    explanation:
      'An honest claim about structured simulated work survives scrutiny and remains genuinely impressive; a fabricated claim about real-system work does not survive the first follow-up question.',
    domain: 'General Security Concepts',
    conceptId: 'provenance-honesty',
  },
  {
    id: 'p25-q15',
    type: 'scenario',
    stem: 'A learner targeting a SOC Analyst I role is deciding which three labs to feature first in their portfolio, from a completed set spanning IAM, cryptography, SOC console triage, and incident response. Which selection best matches the target role?',
    options: [
      'SOC console triage and incident response, since they map most directly to the SOC Analyst I role\'s day-to-day responsibilities',
      'Cryptography and IAM only, regardless of the target role',
      'Whichever three labs were completed most recently, regardless of relevance',
      'All four labs equally, since role relevance should never influence curation'
    ],
    answer: 0,
    explanation:
      'Tailoring the featured selection to the target role means prioritising the labs most directly relevant to that role\'s responsibilities over an arbitrary or unrelated selection.',
    domain: 'General Security Concepts',
    conceptId: 'role-tailored-portfolio',
  },
  {
    id: 'p25-q16',
    type: 'scenario',
    stem: 'A learner writes in their portfolio README: "Investigated and contained a live ransomware attack against enterprise infrastructure," describing work that was actually a simulated platform lab. During an interview, they are asked to describe the real infrastructure and business impact involved. What is the most likely outcome, and what should the README have said instead?',
    options: [
      'The claim is likely to collapse under follow-up questioning; the README should have accurately described a structured, simulated SOC investigation and containment exercise, which remains a legitimate and relevant claim',
      'The interviewer will have no way to distinguish real from simulated work under any circumstances',
      'This phrasing is standard practice and carries no risk to the candidate\'s credibility',
      'Simulated lab work should never be mentioned in a portfolio at all, honestly or otherwise'
    ],
    answer: 0,
    explanation:
      'Fabricated claims about real-system involvement typically do not survive specific follow-up questions, while an honest description of simulated, structured work remains both accurate and genuinely relevant to the role.',
    domain: 'General Security Concepts',
    conceptId: 'provenance-honesty',
  },
  {
    id: 'p25-q17',
    type: 'scenario',
    stem: 'A learner has generated repository skeletons for all twelve labs they have completed, but has not captured any evidence artifacts (transcripts, reports, screenshots) in any of them. What is the state of this portfolio, and what is missing?',
    options: [
      'The portfolio currently consists of unfilled templates — the structural skeleton exists, but the captured evidence that proves the work was actually performed is entirely missing',
      'The portfolio is already complete and ready to publish as-is',
      'Generated skeletons alone are indistinguishable from genuine, evidence-backed repositories to a reviewer',
      'Evidence capture is an optional step that adds no value once the skeleton exists'
    ],
    answer: 0,
    explanation:
      'The skeleton alone does not demonstrate that the work was performed — the evidence captured during the lab is specifically what proves it, and its absence leaves the portfolio incomplete.',
    domain: 'General Security Concepts',
    conceptId: 'evidence-as-proof',
  },
  {
    id: 'p25-q18',
    type: 'scenario',
    stem: 'A reviewer opens a candidate\'s portfolio index and sees five labs listed under Security Operations, one under General Security Concepts, and none under any other domain. What does this immediately communicate to the reviewer, using only the index page?',
    options: [
      'A clear picture of the candidate\'s coverage — strong depth in Security Operations, but a visible, immediate gap across the other domains — without needing to open a single repository',
      'Nothing meaningful can be inferred from a portfolio index without opening every linked repository first',
      'The candidate has no experience relevant to any domain, since only two domains are represented',
      'The index page is purely decorative and carries no evaluative signal on its own'
    ],
    answer: 0,
    explanation:
      'This is exactly the value of domain-grouped indexing — depth and gaps in coverage are visible at a glance, before any individual repository is opened.',
    domain: 'General Security Concepts',
    conceptId: 'portfolio-index',
  },
];

// ---------- Lab 1: Generate and Review a Professional Lab Repository ----------

const LAB_25_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the full portfolio folder structure before generating your first repository.',
    command: 'show portfolio folder structure',
    expected: 'The nine-folder skeleton and what belongs in each folder.',
  },
  {
    id: 's1',
    instruction: 'Review README anatomy for a security project.',
    command: 'show readme anatomy',
    expected: 'The nine-section order a strong security README follows.',
  },
  {
    id: 's2',
    instruction: 'Review the redaction checklist before generating or publishing anything.',
    command: 'explain redaction checklist',
    expected: 'A checklist of what must never appear in a committed artifact.',
  },
  {
    id: 's3',
    instruction: 'Review how findings, remediation, and validation fit together in a report.',
    command: 'explain findings remediation validation',
    expected: 'The four-part structure of a professional finding.',
  },
];

const LAB_25_0: Lab = {
  id: 'p25-lab-0',
  phaseId: 'phase-25',
  title: 'Generate and Review a Professional Lab Repository',
  objective:
    'Review the portfolio folder structure, README anatomy, redaction checklist, and findings/remediation/validation format, then generate a repository for one completed lab using the GitHub Portfolio Generator and review every file it produces.',
  securityConcepts: [
    'Professional repository structure',
    'README anatomy for a security project',
    'Redaction discipline',
    'Findings, remediation, and validation reporting',
  ],
  environment: 'Deterministic portfolio-generation tool — produces documentation files only; nothing is published or sent anywhere',
  topology: 'Not applicable — this lab is a documentation-generation exercise',
  prerequisites: ['Complete at least one lab in any prior phase so a repository can be generated from real lab content'],
  steps: LAB_25_0_STEPS,
  expectedResults: [
    'Learner can name all nine folders in the standard portfolio skeleton and what belongs in each',
    'Learner generates one lab repository and reviews every generated file',
    'Learner can identify what a redaction pass on that repository should check for',
  ],
  verification: [
    'Learner can state the nine-section README order from memory',
    'Learner can explain why findings need severity, evidence, remediation, and validation together',
    'Learner can explain why redaction must be checked every time, not only when content seems obviously sensitive',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure which lab to generate first → pick a lab you have actually completed and captured evidence for; a generated skeleton with no captured evidence is unfinished, not a real example.',
    'Generated README feels generic → that is expected; the generator produces the skeleton, and the captured evidence you add is what makes the artifact genuinely yours.',
  ],
  challenge:
    'Write a two-sentence redaction confirmation: what you specifically checked for in the generated repository, and what (if anything) you would need to redact before publishing it publicly.',
  evidence: [
    {
      id: 'ev0',
      label: 'Generated repository review',
      type: 'log',
      placeholder: 'Note which lab you generated a repository for and what each file contained',
    },
    {
      id: 'ev1',
      label: 'Redaction confirmation',
      type: 'report',
      placeholder: 'What was checked, and what would need redaction before publishing',
    },
  ],
  securityLesson:
    'A generated skeleton is the easy 80% — every completed lab gets the same structure automatically. The remaining 20%, captured evidence and a redaction pass performed every time without exception, is what separates a genuine professional artifact from an unfinished template.',
};

// ---------- Lab 2: Curate a Role-Targeted Portfolio Index ----------

const LAB_25_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review how to curate a portfolio for a specific target role.',
    command: 'explain portfolio curation',
    expected: 'The principle of curating five to eight repositories tailored to a target role, rather than publishing everything.',
  },
  {
    id: 's1',
    instruction: 'Review the portfolio index format before generating your own.',
    command: 'show portfolio index format',
    expected: 'An explanation of domain-grouped indexing and what it communicates to a reviewer at a glance.',
  },
  {
    id: 's2',
    instruction: 'Review how provenance labels should appear in any portfolio claim.',
    command: 'explain provenance labeling in evidence',
    expected: 'Why simulated work must never be described as a real-system finding or incident.',
  },
];

const LAB_25_1: Lab = {
  id: 'p25-lab-1',
  phaseId: 'phase-25',
  title: 'Curate a Role-Targeted Portfolio Index',
  objective:
    'Generate the full portfolio index across every completed lab, review domain coverage, and select a curated five-to-eight-lab subset tailored to a specific target role.',
  securityConcepts: [
    'Portfolio curation strategy',
    'Domain-grouped portfolio indexing',
    'Role-tailored lab selection',
    'Honest provenance framing in portfolio claims',
  ],
  environment: 'Deterministic portfolio-generation tool — produces documentation files only; nothing is published or sent anywhere',
  topology: 'Not applicable — this lab is a documentation-curation exercise',
  prerequisites: ['Complete Phase 25 Lab 0 (Generate and Review a Professional Lab Repository)'],
  steps: LAB_25_1_STEPS,
  expectedResults: [
    'Learner generates the full portfolio index and reviews domain coverage across every built phase',
    'Learner selects a curated 5-8 lab subset tailored to one specific target role',
    'Learner can state why the selection is tailored to that role rather than simply the most recently completed labs',
  ],
  verification: [
    'Learner can name their weakest-covered domain from the portfolio index',
    'Learner can justify each lab in their curated selection against the target role',
    'Learner can write one accurate, honestly-framed sentence describing a simulated lab for a portfolio README',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure which role to target → pick one from the roles this platform\'s Career Mode will cover (SOC Analyst I, IAM Analyst, etc.) even before that phase is built — the curation principle does not depend on it.',
    'Tempted to feature every completed lab → resist it; a reviewer opens two or three repositories, not twelve, so curation is worth more than volume.',
  ],
  challenge:
    'Write the summary paragraph of your own portfolio index: total labs completed, your strongest domain, your weakest domain, and the specific role your curated selection targets.',
  evidence: [
    {
      id: 'ev0',
      label: 'Portfolio index review',
      type: 'log',
      placeholder: 'Paste your generated portfolio index and domain coverage breakdown',
    },
    {
      id: 'ev1',
      label: 'Curated selection and role justification',
      type: 'report',
      placeholder: '5-8 featured labs, the target role, and why each lab was selected for it',
    },
  ],
  securityLesson:
    'A portfolio index is a map, not a replacement for the territory — its entire value is letting a reviewer see coverage and curation quality in the time it takes to skim one page, which is exactly the amount of attention a portfolio realistically gets before a human decides whether to look closer.',
};

// ---------- Lessons ----------

const LESSON_25_L1: Lesson = {
  id: 'p25-lesson-0',
  phaseId: 'phase-25',
  title: 'What Makes a Security Portfolio Repo Credible',
  objectives: [
    'Explain why a documented repository complements a certification rather than duplicating it',
    'Describe the nine-folder portfolio skeleton and what belongs in each folder',
    'State the nine-section README order for a security project',
    'Apply redaction discipline consistently to every artifact type',
    'Structure a finding with severity, evidence, remediation, and validation together',
  ],
  sections: LESSON_25_L1_SECTIONS,
  quiz: LESSON_25_L1_QUIZ,
  concepts: [
    'portfolio-value',
    'portfolio-structure',
    'readme-anatomy',
    'redaction-discipline',
    'findings-remediation-validation',
    'reviewer-behavior',
  ],
  homework:
    'Take one lab you have completed and audit its documentation against the nine required sections. Write down which sections are thin and what evidence would strengthen them.',
  careerConnection:
    'Every hiring pipeline in security eventually asks "show me something you built or investigated" — this lesson is the difference between having an answer ready and improvising one in the interview.',
};

const LESSON_25_L2: Lesson = {
  id: 'p25-lesson-1',
  phaseId: 'phase-25',
  title: 'Building the Portfolio, Lab by Lab',
  objectives: [
    'Explain why curating 5-8 labs outperforms publishing every completed lab',
    'Tailor a portfolio selection to a specific target role',
    'Explain why captured evidence, not the generated skeleton, proves the work was performed',
    'Build and read a domain-grouped portfolio index',
    'Frame portfolio claims honestly using this platform\'s real/simulated/prepared provenance labels',
  ],
  sections: LESSON_25_L2_SECTIONS,
  quiz: LESSON_25_L2_QUIZ,
  concepts: [
    'portfolio-curation',
    'role-tailored-portfolio',
    'evidence-as-proof',
    'portfolio-index',
    'provenance-honesty',
  ],
  homework:
    'Publish or draft one lab repository end to end, with every artifact redacted and every output labelled real, simulated, or prepared. Have a peer skim it and tell you what is unclear.',
  careerConnection:
    'This is the direct bridge into Career Mode: curating toward a role is the exact skill that phase formalises with job-description mapping, but the underlying judgement call starts here.',
};

// ---------------------------------------------------------------------------
// Phase 25 export
// ---------------------------------------------------------------------------

export const PHASE_25: Phase = {
  id: 'phase-25',
  number: 25,
  title: 'GitHub Cybersecurity Portfolio',
  description:
    'Turn completed labs into professional, consistently structured GitHub repositories, then curate and index a role-targeted portfolio across every domain this platform covers.',
  examDomain: 'Career',
  scene: 'github-portfolio',
  lessons: [LESSON_25_L1, LESSON_25_L2],
  labs: [LAB_25_0, LAB_25_1],
};
