# Phase 20 Completion Report — Security Automation

**Exam domain:** Security Operations (4.0, SY0-701)
**Status:** Complete
**Route:** `/automation`
**Tests:** 710 passing across 18 files (3 new since Phase 19: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `AutomationView` chunk 20.79 kB (5.98 kB gzipped), zero TypeScript errors

## 1. Design Note: Safe Simulation of "Automation" Content

Phase 20 is unique in that its PROMPT.md projects (parse logs, detect failed logins, extract indicators, generate reports, query an API, automate evidence collection) describe *writing and running scripts*. Consistent with this platform's safety contract (`src/sim/` never executes anything — every "tool output" is a lookup in a prepared table), Phase 20 teaches these concepts through **annotated, display-only script text and prepared outputs**, exactly like every other simulated command in the platform. No script is ever executed; `show log parsing script` and `show enrichment script` are read-only pseudocode/Python text for the learner to reason about, not runnable code. This preserves the "no execution path" safety guarantee while still meeting every PROMPT.md project bullet.

## 2. Features Delivered

| PROMPT.md requirement (Phase 20 — Security Automation) | Status | Evidence                                                                 |
| ------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------|
| Python security basics                                        | Done   | Lesson 1, "Why Python for Security Automation" + quiz p20-q9              |
| JSON                                                           | Done   | Lesson 1, "JSON as the Lingua Franca of Security APIs" + quiz p20-q1      |
| APIs                                                           | Done   | Lesson 1, "APIs and Secure Automation Practices" + quiz p20-q5, p20-q16   |
| Automation                                                     | Done   | Both lessons; SOAR section + quiz p20-q3, p20-q4, p20-q8, p20-q17         |
| Log parsing                                                    | Done   | Lesson 1, "Regular Expressions for Log Parsing" + quiz p20-q0, p20-q6, p20-q7 |
| IOC processing                                                 | Done   | Lesson 2, "Extracting Indicators of Compromise (IOCs) from Text" + quiz p20-q11, p20-q12 |
| Report generation                                              | Done   | Lesson 2, "Automating Report Generation" + quiz p20-q13, p20-q18          |
| SOAR concepts                                                  | Done   | Lesson 1, "SOAR" section + quiz p20-q3, p20-q4, p20-q8                    |
| Project — parse authentication logs                            | Done   | `p20-lab-0` step 1-2, `show raw auth log` / `show log parsing script`     |
| Project — detect repeated failed logins                        | Done   | `p20-lab-0` step 3, `show failed login analysis` + quiz p20-q10           |
| Project — extract indicators                                   | Done   | IOC classification exercise + `show failed login analysis` indicator extraction |
| Project — generate security reports                            | Done   | `p20-lab-1` step 3, `show generated report`                              |
| Project — query a simulated API                                | Done   | `p20-lab-1` step 1-2, `show api response sample` / `show enrichment script` |
| Project — automate evidence collection                         | Done   | `p20-lab-1` step 4, `show evidence collection log` + quiz p20-q14, p20-q15 |

### Lessons

| #   | Lesson                                        | Topics covered                                                                                    |
| --- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 0   | Python & Automation Fundamentals for Security     | Why Python, JSON structure, regex log parsing, secure API credential handling, SOAR (orchestration + automation + response) |
| 1   | Building Security Automation Projects             | Failed-login detection, IOC extraction (MD5/SHA-256/IP/domain/URL, defanging), report generation, resilient API querying, evidence automation/chain of custody |

19 quiz questions across the two lessons (mix of MCQ and scenario), consistent with Phases 14–19.

### Labs

| #   | Lab                                                          | What it exercises                                                                 |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------|
| 0   | Parse Authentication Logs and Detect Failed Login Patterns (`p20-lab-0`) | Regex field extraction, threshold/time-window detection, distinguishing attack pattern from user error |
| 1   | Automate a Security Report and Query a Simulated API (`p20-lab-1`)       | JSON response parsing, hardcoded-credential gap in a script, automated report structure, missing evidence hash |

### Prepared simulator commands (`src/sim/phase20Commands.ts`)

7 commands, deterministic, labelled `simulated`: `show raw auth log`, `show log parsing script`, `show failed login analysis`, `show api response sample`, `show enrichment script`, `show generated report`, `show evidence collection log`.

### Supporting code

- [src/data/phase20.ts](../src/data/phase20.ts) — lessons, quizzes, labs, `PHASE_20` export.
- [src/components/AutomationView.tsx](../src/components/AutomationView.tsx) — interactive UI (IOC type classification, pipeline stage identification, automation gap audit, knowledge check, summary).
- [src/lib/automationEngine.ts](../src/lib/automationEngine.ts) — pure grading functions for the interactive exercises.
- [src/sim/phase20Commands.ts](../src/sim/phase20Commands.ts) — prepared command outputs, including annotated (non-executable) script text.
- `src/data/curriculum.ts` — imports/exports `PHASE_20`, included in `PHASES` and `PHASE_OUTLINE` (`status: 'available'`).
- `src/sim/commands.ts` — `...inPhase(20, PHASE_20_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/automation` route (lazy-loaded) and sidebar nav entry, added together per the established Phase 15+ workflow.

## 3. Safety Review During Authoring

Given this phase's content directly discusses API credentials and includes an intentional "hardcoded credential" finding (`show enrichment script`), extra care was taken to avoid tripping — or worse, defeating the purpose of — the credential-leak safety test:

- The placeholder credential value is `'lab-demo-placeholder-not-a-real-token'`, an obviously fictional string, not a plausible-looking secret.
- The variable name `TI_TOKEN` was used instead of any `api_key`/`api-key`/`apikey` variant, since those substrings are explicitly forbidden by `tests/simEngine.test.ts` regardless of context.
- `f'Bearer {TI_TOKEN}'` is a template string containing a `{...}` placeholder, not a literal 20+ character bearer token value, so it does not match the bearer-token safety regex.
- Verified via grep against all four safety patterns (`password=`, `secret:`, `api-key`/`api_key`, `BEGIN ... PRIVATE KEY`, long bearer tokens) before running the test suite — no matches.

## 4. Tests

- All 710 tests pass across 18 test files (`npm test -- --run`).
- Curriculum structural checks: unique lesson/lab/quiz IDs, answer indices in range, explanations >10 chars, domain tags present (`Security Operations`), lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson).
- Roadmap outline: Phase 20 listed with `status: 'available'`.
- Simulator safety: every Phase 20 prepared command is provenance-labelled `simulated`, contains no real credentials, keys, or tokens, and no script is ever executed.

## 5. Build

`npm run build` completes with zero TypeScript errors. `AutomationView` is code-split into its own 20.79 kB chunk (5.98 kB gzipped), loaded lazily via `React.lazy` in `App.tsx`.

## 6. Security Review

- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic, prepared, and labelled `simulated`; the "script" text shown is display-only and is never executed by the platform.
- The intentional hardcoded-credential finding uses an obviously fictional placeholder value and exists specifically to teach the learner to recognise and remediate that exact anti-pattern.

## 7. Acceptance Criteria

- [x] Phase 20 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are wired into `curriculum.ts` and exported.
- [x] `src/data/phaseIndex.json` matches `PHASES` and includes the phase-20 entry.
- [x] Simulator commands for Phase 20 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 710 tests pass.
- [x] Production build completes without errors.
- [x] `AutomationView` is reachable from the main navigation (route + nav entry added together).

## Next Phase

**Phase 21 — Wireshark & Packet Analysis**, per `PROMPT.md`. Currently listed as `planned` in `PHASE_OUTLINE`. Awaiting approval to proceed.

---
*Report generated at the completion of Phase 20. All material follows the CompTIA Security+ SY0-701 exam objectives and the platform's phase-gated build process.*
