import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 15 — Mobile / IoT / Embedded Security
// Aligned with CompTIA Security+ SY0-701 (Domain 3: Security Architecture)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Mobile Security & Device Management ----------

const LESSON_15_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p15-l1-s0',
    title: 'Concept — The Mobile Threat Landscape',
    body:
      'Mobile devices carry corporate email, credentials, and often direct SSO access, yet they leave the building every day. The threats are distinct from a desktop: loss/theft of a physically small device, malicious or over-permissioned apps, unpatched OS versions carried for months, unsecured public Wi-Fi and rogue access points, SMS/smishing as a delivery channel, and malicious QR codes. The exam expects you to recognise that "mobile" is not "smaller desktop" — it is a different threat model built around portability and app ecosystems.',
  },
  {
    id: 'p15-l1-s1',
    title: 'Concept — Device Ownership Models',
    body:
      'Four models describe who owns the device and how much control IT has. BYOD (Bring Your Own Device): the employee owns it, IT manages only a work container. COBO (Corporate-Owned, Business-Only): the company owns it and personal use is prohibited. COPE (Corporate-Owned, Personally-Enabled): the company owns it but permits personal use. CYOD (Choose Your Own Device): the employee picks a model from an approved list, but the company still owns and images it. The exam\'s trick is testing whether you know who owns the device versus who is allowed to use it personally — those are two independent questions.',
  },
  {
    id: 'p15-l1-s2',
    title: 'Concept — Mobile Device Management (MDM) and UEM',
    body:
      'MDM (or the broader Unified Endpoint Management, UEM) lets an organisation enforce a passcode policy, encrypt storage, push configuration profiles, remotely wipe a lost device (fully, or just the work container in BYOD), detect jailbreak/root status, and block enrolment of non-compliant devices. MAM (Mobile Application Management) works at the app layer instead of the whole device — useful in BYOD where wiping the entire personal phone is not acceptable. The distinction matters: MDM controls the device, MAM controls the app and its data.',
  },
  {
    id: 'p15-l1-s3',
    title: 'Concept — Mobile Application Security',
    body:
      'App-store review (Apple App Store, Google Play Protect) is the first control against malicious apps, but it is not perfect — sideloading (installing an app outside the official store, e.g., an unsigned APK) bypasses it entirely. Enterprise app catalogues should restrict sideloading on managed devices. Other risks: excessive app permissions (a flashlight app requesting contacts and location), insecure local storage of tokens, and third-party SDKs that exfiltrate data the developer never intended to share.',
  },
  {
    id: 'p15-l1-s4',
    title: 'Concept — Mobile OS Security Controls',
    body:
      'Modern mobile OSes isolate each app in its own sandbox so one compromised app cannot read another app\'s data without an explicit, user-granted permission. Jailbreaking (iOS) or rooting (Android) removes this sandboxing and the OS\'s built-in integrity checks, which is why MDM solutions check for jailbreak/root status and block or quarantine devices that fail the check. Biometric authentication (Face ID, fingerprint) ties unlock to hardware-backed secure storage, not just a PIN stored in software.',
  },
  {
    id: 'p15-l1-s5',
    title: 'Example — A jailbroken BYOD device bypasses MDM compliance',
    body:
      'An employee jailbreaks their personal iPhone to install a paid app for free. The MDM profile is technically still installed, but the jailbreak has disabled the OS integrity checks the MDM relies on to report compliance accurately. The device continues to sync corporate email. Three months later the phone is lost; the remote wipe command is sent but the jailbreak has also disabled the wipe agent. The control that would have prevented data exposure: a compliance policy that automatically revokes corporate access the moment jailbreak/root is detected, rather than relying on a wipe command that assumes the OS is intact.',
  },
  {
    id: 'p15-l1-s6',
    title: 'Review — What must stick',
    body:
      'BYOD/COBO/COPE/CYOD answer two independent questions: who owns it, and who may use it personally. MDM controls the device; MAM controls the app. Sideloading bypasses app-store review. Jailbreak/root removes OS sandboxing and must be detected and acted on immediately, not just logged.',
  },
];

