import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 17 — Governance, Risk & Compliance
// Aligned with CompTIA Security+ SY0-701 (Domain 5: Security Program
// Management and Oversight)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Risk Management & Governance ----------

const LESSON_17_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p17-l1-s0',
    title: 'Concept — The Risk Management Process',
    body:
      'Risk management is a continuous cycle, not a one-time project: identify assets and the risks that threaten them, assess each risk\'s likelihood and impact, treat the risk with an appropriate response, and monitor because both the environment and the risk change over time. A risk register is the living document that tracks this cycle — every identified risk, its assessment, its owner, its treatment decision, and its current status. A risk register that has not been updated in years is not a control; it is a historical artifact.',
  },
  {
    id: 'p17-l1-s1',
    title: 'Concept — Risk Assessment: Qualitative and Quantitative',
    body:
      'Qualitative risk assessment ranks risks using descriptive categories (low/medium/high, or a colour-coded matrix of likelihood x impact) — fast and intuitive, but subjective. Quantitative risk assessment assigns dollar values: Single Loss Expectancy (SLE) is the cost of one occurrence; Annualized Rate of Occurrence (ARO) is how many times per year it is expected to happen; Annualized Loss Expectancy (ALE) = SLE x ARO is the expected yearly cost. ALE lets you directly compare the cost of a control against the risk it reduces — if a control costs more per year than the ALE it eliminates, it is not cost-justified.',
  },
  {
    id: 'p17-l1-s2',
    title: 'Concept — Risk Treatment: Avoid, Transfer, Mitigate, Accept',
    body:
      'Once a risk is assessed, an organisation chooses exactly one of four treatments. Avoid removes the risk entirely by not engaging in the risky activity (cancelling a project, discontinuing a feature). Transfer shifts the financial or operational burden to a third party (cyber insurance, outsourcing to a provider who assumes liability). Mitigate reduces likelihood or impact with a control (MFA, patching, a WAF) without eliminating the risk. Accept means doing nothing further because the cost of additional treatment exceeds the risk itself — but acceptance must be a documented, signed-off decision, never silence or neglect.',
  },
  {
    id: 'p17-l1-s3',
    title: 'Concept — Policies, Standards, Procedures, and Guidelines',
    body:
      'These four document types form a hierarchy, and the exam expects you to place a given statement into the right layer. A policy is a high-level, mandatory statement of management intent ("the organisation will protect the confidentiality of customer data"). A standard is a specific, measurable, mandatory requirement that implements a policy ("passwords must be 14 characters minimum"). A procedure is step-by-step instructions for performing a task ("how to provision a new user account"). A guideline is advisory, not mandatory — a recommended best practice. Policies answer "why"; standards answer "how much/what"; procedures answer "how, step by step"; guidelines answer "what is recommended, if not required."',
  },
  {
    id: 'p17-l1-s4',
    title: 'Concept — Security Awareness and Training',
    body:
      'Technical controls fail regularly because a person clicked, typed, or approved something they should not have. Security awareness training turns every employee into a detective control, teaching them to recognise phishing, social engineering, and policy violations. Effective programs are recurring (not a single onboarding session), role-based (a developer needs different training than a finance clerk), and measured (phishing simulation click rates, completion rates) rather than treated as a compliance checkbox.',
  },
  {
    id: 'p17-l1-s5',
    title: 'Example — Reading a risk register entry',
    body:
      'Risk: "Unencrypted laptop hard drives, if stolen, expose customer PII." Likelihood: Medium (3 laptops stolen in the past 2 years). Impact: High (regulatory notification, potential fines). Inherent risk: High. Treatment: Mitigate — deploy full-disk encryption fleet-wide. Residual risk after control: Low (a stolen encrypted laptop exposes no readable data). Owner: IT Security Manager. Review date: annually. This single entry demonstrates the full cycle: identification, assessment, treatment, and a plan to monitor going forward.',
  },
  {
    id: 'p17-l1-s6',
    title: 'Review — What must stick',
    body:
      'Risk management is a continuous cycle tracked in a risk register, not a one-time exercise. ALE = SLE x ARO lets you compare a control\'s cost against the risk it removes. The four treatments are avoid, transfer, mitigate, and accept — acceptance must be documented and signed off, never silent. Policies, standards, procedures, and guidelines form a hierarchy from "why" to "how, step by step" to "recommended." Awareness training must be recurring, role-based, and measured.',
  },
];

