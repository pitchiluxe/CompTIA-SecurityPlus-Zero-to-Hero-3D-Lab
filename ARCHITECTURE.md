# Architecture Proposal — CompTIA Security+ Zero-to-Hero 3D Lab

## 1. Technology Stack

| Layer       | Choice                                                     | Rationale                                               |
| ----------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Framework   | React 19 + TypeScript                                      | Component model, strong typing, large ecosystem         |
| Build       | Vite                                                       | Fast HMR, native ES modules, simple config              |
| 3D          | Three.js via `@react-three/fiber` + `@react-three/drei`    | React-native WebGL, declarative scenes, rich primitives |
| State       | Zustand                                                    | Lightweight, scalable, selectors avoid re-renders       |
| Routing     | React Router v7                                            | Standard SPA routing                                    |
| Styling     | Tailwind CSS + Headless UI                                 | Rapid UI, accessible primitives                         |
| Quiz/Engine | Custom deterministic engine                                | Full control over scoring, mastery, spaced repetition   |
| Testing     | Vitest + React Testing Library + @testing-library/jest-dom | Vite-native, fast, React-aware                          |
| Lint        | ESLint + Prettier                                          | Standard TS quality                                     |
| Evidence    | Prepared artifacts (JSON/text) + safe simulations          | Never real tools against live systems                   |

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   App Shell (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Dashboard│  │ Roadmap  │  │  Lab Lib │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Quiz    │  │ Progress │  │  Notes   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│          ┌────────────────────┐                     │
│          │  3D Scene Canvas   │  (React Three Fiber)│
│          │  ┌──────────────┐  │                     │
│          │  │ Scene Manager│  │                     │
│          │  │ - SOC Room   │  │                     │
│          │  │ - Network    │  │                     │
│          │  │ - Identity   │  │                     │
│          │  │ - AttackPath │  │                     │
│          │  └──────────────┘  │                     │
│          └────────────────────┘                     │
│  ┌────────────────────────────────────┐            │
│  │  Simulation Engine (deterministic) │            │
│  │  - Lab runner                      │            │
│  │  - Evidence generator              │            │
│  │  - Command simulator               │            │
│  └────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

## 3. 3D Architecture

### Scene System

- `SceneManager` — mounts/dismounts scenes per phase
- `InteractiveObject` — clickable devices with inspect panels
- `CameraController` — orbit, pan, zoom, focus-on-object
- `LabelSystem` — world-space labels + tooltips
- `Fallback2D` — topological diagram when WebGL unavailable

### Scenes by Phase

| Phase | Scene                                                  |
| ----- | ------------------------------------------------------ |
| 0     | SOC room (workstations, rack, firewall, monitor)       |
| 1     | Endpoint + network basic topology                      |
| 2     | Security controls visual                               |
| 3     | Attack simulation (safe, visual only)                  |
| 4     | Enterprise network architecture (Internet→FW→DMZ→Core) |
| 5     | Identity architecture (HR→IdP→AD→Apps)                 |
| 7     | SOC dashboard + SIEM/EDR simulation                    |
| 23    | Full SOC capstone environment                          |

### Interactive Object Schema

```ts
type Device = {
  id: string;
  type: 'pc' | 'server' | 'firewall' | 'switch' | 'router' | 'ap' | 'dc' | 'siem';
  label: string;
  ip?: string;
  mac?: string;
  status: 'up' | 'down' | 'alert';
  interfaces?: Interface[];
  events?: LogEntry[];
  securityState?: Record<string, unknown>;
};
```

## 4. Simulation Engine

### Design

- Deterministic state machine per lab
- Input → state transition → output + evidence
- No real network calls, no real tool execution
- Outputs labeled: `real` / `simulated` / `prepared`

### Lab Runner

```
LabDefinition
  ├── objective
  ├── steps[]
  ├── expected[]
  ├── verification[]
  └── evidence[] (prepared artifacts)

SimulationEngine
  ├── load(lab)
  ├── step(action) → result + evidence
  ├── verify() → pass/fail
  └── reset()
```

### Safe Command Simulator

For Windows/Linux/Sysmon commands, use prepared outputs mapped by command + args. Never execute on host.

## 5. Data Models

```ts
// Curriculum
type Course = { id; title; phases[] };
type Phase = { id; title; lessons[]; labs[]; scene? };
type Lesson = { id; title; objectives[]; sections[]; quiz[] };
type Lab = { id; title; objective; steps[]; evidence[]; challenge? };
type QuizQuestion = { id; type:'mcq'|'scenario'|'pbq'; stem; options; answer; explanation; examClue? };

// Learner State
type Progress = { phaseId; lessonId; labId; completed; score; timestamp };
type MasteryEntry = { conceptId; level:0-6; lastReviewed; nextReview; weak? };
type Note = { id; lessonId; content; created };

// Evidence / GitHub
type EvidenceItem = { id; labId; type:text|screenshot|log|report; content; capturedAt };
type GitHubProject = { labId; repo; files[]; generatedAt };
```

## 6. Progress / Mastery Architecture

- **Mastery level 0–6**: Never encountered → Teach
- **Spaced repetition**: weak areas re-enter future assessments
- **Daily mode**: progress check → weak review → next lesson → exercise → challenge → quiz → grade → update → homework → preview
- **Mock exam**: timed, no answer reveal until submitted, domain scores, weak/strong areas, readiness verdict
- **Storage**: localStorage for learner state (single-user web app); no server required

## 7. Implementation Roadmap

| Phase | Scope                                        | Key Deliverables                                                                                  |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 0     | Platform Foundation + SOC 3D                 | Dashboard, roadmap, nav, progress, quiz engine, mastery, notes, evidence, GH generator, SOC scene |
| 1     | Foundations                                  | 2 endpoints, process/network inspection labs, basic topology 3D                                   |
| 2     | Security Fundamentals                        | CIA/AAA/controls interactive scenarios                                                            |
| 3     | Threats & Attacks                            | Malware/phishing simulations, safe incident evidence                                              |
| 4     | Architecture                                 | Enterprise network 3D, DMZ/segmentation                                                           |
| 5     | IAM                                          | Identity lifecycle lab + 3D architecture                                                          |
| 6–8   | Crypto / SOC Ops / Windows / Linux           | Labs + scenes                                                                                     |
| 9–11  | Vuln Mgmt / Network / Incident Response      | Scanning labs, IR console                                                                         |
| 12–15 | Threat Intel / Cloud / Mobile-IoT / App-Data | Simulated exercises                                                                               |
| 16–18 | GRC / BCP-DR / Hardening                     | Risk assessment lab                                                                               |
| 19–21 | Automation / Wireshark / Troubleshooting     | Parser, packet labs, investigation UI                                                             |
| 22    | SOC Capstone                                 | Full multi-stage incident                                                                         |
| 23    | Exam Prep                                    | Quiz engine + mock exams                                                                          |
| 24    | GitHub Portfolio                             | Project generator                                                                                 |
| 25    | Career Mode                                  | Job-description mapper                                                                            |
| 26    | IAM Bridge                                   | Security+ → IAM concepts                                                                          |

## 8. Decisions Made in Phase 0

These were open at proposal time and are now settled:

| Question           | Decision                                                                                 | Reason                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| SOC room layout    | Devices on a single floor plane (y = 0) around a central firewall, video wall at z = -12 | Two devices sharing an (x, z) collide in 3D and collapse to one node in the top-down 2D fallback |
| Notes storage      | JSON in `localStorage` via Zustand `persist`                                             | No backend; markdown files would need a filesystem the browser does not have                     |
| Quiz engine        | Inline, all questions on one page                                                        | Mock-exam mode needs a review pass over unanswered items before submit                           |
| 2D fallback        | Pure SVG topology                                                                        | Renders without a GPU, is keyboard-accessible, and carries the same device data                  |
| TypeScript version | Pinned to 6.0.3                                                                          | `typescript-eslint` cannot load against TS 7; see README                                         |

Additional decisions taken during implementation:

- **Provenance is a required field**, not optional metadata, on every simulation output — a lab author cannot ship unlabelled output.
- **The command simulator is a closed allowlist**, not a filter. Safety comes from there being no execution path at all, rather than from blocking dangerous strings.
- **The 3D scene is lazily loaded.** Learners on the 2D fallback path never download the 1 MB 3D engine.
- **The 2D fallback has three triggers**: no WebGL support, a React render error inside the canvas, and a `webglcontextlost` event.
- **Zustand selectors must return stable references.** Selecting a freshly built array loops forever under `useSyncExternalStore`; derived collections are computed in `useMemo` from a stable state slice.

## 9. Phase 1 — Decisions

| Question                             | Decision                                                                          | Reason                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Where does the connection path live? | `src/data/connectionPath.ts`, rendered by both scenes and echoed by the simulator | Keeps the 3D scene, 2D fallback, detail panels, and `trace connection` transcript from drifting apart               |
| Controls vs detection                | Separate fields on each stage, not one list                                       | A control that blocks and a control that sees are different things — that distinction is the phase's teaching point |
| Command allowlist growth             | Split per phase, composed into `SIM_COMMANDS`                                     | Each phase's prepared evidence stays reviewable on its own; the closed-allowlist contract is unchanged              |
| Phase-count assertions               | Replaced with invariants over all phases                                          | A test asserting "there is exactly one phase" must fail on success — it encoded progress, not a rule                |

## 10. Phase 2 — Decisions

| Question                             | Decision                                                                   | Reason                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How do scenario options work?        | One shared pool across all six fields; each option correct for exactly one | Six independent dropdowns let learners pattern-match each field. A shared pool forces the threat/vulnerability decision, which is what the exam actually tests |
| Can an option move between fields?   | Yes — click it in the new field                                            | `assign()` already cleared the old slot; blocking the click made "this is a threat, not a vulnerability" corrections impossible to express                     |
| What does wrong-answer feedback say? | The learner's own choice is explained first, then the correction           | Giving only the right answer skips the misconception that produced the error                                                                                   |
| Layout for defence in depth          | Concentric rings, not a linear path                                        | Phase 1's path is linear; layering is concentric. Reusing the linear layout would misrepresent the concept                                                     |
| How is "controls fail" taught?       | Layers can be failed interactively, and a counter reports survivors        | Turns the strategy's core assumption into an action rather than a sentence                                                                                     |

## 11. Phase 3 — Decisions

| Question                             | Decision                                                                        | Reason                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| How is attack content kept safe?     | Recognition and defence only; safety enforced by tests over the phase text      | Review notes rot; assertions against payload, credential, and non-reserved-identifier patterns cannot be quietly regressed |
| Is the attack chain a new model?     | No — each stage cross-links to a Phase 2 defence layer and a Phase 1 path stage | The chain is the two existing models seen from the attacker's side; tests assert both cross-references resolve             |
| Interaction for the chain scene      | Break a link (attack halts) — the inverse of Phase 2's fail a layer             | Same interaction grammar, opposite polarity, reinforcing that one stage is enough to stop                                  |
| Where does the Phase 0 incident fit? | It is stage 5 of 6, stated explicitly in lesson and transcript                  | Gives the platform a single narrative spine across four phases                                                             |

## 12. Phase 4 — Decisions

| Question                          | Decision                                                                  | Reason                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| What organises the architecture?  | A numeric trust level per zone, with `trustDelta()` on each boundary      | Turns "a boundary exists where trust changes" into something computable and testable — the steepest delta demonstrably gets the strictest control |
| How is `help` scoped?             | Commands carry a phase; `LabView` caps the listing at the lab's own phase | 55 commands in a Phase 0 lab was noise and a spoiler. Scopes the listing only; `runCommand` still matches the full allowlist                      |
| Where does the phase number live? | Applied at composition (`PreparedCommand` = `Omit<SimCommand,'phase'>`)   | Avoids repeating the number on every one of 65 entries and makes it impossible to mistag one                                                      |
| Zone-to-device linkage            | Descriptive strings for now, not typed references                         | Noted as a limitation; worth making structural when Phase 11 revisits network security                                                            |

## 13. Phase 5 — Decisions

| Question                    | Decision                                          | Reason                                                                                                                                  |
| --------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Shape of the identity scene | A ring, not a line                                | The lifecycle closes: deprovisioning returns the identity to HR authority, and a rehire rejoins the loop rather than starting a new one |
| Troubleshooting interaction | Three-part diagnosis: stage, then cause, then fix | Localising before explaining is the actual engineering skill; an engineer who cannot localise fixes the wrong layer                     |
| Mastery credit              | Only on a fully correct diagnosis                 | Right cause with the wrong stage is not a solved incident                                                                               |
| Crypto artifacts            | Structure shown, all signatures and keys redacted | The teaching value of a SAML assertion is which fields must be validated, not its bytes                                                 |
| Route splitting             | Every route lazy except Dashboard                 | Curriculum text is shared and stays in the main chunk; per-view data files split out cleanly (605 kB → 424 kB at Phase 4)               |

## 14. Phase 6 — Decisions

| Question                               | Decision                                                                                             | Reason                                                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Digest and encoding values             | Real and verifiable, checked against Node crypto by test                                             | The phase's claim is "verify it yourself"; invented values would teach the shape while undermining that claim on the one topic where it matters most |
| Key material                           | Always redacted, never fabricated                                                                    | Unlike digests, ciphertext and keys cannot be made verifiable without publishing a key                                                               |
| How the four-way distinction is taught | A model with provides/does-not-provide, plus a graded exercise reporting the specific confusion made | "You called hashing encryption 3 times" is more actionable than a score                                                                              |
| Discriminating framing                 | Two questions — reversible? needs a key? — asserted by test to uniquely separate all four            | If an edit made two operations share both answers, the framing silently stops working                                                                |
| TLS scene form                         | Sequence diagram with lifelines                                                                      | The conventional representation for a message exchange; local computation steps render as self-loops, not crossing arrows                            |

## 15. Phase 7 — Decisions

| Question                         | Decision                                                                       | Reason                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| How does the investigation work? | Pivoting on indicators keyed into every log event, not a scripted walkthrough  | Supports real searching, following and backtracking — the actual investigative skill                                    |
| Are all alerts real?             | No — two of five are false positives                                           | A queue where everything is real teaches the wrong reflex; discrimination is the job                                    |
| How is triage graded?            | Both error directions named separately: missed incidents and false escalations | They have different costs, and escalate-everything must not score well                                                  |
| Is there a 3D scene?             | No — the phase reuses the Phase 0 SOC room                                     | PROMPT.md specifies a dashboard and investigation lab; a decorative scene would contradict "functional, not decorative" |
| Beacon detection signal          | Regularity of interval, never volume                                           | The real beacon moved 4 KB per check-in; a volume rule would miss it and catch the nightly backup                       |

## 16. Phase 8 — Decisions

| Question                               | Decision                                                                                                     | Reason                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| How to satisfy "hands-on" labs safely? | Simulated walkthrough in-platform PLUS real commands scoped to a VM the learner owns                         | PROMPT.md asks for hands-on; CLAUDE.md requires owned environments. Doing both is honest; pretending a simulation is hands-on is not |
| Gradeable form of "harden an endpoint" | A 24-item configuration audit: is each setting compliant or a finding?                                       | Mirrors the Phase 7 triage discrimination — not everything that looks wrong is wrong                                                 |
| Audit metrics                          | Missed findings, false findings, and high-severity missed, tracked separately                                | Flagging everything must score poorly; missing an access path is worse than missing an info disclosure                               |
| Deliberate traps                       | UAC "Enabled" with silent elevation; Defender healthy with C:\ excluded; persistence listed as a config item | The headline reading being wrong is the actual skill being taught                                                                    |
| Command syntax                         | Real and correct PowerShell                                                                                  | Learners run the same commands on their own VM, so nothing has to be unlearned                                                       |

## 17. Phase 9 — Decisions

| Question                                               | Decision                                                                                                                | Reason                                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| How to stop curriculum text bloating the eager bundle? | A generated `phaseIndex.json` with only ids, titles and descriptions; Dashboard imports that instead of `curriculum.ts` | Dashboard is the eager landing route, so importing the curriculum pulled every phase's full text. 599 kB → 262 kB |
| Generated or hand-written index?                       | Generated via `npm run gen:index`, committed, with five drift guards                                                    | No build step, and forgetting to regenerate fails the suite rather than shipping stale data                       |
| Is Linux a repeat of Windows?                          | No — same intrusion on both hosts, with an explicit concept mapping and cross-platform continuity tests                 | The transfer is the point; tests stop the two phases telling different stories                                    |
| Hands-on labs                                          | Same owned-environment scoping as Phase 8, asserted by test                                                             | PROMPT.md asks for hands-on; CLAUDE.md requires owned environments                                                |

## 18. Phase 10 — Decisions

| Question                                | Decision                                                                     | Reason                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Hard-code severities or implement CVSS? | Implement the published v3.1 formula, verified against nine official vectors | A learner can change a metric and watch the score move; a wrong scoring engine would be worse than none because it would be trusted |
| Rounding                                | The spec's integer-arithmetic Roundup, verbatim                              | `Math.ceil(x*10)/10` is wrong for values already exact at one decimal place — the usual source of subtly incorrect implementations  |
| Store scores or vectors?                | Vectors only; the score is always computed                                   | Keeps the data honest and makes the calculator the single source of truth                                                           |
| False positive vs constrained           | Modelled as distinct categories                                              | Conflating them is how genuine findings quietly stay open                                                                           |
| Tools (Nmap, OpenVAS, Nessus)           | Taught by their output; nothing executed; authorisation stated first         | PROMPT.md's "only authorized/isolated environments" is a permission question, not a technical one                                   |

## 19. Phase 11 — Decisions

| Question                                | Decision                                     | Reason                                                                                                                                                             |
| --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Show recommended values in the review?  | No — config only, exactly as it would appear | Phase 8's audit showed both sides, which makes it mechanical. Knowing what right looks like is the actual skill; a test asserts the config never leaks its verdict |
| Hard-code the shadowed rules?           | No — compute from CIDR and port containment  | Lets the learner reorder and watch the analysis change; also surfaced that relocating the broad permit does not fully fix it                                       |
| Redundant vs contradicted               | Distinguished                                | Same-action shadowing is dead weight; differing-action shadowing actively defeats a control                                                                        |
| Include correct-but-questionable items? | Yes — alert-only IDS, split-tunnel VPN       | Flagging everything must score badly; both are legitimate design trade-offs                                                                                        |

## 20. Phase 12 — Decisions

| Question                                     | Decision                                                             | Reason                                                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Grade containment right/wrong, or on axes?   | Two axes: `stopsAttacker` and `preservesEvidence`, graded separately | Right/wrong hides the actual difficulty. Reimaging genuinely stops the attacker and is still the wrong call — only a two-axis model states both at once |
| Which incident to work end to end?           | The one carried since Phase 0 (IR-2026-0908-01)                      | Every prior phase contributed a finding to it; closing it here makes the platform one continuous case rather than twelve unrelated exercises            |
| Eight incident types as full investigations? | No — one worked case plus seven modelled patterns                    | Eight complete investigations would be eight shallow ones. Patterns carry indicators, containment priority, evidence, and the characteristic mistake    |
| Shuffle the timeline randomly?               | Seeded xorshift32, deterministic                                     | The exercise must be reproducible — a learner retrying, or comparing notes, needs the same starting order                                               |
| Score the timeline all-or-nothing?           | Partial credit per position                                          | Nine of eleven events in sequence is real progress; a binary score cannot distinguish it from having no idea                                            |
| Reveal event times before submission?        | No — times appear only after grading                                 | The times are the answer. Correlation is the skill; reading a sorted column is not                                                                      |

## 21. Phase 0 — As Built

```
src/
├── components/     AppLayout, Dashboard, Roadmap, SOCView, LabLibrary, LabView,
│                   LessonView, QuizView, ProgressView, NotesView, EvidenceView,
│                   GitHubView, IncidentConsoleView, DevicePanel, ui
├── scenes/         SOCScene, PathScene, ControlsScene, AttackChainScene,
│                   ZoneScene, IdentityScene, TlsScene (R3F); plus a 2D SVG
│                   fallback for each
├── sim/            types (provenance contract), commands + phase1..phase12
│                   Commands (phase-tagged allowlist), engine (runner)
├── lib/            quizEngine, riskEngine, troubleshootEngine, cryptoClassify,
│                   triageEngine, auditEngine, cvss, vulnTriage,
│                   firewallAnalysis, configReview, irEngine, srs,
│                   githubGenerator, webgl
├── store/          useProgressStore, useMasteryStore, useNotesStore, useEvidenceStore
├── data/           curriculum, phase1..phase12, phaseIndex (generated),
│                   examBlueprint, socDevices,
│                   connectionPath, defenceLayers, riskScenarios, attackChain,
│                   networkZones, identityLifecycle, iamIncidents,
│                   cryptoOperations, tlsHandshake, socTelemetry, windowsBaseline,
│                   vulnFindings, networkConfig, incidents
├── types.ts
└── main.tsx

tests/              quizEngine, srs, simEngine, stores, curriculum, components,
                    phase1..phase12 (686 tests)
```
