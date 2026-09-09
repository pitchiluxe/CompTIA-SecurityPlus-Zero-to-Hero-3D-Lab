# Phase 22 Completion Report — Security Troubleshooting Center

**Exam domain:** Security Operations (4.0, SY0-701)
**Status:** Complete
**Route:** `/troubleshoot-center`
**Tests:** 716 passing across 18 files (3 new since Phase 21: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `TroubleshootCenterView` code-split chunk, zero TypeScript errors

## 1. Features Delivered

| PROMPT.md requirement (Phase 22 — Security Troubleshooting Center) | Status | Evidence |
| --- | --- | --- |
| Scenario 1 — Compromised account | Done | `p22-scenario-0` |
| Scenario 2 — Phishing incident | Done | `p22-scenario-1` |
| Scenario 3 — Malware alert | Done | `p22-scenario-2` |
| Scenario 4 — Suspicious PowerShell | Done | `p22-scenario-3` |
| Scenario 5 — Failed authentication storm | Done | `p22-scenario-4` |
| Scenario 6 — Privilege escalation | Done | `p22-scenario-5` |
| Scenario 7 — Vulnerability finding | Done | `p22-scenario-6` |
| Scenario 8 — Misconfigured firewall | Done | `p22-scenario-7` |
| Scenario 9 — DNS anomaly | Done | `p22-scenario-8` |
| Scenario 10 — Suspicious network traffic | Done | `p22-scenario-9` |
| Investigation Interface — network diagram, device status, logs, alerts, user information, process information, timeline, previous change history | Done | Eight-panel evidence tabs in `TroubleshootCenterView`, one field per scenario in `troubleshootScenarios.ts` |
| "Make the learner investigate rather than immediately revealing the answer" | Done | Diagnosis fields (root cause, recommended action) are graded and revealed only after submission; all eight evidence panels are visible beforehand with no answer shown |

### Lessons

| # | Lesson | Topics covered |
| --- | --- | --- |
| 0 | Structured Security Troubleshooting | Confirmation bias, the eight-panel investigation interface, building/testing a theory of probable cause, root cause vs. symptom vs. contributing factor, change history as a shortcut |
| 1 | Recognising the Ten Common Alert Categories | Diagnostic signatures for all ten scenario categories, grouped by identity, email/malware, endpoint, infrastructure, and network-layer alerts |

19 quiz questions across the two lessons (mix of MCQ and scenario), consistent with Phases 20–21.

### Labs

| # | Lab | What it exercises |
| --- | --- | --- |
| 0 | Investigate a Compromised Account Using the Investigation Interface (`p22-lab-0`) | Works through all eight investigation panels for one worked case before reaching a root cause |
| 1 | Diagnose All Ten Troubleshooting Center Scenarios (`p22-lab-1`) | End-to-end use of the interactive `TroubleshootCenterView` across all ten scenarios |

### Prepared simulator commands (`src/sim/phase22Commands.ts`)

8 commands, deterministic, labelled `simulated`, `tool: 'platform'` — one per Investigation Interface panel named in PROMPT.md: `show network diagram`, `show device status`, `show investigation logs`, `show alert queue`, `show user account details`, `show process information`, `show incident timeline`, `show change history`. Modelled on the Compromised Account scenario as Lab 0's worked example.

### Supporting code

- [src/data/troubleshootScenarios.ts](../src/data/troubleshootScenarios.ts) — all ten scenarios, each with a network diagram, device status, logs, alerts, user/process info, timeline, change history, root-cause options, and action options.
- [src/lib/troubleshootCenterEngine.ts](../src/lib/troubleshootCenterEngine.ts) — pure grading functions for the two-field diagnosis (root cause, recommended action), following the same contract as `troubleshootEngine.ts` (Phase 5) and `triageEngine.ts` (Phase 7).
- [src/data/phase22.ts](../src/data/phase22.ts) — lessons, quizzes, labs, `PHASE_22` export.
- [src/components/TroubleshootCenterView.tsx](../src/components/TroubleshootCenterView.tsx) — interactive UI: scenario selector, eight-tab evidence panel, two-field diagnosis with graded feedback and debrief.
- [src/sim/phase22Commands.ts](../src/sim/phase22Commands.ts) — prepared command outputs, `tool: 'platform'`.
- `src/data/curriculum.ts` — imports/exports `PHASE_22`, included in `PHASES`, and `PHASE_OUTLINE` status flipped from `planned` to `available`.
- `src/sim/commands.ts` — `...inPhase(22, PHASE_22_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/troubleshoot-center` route (lazy-loaded) and sidebar nav entry ("Troubleshooting Center", `Stethoscope` icon), added together per the Phase 13/14 naming lesson in repo memory.

## 2. Design Notes

- **Two-field diagnosis, not three.** Phase 5's IAM troubleshooting grades stage → cause → fix because all its incidents share one lifecycle model. Phase 22's ten scenarios span unrelated domains (identity, email, endpoint, infrastructure, network) with no shared "stage" concept, so the engine grades only root cause and recommended action — matching what the evidence can actually support across all ten cases.
- **Eight commands map 1:1 to PROMPT.md's Investigation Interface list** (network diagram, device status, logs, alerts, user information, process information, timeline, previous change history), rather than inventing an unrelated command set — this keeps the simulator commands directly traceable to the spec.
- **Lab 0 vs. the interactive view.** Following the Phase 21 (`PacketAnalysisView`) precedent, Lab 0's sim commands are a worked example for one scenario (Compromised Account) referenced in `phase22Commands.ts`; the interactive `TroubleshootCenterView` itself pulls scenario data directly from `troubleshootScenarios.ts` rather than the sim command allowlist, since ten independent scenarios' full evidence sets don't fit the single-fixed-string `PreparedCommand` model.

## 3. Safety Review During Authoring

All hostnames, usernames, and IPs across `troubleshootScenarios.ts` and `phase22Commands.ts` are fictional; IPs use RFC 1918 (private) or RFC 5737 (documentation) ranges only. Grepped both new data files plus `phase22.ts` against all four `simEngine.test.ts` safety patterns (`password[:=]`, `secret[:=]`, `api[_-]?key`, `BEGIN ... PRIVATE KEY`, `bearer <token>`) before running tests — no matches. Phrasing that discusses passwords/credentials conceptually (e.g., "stale password," "password reset") deliberately avoids the literal `password:`/`password=` shape that trips the regex.

## 4. Test & Build Verification

- `npm run gen:index` — regenerated `src/data/phaseIndex.json` to include Phase 22.
- `npm test -- --run` — 716 tests passing across 18 files (up from 713 in Phase 21).
- `npm run build` — clean production build; `TroubleshootCenterView` chunk (57.48 kB / 17.83 kB gzip) code-split correctly.

## 5. Known Issues / Follow-ups

None outstanding. All ten scenarios, the eight-panel investigation interface, and both labs are fully wired and tested.

## 6. Next Phase

Phase 23 — Full SOC Capstone: a fictional enterprise SOC with a simulated multi-stage incident (phishing → compromised credentials → suspicious authentication → malicious process → lateral movement → alert → incident response), requiring the learner to detect, triage, investigate, collect evidence, contain, recommend remediation, recover, and document lessons learned.