const LESSON_17_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p17-q0',
    type: 'mcq',
    stem: 'A risk has an SLE of $50,000 and an ARO of 0.5. What is the ALE?',
    options: ['$25,000', '$50,000', '$100,000', '$12,500'],
    answer: 0,
    explanation:
      'ALE = SLE x ARO = $50,000 x 0.5 = $25,000. This is the expected annualised cost of the risk if left untreated.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-assessment',
  },
  {
    id: 'p17-q1',
    type: 'mcq',
    stem: 'A company purchases cyber liability insurance to cover the cost of a future data breach. Which risk treatment is this?',
    options: ['Transfer', 'Avoid', 'Mitigate', 'Accept'],
    answer: 0,
    explanation:
      'Insurance shifts the financial burden of the risk to a third party (the insurer) — this is risk transfer, not a control that reduces the likelihood or impact directly.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-treatment',
  },
  {
    id: 'p17-q2',
    type: 'mcq',
    stem: 'What distinguishes a standard from a guideline?',
    options: [
      'A standard is mandatory and measurable; a guideline is advisory and not mandatory',
      'A standard is optional; a guideline is mandatory',
      'They are the same document type with different names',
      'A standard only applies to external auditors',
    ],
    answer: 0,
    explanation:
      'Standards are specific, mandatory, measurable requirements that implement a policy. Guidelines are recommended best practices that are not mandatory.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'governance-documents',
  },
  {
    id: 'p17-q3',
    type: 'mcq',
    stem: 'Why must risk acceptance always be a documented, signed-off decision rather than silence?',
    options: [
      'Without documentation and accountability, an unaddressed risk cannot be distinguished from a risk no one ever evaluated',
      'Documentation is only required for risks that are mitigated, not accepted',
      'Signed acceptance transfers legal liability to the insurance provider automatically',
      'There is no requirement to document risk acceptance',
    ],
    answer: 0,
    explanation:
      'A documented, signed acceptance proves the risk was deliberately evaluated and knowingly accepted by an accountable owner — distinguishing governance from simple neglect.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-treatment',
  },
  {
    id: 'p17-q4',
    type: 'mcq',
    stem: 'What is the primary purpose of a risk register?',
    options: [
      'To track every identified risk, its assessment, owner, treatment, and current status over time',
      'To store encrypted customer data',
      'To replace the need for a security policy',
      'To list every employee\'s security training completion date only',
    ],
    answer: 0,
    explanation:
      'The risk register is the living document at the centre of the risk management cycle — identification, assessment, treatment, and ongoing monitoring all flow through it.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-management',
  },
  {
    id: 'p17-q5',
    type: 'scenario',
    stem: 'Leadership reviews a proposed IoT product line and determines the security risk is unacceptable, so the project is cancelled entirely. Which risk treatment is this?',
    options: ['Avoid', 'Mitigate', 'Transfer', 'Accept'],
    answer: 0,
    explanation:
      'Cancelling the risky activity entirely, rather than reducing or shifting the risk, is risk avoidance.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-treatment',
  },
  {
    id: 'p17-q6',
    type: 'scenario',
    stem: 'A security policy states employees must protect confidential information, but no document specifies what "protect" means in practice — no minimum password length, no encryption requirement, no specific control. What is missing?',
    options: [
      'A standard that translates the high-level policy into specific, measurable, mandatory requirements',
      'A guideline, since standards are optional',
      'Nothing is missing — policies are self-enforcing',
      'A procedure only, standards are not needed',
    ],
    answer: 0,
    explanation:
      'A policy states intent at a high level; without a standard defining specific measurable requirements, the policy cannot be consistently implemented or audited.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'governance-documents',
  },
  {
    id: 'p17-q7',
    type: 'scenario',
    stem: 'A company calculates that a proposed control costs $40,000 per year, but the ALE of the risk it addresses is only $15,000 per year. What should the company conclude?',
    options: [
      'The control is not cost-justified based on this risk alone — the annual cost exceeds the annual expected loss',
      'The control must be implemented regardless of cost',
      'The ALE calculation is irrelevant to control decisions',
      'The SLE should be recalculated to match the control cost',
    ],
    answer: 0,
    explanation:
      'Comparing control cost to ALE is exactly how quantitative risk assessment supports decision-making — a control that costs more than the loss it prevents is not justified by this risk alone.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-assessment',
  },
  {
    id: 'p17-q8',
    type: 'scenario',
    stem: 'New employees complete a single security awareness session on their first day and receive no further training afterward. What is the gap?',
    options: [
      'Awareness training must be recurring (e.g., annual) to remain effective as threats and policies evolve',
      'There is no gap — onboarding training is sufficient for the employee\'s entire tenure',
      'Awareness training should only be given to IT staff',
      'Recurring training is only required for regulated industries',
    ],
    answer: 0,
    explanation:
      'A single onboarding session becomes outdated as threats and policy change; effective awareness programs are recurring, role-based, and measured over the employee\'s tenure.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'security-awareness',
  },
  {
    id: 'p17-q9',
    type: 'scenario',
    stem: 'A document specifies the exact ordered steps an analyst must follow when responding to a reported phishing email. What type of governance document is this?',
    options: ['Procedure', 'Policy', 'Standard', 'Guideline'],
    answer: 0,
    explanation:
      'Step-by-step, sequential instructions for performing a specific task are the definition of a procedure.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'governance-documents',
  },
  {
    id: 'p17-q-pbq',
    type: 'pbq',
    stem: 'Order the standard risk management steps from first to last.',
    options: [
      'Identify assets, threats, and vulnerabilities',
      'Assess likelihood and impact of each risk',
      'Select a treatment: accept, avoid, mitigate, transfer, or share',
      'Monitor, review, and re-evaluate the risk posture',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'You cannot treat a risk you have not identified and measured. Continuous monitoring makes risk management a loop, not a one-time event.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'risk-management',
  },
];

