# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project

**CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform** — an interactive training platform that takes learners from beginner to Security+-exam-ready and junior-SOC/IAM-job-ready, built with professional 3D environments and safe simulated labs.

Exam alignment: **CompTIA Security+ SY0-701** (5 domains, 90 min, passing score 750). [Exam info](https://www.comptia.org/certifications/security)

## Technology Stack (proposed — finalized at Phase 0 scaffold)

- **Frontend**: React + TypeScript
- **Build tool**: Vite
- **3D**: Three.js via React Three Fiber (`@react-three/fiber` + `@react-three/drei`)
- **State**: Zustand or React Context for progress/mastery
- **Simulation**: Deterministic in-browser simulation engine (no real tooling against live systems)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Repository Layout (planned)

```
root/
├── src/
│   ├── components/        # React components (UI + 3D)
│   ├── scenes/            # Three.js scene definitions
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Global state (progress, mastery, quiz)
│   ├── sim/               # Lab simulation engine
│   ├── data/              # Course content, questions, evidence
│   ├── lib/               # Utilities, helpers
│   └── main.tsx           # Entry point
├── public/                # Static assets, models, textures
├── tests/                 # Unit + integration tests
├── docs/                  # Generated GitHub project docs per lab
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## Development Commands (to be created at Phase 0 scaffold)

| Command                    | Description              |
| -------------------------- | ------------------------ |
| `npm install`              | Install dependencies     |
| `npm run dev`              | Start dev server         |
| `npm run build`            | Production build         |
| `npm run preview`          | Preview production build |
| `npm test`                 | Run all tests            |
| `npm test -- --run <file>` | Run a single test file   |
| `npm run lint`             | Lint with ESLint         |
| `npm run format`           | Format with Prettier     |

## Core Architecture

The platform is a **phase-gated training platform**. Each phase adds a domain of Security+ content plus a 3D scene and/or lab.

**Three layers:**

1. **Learning Engine** — curriculum content (concept → example → scenario → lab → challenge → quiz → review), progress tracking, mastery system (0–6), spaced repetition, daily mode, mock exam mode.
2. **3D Engine** — Three.js scenes for SOC room, network topology, identity architecture, attack-path visualizations, device inspection. Interactive objects (router, switch, firewall, server, PC, AP, DC, SIEM). Camera controls (orbit/pan/zoom), labels, tooltips, 2D fallback.
3. **Simulation Engine** — Deterministic, safe simulations of labs (Nmap, Wireshark, Windows/Linux commands) using prepared artifacts — never real tools against live systems.

**Key data models:** Course/Domain/Lesson, Lab, QuizQuestion, MasteryEntry, Progress, Incident, EvidenceItem, GitHubProject.

## Build Rules (from PROMPT.md)

- Build **phase-by-phase**. Do not attempt the whole platform at once.
- Inspect the repository before changing it. Preserve working functionality.
- Test every phase before moving forward. Keep the implementation mapped to current official CompTIA Security+ objectives.
- If web access is available, verify the current exam version/objectives before implementing curriculum.
- Teach through: **concept → example → scenario → lab → challenge → quiz → review**.
- Labs must be safe and isolated to owned/authorized environments.
- **Never include real secrets, credentials, private keys, API tokens, or personal information** in generated projects.
- **All offensive/security testing only against the learner's own systems or intentionally vulnerable labs.** Use simulations when possible. Do not build functionality to attack public or unauthorized targets.
- At the end of every phase produce a **Phase Completion Report** (features, labs, 3D features, tests, security review, known issues, docs, acceptance criteria, evidence, next phase).
- Do not silently skip failed acceptance criteria.

## Professional 3D Requirements

The 3D environment must be **functional, not decorative**. Include where practical:

- SOC/security operations room, server racks, network rack, firewall, router/switch, Windows endpoint, Linux server
- Security monitoring display, interactive camera, device inspection
- Security event visualization, attack-path visualization, authentication flow, packet/log/event flow, incident timeline
- Network segmentation visualization, vulnerability visualization
- Interactive device inspection, camera controls, labels
- **2D fallback** for low-end hardware

Prefer **Three.js / React Three Fiber** or equivalent suitable WebGL technology.

## Simulation Rules

- Use **deterministic simulations** when real security tooling cannot safely/realistically be embedded.
- Clearly distinguish: **Real tool output**, **Simulated output**, **Prepared sample evidence**.
- For tools (Nmap, Wireshark, Wazuh, Sysmon, OpenVAS/Greenbone, Linux/Windows utilities): provide safe lab integration or prepared lab artifacts.

## Every Lab Must Include

Objective · Security concepts · Environment · Architecture/topology · Prerequisites · Step-by-step instructions · Expected results · Verification · Troubleshooting · Challenge · Evidence/screenshots/logs · Security lesson · GitHub documentation · Instructor validation.

## Phases (overview)

0. Platform Foundation & Security Lab
1. Computer, Network & Security Foundations
2. Security Fundamentals (CIA, AAA, controls, risk)
3. Threats, Vulnerabilities & Attacks
4. Security Architecture (DMZ, Zero Trust, IDS/IPS, WAF)
5. Identity & Access Management (MFA, SSO, SAML, OAuth, AD, Kerberos) — **major career component**
6. Cryptography & PKI
7. Security Operations / SOC
8. Windows Security
9. Linux Security
10. Vulnerability Management
11. Network Security
12. Incident Response
13. Threat Intelligence
14. Cloud Security
15. Mobile / IoT / Embedded Security
16. Application & Data Security
17. Governance, Risk & Compliance
18. Business Continuity & Disaster Recovery
19. Security Hardening
20. Security Automation
21. Wireshark & Packet Analysis
22. Security Troubleshooting Center
23. Full SOC Capstone
24. Security+ Exam Preparation
25. GitHub Cybersecurity Portfolio
26. Career Mode
27. Security+ → IAM Career Bridge

## First Task

1. Inspect repository (done — spec files only, no code).
2. Verify current Security+ exam version (done — SY0-701).
3. Propose architecture, tech stack, 3D architecture, simulation architecture, data models, progress/mastery architecture, and implementation roadmap.
4. **Build PHASE 0 only.**
5. Test PHASE 0.
6. Produce Phase 0 completion report.
7. Wait for approval before proceeding.

The final goal: **ZERO → Security Fundamentals → Security+ → Hands-on Labs → SOC/IAM Skills → GitHub Portfolio → Interviews → Junior Cybersecurity Professional**.

## Notes

- The `PROMPT.md` is the master prompt covering the complete phased platform — it takes precedence for curriculum content.
- `README.md` is the project overview.
- Daily mode: when the user says **"START TODAY'S SECURITY+ LESSON"**, follow the daily lesson flow (check progress → review weak areas → teach → exercise → challenge → quiz → grade → update → homework → preview).
- Mock exam mode: when the user says **"START SECURITY+ MOCK EXAM"**, simulate a timed exam without revealing answers.
- Troubleshooting/Socratic mode: do not immediately give solutions — ask guiding questions and give progressive hints.