const LESSON_15_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p15-q0',
    type: 'mcq',
    stem: 'A company purchases smartphones, retains full ownership, and prohibits any personal use. Which ownership model is this?',
    options: ['COBO', 'BYOD', 'COPE', 'CYOD'],
    answer: 0,
    explanation:
      'COBO (Corporate-Owned, Business-Only) means the company owns the device and personal use is prohibited. COPE allows personal use; BYOD is employee-owned; CYOD lets the employee pick from an approved list.',
    domain: 'Security Architecture',
    conceptId: 'device-ownership-models',
  },
  {
    id: 'p15-q1',
    type: 'mcq',
    stem: 'What is the primary difference between MDM and MAM?',
    options: [
      'MDM manages the entire device; MAM manages only specific applications and their data',
      'MDM only works on iOS; MAM only works on Android',
      'MDM is free; MAM requires a paid licence',
      'MDM and MAM are the same technology with different names',
    ],
    answer: 0,
    explanation:
      'MDM controls the whole device (passcode policy, full wipe, OS configuration). MAM operates at the application layer, which is useful in BYOD where wiping a personal device entirely is unacceptable.',
    domain: 'Security Architecture',
    conceptId: 'mdm',
  },
  {
    id: 'p15-q2',
    type: 'mcq',
    stem: 'What does app sideloading bypass?',
    options: [
      'Official app-store review and vetting',
      'The device passcode policy',
      'Cellular network encryption',
      'The device manufacturer warranty',
    ],
    answer: 0,
    explanation:
      'Sideloading installs an app outside the official store, bypassing the review process (malware scanning, permission review) that the app store normally performs.',
    domain: 'Security Architecture',
    conceptId: 'mobile-app-security',
  },
  {
    id: 'p15-q3',
    type: 'mcq',
    stem: 'What does jailbreaking or rooting a mobile device remove?',
    options: [
      'The OS sandboxing and built-in integrity checks',
      'The cellular radio firmware',
      'The device\'s IMEI number',
      'The battery management system',
    ],
    answer: 0,
    explanation:
      'Jailbreak/root removes the sandbox that isolates apps from each other and from the OS, and disables integrity checks that MDM solutions rely on to assess compliance.',
    domain: 'Security Architecture',
    conceptId: 'mobile-os-security',
  },
  {
    id: 'p15-q4',
    type: 'mcq',
    stem: 'An employee chooses a company-owned phone from three IT-approved models. Which ownership model is this?',
    options: ['CYOD', 'BYOD', 'COBO', 'COPE'],
    answer: 0,
    explanation:
      'CYOD (Choose Your Own Device) lets the employee select a model from an approved list, but the company still owns, images, and manages the device.',
    domain: 'Security Architecture',
    conceptId: 'device-ownership-models',
  },
  {
    id: 'p15-q5',
    type: 'scenario',
    stem: 'A BYOD device is lost. The company can only wipe a corporate work container, not the entire personal phone. What control made this possible?',
    options: [
      'MAM containerisation, which separates work data/apps from personal data',
      'Full-device MDM enrolment',
      'A factory reset protection lock',
      'SIM card encryption',
    ],
    answer: 0,
    explanation:
      'MAM containerisation isolates the work profile so it can be wiped independently of personal data — essential for BYOD where a full wipe would destroy the employee\'s own data.',
    domain: 'Security Architecture',
    conceptId: 'mdm',
  },
  {
    id: 'p15-q6',
    type: 'scenario',
    stem: 'A flashlight app requests permission to read contacts, access location, and read SMS messages. What is the security concern?',
    options: [
      'Excessive permissions unrelated to the app\'s stated function — a sign of potential data harvesting',
      'The app will drain the battery faster',
      'The app cannot function without these permissions',
      'This is standard and requires no review',
    ],
    answer: 0,
    explanation:
      'A flashlight app has no legitimate need for contacts, location, or SMS access. Excessive permission requests unrelated to core functionality are a classic indicator of a data-harvesting or malicious app.',
    domain: 'Security Architecture',
    conceptId: 'mobile-app-security',
  },
  {
    id: 'p15-q7',
    type: 'scenario',
    stem: 'An MDM policy is configured to log jailbreak detection events but take no automatic action. What is the risk?',
    options: [
      'A jailbroken device keeps accessing corporate resources until someone manually reviews the log',
      'The device will be unable to make phone calls',
      'The MDM agent will crash',
      'There is no risk — logging alone is sufficient',
    ],
    answer: 0,
    explanation:
      'Detection without automatic enforcement (revoking access, quarantining the device) leaves a window where a jailbroken, unsandboxed device continues to sync corporate data.',
    domain: 'Security Architecture',
    conceptId: 'mobile-os-security',
  },
  {
    id: 'p15-q8',
    type: 'scenario',
    stem: 'A company-owned smartphone is used both for company email and the employee\'s personal photos and social media. Which model is this and what is the key security implication?',
    options: [
      'COPE — the company owns and can wipe the device, but personal data coexists with corporate data',
      'BYOD — the employee owns the device',
      'CYOD — the employee selected the model',
      'COBO — personal use is prohibited',
    ],
    answer: 0,
    explanation:
      'COPE (Corporate-Owned, Personally-Enabled) grants the company full ownership and wipe authority, but the personal-use allowance means a wipe destroys the employee\'s personal data too — a policy and expectation-setting issue, not just a technical one.',
    domain: 'Security Architecture',
    conceptId: 'device-ownership-models',
  },
  {
    id: 'p15-q9',
    type: 'scenario',
    stem: 'An employee connects to corporate email over an open, unencrypted airport Wi-Fi network without a VPN. What is the primary risk?',
    options: [
      'An on-path (man-in-the-middle) attacker on the same network can intercept unencrypted traffic',
      'The phone battery will drain faster',
      'The airport network will block the connection',
      'There is no risk if the app uses a PIN',
    ],
    answer: 0,
    explanation:
      'Open Wi-Fi networks let any nearby attacker attempt on-path interception. Always require a VPN or rely on TLS-everywhere apps when using untrusted public networks.',
    domain: 'Security Architecture',
    conceptId: 'mobile-threats',
  },
  {
    id: 'p15-q-pbq',
    type: 'pbq',
    stem: 'Order the containment steps for a lost corporate smartphone.',
    options: [
      'Confirm the device ownership model and enrolled services',
      'Locate the device and attempt remote lock or wipe through MDM',
      'Revoke corporate app tokens and certificates for that device',
      'Document the incident and review data loss exposure',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Ownership determines what you can legally do. Location and lock/wipe protect the device, token revocation blocks already-issued credentials, and documentation closes the loop.',
    domain: 'Security Architecture',
    conceptId: 'mobile-os-security',
  },
];