// ---------- Lesson 2: Compliance, Audits & Third-Party Risk ----------

const LESSON_17_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p17-l2-s0',
    title: 'Concept — Compliance and Regulatory Frameworks',
    body:
      'Compliance means meeting the requirements of a law, regulation, or contractual framework. GDPR governs personal data of EU residents regardless of where the processing company is located. HIPAA governs protected health information in the US. PCI DSS is a contractual (not legal) framework required by payment card brands for anyone who stores, processes, or transmits cardholder data. SOC 2 is an attestation framework, commonly required by enterprise customers, evaluating a service provider\'s controls around security, availability, and confidentiality. The exam expects you to match a scenario (EU customer data, health records, card payments) to the framework that primarily applies.',
  },
  {
    id: 'p17-l2-s1',
    title: 'Concept — Audits and Assessments',
    body:
      'An audit is an independent, evidence-based examination of whether controls actually operate as designed — internal audits are performed by the organisation\'s own staff for management assurance; external/regulatory audits are performed by outside parties and may carry legal or contractual consequences. An attestation (like a SOC 2 report) is a formal statement, often by an independent auditor, that specific controls were examined and found to meet a defined standard — it is a deliverable that helps satisfy a customer\'s or regulator\'s due-diligence requirement. Every audit finding needs an owner and a remediation plan with a target date; an open finding with no plan is itself a governance failure, not just an unresolved technical issue.',
  },
  {
    id: 'p17-l2-s2',
    title: 'Concept — Third-Party and Vendor Risk Management',
    body:
      'Every vendor with access to your systems or data inherits into your own risk posture — a vendor breach is your breach from the customer\'s perspective. Vendor risk management includes due diligence before signing (security questionnaires, reviewing the vendor\'s own compliance attestations), contractual protections (SLAs for uptime and incident notification timelines, a right-to-audit clause letting you verify their controls directly rather than trusting their word alone), and ongoing monitoring for the life of the relationship, not just at onboarding. A vendor with data access but no completed risk assessment is an unmanaged extension of your attack surface.',
  },
  {
    id: 'p17-l2-s3',
    title: 'Concept — Business Impact Analysis (BIA)',
    body:
      'A BIA identifies which business processes are critical to the organisation\'s survival and, for each, determines the Maximum Tolerable Downtime (MTD) — the longest that process can be unavailable before causing unacceptable harm. The BIA does not design the recovery solution; it defines the requirement that later feeds recovery time objectives, which the organisation\'s business continuity and disaster recovery plans (Phase 18) are built to satisfy. Skipping the BIA means an organisation builds recovery plans against a guess rather than a measured business requirement.',
  },
  {
    id: 'p17-l2-s4',
    title: 'Concept — Privacy and Data Retention in a Compliance Context',
    body:
      'Privacy regulations (GDPR, and sector-specific laws) generally require data minimisation — collect only what is needed, keep it only as long as needed, and provide mechanisms for individuals to access or request deletion of their data. A compliance program that only tracks security controls but ignores retention and deletion obligations will pass a security audit while still failing a privacy audit; the two are related but distinct scopes.',
  },
  {
    id: 'p17-l2-s5',
    title: 'Example — A vendor risk assessment in practice',
    body:
      'A company is about to sign a contract with a cloud-based payroll provider that will hold every employee\'s SSN and bank account details. Before signing, the security team sends a vendor security questionnaire, requests the provider\'s latest SOC 2 Type II report, and negotiates a right-to-audit clause and a 24-hour breach-notification requirement into the contract. Six months later, the provider discloses an incident; because the notification clause exists, the company is informed within the contractual window rather than finding out from a news article — the governance work done before signing is what made the difference during the incident.',
  },
  {
    id: 'p17-l2-s6',
    title: 'Review — What must stick',
    body:
      'Match the scenario to the framework: EU personal data → GDPR; health records → HIPAA; card payments → PCI DSS; enterprise customer assurance → SOC 2. Audits verify controls operate as designed; every finding needs an owner and a remediation plan. Vendor risk is inherited risk — assess before signing, contract for a right-to-audit and breach notification, and monitor continuously. A BIA defines maximum tolerable downtime per critical process, which later recovery plans are built to satisfy. Privacy compliance requires retention and deletion controls, not just security controls.',
  },
];

