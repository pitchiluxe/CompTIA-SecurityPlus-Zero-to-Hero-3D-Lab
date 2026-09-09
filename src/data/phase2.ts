import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 2 — Security Fundamentals
// Aligned with CompTIA Security+ SY0-701
//
// The vocabulary phase. Every later phase reuses these words, and the exam
// punishes imprecision about them harder than it punishes missing facts.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p2-lesson-0',
    phaseId: 'phase-2',
    title: 'The CIA Triad and the AAA Model',
    objectives: [
      'Explain confidentiality, integrity, and availability, and what attacks each one',
      'Separate authentication, authorisation, and accounting',
      'Explain non-repudiation and what it requires',
      'Identify which property or which A has failed in a described incident',
    ],
    concepts: ['cia-triad', 'aaa', 'non-repudiation'],
    homework:
      'Take one system you use daily and write one concrete way each of confidentiality, integrity, and availability could fail on it. Then name the control that addresses each failure.',
    careerConnection:
      'IAM Analyst — the AAA model is the job. Every access request you review is authentication, authorisation, or accounting, and knowing which one broke is how tickets get routed.',
    sections: [
      {
        id: 'p2-l0-s0',
        title: 'Concept — The CIA triad',
        body: 'Three properties define what security protects. Confidentiality means only authorised parties can read the data. Integrity means the data has not been altered without authorisation, and you can tell. Availability means authorised parties can reach the data when they need it. Every control you ever deploy serves at least one of these, and most trade one against another — encrypting a backup helps confidentiality and slightly harms availability if you lose the key.',
      },
      {
        id: 'p2-l0-s1',
        title: 'Concept — Which property does an attack target?',
        body: 'Ransomware that encrypts your files attacks availability first, and confidentiality only if the attacker also exfiltrated. A database dump posted publicly attacks confidentiality. Silently modifying a payment amount attacks integrity — and integrity attacks are the most dangerous precisely because nothing looks broken. When an exam question describes an incident, the first question to ask is which property was lost.',
      },
      {
        id: 'p2-l0-s2',
        title: 'Concept — Authentication, authorisation, accounting',
        body: 'Authentication proves who you are. Authorisation decides what you may do. Accounting records what you did. They run in that order and each depends on the last: you cannot authorise an identity you have not established, and you cannot account for an action you cannot attribute. Failures cascade downward — break authentication and the other two become meaningless.',
      },
      {
        id: 'p2-l0-s3',
        title: 'Concept — Non-repudiation',
        body: 'Non-repudiation means someone cannot credibly deny having taken an action. It is not a fourth A; it is a property that emerges when authentication and accounting are both strong. It requires individual identity (not a shared account), a tamper-resistant record, and usually cryptographic binding such as a digital signature. Take away any one and repudiation becomes possible.',
      },
      {
        id: 'p2-l0-s4',
        title: 'Example — Where AAA broke at Cedar Analytics',
        body: 'Four engineers share one "dbadmin" account. A table is dropped at 02:14. Authentication succeeded — the password was correct — but it identified a role, not a person. Authorisation succeeded too; dbadmin was permitted to drop tables. Accounting recorded the action faithfully and uselessly, because "dbadmin did it" names nobody. Non-repudiation is impossible: any of the four can deny it, and they are all telling the truth as far as anyone can prove.',
      },
      {
        id: 'p2-l0-s5',
        title: 'Scenario — Naming the failure precisely',
        body: 'A junior analyst reports "we had an authentication failure". Push back: did the system fail to establish identity, or did it establish identity and then grant too much? Those are different tickets with different fixes. Precision in this vocabulary is not pedantry — it is the difference between resetting a password and rewriting a permissions model.',
      },
      {
        id: 'p2-l0-s6',
        title: 'Review — What must stick',
        body: 'C, I, A: read it, trust it, reach it. Authentication then authorisation then accounting, each depending on the last. Non-repudiation is a property, not an A, and it needs individual identity plus a trustworthy record. When an incident is described, name the property lost and the A that failed before proposing anything.',
      },
    ],
    quiz: [
      {
        id: 'p2-q0',
        type: 'scenario',
        stem: 'An attacker silently alters the payment amount in a stored invoice. No data is stolen and the system stays online. Which CIA property was primarily attacked?',
        options: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'],
        answer: 1,
        explanation:
          'The data was altered without authorisation. Nothing was read out and nothing went offline, so confidentiality and availability are intact. Integrity attacks are the hardest to notice precisely because the system keeps working normally.',
        examClue:
          'If the incident describes modification rather than disclosure or outage, the answer is integrity.',
        domain: 'General Security Concepts',
        conceptId: 'cia-triad',
      },
      {
        id: 'p2-q1',
        type: 'mcq',
        stem: 'A user logs in with a valid password and then accesses a payroll file they should not be able to open. Which control failed?',
        options: ['Authentication', 'Authorisation', 'Accounting', 'Availability'],
        answer: 1,
        explanation:
          'Authentication worked — the system correctly established who they were. The failure is in what they were permitted to do afterwards, which is authorisation.',
        examClue:
          'Valid credentials plus excessive access is always an authorisation question, never an authentication one.',
        domain: 'General Security Concepts',
        conceptId: 'aaa',
      },
      {
        id: 'p2-q2',
        type: 'scenario',
        stem: 'Four engineers share one administrator account. After a destructive change, nobody can determine who made it. Which property is absent?',
        options: ['Confidentiality', 'Availability', 'Non-repudiation', 'Authentication'],
        answer: 2,
        explanation:
          'Every engineer can credibly deny the action, and none can be disproven. Non-repudiation requires individual identity plus a trustworthy record — the shared account destroys the first, so the second cannot help.',
        domain: 'General Security Concepts',
        conceptId: 'non-repudiation',
      },
      {
        id: 'p2-q3',
        type: 'mcq',
        stem: 'Ransomware encrypts a file server. The attacker did not copy any data before encrypting. Which property is primarily lost?',
        options: ['Confidentiality', 'Integrity', 'Availability', 'Accounting'],
        answer: 2,
        explanation:
          'Authorised users can no longer reach their data, which is exactly availability. Confidentiality would also be lost if the attacker had exfiltrated first — modern ransomware usually does, which is why double extortion changes the answer.',
        domain: 'General Security Concepts',
        conceptId: 'cia-triad',
      },
    ],
  },

  {
    id: 'p2-lesson-1',
    phaseId: 'phase-2',
    title: 'Security Principles — Least Privilege, Defence in Depth, Zero Trust',
    objectives: [
      'Apply least privilege to an account and justify the scope you chose',
      'Explain defence in depth as an assumption about failure',
      'Contrast Zero Trust with perimeter-based trust',
      'Describe attack surface and name three ways to reduce it',
    ],
    concepts: ['least-privilege', 'defense-in-depth', 'zero-trust', 'attack-surface'],
    homework:
      'Find one place in your own setup where you hold more privilege than you need. Write down what it would take to reduce it, and what would break if you did.',
    careerConnection:
      'These four principles are what interviewers probe when they ask "how would you secure X". Naming the principle and then the specific control is what a strong answer sounds like.',
    sections: [
      {
        id: 'p2-l1-s0',
        title: 'Concept — Least privilege',
        body: 'Grant the smallest set of rights that still lets the job be done, for the shortest time it is needed. You saw this concretely in Phase 1: analyst1 held one scoped sudo grant rather than blanket root. The discipline is not "give people less" — it is "give people exactly enough, and review it when the job changes". Privilege that outlives its purpose is the most common finding in any access review.',
      },
      {
        id: 'p2-l1-s1',
        title: 'Concept — Defence in depth',
        body: 'Layer independent controls so no single failure is fatal. The critical word is assumption: defence in depth begins by assuming each individual control will eventually fail. The question stops being "is the firewall good enough" and becomes "what still stands when the firewall is bypassed". Layers only count when they are genuinely independent — two controls that fail to the same root cause are one layer wearing two hats.',
      },
      {
        id: 'p2-l1-s2',
        title: 'Concept — Zero Trust',
        body: 'Perimeter security assumes that traffic inside the network is trustworthy. Zero Trust removes that assumption: every request is authenticated, authorised, and evaluated on its own merits regardless of where it came from. "Never trust, always verify." Note that this does not replace defence in depth — it changes what one specific layer, the perimeter, is allowed to conclude. A VPN that places a laptop "inside" is exactly the assumption Zero Trust rejects.',
      },
      {
        id: 'p2-l1-s3',
        title: 'Concept — Attack surface',
        body: 'Attack surface is the total set of points where an attacker can attempt entry. It is more than open ports: local accounts, writable files, installed software, privilege grants, and exposed APIs all count. Reduction beats defence — a service bound to loopback cannot be attacked over the network at all, which is stronger and cheaper than any control you could put in front of it.',
      },
      {
        id: 'p2-l1-s4',
        title: 'Example — The same server, three principles',
        body: 'SRV-01 from Phase 1. Least privilege: analyst1 gets one sudo command, not root. Attack surface reduction: postgres binds to 127.0.0.1, removing it from the network entirely. Defence in depth: even if nginx is exploited, the worker runs as www-data with no sudo, on a segmented VLAN, behind a firewall that logs the flow. Three principles, one host, each visible in command output you have already read.',
      },
      {
        id: 'p2-l1-s5',
        title: 'Scenario — Where Zero Trust changes the answer',
        body: 'An attacker phishes a remote worker and connects over the corporate VPN. Under perimeter trust they are now "inside" and can reach internal services freely. Under Zero Trust the VPN grants network reachability but nothing more — each service still demands authentication, checks device posture, and authorises the specific request. The compromise is the same; the blast radius is not.',
      },
      {
        id: 'p2-l1-s6',
        title: 'Review — What must stick',
        body: 'Least privilege: smallest rights, shortest time, reviewed. Defence in depth: assume each layer fails, and make sure the layers are independent. Zero Trust: location grants nothing; verify every request. Attack surface: everything reachable, and reduction beats protection.',
      },
    ],
    quiz: [
      {
        id: 'p2-q4',
        type: 'mcq',
        stem: 'What core assumption does defence in depth make?',
        options: [
          'That the perimeter firewall is the most important control',
          'That any individual control will eventually fail',
          'That attackers are always external',
          'That layered controls remove all risk',
        ],
        answer: 1,
        explanation:
          'The strategy exists because single controls fail. Layers are chosen so that a failure in one still leaves others standing — which is also why the layers must be independent of each other.',
        domain: 'Security Architecture',
        conceptId: 'defense-in-depth',
      },
      {
        id: 'p2-q5',
        type: 'scenario',
        stem: 'A remote worker is phished and the attacker connects through the corporate VPN. Under a Zero Trust model, what limits the damage?',
        options: [
          'The VPN encrypts the traffic, so the attacker cannot act',
          'Being on the internal network grants no implicit trust; each service still authenticates and authorises the request',
          'The perimeter firewall blocks all VPN traffic by default',
          'Zero Trust prevents credentials from being phished',
        ],
        answer: 1,
        explanation:
          'Zero Trust removes location as a basis for trust. The attacker gains network reachability but must still satisfy authentication, device posture, and authorisation at every service. Encryption protects the traffic, not the account, and no model prevents phishing itself.',
        examClue:
          'Options claiming a model prevents the initial compromise are usually wrong — models limit consequences.',
        domain: 'Security Architecture',
        conceptId: 'zero-trust',
      },
      {
        id: 'p2-q6',
        type: 'mcq',
        stem: 'Which action reduces attack surface most fundamentally?',
        options: [
          'Adding an intrusion detection signature for the service',
          'Binding the service to loopback so it is unreachable from the network',
          'Enabling verbose logging on the service',
          'Placing the service behind a reverse proxy',
        ],
        answer: 1,
        explanation:
          'Removing reachability eliminates the network attack path entirely. Detection, logging, and proxying all leave the service reachable and add controls in front of it — useful, but weaker than removal.',
        domain: 'Security Architecture',
        conceptId: 'attack-surface',
      },
      {
        id: 'p2-q7',
        type: 'pbq',
        stem: 'Order these defence-in-depth layers from outermost to the asset: [0] Data, [1] Policy, [2] Endpoint, [3] Perimeter, [4] Network.',
        options: ['Policy', 'Perimeter', 'Network', 'Endpoint', 'Data'],
        answer: [0, 1, 2, 3, 4],
        explanation:
          'Policy governs everything and sits outermost. Then perimeter, then internal network segmentation, then the endpoint itself, then the data — the last layer before the asset. Encryption at rest protects the data even when every other layer has failed.',
        domain: 'Security Architecture',
        conceptId: 'defense-in-depth',
      },
    ],
  },

  {
    id: 'p2-lesson-2',
    phaseId: 'phase-2',
    title: 'The Language of Risk',
    objectives: [
      'Separate threat, vulnerability, exploit, and risk precisely',
      'State a risk as likelihood combined with impact',
      'Distinguish inherent risk from residual risk',
      'Name the four risk treatment options and pick one for a scenario',
    ],
    concepts: ['threat', 'vulnerability', 'exploit', 'risk', 'residual-risk'],
    homework:
      'Write a five-line risk statement for a laptop you own, correctly separating asset, threat, vulnerability, risk, and control. Do not let the threat and the vulnerability collapse into one sentence.',
    careerConnection:
      'GRC and SOC roles both live in this vocabulary. A finding written as "the server is vulnerable" gets ignored; one written as likelihood, impact, and treatment gets funded.',
    sections: [
      {
        id: 'p2-l2-s0',
        title: 'Concept — Four words people constantly confuse',
        body: 'A threat is the actor or event that could cause harm — it exists whether or not you are weak. A vulnerability is the weakness it could exploit — it is yours, and yours to fix. An exploit is the specific technique or code that turns the vulnerability into an actual compromise. Risk is what you get when you combine the likelihood of that happening with the impact if it does. Four distinct things, and the exam will offer you all four as options to the same question.',
      },
      {
        id: 'p2-l2-s1',
        title: 'Concept — Risk is a sentence with two halves',
        body: 'Risk = likelihood x impact. A statement naming only one half is not a risk statement. "The appliance is unpatched" is a vulnerability. "Attackers scan for this" is a threat. "There is a high likelihood of unauthorised access to patient records, with severe regulatory and patient-harm impact" is a risk — it commits to both halves, which is what makes it actionable and prioritisable against other risks.',
      },
      {
        id: 'p2-l2-s2',
        title: 'Concept — Inherent, residual, and the honest part',
        body: 'Inherent risk is the level before controls. Residual risk is what remains after them. Residual risk is never zero, and a risk register that claims otherwise is not being honest. The professional skill is stating residual risk as a specific failure mode — "two approvers could collude", "an attacker could steal an authenticated session" — rather than as a vague admission that some risk remains.',
      },
      {
        id: 'p2-l2-s3',
        title: 'Concept — The four treatments',
        body: 'Mitigate: apply controls to reduce likelihood or impact. Transfer: move the financial consequence elsewhere, typically insurance or a contract. Avoid: stop doing the activity entirely. Accept: acknowledge the risk and formally choose to live with it. Accept is a legitimate decision when it is documented and made by someone with the authority to make it — an undocumented shrug is not acceptance, it is negligence.',
      },
      {
        id: 'p2-l2-s4',
        title: 'Example — Northwind, assessed twice',
        body: 'Inherent: unpatched internet-facing VPN, published advisory, health records behind it. Likelihood high, impact severe, inherent risk HIGH. Apply controls: patch the firmware, enforce MFA. Reassess: likelihood drops sharply, impact is unchanged because the records are still what they are. Residual risk MODERATE, driven by unknown future flaws and session theft. Treatment: mitigate. Note impact rarely moves — controls usually attack likelihood.',
      },
      {
        id: 'p2-l2-s5',
        title: 'Scenario — When avoidance is the wrong answer',
        body: 'Northwind could decommission the VPN and require everyone on site. Risk eliminated. Also: the business stops functioning as it needs to. Risk treatment has to remain compatible with what the organisation actually does — a recommendation the business cannot accept is a recommendation that will be ignored, which leaves you with the original risk and less credibility.',
      },
      {
        id: 'p2-l2-s6',
        title: 'Review — What must stick',
        body: 'Threat is theirs, vulnerability is yours, exploit is the technique, risk is likelihood times impact. Assess twice: inherent, then residual. Residual is never zero and should be named as a specific failure mode. Four treatments: mitigate, transfer, avoid, accept — and accept must be documented and authorised.',
      },
    ],
    quiz: [
      {
        id: 'p2-q8',
        type: 'mcq',
        stem: 'A vendor publishes an advisory for an authentication bypass in a firmware version you are running. In risk terms, what is the unpatched firmware?',
        options: ['A threat', 'A vulnerability', 'An exploit', 'A risk'],
        answer: 1,
        explanation:
          'The unpatched firmware is the weakness — the vulnerability. The attacker scanning for it is the threat; the code that abuses it is the exploit; the combination of likelihood and impact is the risk.',
        examClue:
          'Ask "is this mine to fix?" If yes, it is a vulnerability. If it exists regardless of your actions, it is a threat.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'vulnerability',
      },
      {
        id: 'p2-q9',
        type: 'mcq',
        stem: 'Which statement is a properly formed risk statement?',
        options: [
          'The VPN appliance is running outdated firmware',
          'Attackers routinely scan the internet for vulnerable VPN appliances',
          'There is a high likelihood of unauthorised access to patient records, with severe regulatory and patient-harm impact',
          'The organisation should patch the VPN appliance immediately',
        ],
        answer: 2,
        explanation:
          'Only the third names both likelihood and impact. The first is a vulnerability, the second a threat, and the fourth a recommended control.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'risk',
      },
      {
        id: 'p2-q10',
        type: 'scenario',
        stem: 'After patching and enabling MFA, an assessment records the remaining exposure as "an attacker who steals an already-authenticated session token". What is this?',
        options: ['Inherent risk', 'Residual risk', 'A compensating control', 'Risk transfer'],
        answer: 1,
        explanation:
          'Residual risk is what remains after controls are applied. Stating it as a specific failure mode, rather than as a vague remainder, is what makes the assessment useful.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'residual-risk',
      },
      {
        id: 'p2-q11',
        type: 'mcq',
        stem: 'An organisation buys cyber insurance covering breach notification costs. Which risk treatment is this?',
        options: ['Mitigate', 'Transfer', 'Avoid', 'Accept'],
        answer: 1,
        explanation:
          'Insurance moves the financial consequence to another party. It does not reduce likelihood or impact to the organisation operationally, which is why transfer is never a substitute for controls.',
        examClue:
          'Insurance and contractual indemnity are always transfer. Stopping the activity is avoid.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'risk',
      },
    ],
  },

  {
    id: 'p2-lesson-3',
    phaseId: 'phase-2',
    title: 'Security Controls and Their Two Axes',
    objectives: [
      'Classify a control by function: preventive, detective, or corrective',
      'Classify a control by type: physical, technical, or administrative',
      'Explain deterrent and compensating controls and where they fit',
      'Classify any described control on both axes',
    ],
    concepts: ['controls', 'control-function', 'control-type'],
    homework:
      'Pick three controls protecting something you own and place each one on both axes: preventive/detective/corrective, and physical/technical/administrative. Note any you find hard to place, and why.',
    careerConnection:
      'Audit and GRC work is largely control classification. When an auditor asks "what detective controls cover this risk", the question is literally this taxonomy.',
    sections: [
      {
        id: 'p2-l3-s0',
        title: 'Concept — Two independent axes',
        body: 'Every control answers two separate questions. What does it DO: preventive stops the event, detective identifies that it happened, corrective restores afterwards. HOW is it implemented: physical is a barrier in the world, technical is implemented in software or hardware, administrative is a policy or process carried out by people. The axes are independent — a door badge reader and a firewall rule are both preventive and differ only on the second axis.',
      },
      {
        id: 'p2-l3-s1',
        title: 'Concept — Function: preventive, detective, corrective',
        body: 'Preventive acts before: firewall deny rules, MFA, badge readers, awareness training. Detective acts during or after: SIEM alerts, CCTV, access reviews, log monitoring. Corrective acts after, to restore: backup restoration, incident response plans, patching a live flaw. Classify by behaviour in the moment, not by product category — an alert that also auto-blocks is both preventive and detective.',
      },
      {
        id: 'p2-l3-s2',
        title: 'Concept — Type: physical, technical, administrative',
        body: 'Physical controls are tangible: locks, fences, guards, cameras, cable locks. Technical controls (sometimes called logical) live in systems: encryption, ACLs, firewalls, MFA. Administrative controls are the human layer: policies, procedures, training, background checks, access reviews. Candidates who look only for technical controls misclassify roughly half the scenarios on the exam.',
      },
      {
        id: 'p2-l3-s3',
        title: 'Concept — Deterrent and compensating',
        body: 'Two more categories sit alongside rather than replacing the three functions. Deterrent discourages the actor from attempting: warning signage, visible cameras, a published disciplinary policy. Compensating is chosen as a substitute when the primary control is not feasible: a warm site instead of a hot site, extra monitoring where segmentation is not yet possible. Compensating describes WHY the control was selected, not what it does.',
      },
      {
        id: 'p2-l3-s4',
        title: 'Example — Backups, the classic misclassification',
        body: 'Backups feel protective, so learners call them preventive. They prevent nothing whatsoever — a backup does not stop ransomware from encrypting anything. It restores the system afterwards, which is the definition of corrective. If you remember one classification from this phase, make it this one; it appears on almost every practice exam.',
      },
      {
        id: 'p2-l3-s5',
        title: 'Scenario — Classifying a mixed set',
        body: 'Security awareness training: preventive, administrative. CCTV recording: detective, physical. Automated backup restore: corrective, technical. Quarterly access review: detective, administrative. Door badge reader: preventive, physical. Firewall deny rule: preventive, technical. Work across both axes every time; naming only one is half an answer.',
      },
      {
        id: 'p2-l3-s6',
        title: 'Review — What must stick',
        body: 'Function: preventive stops, detective spots, corrective restores. Type: physical is tangible, technical is in systems, administrative is people and process. Deterrent discourages; compensating substitutes. Backups are corrective. Always answer on both axes.',
      },
    ],
    quiz: [
      {
        id: 'p2-q12',
        type: 'mcq',
        stem: 'How is an automated backup restore process classified?',
        options: [
          'Preventive, technical',
          'Corrective, technical',
          'Detective, administrative',
          'Preventive, administrative',
        ],
        answer: 1,
        explanation:
          'A backup prevents nothing — it restores the system after an incident, which is corrective. It is implemented in software, making it technical. This is the most commonly misclassified control on the exam.',
        examClue:
          'Ask what the control does at the moment of the incident. If it acts afterwards to restore, it is corrective.',
        domain: 'General Security Concepts',
        conceptId: 'control-function',
      },
      {
        id: 'p2-q13',
        type: 'mcq',
        stem: 'A quarterly user access review is which type of control?',
        options: [
          'Detective, administrative',
          'Preventive, technical',
          'Corrective, physical',
          'Detective, technical',
        ],
        answer: 0,
        explanation:
          'The review identifies inappropriate access that already exists, which is detective. It is a process carried out by people, making it administrative rather than technical.',
        domain: 'General Security Concepts',
        conceptId: 'control-type',
      },
      {
        id: 'p2-q14',
        type: 'scenario',
        stem: 'An organisation cannot segment a legacy network this year, so it deploys additional monitoring on that segment instead. What is the additional monitoring?',
        options: [
          'A deterrent control',
          'A compensating control',
          'A preventive control',
          'Risk avoidance',
        ],
        answer: 1,
        explanation:
          'It was selected specifically as a substitute because the primary control (segmentation) is not currently feasible. That is what compensating means — it describes why the control was chosen, not what it does.',
        domain: 'General Security Concepts',
        conceptId: 'controls',
      },
      {
        id: 'p2-q15',
        type: 'mcq',
        stem: 'Visible warning signage stating that premises are monitored is best classified as which control function?',
        options: ['Preventive', 'Detective', 'Deterrent', 'Corrective'],
        answer: 2,
        explanation:
          'The sign itself stops nothing and detects nothing. Its purpose is to discourage the actor from attempting, which is a deterrent. The camera it advertises is the detective control.',
        domain: 'General Security Concepts',
        conceptId: 'control-function',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p2-lab-0',
    phaseId: 'phase-2',
    title: 'Classify the Control Inventory',
    objective:
      'Classify every control in a reference inventory on both axes, and correct the three most commonly misclassified entries.',
    securityConcepts: [
      'Control function',
      'Control type',
      'Compensating controls',
      'Deterrent controls',
    ],
    environment: 'Deterministic simulator — prepared reference artifacts, nothing is executed',
    topology: 'Northwind reference control inventory (12 controls)',
    prerequisites: ['Complete Phase 1'],
    steps: [
      {
        id: 's0',
        instruction: 'Retrieve the control inventory.',
        command: 'list controls',
        expected: '12 controls, each with a function and a type.',
      },
      {
        id: 's1',
        instruction: 'Check your classification of the SIEM correlation alert.',
        command: 'classify control c-04',
        expected: 'Detective, technical — with the reasoning and the common confusion.',
      },
      {
        id: 's2',
        instruction: 'Check the backup restore — the most misclassified control on the exam.',
        command: 'classify control c-05',
        expected: 'Corrective, technical. Backups prevent nothing.',
      },
      {
        id: 's3',
        instruction: 'Check the warm site failover and note why it is compensating.',
        command: 'classify control c-12',
        expected: 'Compensating, technical — chosen as a substitute for a hot site.',
      },
    ],
    expectedResults: [
      'All 12 controls classified on both axes',
      'Backup restore correctly identified as corrective',
      'Compensating distinguished from corrective',
      'Deterrent distinguished from preventive',
    ],
    verification: [
      'Learner can classify any control on both axes',
      'Learner can explain why backups are corrective rather than preventive',
      'Learner can explain what makes a control compensating',
    ],
    troubleshooting: [
      'Unsure of function → ask what the control does at the moment of the incident: stop it, spot it, or repair it.',
      'Unsure of type → ask who or what enforces it: a barrier, a system, or a person following a process.',
      'Compensating vs corrective → compensating is about why the control was chosen; corrective is about what it does.',
    ],
    challenge:
      'Pick three controls from your own environment — home or work — and classify each on both axes. Then find one control you would call compensating and justify what primary control it substitutes for.',
    evidence: [
      {
        id: 'ev0',
        label: 'Control classification table',
        type: 'report',
        placeholder: 'Control | Function | Type | Reasoning',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Auditors and risk registers speak in this taxonomy. "What detective controls cover this risk?" is a question you cannot answer without it, and answering on only one axis is answering half the question.',
  },

  {
    id: 'p2-lab-1',
    phaseId: 'phase-2',
    title: 'Map Defence in Depth to a Real Asset',
    objective:
      'Trace the layers protecting a specific asset, identify what still stands when each layer fails, and reduce the attack surface of one host.',
    securityConcepts: ['Defence in depth', 'Attack surface', 'Layer independence', 'Zero Trust'],
    environment: 'Deterministic simulator — prepared reference artifacts, nothing is executed',
    topology: 'Seven layers from policy to data, protecting the patient records asset',
    prerequisites: ['Complete "Classify the Control Inventory"'],
    steps: [
      {
        id: 's0',
        instruction: 'List the defence layers protecting the asset.',
        command: 'show defense layers',
        expected: 'Seven layers from policy to data, each with an example control.',
      },
      {
        id: 's1',
        instruction: 'Enumerate the attack surface of the Linux server.',
        command: 'show attack surface srv-01',
        expected: 'Two reachable services, one loopback-only, three non-network surface items.',
      },
      {
        id: 's2',
        instruction: 'Confirm the loopback binding that removed one service from the surface.',
        command: 'ss -tulpn',
        expected: 'postgres bound to 127.0.0.1 only.',
      },
      {
        id: 's3',
        instruction: 'Confirm the least-privilege grant on the same host.',
        command: 'sudo -l',
        expected: 'One scoped command rather than blanket root.',
      },
      {
        id: 's4',
        instruction: 'Walk the network layers the traffic actually crosses.',
        command: 'trace connection ws-01 srv-01',
        expected: 'Nine steps; the firewall and switch layers are visible in the path.',
      },
    ],
    expectedResults: [
      'Seven defence layers identified with an example control each',
      'Attack surface enumerated beyond open ports',
      'Least privilege and surface reduction observed in real output',
      'Network layers cross-referenced against the Phase 1 connection path',
    ],
    verification: [
      'Learner can name what still protects the asset when the perimeter fails',
      'Learner can name three non-port items in the attack surface',
      'Learner can explain why layer independence matters',
    ],
    troubleshooting: [
      'Layers feel abstract → anchor each one to a control you have already seen in command output.',
      'Confusing defence in depth with Zero Trust → depth is about layering; Zero Trust is about refusing to trust location.',
    ],
    challenge:
      'The perimeter firewall is bypassed. Walk the remaining six layers and state, for each, whether it still stands and what specifically it would do. Then name two layers in this list that are NOT independent of each other, and explain why that weakens the stack.',
    evidence: [
      {
        id: 'ev0',
        label: 'Layer analysis',
        type: 'report',
        placeholder: 'Layer, control, still standing after perimeter failure, what it does',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Layers only count when they fail independently. Two controls that share a root cause — the same credential, the same appliance, the same admin — are one layer wearing two hats, and a stack built from them is thinner than it looks.',
  },

  {
    id: 'p2-lab-2',
    phaseId: 'phase-2',
    title: 'Run a Full Risk Assessment',
    objective:
      'Produce a complete risk assessment for a business scenario: asset, threat, vulnerability, inherent risk, control, residual risk, and treatment.',
    securityConcepts: [
      'Risk assessment',
      'Inherent vs residual risk',
      'Risk treatment',
      'Likelihood and impact',
    ],
    environment: 'Deterministic simulator plus the interactive Risk Scenario Workbench',
    topology: 'Northwind Clinic — internet-facing VPN appliance fronting patient records',
    prerequisites: ['Complete "Map Defence in Depth to a Real Asset"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review a worked risk assessment end to end.',
        command: 'assess risk northwind-vpn',
        expected:
          'Asset, threat, vulnerability, likelihood, impact, inherent and residual risk, treatment.',
      },
      {
        id: 's1',
        instruction:
          'Open the Risk Scenario Workbench and complete scenario 1, "The unpatched remote access appliance". Place all six fields before submitting.',
        expected: 'Six fields graded, with a rationale for each and a debrief.',
      },
      {
        id: 's2',
        instruction: 'Complete scenario 2, "The finance department wire transfer".',
        expected: 'A scenario whose vulnerability and controls are entirely administrative.',
      },
      {
        id: 's3',
        instruction: 'Complete scenario 3, "The shared administrator account".',
        expected: 'An AAA failure where non-repudiation is impossible by design.',
      },
    ],
    expectedResults: [
      'A worked assessment reviewed in full',
      'All three scenarios completed with every field placed',
      'Threat correctly separated from vulnerability in each',
      'Residual risk stated as a specific failure mode',
    ],
    verification: [
      'Learner can state a risk as likelihood combined with impact',
      'Learner can distinguish inherent from residual risk',
      'Learner can name the four treatment options and justify a choice',
    ],
    troubleshooting: [
      'Confusing threat with vulnerability → ask "is this mine to fix?" If yes, it is a vulnerability.',
      'Residual risk feels like guessing → name the specific way the chosen control can still fail.',
      'Option already greyed out → it is assigned to another field. The pool is shared on purpose.',
    ],
    challenge:
      'Write a risk assessment for a system you actually use, in the same seven-part structure. State the residual risk as a concrete failure mode, then pick a treatment and justify why the other three are wrong for your situation.',
    evidence: [
      {
        id: 'ev0',
        label: 'Risk assessment',
        type: 'report',
        placeholder:
          'Asset, threat, vulnerability, likelihood, impact, control, residual risk, treatment',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A finding written as "the server is vulnerable" gets ignored. The same finding written as likelihood, impact, control, and residual risk gets funded. The vocabulary is not academic — it is how security work gets prioritised against everything else the business wants to spend money on.',
  },
];

export const PHASE_2: Phase = {
  id: 'phase-2',
  number: 2,
  title: 'Security Fundamentals',
  description:
    'The vocabulary every later phase reuses: CIA, AAA, the security principles, the language of risk, and the control taxonomy. Precision here is what separates a finding that gets funded from one that gets ignored.',
  examDomain: 'General Security Concepts',
  scene: 'controls',
  lessons: LESSONS,
  labs: LABS,
};