// ---------- Lesson 2: IoT & Embedded Device Security ----------

const LESSON_15_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p15-l2-s0',
    title: 'Concept — The IoT Risk Profile',
    body:
      'IoT devices (cameras, sensors, smart thermostats, badge readers, printers) are purpose-built, often headless, and rarely receive the same security attention as a laptop or server. Common weaknesses: factory-default credentials that are never changed, no ability to install endpoint security agents, minimal or no logging, and long deployment lifespans (5-15 years) that outlast the vendor\'s security-patch commitment. The Mirai botnet remains the canonical exam example: hundreds of thousands of cameras and routers compromised purely through unchanged default credentials.',
  },
  {
    id: 'p15-l2-s1',
    title: 'Concept — Embedded Systems and Firmware',
    body:
      'An embedded system runs fixed-purpose software (firmware) on specialised hardware — a thermostat, a medical infusion pump, an industrial PLC. Firmware updates are infrequent, may require vendor involvement, physical access, or scheduled downtime, and many devices reach end-of-life (EOL) while still deployed, meaning known vulnerabilities will never be patched. The exam expects you to identify EOL/unsupported firmware as a permanent, unremediable vulnerability that can only be managed through compensating controls (segmentation, monitoring) or replacement.',
  },
  {
    id: 'p15-l2-s2',
    title: 'Concept — Device Identity',
    body:
      'Because IoT devices cannot run traditional endpoint agents, they need another way to prove they are what they claim to be. A unique X.509 certificate per device, provisioned at manufacture or first boot, allows mutual TLS authentication — the network and the device both verify each other\'s identity cryptographically. This is far stronger than a shared pre-shared key (PSK) or a device serial number, because a compromised or cloned device with a shared secret can impersonate every other device on the network; a unique certificate can be revoked individually.',
  },
  {
    id: 'p15-l2-s3',
    title: 'Concept — Network Segmentation for IoT',
    body:
      'Because IoT devices cannot be hardened like a managed endpoint, the primary control is architectural: isolate them on their own VLAN with an ACL that permits only the specific traffic they need (e.g., a thermostat talking to its cloud management endpoint) and denies everything else, especially any path to corporate subnets. Guest Wi-Fi and IoT devices should never share a VLAN — a compromised guest device and a compromised IoT device on the same broadcast domain each become a pivot point into the other.',
  },
  {
    id: 'p15-l2-s4',
    title: 'Concept — Supply Chain and Lifecycle Risk',
    body:
      'IoT and embedded devices are frequently built from third-party components (chipsets, RTOS, open-source libraries) that the end customer never audits. A vulnerability in a shared component can affect thousands of unrelated products from different vendors simultaneously. Procurement should evaluate a vendor\'s patch-support commitment and end-of-life date before purchase, not after a vulnerability is disclosed — by then the fleet is already deployed and difficult to replace.',
  },
  {
    id: 'p15-l2-s5',
    title: 'Example — An unsegmented IoT camera used as a pivot point',
    body:
      'A retail chain installs networked IP cameras on the same flat VLAN as point-of-sale terminals, for installation convenience. An attacker scans the internet for the camera\'s known default credentials, logs in, and uses the camera\'s shell access to pivot laterally to a POS terminal on the same broadcast domain, ultimately exfiltrating card data. The single control that would have stopped the pivot: placing the cameras on an isolated IoT VLAN with an ACL denying any path to the POS network, regardless of whether the camera credentials were ever changed.',
  },
  {
    id: 'p15-l2-s6',
    title: 'Review — What must stick',
    body:
      'IoT devices cannot run traditional agents — segmentation and per-device identity are the primary controls. Default credentials remain the single largest real-world IoT risk. EOL firmware is a permanent vulnerability, not a temporary gap. Guest and IoT traffic must never share a VLAN. Supply-chain risk means a shared component vulnerability can affect many unrelated vendors at once.',
  },
];