const LESSON_17_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p17-q10',
    type: 'mcq',
    stem: 'A US healthcare provider stores patient diagnosis and treatment records. Which regulatory framework primarily applies?',
    options: ['HIPAA', 'PCI DSS', 'GDPR', 'SOC 2'],
    answer: 0,
    explanation:
      'HIPAA governs protected health information (PHI) for covered entities and business associates in the United States.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'compliance-frameworks',
  },
  {
    id: 'p17-q11',
    type: 'mcq',
    stem: 'A company processes payment card transactions. Which framework requires compliance, even though it is contractual rather than a government law?',
    options: ['PCI DSS', 'HIPAA', 'GDPR', 'FERPA'],
    answer: 0,
    explanation:
      'PCI DSS is mandated by the payment card brands (Visa, Mastercard, etc.) through merchant contracts, not by government statute, but non-compliance can still result in fines and loss of card-processing privileges.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'compliance-frameworks',
  },
  {
    id: 'p17-q12',
    type: 'mcq',
    stem: 'What is the primary purpose of a right-to-audit clause in a vendor contract?',
    options: [
      'It lets the organisation directly verify a vendor\'s security controls rather than relying solely on the vendor\'s self-attestation',
      'It requires the vendor to lower their prices annually',
      'It transfers all legal liability for a breach to the vendor automatically',
      'It replaces the need for a security questionnaire',
    ],
    answer: 0,
    explanation:
      'A right-to-audit clause gives the customer the contractual ability to independently verify the vendor\'s controls, rather than trusting the vendor\'s word or attestation alone.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'vendor-risk',
  },
  {
    id: 'p17-q13',
    type: 'mcq',
    stem: 'What does a Business Impact Analysis (BIA) determine for each critical business process?',
    options: [
      'The Maximum Tolerable Downtime (MTD) — how long the process can be unavailable before unacceptable harm occurs',
      'The exact recovery technology to purchase',
      'The annual security training budget',
      'The physical location of the data centre'
    ],
    answer: 0,
    explanation:
      'A BIA identifies criticality and MTD per process — the business requirement that recovery plans are later built to satisfy.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'business-impact-analysis',
  },
  {
    id: 'p17-q14',
    type: 'mcq',
    stem: 'What is the key difference between an internal audit and an external/regulatory audit?',
    options: [
      'Internal audits are performed by the organisation\'s own staff for management assurance; external/regulatory audits are performed by outside parties and may carry legal or contractual consequences',
      'Internal audits are always more thorough than external audits',
      'External audits are optional for every organisation',
      'There is no meaningful difference between the two',
    ],
    answer: 0,
    explanation:
      'Internal audits provide assurance to management; external/regulatory audits are performed by independent outside parties and can carry legal, contractual, or certification consequences.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'audits',
  },
  {
    id: 'p17-q15',
    type: 'scenario',
    stem: 'An EU-based customer\'s personal data is processed by a company headquartered in the United States. Which regulation applies to that data regardless of where the company is located?',
    options: ['GDPR', 'HIPAA only', 'PCI DSS only', 'No regulation applies since the company is US-based'],
    answer: 0,
    explanation:
      'GDPR applies based on the data subject\'s location (EU residents) and the nature of the processing, not the processing company\'s headquarters location.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'compliance-frameworks',
  },
  {
    id: 'p17-q16',
    type: 'scenario',
    stem: 'An internal audit finding from 18 months ago remains open with no assigned owner or remediation date. What is the primary governance failure here?',
    options: [
      'The lack of ownership and a remediation plan turns a known control gap into an indefinitely accepted risk with no accountability',
      'Internal audit findings do not require remediation',
      'The finding should have been reported to a regulator instead',
      'This is normal and requires no action',
    ],
    answer: 0,
    explanation:
      'An audit finding without an owner and target date effectively becomes a silently accepted risk — the opposite of the documented, accountable risk acceptance a mature program requires.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'audits',
  },
  {
    id: 'p17-q17',
    type: 'scenario',
    stem: 'A company signs a cloud payroll vendor without sending a security questionnaire or reviewing the vendor\'s SOC 2 report. Six months later the vendor suffers a breach affecting employee SSNs. What governance step was skipped?',
    options: [
      'Vendor due diligence and risk assessment before signing the contract',
      'Employee security awareness training',
      'Data classification of internal marketing materials',
      'The company\'s own internal audit schedule'
    ],
    answer: 0,
    explanation:
      'Vendor risk is inherited risk — due diligence (questionnaires, reviewing attestations like SOC 2) before signing is exactly the control that was missing here.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'vendor-risk',
  },
  {
    id: 'p17-q18',
    type: 'scenario',
    stem: 'A company\'s security program tracks encryption and access control audits thoroughly, but has no process for responding to a customer\'s request to delete their personal data. What compliance gap does this represent?',
    options: [
      'A privacy compliance gap — data minimisation and deletion rights are a distinct requirement from security controls alone',
      'No gap exists if security controls are strong',
      'This only matters for healthcare organisations',
      'PCI DSS requires this, not privacy law',
    ],
    answer: 0,
    explanation:
      'Privacy regulations require data subject rights such as deletion requests, which is a distinct compliance scope from security controls — passing a security audit does not guarantee passing a privacy audit.',
    domain: 'Security Program Management and Oversight',
    conceptId: 'compliance-frameworks',
  },
];

