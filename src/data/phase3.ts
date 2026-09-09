import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 3 — Threats, Vulnerabilities & Attacks
// Aligned with CompTIA Security+ SY0-701 (Domain 2.0, the largest at 22%)
//
// CONTENT SAFETY: this phase teaches recognition and defence. Every attack is
// described by the evidence it leaves and the control that catches it. No
// working malicious technique, tooling, or credential-handling code appears.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p3-lesson-0',
    phaseId: 'phase-3',
    title: 'Malware — Classifying by Propagation and Behaviour',
    objectives: [
      'Distinguish virus, worm, and trojan by how each one spreads',
      'Explain ransomware, spyware, rootkits, and botnets by behaviour',
      'Identify a malware family from telemetry rather than from a file name',
      'Explain why living-off-the-land attacks leave no file to find',
    ],
    concepts: ['malware-types', 'ransomware', 'rootkit', 'botnet', 'lolbins'],
    homework:
      'Build a table of the malware types in this lesson with one column for how it spreads and one for what it does. Then explain why a single sample can occupy two rows at once.',
    careerConnection:
      'SOC Analyst — alerts name a behaviour, not a family. Being able to say "this is worm-like propagation" from the telemetry is what turns an alert into a triage decision.',
    sections: [
      {
        id: 'p3-l0-s0',
        title: 'Concept — Classify by how it spreads',
        body: 'Three families are defined by propagation. A virus attaches to a host file and needs a user to run it. A worm spreads across the network by itself, needing no user action at all — that single difference is what makes worms so much faster and so much louder in network telemetry. A trojan spreads by disguise: the user installs it willingly because it appears to be something legitimate. If an exam question turns on virus versus worm, the deciding question is always "does it need a user to act?".',
      },
      {
        id: 'p3-l0-s1',
        title: 'Concept — Classify by what it does',
        body: 'The other families are defined by behaviour rather than spread. Ransomware encrypts and extorts. Spyware observes and exfiltrates quietly. A rootkit hides the attacker presence by subverting the tools you would use to look. A botnet places the host under remote control alongside many others. Any of these can arrive by any delivery method, which is why ransomware shows up in every row of a propagation table — it is a payload, not a delivery mechanism.',
      },
      {
        id: 'p3-l0-s2',
        title: 'Concept — Ransomware and double extortion',
        body: 'Classic ransomware attacked availability: your files are encrypted and you cannot reach them. Modern ransomware exfiltrates first and encrypts second, which means confidentiality is lost too. This changes the answer to "do we have backups?" — restoring gets you working again but does nothing about the copy the attacker took. Note the ordering in real telemetry: shadow copies are deleted before encryption begins, because removing your recovery is the first priority.',
      },
      {
        id: 'p3-l0-s3',
        title: 'Concept — Why rootkits need a different detection method',
        body: 'A rootkit compromises the reporting layer. Run ps or Task Manager on a rootkitted host and the hidden process is simply absent from the output — the tool is telling you the truth as it sees it, and its view has been edited. This means a clean live listing proves nothing at all. Detection requires a vantage point the rootkit does not control: offline disk analysis, memory forensics, or a trusted boot measurement, and the finding is a discrepancy between two views.',
      },
      {
        id: 'p3-l0-s4',
        title: 'Example — Living off the land',
        body: 'The incident running through this platform used no malware file whatsoever. The attacker ran PowerShell — a signed, legitimate, pre-installed Microsoft tool — to open an outbound session. There is no binary for antivirus to match against a signature, because nothing malicious was ever written to disk. Detection has to move to behaviour: an interactive PowerShell process holding a long-lived outbound TLS session at a regular interval is anomalous regardless of the fact that PowerShell itself is legitimate.',
      },
      {
        id: 'p3-l0-s5',
        title: 'Scenario — Reading telemetry rather than names',
        body: 'You are handed a host showing: a legitimate archiving utility launched, shadow copies enumerated then deleted, a file rename rate of four thousand per minute, and an outbound connection midway through. No file name in that list is suspicious. The behaviour sequence is unmistakable, and it is the sequence you are being asked to recognise — deleting recovery before encrypting is not something legitimate software does.',
      },
      {
        id: 'p3-l0-s6',
        title: 'Review — What must stick',
        body: 'Virus needs a user and a host file; worm needs neither; trojan needs a disguise. Ransomware, spyware, rootkit, and botnet are behaviours any delivery can carry. Modern ransomware exfiltrates before encrypting, so backups no longer end the incident. Rootkits require an external vantage point. Living off the land means no file to find, so detection is behavioural.',
      },
    ],
    quiz: [
      {
        id: 'p3-q0',
        type: 'mcq',
        stem: 'Malicious code spreads across a network segment without any user opening a file or clicking anything. What is it?',
        options: ['A virus', 'A worm', 'A trojan', 'Spyware'],
        answer: 1,
        explanation:
          'Self-propagation with no user action is the defining property of a worm. A virus requires a user to run an infected host file; a trojan requires the user to install it believing it is legitimate.',
        examClue:
          'For virus versus worm, the only question that matters is whether a user had to do something.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'malware-types',
      },
      {
        id: 'p3-q1',
        type: 'scenario',
        stem: 'Ransomware telemetry shows shadow copies deleted at T+00:05 and encryption beginning at T+00:06. Why does the attacker do these in that order?',
        options: [
          'Deleting shadow copies is required before files can be encrypted',
          "It removes the victim's recovery option before they can use it",
          'Shadow copies would slow the encryption process',
          'It is an artefact of how the operating system schedules disk writes',
        ],
        answer: 1,
        explanation:
          'Removing recovery first maximises pressure to pay. Encryption does not technically require it — the ordering is a coercion decision, and it is exactly why offline or immutable backups matter more than any on-host copy.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'ransomware',
      },
      {
        id: 'p3-q2',
        type: 'scenario',
        stem: 'A host is suspected of running a rootkit. ps aux shows nothing unusual. What should you conclude?',
        options: [
          'The host is clean, since the process listing is authoritative',
          'Nothing — a rootkit subverts the tools that would report it, so a clean listing is not evidence of absence',
          'The rootkit must have removed itself',
          'ps aux is the wrong command; tasklist would show it',
        ],
        answer: 1,
        explanation:
          'A rootkit compromises the reporting layer, so the live view cannot be trusted to describe itself. Confirmation requires a vantage point outside the rootkit control — offline disk analysis or memory forensics.',
        examClue:
          'Whenever a question implies a tool is reporting on a system that may control that tool, distrust the report.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'rootkit',
      },
      {
        id: 'p3-q3',
        type: 'mcq',
        stem: 'An attacker uses only PowerShell, a signed Microsoft utility, to establish command and control. Why does signature-based antivirus miss this?',
        options: [
          'PowerShell encrypts its own traffic so antivirus cannot read it',
          'No malicious file was written, so there is no signature to match',
          'Antivirus does not scan Microsoft-signed binaries at all',
          'PowerShell runs in kernel mode, outside antivirus visibility',
        ],
        answer: 1,
        explanation:
          'Living off the land uses tools already present and trusted. Signature detection needs a file to match; behavioural detection is required instead — an interactive shell beaconing outbound is anomalous even though the binary is legitimate.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'lolbins',
      },
    ],
  },

  {
    id: 'p3-lesson-1',
    phaseId: 'phase-3',
    title: 'Social Engineering and the Phishing Family',
    objectives: [
      'Distinguish phishing, spear phishing, whaling, smishing, and vishing',
      'Name the psychological principles social engineering exploits',
      'Identify phishing indicators in real message headers',
      'Explain why a valid TLS certificate proves nothing about trustworthiness',
    ],
    concepts: ['phishing', 'social-engineering', 'spear-phishing', 'phishing-indicators'],
    homework:
      'Find a phishing email in your own spam folder and write down the specific pressure technique it uses, the lookalike detail in the sender address, and what it wanted you to do. Do not click anything.',
    careerConnection:
      'Phishing triage is the single most common ticket a junior SOC analyst handles. Being able to read headers and articulate the indicators is a day-one job skill.',
    sections: [
      {
        id: 'p3-l1-s0',
        title: 'Concept — The family, by channel and targeting',
        body: 'Phishing is bulk and untargeted. Spear phishing targets a named person or team and uses real organisational detail to be convincing. Whaling targets a senior executive, usually to authorise a payment or approval. Smishing arrives by SMS and vishing by voice call. Two axes again: the channel names the technique, the targeting names the intensity. Smishing and vishing are the hardest to investigate because neither leaves a header you can analyse.',
      },
      {
        id: 'p3-l1-s1',
        title: 'Concept — What social engineering actually exploits',
        body: 'These attacks work on well-documented psychological principles: authority (the message appears to come from IT or a director), urgency (act within two hours), scarcity, familiarity, social proof, and fear. Notice that none of these is a failure of intelligence. Treating a click as a user failing is both unkind and useless — it produces no control improvement. Assuming someone will always eventually click produces several.',
      },
      {
        id: 'p3-l1-s2',
        title: 'Concept — Reading the headers',
        body: 'Email authentication gives you three checks. SPF asks whether the sending IP is permitted for that domain. DKIM asks whether the message is cryptographically signed and unmodified. DMARC ties those to the visible From address and states what to do on failure. A message with SPF softfail, no DKIM, and DMARC p=NONE is telling you plainly that nobody has vouched for it. Then check whether Reply-To differs from From, and how old the sending domain is.',
      },
      {
        id: 'p3-l1-s3',
        title: 'Concept — The padlock means almost nothing',
        body: 'A free domain-validated TLS certificate is issued in minutes to whoever controls the domain. It proves the connection is encrypted and the domain is what it claims — it says nothing about whether the domain is trustworthy. Teaching users to "look for the padlock" is actively harmful, because attackers always have one. What genuinely helps: check the domain itself, and notice when the password manager does not offer to autofill, because the manager is comparing origins and you are not.',
      },
      {
        id: 'p3-l1-s4',
        title: 'Example — Five indicators in one header block',
        body: 'The lab sample shows: SPF softfail, no DKIM signature, DMARC policy none, a Reply-To on a completely different domain from the From, and a sending domain registered four days ago. The subject line supplies urgency and authority together. Any one of these is worth a second look; five together is a conclusion, and you can state it with evidence rather than a hunch.',
      },
      {
        id: 'p3-l1-s5',
        title: 'Scenario — Which control would actually have stopped it?',
        body: 'Awareness training reduces click rate but never to zero. Mail filtering catches most but not all. The control that defeats this specific chain is phishing-resistant MFA using FIDO2 or WebAuthn, because the authenticator cryptographically binds to the real origin and simply will not respond to the lookalike domain. The user can click, and can even type their password, and the attack still fails.',
      },
      {
        id: 'p3-l1-s6',
        title: 'Review — What must stick',
        body: 'Channel names the technique: email, SMS, voice. Targeting names the intensity: bulk, individual, executive. Social engineering exploits authority, urgency, scarcity, familiarity, social proof, and fear. Read SPF, DKIM, DMARC, Reply-To, and domain age. The padlock proves encryption, not honesty. Phishing-resistant MFA is the control that ends this chain.',
      },
    ],
    quiz: [
      {
        id: 'p3-q4',
        type: 'mcq',
        stem: 'An email targets one named analyst and references SRV-01, a system that genuinely exists in their organisation. Which attack is this?',
        options: ['Phishing', 'Spear phishing', 'Whaling', 'Smishing'],
        answer: 1,
        explanation:
          'Targeting a specific individual using accurate internal detail is spear phishing. Bulk untargeted messaging is phishing; targeting a senior executive is whaling; SMS delivery is smishing.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'spear-phishing',
      },
      {
        id: 'p3-q5',
        type: 'scenario',
        stem: 'A phishing site presents a valid TLS certificate and a padlock in the address bar. What does this establish?',
        options: [
          'The site is operated by the organisation it appears to represent',
          'Only that the connection is encrypted and the domain controls itself — nothing about trustworthiness',
          'That the site has passed a security review',
          'That the site cannot capture submitted data',
        ],
        answer: 1,
        explanation:
          'Domain-validated certificates are free and issued in minutes to anyone controlling the domain. Encryption protects the data in transit — including data in transit to an attacker.',
        examClue:
          'Any option treating a certificate as proof of legitimacy is wrong. Certificates prove control of a name, not honesty.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'phishing-indicators',
      },
      {
        id: 'p3-q6',
        type: 'mcq',
        stem: 'Which control most reliably defeats a credential-phishing chain even when the user clicks and submits their password?',
        options: [
          'Annual security awareness training',
          'SMS one-time passcodes',
          'Phishing-resistant MFA using FIDO2/WebAuthn',
          'A longer minimum password length',
        ],
        answer: 2,
        explanation:
          'FIDO2/WebAuthn binds the authentication cryptographically to the real origin, so the authenticator will not respond to a lookalike domain. SMS codes can be relayed by the attacker in real time; training and password length do not address the capture at all.',
        domain: 'Security Architecture',
        conceptId: 'phishing',
      },
      {
        id: 'p3-q7',
        type: 'pbq',
        stem: 'Order these header checks from strongest indicator to weakest for the lab sample: [0] Reply-To differs from From, [1] Sending domain registered 4 days ago, [2] Subject conveys urgency.',
        options: [
          'Sending domain registered 4 days ago',
          'Reply-To differs from From',
          'Subject conveys urgency',
        ],
        answer: [0, 1, 2],
        explanation:
          'Domain age is the hardest to fake and the most decisive — legitimate corporate senders do not use four-day-old domains. A Reply-To mismatch is strong but has occasional legitimate uses. Urgent phrasing is the weakest, because plenty of legitimate mail is urgent.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'phishing-indicators',
      },
    ],
  },

  {
    id: 'p3-lesson-2',
    phaseId: 'phase-3',
    title: 'Password Attacks and Insider Threats',
    objectives: [
      'Distinguish brute force, password spraying, and credential stuffing from log shape',
      'Explain why account lockout defeats one of the three and not the others',
      'Describe insider threat indicators and the process constraints around them',
      'Name the control that addresses all three password attacks at once',
    ],
    concepts: [
      'password-attacks',
      'brute-force',
      'password-spraying',
      'credential-stuffing',
      'insider-threat',
    ],
    homework:
      'Explain, in writing, the difference between brute force, credential stuffing, and password spraying by describing what each one looks like in a log — attempts per account and accounts per attempt.',
    careerConnection:
      'IAM and SOC both. "Is this a spray or a stuffing campaign?" changes which detection rule you tune and which team you escalate to.',
    sections: [
      {
        id: 'p3-l2-s0',
        title: 'Concept — Three attacks, three log shapes',
        body: 'Brute force is one account hit with very many passwords from one source: loud, fast, trivially detectable. Password spraying inverts it — one common password tried against many accounts, one attempt each, deliberately slow. Credential stuffing replays username and password pairs leaked from a different breach, across many accounts from many sources, with an unusually high success rate. Read the shape: accounts, attempts per account, and number of sources.',
      },
      {
        id: 'p3-l2-s1',
        title: 'Concept — Why lockout only stops one of them',
        body: 'Account lockout triggers after N failures on a single account, so it defeats brute force outright. Password spraying never trips it, because no individual account sees a second failure — a per-account threshold is structurally blind to the attack. Detecting spraying requires correlating failures across accounts by source address and time window. This is the clearest case in the whole syllabus of a control that looks comprehensive and is not.',
      },
      {
        id: 'p3-l2-s2',
        title: 'Concept — Credential stuffing is a password-reuse problem',
        body: 'Stuffing works only because people reuse passwords across services. The attacker is not guessing at all; they are replaying pairs that are known to be valid somewhere. The distributed sources defeat IP-based blocking and the high success rate is the giveaway. The control that actually addresses the root cause is checking new passwords against a breach corpus at the moment they are set, so a known-leaked password can never be chosen.',
      },
      {
        id: 'p3-l2-s3',
        title: 'Concept — Insider threat',
        body: 'The insider is the category no perimeter control addresses, because the access is legitimate. There is no exploit to find — only a pattern of use that does not match the role: records accessed far outside job function, bulk export outside working hours with no change ticket, repeated probing of restricted shares. Note that these are indicators, not proof. Insider investigations concern a real person and follow defined HR and legal process; an analyst acting alone on suspicion causes genuine harm.',
      },
      {
        id: 'p3-l2-s4',
        title: 'Example — Spotting a spray in the logs',
        body: 'At 02:14 the log shows a 4625 failure for ahmed.k, then bfernandez, then c.owusu, each roughly thirty seconds apart, all from one source. Three hundred and twelve accounts, one attempt each. No lockout fires anywhere, because no account has a second failure. Then a single 4624 success. Any per-account alert would have stayed silent through the entire campaign.',
      },
      {
        id: 'p3-l2-s5',
        title: 'Scenario — One control, three attacks',
        body: 'Multi-factor authentication defeats all three, because a password alone stops being sufficient to authenticate. Phishing-resistant MFA is stronger still, since SMS or push codes can be relayed by an attacker in real time. When an exam question offers a single control against multiple credential attacks, MFA is very often the intended answer.',
      },
      {
        id: 'p3-l2-s6',
        title: 'Review — What must stick',
        body: 'Brute force: one account, many attempts, one source, beaten by lockout. Spraying: many accounts, one attempt each, slow, beaten by cross-account correlation. Stuffing: many accounts, many sources, high success, beaten by breach-corpus checks. Insiders hold legitimate access, so detection is behavioural and the process is HR-led. MFA addresses all three password attacks.',
      },
    ],
    quiz: [
      {
        id: 'p3-q8',
        type: 'scenario',
        stem: 'Logs show 312 accounts each receiving exactly one failed logon from a single source, roughly 32 seconds apart, overnight. Which attack is this?',
        options: ['Brute force', 'Password spraying', 'Credential stuffing', 'Pass-the-hash'],
        answer: 1,
        explanation:
          'Many accounts with one attempt each, slow and from one source, is password spraying. Brute force concentrates many attempts on one account; credential stuffing uses many distributed sources and shows a high success rate.',
        examClue:
          'Count accounts and attempts-per-account first. That pair alone separates all three password attacks.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'password-spraying',
      },
      {
        id: 'p3-q9',
        type: 'mcq',
        stem: 'Why does account lockout fail to stop password spraying?',
        options: [
          'Spraying attacks disable the lockout policy first',
          'No individual account accumulates enough failures to trigger the threshold',
          'Lockout policies do not apply to domain accounts',
          'Spraying uses valid passwords, so no failures are recorded',
        ],
        answer: 1,
        explanation:
          'Lockout counts failures per account. Spraying deliberately keeps each account at one attempt, so the threshold is never reached. Detection requires correlating across accounts by source.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'password-spraying',
      },
      {
        id: 'p3-q10',
        type: 'mcq',
        stem: 'Which control most directly addresses the root cause of credential stuffing?',
        options: [
          'Account lockout after three failures',
          'Blocking the attacking source IP addresses',
          'Checking new passwords against a known-breach corpus at the time they are set',
          'Increasing password expiry frequency',
        ],
        answer: 2,
        explanation:
          'Stuffing succeeds because of password reuse across services. Preventing known-leaked passwords from being chosen addresses that directly. Lockout does not fire on one attempt per account, IP blocking fails against thousands of sources, and forced expiry drives weaker passwords.',
        domain: 'Security Architecture',
        conceptId: 'credential-stuffing',
      },
      {
        id: 'p3-q11',
        type: 'scenario',
        stem: 'An employee accesses 312 customer records when their role requires around 10, and exports them at 02:40 with no change ticket. What is the correct next step?',
        options: [
          'Immediately disable the account and confront the employee',
          'Preserve the evidence and escalate through the defined HR and legal process',
          'Take no action, since the access was technically authorised',
          'Publicly flag the account in the team channel for awareness',
        ],
        answer: 1,
        explanation:
          'These are strong indicators but not proof of malice — there may be a legitimate explanation. Insider cases affect a real person and carry employment-law consequences, so they follow HR and legal process. Preserve evidence, escalate, and do not act unilaterally.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'insider-threat',
      },
    ],
  },

  {
    id: 'p3-lesson-3',
    phaseId: 'phase-3',
    title: 'Attack Categories Across the Estate',
    objectives: [
      'Name representative attacks for web, network, wireless, and application targets',
      'Explain what makes cloud and IoT attacks characteristically different',
      'Describe a supply-chain attack and why perimeter controls do not see it',
      'Match each attack category to its characteristic defence',
    ],
    concepts: [
      'web-attacks',
      'network-attacks',
      'wireless-attacks',
      'cloud-attacks',
      'iot-attacks',
      'supply-chain',
    ],
    homework:
      'Pick one attack category from this lesson and name the control that would detect it and the separate control that would prevent it. Note when the two are the same control and when they are not.',
    careerConnection:
      'Breadth question territory. Interviews and the exam both sample across these categories, and the expected answer is usually the unglamorous one.',
    sections: [
      {
        id: 'p3-l3-s0',
        title: 'Concept — Web and application attacks',
        body: 'Web attacks target the application logic reachable over HTTP. SQL injection sends input that the application concatenates into a query, so data becomes instruction; parameterised queries fix it by keeping the two apart permanently. Cross-site scripting injects script that executes in another user browser. CSRF makes an authenticated browser issue a request the user did not intend. Lower down, application attacks like buffer overflows exploit memory handling, which is why memory-safe languages and prompt patching matter.',
      },
      {
        id: 'p3-l3-s1',
        title: 'Concept — Network and wireless attacks',
        body: 'On-path attacks (formerly called man-in-the-middle) place the attacker between two parties. ARP spoofing achieves that on a local segment by claiming another host MAC address — which is exactly why the Phase 1 lab had you check the ARP cache for duplicates. DNS poisoning redirects by corrupting name resolution. On wireless, an evil twin broadcasts a familiar SSID to harvest connections, and deauthentication frames force clients off the real network so they reconnect to the attacker.',
      },
      {
        id: 'p3-l3-s2',
        title: 'Concept — Cloud, mobile, and IoT',
        body: 'Cloud attacks are overwhelmingly misconfiguration rather than exotic exploitation: publicly readable storage, over-scoped IAM roles, exposed instance metadata services. Mobile risk concentrates on sideloaded applications and over-broad permissions. IoT is dominated by two unglamorous problems — default credentials that were never changed, and devices that cannot be patched at all. For IoT the practical answer is almost always segmentation, because you often cannot fix the device itself.',
      },
      {
        id: 'p3-l3-s3',
        title: 'Concept — Supply chain',
        body: 'A supply-chain attack compromises something you already trust: a dependency, a vendor update, a build tool. It bypasses every perimeter control because the malicious code arrives through a channel you deliberately invited in. Trust turns out to be transitive and unverified — you trusted the vendor, so you trusted everything they shipped. Defences are about verification and restriction: dependency pinning, an SBOM, signed artifacts, restricting what the build process may reach, and actually reviewing what a version bump changed.',
      },
      {
        id: 'p3-l3-s4',
        title: 'Example — The unglamorous answer is usually right',
        body: 'Asked how a cloud environment was breached, the tempting answer is a novel exploit. The overwhelmingly common answer is a storage bucket left public or a role granted far more permission than it needed. Asked how an IoT camera was compromised: default credentials. The exam reflects reality here, and reality is mostly configuration.',
      },
      {
        id: 'p3-l3-s5',
        title: 'Scenario — Mapping an attack to a defence layer',
        body: 'Take each category and place it on the Phase 2 layer stack. SQL injection lands at the application layer, so input validation is the control. ARP spoofing lands at the network layer, so segmentation and monitoring apply. Supply chain lands outside the stack altogether, arriving pre-trusted at the endpoint — which is precisely why it is so effective and why the defence has to be verification rather than filtering.',
      },
      {
        id: 'p3-l3-s6',
        title: 'Review — What must stick',
        body: 'Web: injection and scripting, fixed by validation and parameterisation. Network: on-path, ARP spoofing, DNS poisoning, addressed by segmentation and encrypted protocols. Wireless: evil twin and deauth, addressed by WPA3 and 802.1X. Cloud: misconfiguration. Mobile: sideloading and permissions. IoT: default credentials and segmentation. Supply chain: pre-trusted delivery, addressed by verification.',
      },
    ],
    quiz: [
      {
        id: 'p3-q12',
        type: 'mcq',
        stem: 'Which defence permanently prevents SQL injection rather than filtering symptoms?',
        options: [
          'Blocking requests containing the word SELECT',
          'Parameterised queries that keep data and instruction separate',
          'Rate limiting the login endpoint',
          'Renaming database tables to non-obvious names',
        ],
        answer: 1,
        explanation:
          'Injection happens when input is concatenated into a query so that data becomes instruction. Parameterisation keeps them structurally separate, so hostile input stays data. Keyword blocking is bypassable and obscurity is not a control.',
        domain: 'Security Architecture',
        conceptId: 'web-attacks',
      },
      {
        id: 'p3-q13',
        type: 'scenario',
        stem: 'Two IP addresses on a LAN resolve to the same MAC address in the ARP cache. What does this indicate?',
        options: [
          'Normal behaviour for a switched network',
          'A likely ARP spoofing or on-path attack',
          'An IPv6 configuration issue',
          'DNS cache poisoning',
        ],
        answer: 1,
        explanation:
          'One MAC claiming multiple IPs is the classic ARP spoofing signature, used to place an attacker on-path. This is why the Phase 1 network configuration lab had you check the ARP cache for duplicates.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'network-attacks',
      },
      {
        id: 'p3-q14',
        type: 'mcq',
        stem: 'What is the most common root cause of cloud data exposure incidents?',
        options: [
          'Novel zero-day exploits in the cloud provider hypervisor',
          'Misconfiguration such as public storage or over-scoped IAM roles',
          'Physical compromise of the provider data centre',
          'Weaknesses in TLS between regions',
        ],
        answer: 1,
        explanation:
          'Cloud incidents are dominated by configuration error, not exploitation. Under the shared responsibility model the provider secures the infrastructure; configuring access correctly remains the customer job.',
        examClue:
          'On cloud questions, prefer the configuration answer over the exotic exploit answer.',
        domain: 'Security Architecture',
        conceptId: 'cloud-attacks',
      },
      {
        id: 'p3-q15',
        type: 'scenario',
        stem: 'A routine dependency update pulls a package version containing a post-install script that contacts an external host during the build. Which attack category is this, and why did perimeter controls not stop it?',
        options: [
          'A worm; perimeter controls do not inspect internal traffic',
          'A supply-chain attack; the code arrived through a trusted channel the organisation deliberately uses',
          'An insider threat; a developer must have introduced it',
          'A web attack; the build server was exploited over HTTP',
        ],
        answer: 1,
        explanation:
          'Supply-chain attacks compromise something already trusted. The perimeter permitted the download because fetching dependencies is expected behaviour. Defences are verification-based: pinning, SBOM, signing, and restricting build-time egress.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'supply-chain',
      },
    ],
  },

  {
    id: 'p3-lesson-4',
    phaseId: 'phase-3',
    title: 'The Attack Chain — Putting It Together',
    objectives: [
      'Walk a spear-phishing chain from delivery to command and control',
      'Name the evidence each stage produces and where it is stored',
      'Identify the earliest stage at which the chain could have been broken',
      'Explain why correlation across sources is what produces the alert',
    ],
    concepts: ['attack-chain', 'detection-opportunity', 'correlation', 'lolbins'],
    homework:
      'Write the attack chain for the phishing example in your own words, stage by stage, and mark the single earliest stage where a control could have broken it. Justify why that stage and not a later one.',
    careerConnection:
      'This is what an incident report looks like. Being able to lay out a chain with evidence per stage is the difference between a ticket that closes and one that gets escalated back to you.',
    sections: [
      {
        id: 'p3-l4-s0',
        title: 'Concept — Attacks are chains, not events',
        body: 'A compromise is a sequence of steps, each one depending on the last. That structure is a defender advantage: you do not have to catch every step, only one of them, and the earlier the catch the cheaper the outcome. This is the same reasoning as defence in depth from Phase 2, applied along time instead of across layers.',
      },
      {
        id: 'p3-l4-s1',
        title: 'Concept — The six stages',
        body: 'Delivery: the spoofed email arrives. User action: the link is clicked. Credential capture: the lookalike page collects the password — simulated here, never implemented. Suspicious login: the attacker authenticates successfully with genuine credentials. Execution: PowerShell opens an outbound session and beacons. Alert: the SIEM correlates separate events into one incident. Six stages, and each one leaves evidence in a different system.',
      },
      {
        id: 'p3-l4-s2',
        title: 'Concept — Evidence lives in different places',
        body: 'Stage one is in the mail gateway. Stage two is in DNS and proxy logs. Stage three shows up as an absence — a credential submission with no matching legitimate login. Stage four is in the authentication log. Stage five is in endpoint process telemetry and firewall flows. Stage six is in the SIEM. No single system sees the whole attack, which is exactly why centralised logging exists.',
      },
      {
        id: 'p3-l4-s3',
        title: 'Concept — Why correlation is the point',
        body: 'Consider stage five in isolation. A DNS query for an unfamiliar domain: unremarkable, happens constantly. A PowerShell process starting: unremarkable, administrators use it daily. An outbound TLS connection: unremarkable, that is most traffic. Each event alone is noise. Joined together on the same host within the same minute, they are an incident. Correlation is not a convenience feature — it is what makes the detection possible at all.',
      },
      {
        id: 'p3-l4-s4',
        title: 'Example — The Phase 0 incident, finally explained',
        body: 'Your very first triage lab showed PowerShell PID 6644 holding a session to 203.0.113.55:443. That was stage five of six. Four stages had already happened: the email was delivered, the link was clicked, credentials were captured, and the attacker logged in successfully. Every one of them left evidence somebody could have examined. Triage found the beacon; the investigation is what reconstructs the four stages before it.',
      },
      {
        id: 'p3-l4-s5',
        title: 'Scenario — Where would you have broken it?',
        body: 'Walk the chain and name the earliest realistic intervention. DMARC enforcement would have quarantined the message at stage one. Newly-registered-domain blocking would have stopped stage two. Phishing-resistant MFA would have made stages three and four worthless. Egress filtering would have blocked stage five. Four independent opportunities, and only one of them needed to work.',
      },
      {
        id: 'p3-l4-s6',
        title: 'Review — What must stick',
        body: 'Attacks are chains; you need to break one link, not all of them. Six stages: delivery, user action, credential capture, suspicious login, execution, alert. Evidence is scattered across mail, DNS, proxy, authentication, endpoint, and network systems. Correlation turns unremarkable events into an incident. The earliest catch is always the cheapest.',
      },
    ],
    quiz: [
      {
        id: 'p3-q16',
        type: 'scenario',
        stem: 'Three events occur on one host within a minute: a DNS query for an unfamiliar domain, a PowerShell process start, and an outbound TLS connection. Individually each is unremarkable. What makes this an incident?',
        options: [
          'The DNS query alone is sufficient evidence of compromise',
          'Correlation — the combination on one host in one time window is anomalous even though each event is not',
          'PowerShell should never run on a workstation',
          'All outbound TLS connections are suspicious by default',
        ],
        answer: 1,
        explanation:
          'Each event is common in isolation. Their co-occurrence on the same host in the same window is the signal, which is why centralised logging and correlation rules exist. Blocking PowerShell or all TLS would break normal operations.',
        examClue:
          'When a question stresses that events are individually unremarkable, the answer involves correlation.',
        domain: 'Security Operations',
        conceptId: 'correlation',
      },
      {
        id: 'p3-q17',
        type: 'mcq',
        stem: 'In the six-stage chain, which intervention would have prevented the compromise at the lowest cost?',
        options: [
          'Restoring the endpoint from backup after the beacon was detected',
          'DMARC enforcement quarantining the spoofed message at delivery',
          'Rebuilding the domain controller',
          'Disabling PowerShell across the estate',
        ],
        answer: 1,
        explanation:
          'The earliest catch is the cheapest. Quarantining at delivery ends the chain before any user action. Restoration and rebuilding are post-incident recovery, and disabling PowerShell breaks legitimate administration.',
        domain: 'Security Operations',
        conceptId: 'detection-opportunity',
      },
      {
        id: 'p3-q18',
        type: 'scenario',
        stem: 'The attacker authenticated successfully using the victim genuine password. Why is this stage particularly hard to detect?',
        options: [
          'The authentication log does not record successful logins',
          'Nothing is technically broken — the credentials are valid, so only contextual signals distinguish it',
          'Successful logins are always encrypted and therefore invisible',
          'The attacker disabled logging before authenticating',
        ],
        answer: 1,
        explanation:
          'A successful login with correct credentials produces a normal success event. Detection depends on context: unfamiliar source ASN, impossible travel, unusual hour, unrecognised device. This is what conditional access policies evaluate.',
        domain: 'Security Operations',
        conceptId: 'attack-chain',
      },
      {
        id: 'p3-q19',
        type: 'pbq',
        stem: 'Order the attack chain stages: [0] Suspicious login, [1] Delivery, [2] Execution and beaconing, [3] User action, [4] Credential capture, [5] Alert and triage.',
        options: [
          'Delivery',
          'User action',
          'Credential capture',
          'Suspicious login',
          'Execution and beaconing',
          'Alert and triage',
        ],
        answer: [1, 3, 4, 0, 2, 5],
        explanation:
          'Delivery, user action, credential capture, suspicious login, execution, alert. Note that the alert comes last — detection happened after five stages had already completed, which is precisely the argument for catching the chain earlier.',
        domain: 'Security Operations',
        conceptId: 'attack-chain',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p3-lab-0',
    phaseId: 'phase-3',
    title: 'Analyse a Phishing Email',
    objective:
      'Examine a prepared spear-phishing sample, identify every indicator in the headers and URL, and state the control that would have stopped it.',
    securityConcepts: [
      'Phishing indicators',
      'SPF / DKIM / DMARC',
      'Domain age and reputation',
      'Social engineering principles',
    ],
    environment:
      'Deterministic simulator — prepared message artifacts, nothing is executed or fetched',
    topology: 'Mail gateway mx.lab.local, recipient analyst1@lab.local',
    prerequisites: ['Complete Phase 2'],
    steps: [
      {
        id: 's0',
        instruction: 'Retrieve the message headers for the reported sample.',
        command: 'show email headers phish-01',
        expected: 'SPF softfail, no DKIM, DMARC none, Reply-To mismatch, 4-day-old domain.',
      },
      {
        id: 's1',
        instruction: 'Analyse the link target and compare it against the legitimate portal.',
        command: 'analyse url srv01-portal-login.example',
        expected: 'Newly registered domain with a free DV certificate and no reputation history.',
      },
      {
        id: 's2',
        instruction: 'Classify the message against the phishing family.',
        command: 'compare phishing types',
        expected: 'Spear phishing — one named recipient, real internal system referenced.',
      },
    ],
    expectedResults: [
      'Five header indicators identified',
      'Lookalike domain compared against the legitimate portal',
      'Message correctly classified as spear phishing',
      'Controlling defence identified',
    ],
    verification: [
      'Learner can name the three email authentication checks and what each proves',
      'Learner can explain why a valid TLS certificate is not reassurance',
      'Learner can distinguish spear phishing from bulk phishing and whaling',
    ],
    troubleshooting: [
      'SPF/DKIM/DMARC unclear → SPF checks the sending IP, DKIM checks a signature, DMARC ties both to the visible From and says what to do on failure.',
      'Unsure why domain age matters → legitimate corporate senders do not operate from domains registered days ago.',
    ],
    challenge:
      'Write the triage note you would attach to this ticket: the verdict, the five indicators as evidence, the classification, and the one control you would recommend. Then explain why awareness training alone is not sufficient as that recommendation.',
    evidence: [
      {
        id: 'ev0',
        label: 'Phishing triage note',
        type: 'report',
        placeholder: 'Verdict, indicators, classification, recommended control',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Phishing triage is evidence work, not intuition. "It looked suspicious" closes no tickets; five named header indicators does. And the padlock has never meant safe — attackers get certificates in minutes.',
  },

  {
    id: 'p3-lab-1',
    phaseId: 'phase-3',
    title: 'Identify Malware from Behaviour',
    objective:
      'Classify malware families from telemetry rather than file names, and explain why one incident in this environment involved no malware file at all.',
    securityConcepts: [
      'Malware classification',
      'Ransomware behaviour',
      'Rootkit detection',
      'Living off the land',
    ],
    environment: 'Deterministic simulator — prepared telemetry, no sample is executed or supplied',
    topology: 'WS-07 (simulated ransomware telemetry), SRV-02 (simulated rootkit discrepancy)',
    prerequisites: ['Complete "Analyse a Phishing Email"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review how malware families differ by propagation and behaviour.',
        command: 'show malware behaviour',
        expected: 'Seven families with their spread mechanism and telemetry tell.',
      },
      {
        id: 's1',
        instruction: 'Read the ransomware indicator timeline and note the ordering.',
        command: 'show ransomware indicators',
        expected: 'Shadow copies deleted before encryption; exfiltration before encryption too.',
      },
      {
        id: 's2',
        instruction: 'Compare live and offline process listings on the suspected rootkit host.',
        command: 'show rootkit discrepancy',
        expected: 'PID 2290 visible offline but absent from the live listing.',
      },
      {
        id: 's3',
        instruction: 'Confirm the process behind the beacon on the Phase 0 host.',
        command: 'tasklist',
        expected: 'powershell.exe PID 6644 — a legitimate signed binary, no malware file.',
      },
    ],
    expectedResults: [
      'Families distinguished by propagation and behaviour',
      'Ransomware ordering understood: recovery removed, then exfiltration, then encryption',
      'Rootkit identified by discrepancy between two vantage points',
      'Living-off-the-land recognised as having no file to detect',
    ],
    verification: [
      'Learner can state the one question that separates a virus from a worm',
      'Learner can explain why a clean ps output does not exclude a rootkit',
      'Learner can explain why signature antivirus missed the Phase 0 incident',
    ],
    troubleshooting: [
      'Confusing ransomware with a delivery method → ransomware is a payload behaviour; any delivery can carry it.',
      'Wondering why the rootkit host looks clean → the rootkit controls the tool doing the reporting.',
    ],
    challenge:
      'Double extortion means backups no longer end a ransomware incident. Write three sentences explaining what still has to be handled after a successful restore, and which CIA property that residual problem concerns.',
    evidence: [
      {
        id: 'ev0',
        label: 'Malware classification notes',
        type: 'text',
        placeholder: 'Family, propagation, behaviour, telemetry tell',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Classify by behaviour, never by name. The most consequential attacks in this environment used no malicious file at all — which is why behavioural detection has largely replaced signature matching.',
  },

  {
    id: 'p3-lab-2',
    phaseId: 'phase-3',
    title: 'Investigate a Password Attack',
    objective:
      'Distinguish brute force, password spraying, and credential stuffing from authentication log shape, and pick the right detection rule for each.',
    securityConcepts: [
      'Brute force',
      'Password spraying',
      'Credential stuffing',
      'Detection thresholds',
    ],
    environment: 'Deterministic simulator — prepared authentication logs, nothing is executed',
    topology: 'Authentication logs from DC-01, three separate simulated campaigns',
    prerequisites: ['Complete "Identify Malware from Behaviour"'],
    steps: [
      {
        id: 's0',
        instruction: 'Examine the first campaign and describe its shape.',
        command: 'show auth log brute-force',
        expected: 'One account, 1,847 failures in four minutes, single source.',
      },
      {
        id: 's1',
        instruction: 'Examine the second campaign and note why lockout never fires.',
        command: 'show auth log password-spraying',
        expected: '312 accounts, one attempt each, ~32 seconds apart.',
      },
      {
        id: 's2',
        instruction: 'Examine the third campaign and note the source count and success rate.',
        command: 'show auth log credential-stuffing',
        expected: '4,610 accounts across 900+ sources with an unusually high success rate.',
      },
      {
        id: 's3',
        instruction: 'Compare all three against the controls that defeat them.',
        command: 'compare password attacks',
        expected: 'Accounts, attempts each, source count, and the defeating control per attack.',
      },
      {
        id: 's4',
        instruction: 'Cross-reference the Windows Security log from your first triage lab.',
        command: 'get-eventlog -logname security -newest 5',
        expected: 'Three 4625 failures then a 4624 success then a 4688 process creation.',
      },
    ],
    expectedResults: [
      'Three campaigns distinguished by log shape',
      'Understood why per-account lockout is blind to spraying',
      'Credential stuffing recognised as a password-reuse problem',
      'One control identified that addresses all three',
    ],
    verification: [
      'Learner can classify a campaign from accounts and attempts-per-account alone',
      'Learner can explain why account lockout defeats only one of the three',
      'Learner can name the control that addresses the root cause of stuffing',
    ],
    troubleshooting: [
      'All three look like failed logins → count distinct accounts, attempts per account, and distinct sources. Those three numbers separate them.',
      'Unsure why stuffing succeeds so often → the pairs are already known-valid somewhere else; nothing is being guessed.',
    ],
    challenge:
      'Write the detection rule you would build for password spraying, stating the fields you would group by, the time window, and the threshold. Then explain in one sentence why a per-account threshold cannot express it.',
    evidence: [
      {
        id: 'ev0',
        label: 'Password attack analysis',
        type: 'report',
        placeholder: 'Campaign, accounts, attempts each, sources, classification, detection rule',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Password spraying is the clearest example in the syllabus of a control that looks comprehensive and is not. Account lockout is a real control that is structurally blind to an entire attack class — knowing what a control cannot see is as important as knowing what it does.',
  },

  {
    id: 'p3-lab-3',
    phaseId: 'phase-3',
    title: 'Attack Categories Across the Estate',
    objective:
      'Map attacks to the systems they target and the defences that address them, including supply-chain and insider cases that no perimeter control sees.',
    securityConcepts: [
      'Attack surfaces',
      'Supply chain',
      'Insider threat',
      'Category-specific defences',
    ],
    environment: 'Deterministic simulator — prepared reference artifacts, nothing is executed',
    topology: 'Reference estate: web, network, wireless, cloud, mobile, IoT, build pipeline',
    prerequisites: ['Complete "Investigate a Password Attack"'],
    steps: [
      {
        id: 's0',
        instruction: 'Review attack categories against their characteristic defences.',
        command: 'show attack categories',
        expected: 'Nine categories, each with representative attacks and a primary defence.',
      },
      {
        id: 's1',
        instruction: 'Walk the simulated supply-chain compromise.',
        command: 'show supply chain incident',
        expected: 'A trusted dependency update reaching 42 hosts through a signed artifact.',
      },
      {
        id: 's2',
        instruction: 'Review insider risk indicators and their weighting.',
        command: 'show insider indicators',
        expected: 'Five indicators, none of which alone proves malice.',
      },
      {
        id: 's3',
        instruction: 'Check the ARP cache for the on-path attack signature.',
        command: 'arp -a',
        expected: 'Each IP maps to a distinct MAC — no duplicates, so no spoofing indicator.',
      },
    ],
    expectedResults: [
      'Categories mapped to characteristic defences',
      'Supply-chain attack understood as pre-trusted delivery',
      'Insider indicators understood as signals requiring process, not unilateral action',
      'ARP cache checked against a known network attack signature',
    ],
    verification: [
      'Learner can name the most common root cause of cloud data exposure',
      'Learner can explain why perimeter controls do not see a supply-chain attack',
      'Learner can state the correct next step on an insider suspicion',
    ],
    troubleshooting: [
      'Cloud attacks feel exotic → they are overwhelmingly misconfiguration. Prefer the boring answer.',
      'IoT devices cannot be patched → then segment them. Sometimes the control is containment rather than remediation.',
    ],
    challenge:
      'Take three categories from the table and place each on the Phase 2 defence layer stack, naming the layer and the specific control. Then explain why supply-chain attacks do not fit cleanly onto that stack at all.',
    evidence: [
      {
        id: 'ev0',
        label: 'Category-to-layer mapping',
        type: 'report',
        placeholder: 'Category, representative attack, defence layer, specific control',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Two categories defeat perimeter thinking entirely. Supply-chain attacks arrive pre-trusted through a channel you invited in, and insiders already hold legitimate access. Both need verification and behavioural monitoring rather than filtering.',
  },

  {
    id: 'p3-lab-4',
    phaseId: 'phase-3',
    title: 'Walk the Attack Chain End to End',
    objective:
      'Reconstruct the full six-stage compromise that produced the Phase 0 alert, name the evidence at each stage, and identify the earliest point it could have been broken.',
    securityConcepts: [
      'Attack chain',
      'Detection opportunities',
      'Correlation',
      'Incident reconstruction',
    ],
    environment:
      'Deterministic simulation — describes evidence only; nothing is executed or captured',
    topology: 'Email → analyst1 → lookalike domain → real portal → WS-01 → 203.0.113.55 → SIEM',
    prerequisites: ['Complete all earlier Phase 3 labs'],
    steps: [
      {
        id: 's0',
        instruction: 'Run the full chain reconstruction.',
        command: 'trace attack chain phish-01',
        expected: 'Six stages from delivery to alert, each with its evidence.',
      },
      {
        id: 's1',
        instruction: 'Confirm stage 1 evidence in the mail headers.',
        command: 'show email headers phish-01',
        expected: 'SPF softfail, DMARC none, 4-day-old sending domain.',
      },
      {
        id: 's2',
        instruction: 'Confirm stage 2 evidence in the endpoint DNS cache.',
        command: 'ipconfig /displaydns',
        expected: 'updates.example.net resolving to 203.0.113.55.',
      },
      {
        id: 's3',
        instruction: 'Confirm stage 5 evidence in the connection table.',
        command: 'netstat -ano',
        expected: 'PID 6644 ESTABLISHED to 203.0.113.55:443.',
      },
      {
        id: 's4',
        instruction: 'Attribute the connection to a process.',
        command: 'tasklist',
        expected: 'PID 6644 is powershell.exe — living off the land.',
      },
      {
        id: 's5',
        instruction: 'Review the defence layers that should have intervened.',
        command: 'show defense layers',
        expected: 'Seven layers, several of which offered an intervention point.',
      },
    ],
    expectedResults: [
      'All six stages reconstructed with evidence',
      'Evidence located across mail, DNS, endpoint, and network systems',
      'The Phase 0 alert placed correctly as stage 5 of 6',
      'At least four independent intervention points identified',
    ],
    verification: [
      'Learner can list the six stages in order',
      'Learner can name which system holds the evidence for each stage',
      'Learner can identify the earliest realistic intervention and justify it',
    ],
    troubleshooting: [
      'Cannot find stage 3 evidence → credential capture shows up largely as an absence: a submission with no matching legitimate login.',
      'Unsure why the alert is last → detection happened after five stages completed. That is the argument the lab is making.',
    ],
    challenge:
      'Write the incident report: six stages, the evidence and its source system for each, the four intervention points, and a single recommendation with justification. Then state which stage you would invest in catching first if you could only fix one, and why.',
    evidence: [
      {
        id: 'ev0',
        label: 'Incident report',
        type: 'report',
        placeholder: 'Stage, what happened, evidence, source system, intervention available',
      },
      {
        id: 'ev1',
        label: 'Full command transcript',
        type: 'log',
        placeholder: 'Paste the transcript',
      },
    ],
    securityLesson:
      'You do not have to catch every link — only one. The PowerShell beacon you triaged in your very first lab was stage five of six, and four earlier stages had each left evidence somebody could have examined. The earliest catch is always the cheapest.',
  },
];

export const PHASE_3: Phase = {
  id: 'phase-3',
  number: 3,
  title: 'Threats, Vulnerabilities & Attacks',
  description:
    'The largest exam domain at 22%. Malware, social engineering, password attacks, and attack categories across the estate — taught as recognition and defence, with every technique described by the evidence it leaves and the control that catches it.',
  examDomain: 'Threats, Vulnerabilities, and Mitigations',
  scene: 'attack-chain',
  lessons: LESSONS,
  labs: LABS,
};