const LESSON_15_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p15-q10',
    type: 'mcq',
    stem: 'What was the primary attack vector exploited by the Mirai botnet?',
    options: [
      'Unchanged factory-default credentials on IoT devices',
      'A zero-day kernel exploit',
      'SQL injection on the device web interface',
      'A supply-chain compromise of the manufacturer',
    ],
    answer: 0,
    explanation:
      'Mirai scanned the internet for IoT devices still using factory-default admin credentials, logged in, and recruited them into a botnet — no software exploit was required.',
    domain: 'Security Architecture',
    conceptId: 'iot-risks',
  },
  {
    id: 'p15-q11',
    type: 'mcq',
    stem: 'A vendor announces end-of-life (EOL) for a line of industrial sensors still deployed in production. What is the security implication?',
    options: [
      'Any future vulnerability discovered in the firmware will never be patched',
      'The sensors will stop transmitting data immediately',
      'The sensors automatically switch to a secure fallback mode',
      'There is no security implication — EOL only affects customer support',
    ],
    answer: 0,
    explanation:
      'EOL means the vendor will not release further firmware updates. Any vulnerability discovered after EOL is permanent and unpatchable except through compensating controls or replacement.',
    domain: 'Security Architecture',
    conceptId: 'embedded-firmware',
  },
  {
    id: 'p15-q12',
    type: 'mcq',
    stem: 'Why is a unique X.509 certificate per IoT device stronger than a shared pre-shared key (PSK) across a fleet?',
    options: [
      'A compromised device can be revoked individually without affecting the rest of the fleet',
      'Certificates never expire, unlike PSKs',
      'Certificates require less processing power than a PSK',
      'PSKs cannot be used for authentication at all',
    ],
    answer: 0,
    explanation:
      'With a shared PSK, one compromised device exposes the credential for the entire fleet. A unique certificate lets you revoke a single compromised device\'s identity without affecting any other device.',
    domain: 'Security Architecture',
    conceptId: 'device-identity',
  },
  {
    id: 'p15-q13',
    type: 'mcq',
    stem: 'What is the primary security control for IoT devices that cannot run a traditional endpoint agent?',
    options: [
      'Network segmentation with a restrictive ACL',
      'Installing antivirus software on the device',
      'Enabling full-disk encryption',
      'Requiring a complex user password',
    ],
    answer: 0,
    explanation:
      'Because IoT devices are usually headless and cannot run endpoint agents, isolating them on a segmented VLAN with a tight ACL is the primary and often only practical control.',
    domain: 'Security Architecture',
    conceptId: 'iot-segmentation',
  },
  {
    id: 'p15-q14',
    type: 'mcq',
    stem: 'Why does IoT supply-chain risk affect multiple unrelated vendors simultaneously?',
    options: [
      'Many IoT products share the same third-party chipsets, RTOS, or open-source components',
      'All IoT vendors use the same manufacturing facility',
      'IoT devices automatically share vulnerability data with each other',
      'Supply-chain risk only affects a single vendor at a time',
    ],
    answer: 0,
    explanation:
      'A vulnerability in a widely used chipset, RTOS, or open-source library can affect every product built on top of it, across many otherwise unrelated vendors.',
    domain: 'Security Architecture',
    conceptId: 'iot-risks',
  },
  {
    id: 'p15-q15',
    type: 'scenario',
    stem: 'A retail chain places IP cameras on the same flat VLAN as point-of-sale terminals. An attacker compromises a camera using default credentials and pivots to a POS terminal. What single control would have prevented the pivot?',
    options: [
      'An isolated IoT VLAN with an ACL denying any path to the POS network',
      'A stronger camera password only',
      'Disabling the cameras entirely',
      'Encrypting the camera\'s video feed',
    ],
    answer: 0,
    explanation:
      'Segmentation is the control that limits blast radius regardless of whether the initial compromise (default credentials) was prevented. Even with unchanged credentials, a segmented camera cannot reach the POS network.',
    domain: 'Security Architecture',
    conceptId: 'iot-segmentation',
  },
  {
    id: 'p15-q16',
    type: 'scenario',
    stem: 'A building-automation vendor is evaluated for a new HVAC controller purchase. Which factor should be assessed before purchase to manage long-term risk?',
    options: [
      'The vendor\'s committed patch-support window and stated end-of-life date',
      'Only the upfront purchase price',
      'The number of colours the controller is available in',
      'Whether the controller has a mobile app'
    ],
    answer: 0,
    explanation:
      'Evaluating patch-support commitment and EOL date before purchase avoids deploying a fleet of devices that will become permanently vulnerable shortly after installation.',
    domain: 'Security Architecture',
    conceptId: 'iot-risks',
  },
  {
    id: 'p15-q17',
    type: 'scenario',
    stem: 'Guest Wi-Fi and building IoT devices are configured on the same VLAN for convenience. What is the risk?',
    options: [
      'A compromised device on either side (guest or IoT) can pivot directly to the other',
      'Guest users will experience slower internet speeds',
      'IoT devices will stop functioning',
      'There is no meaningful risk if both are considered "untrusted"',
    ],
    answer: 0,
    explanation:
      'Sharing a broadcast domain means a compromised guest laptop can reach and attack IoT devices, and a compromised IoT device can attack guest traffic — both should be isolated from each other, not just from corporate.',
    domain: 'Security Architecture',
    conceptId: 'iot-segmentation',
  },
  {
    id: 'p15-q18',
    type: 'scenario',
    stem: 'A hospital deploys networked infusion pumps that cannot be patched without vendor field service and scheduled downtime. What is the most realistic compensating control?',
    options: [
      'Isolate the pumps on a dedicated medical-device VLAN with strict, monitored ACLs',
      'Connect the pumps directly to the general hospital Wi-Fi for convenience',
      'Disable all network connectivity for every pump permanently',
      'Rely solely on the manufacturer to patch remotely without any network control',
    ],
    answer: 0,
    explanation:
      'When a device cannot be patched on demand, network isolation with monitoring is the realistic compensating control — it limits exposure without requiring the device itself to change.',
    domain: 'Security Architecture',
    conceptId: 'embedded-firmware',
  },
];

