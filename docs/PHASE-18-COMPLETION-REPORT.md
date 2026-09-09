# Phase 18 Completion Report — Business Continuity & Disaster Recovery

**Exam domain:** Security Program Management and Oversight (5.0, SY0-701)
**Status:** Complete
**Route:** `/bcdr`
**Tests:** 704 passing across 18 files (3 new since Phase 17: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `BcdrView` chunk 20.86 kB (6.03 kB gzipped), zero TypeScript errors

## 1. Features Delivered

| PROMPT.md requirement (Phase 18 — BC/DR) | Status | Evidence                                                                 |
| ------------------------------------------- | ------ | ----------------------------------------------------------------------------|
| BCP                                          | Done   | Lesson 1, "Business Continuity vs Disaster Recovery" + quiz p18-q0        |
| DR                                           | Done   | Lesson 1, "Business Continuity vs Disaster Recovery" + quiz p18-q0        |
| RTO                                          | Done   | Lesson 1, "RTO and RPO" + quiz p18-q1, p18-q7                             |
| RPO                                          | Done   | Lesson 1, "RTO and RPO" + quiz p18-q2, p18-q7                             |
| MTTR                                         | Done   | Lesson 1, "MTTR and MTBF" + quiz p18-q4                                   |
| MTBF                                         | Done   | Lesson 1, "MTTR and MTBF" + quiz p18-q3                                   |
| Backups                                      | Done   | Lesson 1, "Backup Strategies and the 3-2-1 Rule" + quiz p18-q5, p18-q8    |
| Recovery strategies                          | Done   | Lesson 2, "Matching Site Type to RTO and Budget" + quiz p18-q15           |
| High availability                            | Done   | Lesson 1, "High Availability and Redundancy" + quiz p18-q6, p18-q9        |
| Redundancy                                   | Done   | Lesson 1, "High Availability and Redundancy" + quiz p18-q6, p18-q9        |
| Alternate sites                              | Done   | Lesson 2, "Alternate Site Types" + quiz p18-q10, p18-q11                  |
| Disaster scenarios                           | Done   | Lesson 2, "Disaster Scenarios" + quiz p18-q13, p18-q14, p18-q16, p18-q18  |
| Lab — recovery plans for ransomware/server/network/cloud outages | Done | `p18-lab-1` "Design Recovery Plans for Four Disaster Scenarios" covers all four named in PROMPT.md |

### Lessons

| #   | Lesson                                        | Topics covered                                                                                   |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 0   | BC/DR Fundamentals & Metrics                   | BCP vs DR, RTO/RPO (traced to Phase 17 BIA), MTTR vs MTBF, 3-2-1 backup rule, active-active/passive HA |
| 1   | Recovery Sites, Testing & Disaster Scenarios   | Hot/warm/cold/cloud sites, site-to-RTO matching, BC/DR test types, ransomware/server/network/cloud outage recovery, communication plans |

19 quiz questions across the two lessons (mix of MCQ and scenario), consistent with Phases 14–17.

### Labs

| #   | Lab                                                             | What it exercises                                                                 |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------|
| 0   | Calculate Recovery Objectives and Choose a Recovery Site (`p18-lab-0`) | Backup-frequency vs RPO gap, BIA-to-RTO/RPO traceability, site selection by cost/speed |
| 1   | Design Recovery Plans for Four Disaster Scenarios (`p18-lab-1`)    | Ransomware (immutable backups), server outage (redundancy), network outage (path diversity), cloud outage (multi-region), test-log gap analysis |

### Prepared simulator commands (`src/sim/phase18Commands.ts`)

8 commands, deterministic, labelled `simulated`, continuing the fictional "Meridian Retail Co." from Phase 17: `show backup schedule`, `show recovery objectives`, `show site options`, `show disaster scenario ransomware`, `show disaster scenario server outage`, `show disaster scenario network outage`, `show disaster scenario cloud outage`, `show bcdr test log`.

### Supporting code

- [src/data/phase18.ts](../src/data/phase18.ts) — lessons, quizzes, labs, `PHASE_18` export.
- [src/components/BcdrView.tsx](../src/components/BcdrView.tsx) — interactive UI (recovery metric classification, alternate site selection, BC/DR gap audit, disaster scenario knowledge check, summary).
- [src/lib/bcdrEngine.ts](../src/lib/bcdrEngine.ts) — pure grading functions for the interactive exercises.
- [src/sim/phase18Commands.ts](../src/sim/phase18Commands.ts) — prepared command outputs.
- `src/data/curriculum.ts` — imports/exports `PHASE_18`, included in `PHASES` and `PHASE_OUTLINE` (`status: 'available'`).
- `src/sim/commands.ts` — `...inPhase(18, PHASE_18_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/bcdr` route (lazy-loaded) and sidebar nav entry, added together per the established Phase 15+ workflow.

## 2. Continuity with Phase 17

Phase 18 deliberately reuses the fictional company ("Meridian Retail Co.") and its Business Impact Analysis from Phase 17. `show recovery objectives` explicitly traces each RTO/RPO value back to the Phase 17 BIA's MTD figures, reinforcing the PROMPT.md requirement that these two phases work as a connected pair rather than isolated topics.

## 3. Safety Review During Authoring

Every prepared command output in `phase18Commands.ts` was checked against the credential-leak safety regexes before running tests. No matches were found in the actual safety-relevant patterns (`password=`, `secret:`, `api-key`, private-key blocks, bearer tokens) — a broader diagnostic grep flagged the substring "begin" inside unrelated words (e.g., "begins"), which does not match the actual test regex (`BEGIN [A-Z ]*PRIVATE KEY`) and required no change.

## 4. Tests

- All 704 tests pass across 18 test files (`npm test -- --run`).
- Curriculum structural checks: unique lesson/lab/quiz IDs, answer indices in range, explanations >10 chars, domain tags present (`Security Program Management and Oversight`), lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson).
- Roadmap outline: Phase 18 listed with `status: 'available'`.
- Simulator safety: every Phase 18 prepared command is provenance-labelled `simulated`, uses only fictional company data, and contains no real credentials, keys, or tokens.

## 5. Build

`npm run build` completes with zero TypeScript errors. `BcdrView` is code-split into its own 20.86 kB chunk (6.03 kB gzipped), loaded lazily via `React.lazy` in `App.tsx`.

## 6. Security Review

- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic, prepared, and labelled `simulated`; the company, systems, and figures are entirely fictional, continuing from Phase 17.
- Ransomware recovery guidance is presented at the conceptual/governance level (backup immutability, verification before restore) — no functional exploit or decryption tooling is included.

## 7. Acceptance Criteria

- [x] Phase 18 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are wired into `curriculum.ts` and exported.
- [x] `src/data/phaseIndex.json` matches `PHASES` and includes the phase-18 entry.
- [x] Simulator commands for Phase 18 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 704 tests pass.
- [x] Production build completes without errors.
- [x] `BcdrView` is reachable from the main navigation (route + nav entry added together).

## Next Phase

**Phase 19 — Security Hardening**, per `PROMPT.md`. Currently listed as `planned` in `PHASE_OUTLINE`. Awaiting approval to proceed.

---
*Report generated at the completion of Phase 18. All material follows the CompTIA Security+ SY0-701 exam objectives and the platform's phase-gated build process.*
