import { PHASE_1 } from './phase1';
import { PHASE_2 } from './phase2';
import { PHASE_3 } from './phase3';
import { PHASE_4 } from './phase4';
import { PHASE_5 } from './phase5';
import { PHASE_6 } from './phase6';
import { PHASE_7 } from './phase7';
import { PHASE_8 } from './phase8';
import { PHASE_9 } from './phase9';
import { PHASE_10 } from './phase10';
import { PHASE_11 } from './phase11';
import { PHASE_12 } from './phase12';
import { PHASE_13 } from './phase13';
import { PHASE_14 } from './phase14';
import { PHASE_15 } from './phase15';
import { PHASE_16 } from './phase16';
import { PHASE_17 } from './phase17';
import { PHASE_18 } from './phase18';
import { PHASE_19 } from './phase19';
import { PHASE_20 } from './phase20';
import { PHASE_21 } from './phase21';
import { PHASE_22 } from './phase22';
import { PHASE_23 } from './phase23';
import { PHASE_24 } from './phase24';
import { PHASE_25 } from './phase25';
import { PHASE_26 } from './phase26';
import { PHASE_27 } from './phase27';
import type { Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 0 — Platform Foundation & Security Lab
// Aligned with CompTIA Security+ SY0-701
// ---------------------------------------------------------------------------

export const PHASE_0: Phase = {
  id: 'phase-0',
  number: 0,
  title: 'Platform Foundation & Security Lab',
  description:
    'Enter the SOC environment, inspect devices, navigate the course roadmap, track progress, and run your first safe labs.',
  examDomain: 'General Security Concepts',
  scene: 'soc',
  lessons: [
    {
      id: 'p0-lesson-0',
      phaseId: 'phase-0',
      title: 'Welcome to the Security+ Zero-to-Hero Platform',
      objectives: [
        'Understand how the platform is structured',
        'Navigate the dashboard, roadmap, and lab library',
        'Explain how progress and mastery are tracked',
        'Distinguish real, simulated, and prepared output',
      ],
      concepts: ['platform', 'curriculum', 'safety', 'provenance'],
      homework:
        'Write down, from memory, the five SY0-701 domains, the pass mark, and the three provenance labels. Then state which label the output of a lab command in this platform carries, and why that matters when you defend a finding.',
      careerConnection:
        'SOC Analyst — day one is learning the environment and the tooling before you touch an alert.',
      sections: [
        {
          id: 'p0-s0',
          title: 'Concept — What you are building toward',
          body: 'This platform teaches CompTIA Security+ (SY0-701) through interactive labs, a 3D SOC environment, and progressive mastery tracking. No prior experience is required. The exam has five domains, up to 90 questions, 90 minutes, and a passing score of 750 on a 100-900 scale. Everything you do here maps back to those domains.',
        },
        {
          id: 'p0-s1',
          title: 'Concept — How the platform works',
          body: 'Each phase carries lessons, labs, and a 3D scene. The teaching loop is always the same: concept, then example, then scenario, then lab, then challenge, then quiz, then review. Completing labs produces evidence you keep; quizzes move concepts up a 0-6 mastery ladder; concepts you miss come back on a spaced-repetition schedule.',
        },
        {
          id: 'p0-s2',
          title: 'Concept — Safe, simulated labs',
          body: 'Every lab here is a deterministic simulation backed by prepared artifacts. No real tool is ever executed, and nothing touches a live system. Output is always labelled one of three ways: REAL TOOL OUTPUT, SIMULATED OUTPUT, or PREPARED SAMPLE EVIDENCE. Knowing which one you are looking at is a professional habit, not a technicality — an analyst who cannot say where their data came from cannot defend a finding.',
        },
        {
          id: 'p0-s3',
          title: 'Example — Reading a triage sequence',
          body: 'Run netstat -ano in the lab terminal and you see PID 6644 holding an ESTABLISHED session to 203.0.113.55:443. Run tasklist and PID 6644 resolves to powershell.exe. Two commands, and you have moved from "a connection exists" to "an interactive shell is beaconing outbound" — the difference between noise and an incident.',
        },
        {
          id: 'p0-s4',
          title: 'Scenario — Your first shift',
          body: 'The video wall shows an alert on one device in the SOC room. You do not yet know what the alert means. Your job in Lab 0 is narrower and more useful: learn the room. Identify every device, its role, its addresses, and its security state. You cannot triage an environment you cannot describe.',
        },
        {
          id: 'p0-s5',
          title: 'Review — What must stick',
          body: 'Five exam domains and a 750 pass mark. The seven-step teaching loop. The 0-6 mastery ladder. Three provenance labels. One rule that never bends: authorised targets only, simulation by default.',
        },
      ],
      quiz: [
        {
          id: 'p0-q0',
          type: 'mcq',
          stem: 'Which SY0-701 domain does Phase 0 map to?',
          options: [
            'General Security Concepts',
            'Threats, Vulnerabilities, and Mitigations',
            'Security Architecture',
            'Security Operations',
          ],
          answer: 0,
          explanation:
            'Phase 0 covers platform foundation and orientation, which sits under Domain 1.0 General Security Concepts.',
          domain: 'General Security Concepts',
          conceptId: 'curriculum',
        },
        {
          id: 'p0-q1',
          type: 'scenario',
          stem: 'A lab shows output labelled "SIMULATED OUTPUT". What does that tell you?',
          options: [
            'It came from a real tool run against a live host',
            'A deterministic simulation produced it — safe and reproducible',
            'It is fabricated and cannot be trusted for learning',
            'It requires a commercial licence to view',
          ],
          answer: 1,
          explanation:
            'Simulated means the deterministic simulation engine generated it. It is safe, reproducible, and never touches a live system. Prepared means a stored sample artifact; real means genuine tool output.',
          examClue:
            'Security+ repeatedly tests whether you can state the source and reliability of evidence.',
          domain: 'General Security Concepts',
          conceptId: 'provenance',
        },
        {
          id: 'p0-q2',
          type: 'mcq',
          stem: 'What is the passing score for CompTIA Security+ SY0-701?',
          options: ['700 of 900', '750 of 900', '80 percent', '675 of 900'],
          answer: 1,
          explanation:
            'SY0-701 is scored on a 100-900 scale with 750 required to pass. It is a scaled score, not a raw percentage.',
          domain: 'General Security Concepts',
          conceptId: 'curriculum',
        },
        {
          id: 'p0-q3',
          type: 'scenario',
          stem: 'netstat -ano shows PID 6644 with an ESTABLISHED session to an external address on 443, and tasklist resolves PID 6644 to powershell.exe. What is the best next step?',
          options: [
            'Ignore it — 443 is encrypted, so it is legitimate traffic',
            'Reboot the host immediately to clear the connection',
            'Escalate as possible command-and-control and preserve the host for investigation',
            'Delete powershell.exe from the endpoint',
          ],
          answer: 2,
          explanation:
            'An interactive shell holding an outbound TLS session to an unfamiliar external host is a classic living-off-the-land C2 pattern. Escalate and preserve volatile evidence. Rebooting destroys it; port 443 being encrypted is exactly why attackers choose it.',
          examClue:
            'When an answer choice destroys evidence, it is almost never correct on an incident-response question.',
          domain: 'Security Operations',
          conceptId: 'safety',
        },
        {
          id: 'p0-q4',
          type: 'pbq',
          stem: 'Order the platform teaching loop. Select the steps in the correct sequence: [0] Quiz, [1] Concept, [2] Lab, [3] Scenario, [4] Example, [5] Review, [6] Challenge.',
          options: ['Concept', 'Example', 'Scenario', 'Lab', 'Challenge', 'Quiz', 'Review'],
          answer: [1, 4, 3, 2, 6, 0, 5],
          explanation:
            'The loop is concept, example, scenario, lab, challenge, quiz, review. Understanding precedes application; assessment comes after practice, not before.',
          domain: 'General Security Concepts',
          conceptId: 'platform',
        },
      ],
    },
  ],
  labs: [
    {
      id: 'p0-lab-0',
      phaseId: 'phase-0',
      title: 'Enter the SOC Environment',
      objective:
        'Navigate the 3D SOC room, inspect every device, and record its role, addressing, and security state.',
      securityConcepts: ['SOC layout', 'Device roles', 'Asset inventory', 'Interactive inspection'],
      environment: 'Simulated SOC room — isolated browser environment, no live systems',
      topology:
        'SOC room: analyst workstations, server rack, network rack, firewall at the trust boundary, domain controller, SIEM collector, video wall',
      prerequisites: ['None — this is the entry lab'],
      steps: [
        {
          id: 's0',
          instruction: 'Load the SOC scene in the simulator.',
          command: 'navigate soc',
          expected: 'Scene mounts and reports the registered device count.',
        },
        {
          id: 's1',
          instruction: 'Inspect the firewall and note both interface addresses.',
          command: 'inspect firewall-01',
          expected: 'Untrust and trust interfaces listed with their IPs.',
        },
        {
          id: 's2',
          instruction: 'Click the Windows endpoint in the 3D scene and read its security state.',
          expected: 'Device panel opens showing users, Defender, firewall, and BitLocker state.',
        },
        {
          id: 's3',
          instruction: 'Click the Linux server and review its recent events.',
          expected: 'Device panel opens with services and log entries.',
        },
        {
          id: 's4',
          instruction: 'Orbit, pan, and zoom the camera to view the room from the video wall side.',
          expected: 'Camera moves smoothly; labels stay readable.',
        },
      ],
      expectedResults: [
        'Learner can enter and navigate the SOC scene',
        'Device inspection panel opens for every device',
        'Camera controls respond',
        'Lab progress is recorded',
      ],
      verification: [
        'SOC scene (or 2D fallback) loads',
        'At least three devices inspected',
        'Camera controls functional',
      ],
      troubleshooting: [
        '3D scene blank → your GPU or browser may lack WebGL; the platform switches to the 2D topology automatically. Use the toggle to force it.',
        'Device will not click → orbit drag can swallow the click. Release the mouse before clicking.',
        'Labels unreadable → zoom in; label size is fixed in world space, not screen space.',
      ],
      challenge:
        'Build a complete asset inventory: every device, its role, IP, MAC, and one security control that is enabled on it. Save it to your notes. This is the artifact a real SOC onboarding asks for in week one.',
      evidence: [
        {
          id: 'ev0',
          label: 'Device inspection log',
          type: 'text',
          placeholder: 'Record each device name, role, IP, and status',
        },
        {
          id: 'ev1',
          label: 'SOC room observation',
          type: 'screenshot',
          placeholder: 'Describe or paste a capture of the 3D scene',
        },
      ],
      securityLesson:
        'A SOC is the nervous system of security operations. Asset inventory is CIS Control 1 for a reason: you cannot protect, monitor, or triage what you have not enumerated.',
    },
    {
      id: 'p0-lab-1',
      phaseId: 'phase-0',
      title: 'First Triage — Host Command Line',
      objective:
        'Use simulated Windows and Linux commands to establish a host baseline and spot one anomalous outbound connection.',
      securityConcepts: [
        'Host triage',
        'Baseline vs anomaly',
        'Living-off-the-land binaries',
        'Least privilege',
      ],
      environment: 'Deterministic command simulator — prepared outputs only, nothing is executed',
      topology: 'WS-01 (Windows 11, 192.168.1.10) and SRV-01 (Ubuntu 22.04, 192.168.1.30)',
      prerequisites: ['Complete "Enter the SOC Environment"'],
      steps: [
        {
          id: 's0',
          instruction: 'Establish the Windows network baseline.',
          command: 'ipconfig /all',
          expected: 'Host name, MAC, IPv4, gateway, and DNS server recorded.',
        },
        {
          id: 's1',
          instruction: 'Confirm which identity you are operating as.',
          command: 'whoami',
          expected: 'Returns lab\\analyst1 — a standard user, not an administrator.',
        },
        {
          id: 's2',
          instruction: 'List active connections with owning process IDs.',
          command: 'netstat -ano',
          expected: 'One ESTABLISHED session to an external address stands out.',
        },
        {
          id: 's3',
          instruction: 'Resolve the suspicious PID to a process name.',
          command: 'tasklist',
          expected: 'PID 6644 resolves to powershell.exe.',
        },
        {
          id: 's4',
          instruction: 'Corroborate with the Security event log.',
          command: 'get-eventlog -logname security -newest 5',
          expected:
            'Failed logons (4625) followed by a success (4624) and a process creation (4688).',
        },
        {
          id: 's5',
          instruction: 'Check the Linux server listeners.',
          command: 'ss -tulpn',
          expected: 'postgres bound to loopback only; sshd and nginx bound to all interfaces.',
        },
        {
          id: 's6',
          instruction: 'Review the sudo grant on the Linux server.',
          command: 'sudo -l',
          expected: 'One scoped command — least privilege applied correctly.',
        },
      ],
      expectedResults: [
        'Windows host baseline captured',
        'Anomalous outbound connection identified and attributed to a process',
        'Event log corroborates a password-guessing attempt followed by execution',
        'Linux attack surface and sudo scope reviewed',
      ],
      verification: [
        'Transcript contains ipconfig /all and netstat -ano output',
        'Learner can name the process behind the external connection',
        'Learner can state which Linux service is not externally reachable',
      ],
      troubleshooting: [
        'Command not recognised → the simulator is a closed allowlist, not a shell. Type help for the supported set.',
        'Output looks static → it is. Prepared artifacts are deterministic on purpose so findings are reproducible.',
      ],
      challenge:
        'Write a three-sentence escalation note: what you observed, why it is suspicious, and what you recommend. Do not include a remediation step that destroys volatile evidence.',
      evidence: [
        {
          id: 'ev0',
          label: 'Command transcript',
          type: 'log',
          placeholder: 'Paste the full simulator transcript',
        },
        {
          id: 'ev1',
          label: 'Escalation note',
          type: 'report',
          placeholder: 'Observation, assessment, recommendation',
        },
      ],
      securityLesson:
        'Triage is correlation, not a single magic command. A connection alone is noise; a connection attributed to an interactive shell, corroborated by failed-then-successful logons, is an incident.',
    },
  ],
};

export const PHASES: Phase[] = [
  PHASE_0,
  PHASE_1,
  PHASE_2,
  PHASE_3,
  PHASE_4,
  PHASE_5,
  PHASE_6,
  PHASE_7,
  PHASE_8,
  PHASE_9,
  PHASE_10,
  PHASE_11,
  PHASE_12,
  PHASE_13,
  PHASE_14,
  PHASE_15,
  PHASE_16,
  PHASE_17,
  PHASE_18,
  PHASE_19,
  PHASE_20,
  PHASE_21,
  PHASE_22,
  PHASE_23,
  PHASE_24,
  PHASE_25,
  PHASE_26,
  PHASE_27,
];

export {
  PHASE_1,
  PHASE_2,
  PHASE_3,
  PHASE_4,
  PHASE_5,
  PHASE_6,
  PHASE_7,
  PHASE_8,
  PHASE_9,
  PHASE_10,
  PHASE_11,
  PHASE_12,
  PHASE_13,
  PHASE_14,
  PHASE_15,
  PHASE_16,
  PHASE_17,
  PHASE_18,
  PHASE_19,
  PHASE_20,
  PHASE_21,
  PHASE_22,
  PHASE_23,
  PHASE_24,
  PHASE_25,
  PHASE_26,
  PHASE_27,
};

// ---------------------------------------------------------------------------
// Full roadmap outline. Phases beyond 0 are declared here so learners can see
// the whole path; they unlock as each phase is built and approved.
// ---------------------------------------------------------------------------

export type PhaseOutline = {
  number: number;
  title: string;
  examDomain: string;
  status: 'available' | 'planned';
};

export const PHASE_OUTLINE: PhaseOutline[] = [
  {
    number: 0,
    title: 'Platform Foundation & Security Lab',
    examDomain: 'General Security Concepts',
    status: 'available',
  },
  {
    number: 1,
    title: 'Computer, Network & Security Foundations',
    examDomain: 'General Security Concepts',
    status: 'available',
  },
  {
    number: 2,
    title: 'Security Fundamentals',
    examDomain: 'General Security Concepts',
    status: 'available',
  },
  {
    number: 3,
    title: 'Threats, Vulnerabilities & Attacks',
    examDomain: 'Threats, Vulnerabilities, and Mitigations',
    status: 'available',
  },
  {
    number: 4,
    title: 'Security Architecture',
    examDomain: 'Security Architecture',
    status: 'available',
  },
  {
    number: 5,
    title: 'Identity & Access Management',
    examDomain: 'Security Architecture',
    status: 'available',
  },
  {
    number: 6,
    title: 'Cryptography & PKI',
    examDomain: 'General Security Concepts',
    status: 'available',
  },
  {
    number: 7,
    title: 'Security Operations / SOC',
    examDomain: 'Security Operations',
    status: 'available',
  },
  { number: 8, title: 'Windows Security', examDomain: 'Security Operations', status: 'available' },
  { number: 9, title: 'Linux Security', examDomain: 'Security Operations', status: 'available' },
  {
    number: 10,
    title: 'Vulnerability Management',
    examDomain: 'Security Operations',
    status: 'available',
  },
  {
    number: 11,
    title: 'Network Security',
    examDomain: 'Security Architecture',
    status: 'available',
  },
  {
    number: 12,
    title: 'Incident Response',
    examDomain: 'Security Operations',
    status: 'available',
  },
  {
    number: 13,
    title: 'Threat Intelligence',
    examDomain: 'Threats, Vulnerabilities, and Mitigations',
    status: 'available',
  },
  { number: 14, title: 'Cloud Security', examDomain: 'Security Architecture', status: 'available' },
  {
    number: 15,
    title: 'Mobile / IoT / Embedded Security',
    examDomain: 'Security Architecture',
    status: 'available',
  },
  {
    number: 16,
    title: 'Application & Data Security',
    examDomain: 'Security Architecture',
    status: 'available',
  },
  {
    number: 17,
    title: 'Governance, Risk & Compliance',
    examDomain: 'Security Program Management and Oversight',
    status: 'available',
  },
  {
    number: 18,
    title: 'Business Continuity & Disaster Recovery',
    examDomain: 'Security Program Management and Oversight',
    status: 'available',
  },
  { number: 19, title: 'Security Hardening', examDomain: 'Security Operations', status: 'available' },
  {
    number: 20,
    title: 'Security Automation',
    examDomain: 'Security Operations',
    status: 'available',
  },
  {
    number: 21,
    title: 'Wireshark & Packet Analysis',
    examDomain: 'Security Operations',
    status: 'available',
  },
  {
    number: 22,
    title: 'Security Troubleshooting Center',
    examDomain: 'Security Operations',
    status: 'available',
  },
  { number: 23, title: 'Full SOC Capstone', examDomain: 'Security Operations', status: 'available' },
  { number: 24, title: 'Security+ Exam Preparation', examDomain: 'All domains', status: 'available' },
  { number: 25, title: 'GitHub Cybersecurity Portfolio', examDomain: 'Career', status: 'available' },
  { number: 26, title: 'Career Mode', examDomain: 'Career', status: 'available' },
  { number: 27, title: 'Security+ to IAM Career Bridge', examDomain: 'Career', status: 'available' },
];

export function getPhase(phaseId: string): Phase | undefined {
  return PHASES.find((p) => p.id === phaseId);
}

export function getLesson(lessonId: string) {
  for (const phase of PHASES) {
    const lesson = phase.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getLab(labId: string) {
  for (const phase of PHASES) {
    const lab = phase.labs.find((l) => l.id === labId);
    if (lab) return lab;
  }
  return undefined;
}

/** Every quiz question across every built phase — used by practice and mock exams. */
export function allQuestions() {
  return PHASES.flatMap((p) => p.lessons.flatMap((l) => l.quiz));
}

/** Total gradeable items in a phase, for progress percentages. */
export function phaseItemCount(phase: Phase): number {
  return phase.lessons.length + phase.labs.length;
}