// ---------- Lab 1: Audit a Mobile Device Fleet ----------

const LAB_15_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review MDM enrolment status across the device fleet.',
    command: 'show mdm enrollment',
    expected: 'A summary showing enrolled, unenrolled, and non-compliant devices, including jailbreak/root findings.',
  },
  {
    id: 's1',
    instruction: 'Inspect mobile application policies for sideloading and permission risks.',
    command: 'show mobile app policies',
    expected: 'A policy report flagging sideloading allowed on managed Android devices.',
  },
  {
    id: 's2',
    instruction: 'Review BYOD devices for containerisation and passcode enforcement.',
    command: 'show byod devices',
    expected: 'At least one BYOD device found without a passcode policy or work-container separation.',
  },
  {
    id: 's3',
    instruction: 'Generate the overall mobile compliance report.',
    command: 'show mobile compliance report',
    expected: 'A consolidated report listing every non-compliant device and the specific policy violated.',
  },
];

const LAB_15_0: Lab = {
  id: 'p15-lab-0',
  phaseId: 'phase-15',
  title: 'Audit a Mobile Device Fleet',
  objective:
    'Audit a simulated mobile device fleet for MDM enrolment gaps, jailbreak/root risk, unsafe application policies, and BYOD containerisation failures. Produce a findings report.',
  securityConcepts: [
    'Device ownership models',
    'MDM / MAM',
    'Mobile application security',
    'Mobile OS security',
    'BYOD policy',
  ],
  environment: 'Deterministic mobile fleet simulator — prepared outputs only, nothing is executed against a real device or MDM tenant',
  topology: 'Simulated MDM tenant managing 40 devices: 15 BYOD, 10 COBO, 8 COPE, 7 CYOD, across iOS and Android',
  prerequisites: ['Complete Phase 5 (Identity & Access Management)', 'Complete Phase 4 (Security Architecture)'],
  steps: LAB_15_0_STEPS,
  expectedResults: [
    'At least one jailbroken/rooted device still holding corporate access identified',
    'Sideloading of unsigned apps on managed Android devices flagged',
    'A BYOD device without passcode enforcement or containerisation identified',
    'A consolidated compliance report naming every violation',
  ],
  verification: [
    'Learner can name at least three distinct mobile security findings',
    'Learner can explain which ownership model (BYOD/COBO/COPE/CYOD) each affected device uses and why that changes the remediation',
    'Learner can recommend a specific MDM/MAM policy change for each finding',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Unsure which ownership model applies → check who owns the device and whether personal use is allowed; those two facts alone determine BYOD/COBO/COPE/CYOD.',
    'Confused about MDM vs MAM → MDM controls the whole device; MAM controls only the managed app and its data, which matters when a full wipe is not acceptable (BYOD).',
  ],
  challenge:
    'Write a one-page findings report: for each violation, state the finding, the affected ownership model, the risk, and a specific MDM/MAM policy remediation. Prioritise by severity.',
  evidence: [
    {
      id: 'ev0',
      label: 'Mobile fleet audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Findings report',
      type: 'report',
      placeholder: 'Finding, ownership model, risk, remediation for each violation',
    },
  ],
  securityLesson:
    'Mobile security failures are rarely about missing technology — MDM/MAM already exist in almost every enterprise. They are policy failures: enrolment allowed without enforcement, sideloading left open, containerisation never configured. The audit skill is recognising the gap between what the tool can do and what the policy actually requires it to do.',
};