// ---------- Lab 1: Conduct a Security Risk Assessment ----------

const LAB_17_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the fictional company\'s asset inventory to identify what needs protecting.',
    command: 'show asset inventory',
    expected: 'A list of critical assets (customer database, payment system, employee laptops, etc.) with business value noted.',
  },
  {
    id: 's1',
    instruction: 'Review the threat catalogue relevant to this company\'s environment.',
    command: 'show threat catalog',
    expected: 'A list of applicable threats (ransomware, insider threat, vendor breach, lost device) mapped loosely to assets.',
  },
  {
    id: 's2',
    instruction: 'Review the current risk register for existing entries and gaps.',
    command: 'show risk register',
    expected: 'A register showing several assessed risks, at least one stale/overdue for review, and at least one asset with no entry at all.',
  },
  {
    id: 's3',
    instruction: 'Run the quantitative risk calculation for the highest-priority unassessed risk.',
    command: 'show risk calculation',
    expected: 'An SLE x ARO = ALE walkthrough for the unencrypted-laptop risk, with a comparison against the proposed control cost.',
  },
];

const LAB_17_0: Lab = {
  id: 'p17-lab-0',
  phaseId: 'phase-17',
  title: 'Conduct a Security Risk Assessment',
  objective:
    'Conduct a simulated risk assessment for a fictional company: identify assets and threats, review the existing risk register for gaps, calculate ALE for an unassessed risk, and recommend a treatment.',
  securityConcepts: [
    'Risk management process',
    'Risk register',
    'Qualitative and quantitative risk assessment',
    'ALE / SLE / ARO',
    'Risk treatment',
  ],
  environment: 'Deterministic governance simulator — prepared outputs only, no real company or system is assessed',
  topology: 'Fictional mid-size company: customer database, payment processing system, 200 employee laptops, one cloud payroll vendor',
  prerequisites: ['Complete Phase 2 (Security Fundamentals)', 'Complete Phase 4 (Security Architecture)'],
  steps: LAB_17_0_STEPS,
  expectedResults: [
    'Critical assets and applicable threats identified',
    'A stale risk register entry and a missing entry both identified',
    'ALE correctly calculated for the unencrypted-laptop risk',
    'A specific risk treatment (avoid/transfer/mitigate/accept) recommended with justification',
  ],
  verification: [
    'Learner can calculate ALE = SLE x ARO correctly given the simulator\'s figures',
    'Learner can justify why a specific treatment (not just "fix it") is the right response',
    'Learner can explain why a risk register missing an asset is itself a finding',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure how to pick a treatment → compare the ALE to the cost of mitigating; if mitigation costs more than the ALE and the risk is low-impact, acceptance may be justified instead.',
    'Confused about qualitative vs quantitative → qualitative uses labels (low/medium/high); quantitative uses dollar figures (SLE, ARO, ALE). Use whichever the available data supports.',
  ],
  challenge:
    'Write a one-page risk assessment memo: for the unencrypted-laptop risk, state the ALE, the proposed control and its cost, the recommended treatment, and the residual risk after treatment.',
  evidence: [
    {
      id: 'ev0',
      label: 'Risk assessment transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Risk assessment memo',
      type: 'report',
      placeholder: 'ALE, control cost, recommended treatment, residual risk',
    },
  ],
  securityLesson:
    'A risk assessment that never produces a number a decision-maker can compare against a control\'s cost is just an opinion. ALE is not the whole answer, but it is the argument that gets a security control funded instead of debated indefinitely.',
};

