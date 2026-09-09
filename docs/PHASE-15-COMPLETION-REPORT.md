# Phase 15 Completion Report — Mobile / IoT / Embedded Security

**Exam domain:** Security Architecture (3.0, SY0-701)
**Status:** Complete
**Route:** `/mobile-iot`
**Tests:** 695 passing across 18 files (3 new since Phase 14: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `MobileIotView` chunk 20.32 kB (5.88 kB gzipped), zero TypeScript errors

## 1. Features Delivered

| PROMPT.md requirement (Phase 15 — Mobile/IoT/Embedded) | Status | Evidence                                                                 |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------|
| Mobile threats                                            | Done   | Lesson 1, "The Mobile Threat Landscape" + quiz p15-q9                    |
| Mobile device management (MDM)                            | Done   | Lesson 1, "MDM and UEM" + quiz p15-q1, p15-q5                            |
| BYOD                                                       | Done   | Lesson 1, "Device Ownership Models" (BYOD/COBO/COPE/CYOD) + quiz p15-q0, p15-q4, p15-q8 |
| Application security (mobile)                              | Done   | Lesson 1, "Mobile Application Security" + quiz p15-q2, p15-q6            |
| IoT risks                                                  | Done   | Lesson 2, "The IoT Risk Profile" + quiz p15-q10, p15-q14                 |
| Embedded devices                                           | Done   | Lesson 2, "Embedded Systems and Firmware" + quiz p15-q11, p15-q18        |
| Firmware                                                   | Done   | Lesson 2, "Embedded Systems and Firmware" (EOL risk)                     |
| Device identity                                            | Done   | Lesson 2, "Device Identity" (per-device X.509 vs shared PSK) + quiz p15-q12 |
| Network segmentation                                       | Done   | Lesson 2, "Network Segmentation for IoT" + quiz p15-q13, p15-q15, p15-q17 |
| Lab — design a secure enterprise IoT network                | Done   | `p15-lab-1` "Design a Secure Enterprise IoT Network"                     |

### Lessons

| #   | Lesson                                | Topics covered                                                                                 |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------|
| 0   | Mobile Security & Device Management     | BYOD/COBO/COPE/CYOD, MDM vs MAM, mobile app security (sideloading, permissions), OS sandboxing/jailbreak |
| 1   | IoT & Embedded Device Security          | IoT risk profile, embedded firmware/EOL, device identity (X.509 vs shared PSK), segmentation, supply-chain risk |

19 quiz questions across the two lessons (mix of MCQ and scenario), matching the Phase 14 precedent.

### Labs

| #   | Lab                                              | What it exercises                                                                 |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------------------|
| 0   | Audit a Mobile Device Fleet (`p15-lab-0`)         | MDM enrolment/compliance gaps, jailbreak detection without enforcement, sideloading, BYOD containerisation failures |
| 1   | Design a Secure Enterprise IoT Network (`p15-lab-1`) | Flat-network segmentation gaps, EOL firmware, default credentials, shared vs per-device identity |

### Prepared simulator commands (`src/sim/phase15Commands.ts`)

8 commands, deterministic, labelled `simulated`: `show mdm enrollment`, `show mobile app policies`, `show byod devices`, `show mobile compliance report`, `show iot inventory`, `show iot network segments`, `show firmware status`, `show device certificates`.

### Supporting code

- [src/data/phase15.ts](../src/data/phase15.ts) — lessons, quizzes, labs, `PHASE_15` export.
- [src/components/MobileIotView.tsx](../src/components/MobileIotView.tsx) — interactive UI (ownership classification, IoT VLAN segmentation, misconfiguration audit, IoT/embedded knowledge check, summary).
- [src/lib/mobileIotEngine.ts](../src/lib/mobileIotEngine.ts) — pure grading functions for the interactive exercises.
- [src/sim/phase15Commands.ts](../src/sim/phase15Commands.ts) — prepared command outputs.
- `src/data/curriculum.ts` — imports/exports `PHASE_15`, included in `PHASES` and `PHASE_OUTLINE` (`status: 'available'`).
- `src/sim/commands.ts` — `...inPhase(15, PHASE_15_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/mobile-iot` route (lazy-loaded) and sidebar nav entry.

## 2. 3D Components

Phase 15 re-uses the existing SOC scene (`scene: 'soc'`); mobile/IoT content is delivered through `MobileIotView`, consistent with Phases 13–14 since device-ownership classification, VLAN segmentation, and misconfiguration audits are better represented as structured interactive data than a new 3D environment.

## 3. Gaps Found and Fixed in Prior Phases During This Pass

While wiring Phase 15's navigation, two pre-existing defects from Phases 13–14 were found and corrected:

1. **`ThreatIntelView` (Phase 13) had no route and no nav entry** — the component existed but was completely unreachable in the running app. Added a lazy `/threat-intel` route in `App.tsx` and a sidebar entry in `AppLayout.tsx`.
2. **`CloudSecurityView` (Phase 14) had a route but no nav entry** — reachable only by typing the URL directly, with no discoverable link. Added a sidebar entry.

Both are now reachable from the main navigation, alongside the new Phase 15 entry.

## 4. Tests

- All 695 tests pass across 18 test files (`npm test -- --run`).
- Curriculum structural checks: unique lesson/lab/quiz IDs, answer indices in range, explanations >10 chars, domain tags present (`Security Architecture`), lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson).
- Roadmap outline: Phase 15 listed with `status: 'available'`.
- Simulator safety: every Phase 15 prepared command is provenance-labelled `simulated`, uses only fictional identifiers, and contains no real credentials, keys, or tokens (verified against the credential-leak safety regexes learned from the Phase 14 pass).

## 5. Build

`npm run build` completes with zero TypeScript errors. `MobileIotView` is code-split into its own 20.32 kB chunk (5.88 kB gzipped), loaded lazily via `React.lazy` in `App.tsx`.

## 6. Security Review

- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic, prepared, and labelled `simulated`; no real MDM tenant, IoT device, or network is contacted.
- Default-credential and shared-secret examples are presented purely as recognise-and-remediate findings — no functional exploit code is provided.

## 7. Acceptance Criteria

- [x] Phase 15 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are wired into `curriculum.ts` and exported.
- [x] `src/data/phaseIndex.json` matches `PHASES` and includes the phase-15 entry.
- [x] Simulator commands for Phase 15 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 695 tests pass.
- [x] Production build completes without errors.
- [x] `MobileIotView` is reachable from the main navigation.

## Next Phase

**Phase 16 — Application & Data Security**, per `PROMPT.md`. Currently listed as `planned` in `PHASE_OUTLINE`. Awaiting approval to proceed.

---
*Report generated at the completion of Phase 15. All material follows the CompTIA Security+ SY0-701 exam objectives and the platform's phase-gated build process.*