// ---------- Lab 2: Design a Secure Enterprise IoT Network ----------

const LAB_15_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Survey the IoT device inventory across the building.',
    command: 'show iot inventory',
    expected: 'A list of IoT devices (cameras, HVAC controllers, badge readers) with vendor, firmware version, and credential status.',
  },
  {
    id: 's1',
    instruction: 'Review the current network segmentation for IoT devices.',
    command: 'show iot network segments',
    expected: 'A VLAN diagram showing whether IoT devices are isolated from corporate and guest traffic.',
  },
  {
    id: 's2',
    instruction: 'Check firmware update status and vendor support lifecycle for each device class.',
    command: 'show firmware status',
    expected: 'At least one device class flagged as end-of-life with no further vendor patches.',
  },
  {
    id: 's3',
    instruction: 'Verify device identity — confirm each device holds a unique certificate rather than a shared credential.',
    command: 'show device certificates',
    expected: 'A finding that one device class shares a single embedded credential across the entire fleet.',
  },
];

const LAB_15_1: Lab = {
  id: 'p15-lab-1',
  phaseId: 'phase-15',
  title: 'Design a Secure Enterprise IoT Network',
  objective:
    'Review an enterprise IoT deployment for segmentation gaps, end-of-life firmware, default credentials, and weak device identity. Design a corrected, segmented architecture.',
  securityConcepts: [
    'IoT risk profile',
    'Embedded systems and firmware',
    'Device identity',
    'Network segmentation',
    'Supply chain and lifecycle risk',
  ],
  environment: 'Deterministic IoT/embedded simulator — prepared outputs only',
  topology: 'Simulated building network: corporate VLAN, guest VLAN, and a flat (unsegmented) IoT deployment of cameras, HVAC controllers, and badge readers',
  prerequisites: ['Complete Phase 4 (Security Architecture)', 'Complete Phase 11 (Network Security)'],
  steps: LAB_15_1_STEPS,
  expectedResults: [
    'IoT devices found sharing a VLAN with corporate or guest traffic',
    'A device class identified as running end-of-life, unpatchable firmware',
    'Factory-default credentials found on at least one device type',
    'A shared embedded credential (rather than per-device identity) identified',
  ],
  verification: [
    'Learner can propose a corrected VLAN diagram isolating IoT from corporate and guest segments',
    'Learner can explain the compensating control for the end-of-life device class',
    'Learner can explain why per-device certificates are preferable to a shared credential',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Unsure what counts as a segmentation finding → ask: "Can this IoT device reach a corporate server or a guest laptop?" If yes, that is the finding.',
    'Confused about EOL risk → EOL is not a current exploit, it is a guarantee that any future one is permanent. Treat it as a standing risk, not a one-time gap.',
  ],
  challenge:
    'Draw the corrected network diagram: three isolated VLANs (corporate, guest, IoT) with explicit ACL rules for the one or two flows each IoT device class legitimately needs (e.g., cloud management endpoint only). State the compensating control for the end-of-life device class.',
  evidence: [
    {
      id: 'ev0',
      label: 'IoT audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Corrected network design',
      type: 'report',
      placeholder: 'VLANs, ACL rules per device class, and compensating controls',
    },
  ],
  securityLesson:
    'IoT and embedded devices will always lag behind laptops and servers in security maturity — they cannot run an agent, and firmware update cycles are measured in years, not weeks. The architecture has to assume the device itself is untrustworthy and contain the blast radius through segmentation and identity, rather than hoping the device gets fixed.',
};