// ---------- Lab 2: Assess Vendor & Compliance Risk ----------

const LAB_17_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the vendor risk assessment for the company\'s critical third parties.',
    command: 'show vendor risk assessment',
    expected: 'A report showing one vendor with a completed assessment and right-to-audit clause, and one with neither.',
  },
  {
    id: 's1',
    instruction: 'Review the most recent compliance audit findings.',
    command: 'show compliance audit findings',
    expected: 'A list of findings including at least one open finding with no owner or remediation date.',
  },
  {
    id: 's2',
    instruction: 'Review the business impact analysis to identify the most critical process.',
    command: 'show business impact analysis',
    expected: 'A BIA table ranking processes by criticality and MTD, identifying the single most time-critical process.',
  },
];

const LAB_17_1: Lab = {
  id: 'p17-lab-1',
  phaseId: 'phase-17',
  title: 'Assess Vendor & Compliance Risk',
  objective:
    'Review a simulated vendor risk assessment, compliance audit findings, and business impact analysis for governance gaps, then recommend specific remediations.',
  securityConcepts: [
    'Third-party and vendor risk management',
    'Compliance frameworks',
    'Audits and remediation tracking',
    'Business impact analysis',
  ],
  environment: 'Deterministic governance simulator — prepared outputs only',
  topology: 'Same fictional mid-size company as Lab 1, with two critical vendors and a recent internal compliance audit',
  prerequisites: ['Complete Lab 1 (Conduct a Security Risk Assessment)'],
  steps: LAB_17_1_STEPS,
  expectedResults: [
    'A vendor with data access but no completed risk assessment identified',
    'An open audit finding with no owner or remediation date identified',
    'The single most time-critical business process (lowest MTD) identified from the BIA',
  ],
  verification: [
    'Learner can recommend the specific missing vendor risk controls (questionnaire, right-to-audit, SLA)',
    'Learner can assign an owner and propose a remediation timeline for the open audit finding',
    'Learner can explain why the BIA\'s most critical process should be prioritised in any future recovery planning',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure what "MTD" means → Maximum Tolerable Downtime — the longest a process can be unavailable before the harm becomes unacceptable to the business.',
    'Confused about which compliance framework applies → match the data type (health, payment card, EU personal data) to the framework, not the company\'s industry label alone.',
  ],
  challenge:
    'Propose a corrected vendor governance requirement: the specific questionnaire items, contract clauses (right-to-audit, breach notification SLA), and ongoing monitoring cadence that should apply to any vendor handling the same class of data as the non-compliant vendor found in this lab.',
  evidence: [
    {
      id: 'ev0',
      label: 'Vendor/compliance audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Governance remediation plan',
      type: 'report',
      placeholder: 'Vendor controls, audit finding owner/date, and BIA-driven recovery priority',
    },
  ],
  securityLesson:
    'Governance failures rarely look dramatic in the moment — an unreviewed vendor, an open finding with no date, a risk register with a gap. They only become dramatic later, during an incident, when the organisation discovers it had no visibility into exactly the thing that just failed.',
};