// ---------- Lessons ----------

const LESSON_15_L1: Lesson = {
  id: 'p15-lesson-0',
  phaseId: 'phase-15',
  title: 'Mobile Security & Device Management',
  objectives: [
    'Distinguish BYOD, COBO, COPE, and CYOD ownership models',
    'Explain the difference between MDM and MAM',
    'Identify mobile application security risks including sideloading and excessive permissions',
    'Explain how mobile OS sandboxing and jailbreak/root detection protect corporate data',
    'Recognise mobile-specific threats including public Wi-Fi and smishing',
  ],
  sections: LESSON_15_L1_SECTIONS,
  quiz: LESSON_15_L1_QUIZ,
  concepts: [
    'mobile-threats',
    'device-ownership-models',
    'mdm',
    'mobile-app-security',
    'mobile-os-security',
  ],
  homework:
    'Audit the permissions granted to five apps on your own phone and revoke any that the app does not need to function. Note what still works afterwards.',
  careerConnection:
    'Endpoint/Mobile Security Analyst — organisations with any BYOD program need someone who can configure MDM compliance policies and explain, in plain language, why a jailbroken phone cannot be trusted with corporate email.',
};

const LESSON_15_L2: Lesson = {
  id: 'p15-lesson-1',
  phaseId: 'phase-15',
  title: 'IoT & Embedded Device Security',
  objectives: [
    'Describe the IoT risk profile including default credentials and lifecycle limitations',
    'Explain embedded firmware constraints and end-of-life risk',
    'Describe device identity using per-device certificates versus shared credentials',
    'Explain why network segmentation is the primary control for IoT devices',
    'Identify supply-chain and lifecycle risk in IoT/embedded procurement',
  ],
  sections: LESSON_15_L2_SECTIONS,
  quiz: LESSON_15_L2_QUIZ,
  concepts: [
    'iot-risks',
    'embedded-firmware',
    'device-identity',
    'iot-segmentation',
  ],
  homework:
    'List the network-connected devices in your home that are not computers or phones. For each, state whether it can be patched and which network segment it belongs on.',
  careerConnection:
    'OT/IoT Security Engineer — as buildings, factories, and hospitals fill with connected devices that cannot be patched like a laptop, the analyst who can design a segmented, monitored network around them is essential to physical-security-adjacent teams.',
};

// ---------- Phase export ----------

export const PHASE_15: Phase = {
  id: 'phase-15',
  number: 15,
  title: 'Mobile / IoT / Embedded Security',
  description:
    'Master mobile device ownership models, MDM/MAM, mobile application and OS security, then move to IoT and embedded systems: default-credential risk, firmware lifecycle, device identity, and network segmentation — and design a secure enterprise IoT network.',
  examDomain: 'Security Architecture',
  scene: 'soc',
  lessons: [LESSON_15_L1, LESSON_15_L2],
  labs: [LAB_15_0, LAB_15_1],
};