// ---------- Lessons ----------

const LESSON_17_L1: Lesson = {
  id: 'p17-lesson-0',
  phaseId: 'phase-17',
  title: 'Risk Management & Governance',
  objectives: [
    'Describe the risk management process and the role of the risk register',
    'Calculate Annualized Loss Expectancy (ALE) from SLE and ARO',
    'Distinguish the four risk treatments: avoid, transfer, mitigate, accept',
    'Place a governance statement into the correct document type: policy, standard, procedure, or guideline',
    'Explain the requirements of an effective security awareness program',
  ],
  sections: LESSON_17_L1_SECTIONS,
  quiz: LESSON_17_L1_QUIZ,
  concepts: [
    'risk-management',
    'risk-assessment',
    'risk-treatment',
    'governance-documents',
    'security-awareness',
  ],
  homework:
    'Write a risk register entry for a fictional company with likelihood, impact, treatment decision, owner, and residual risk. State plainly which treatment you chose and why the other three were rejected.',
  careerConnection:
    'GRC Analyst — every organisation above a certain size needs someone who can maintain a risk register, calculate ALE to justify a control budget, and know instantly whether a document belongs in the policy, standard, procedure, or guideline layer.',
};

const LESSON_17_L2: Lesson = {
  id: 'p17-lesson-1',
  phaseId: 'phase-17',
  title: 'Compliance, Audits & Third-Party Risk',
  objectives: [
    'Match a data-handling scenario to the correct compliance framework (GDPR, HIPAA, PCI DSS, SOC 2)',
    'Distinguish internal audits, external/regulatory audits, and attestations',
    'Explain third-party and vendor risk management including due diligence and right-to-audit clauses',
    'Explain the purpose of a Business Impact Analysis and Maximum Tolerable Downtime',
    'Explain how privacy compliance requirements differ from security control requirements',
  ],
  sections: LESSON_17_L2_SECTIONS,
  quiz: LESSON_17_L2_QUIZ,
  concepts: [
    'compliance-frameworks',
    'audits',
    'vendor-risk',
    'business-impact-analysis',
  ],
  homework:
    'Write five questions you would ask a vendor before granting them access to your data, and state what a bad answer to each one would tell you.',
  careerConnection:
    'Compliance / Vendor Risk Manager — as organisations outsource more critical functions, the analyst who can run a vendor risk assessment and track audit findings to closure becomes essential to passing the next regulatory or customer audit.',
};

// ---------- Phase export ----------

export const PHASE_17: Phase = {
  id: 'phase-17',
  number: 17,
  title: 'Governance, Risk & Compliance',
  description:
    'Master the risk management cycle (risk register, ALE, treatment), the policy/standard/procedure/guideline hierarchy, and security awareness, then compliance frameworks, audits, third-party vendor risk, and business impact analysis — applied to a simulated risk assessment for a fictional company.',
  examDomain: 'Security Program Management and Oversight',
  scene: 'soc',
  lessons: [LESSON_17_L1, LESSON_17_L2],
  labs: [LAB_17_0, LAB_17_1],
};
