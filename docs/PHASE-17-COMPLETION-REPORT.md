# Phase 17 Completion Report — Governance, Risk & Compliance

**Exam domain:** Security Program Management and Oversight (5.0, SY0-701)
**Status:** Complete
**Route:** `/grc`
**Tests:** 701 passing across 18 files (3 new since Phase 16: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `GrcView` chunk 19.75 kB (5.65 kB gzipped), zero TypeScript errors

## 1. Features Delivered

| PROMPT.md requirement (Phase 17 — Governance, Risk & Compliance) | Status | Evidence                                                                 |
| ---------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------|
| Risk management                                                         | Done   | Lesson 1, "The Risk Management Process" + quiz p17-q4                     |
| Risk assessment                                                         | Done   | Lesson 1, "Risk Assessment: Qualitative and Quantitative" + quiz p17-q0, p17-q7 |
| Risk treatment                                                          | Done   | Lesson 1, "Risk Treatment: Avoid, Transfer, Mitigate, Accept" + quiz p17-q1, p17-q3, p17-q5 |
| Policies / standards / procedures / guidelines                          | Done   | Lesson 1, "Policies, Standards, Procedures, and Guidelines" + quiz p17-q2, p17-q6, p17-q9 |
| Security awareness                                                      | Done   | Lesson 1, "Security Awareness and Training" + quiz p17-q8                 |
| Business continuity / disaster recovery / IR plans (referenced only)     | Done   | Noted as governance document outputs; full depth deferred to Phase 18 by design |
| Data classification, retention, privacy                                 | Done   | Lesson 2, "Privacy and Data Retention in a Compliance Context" + quiz p17-q18 |
| Compliance                                                               | Done   | Lesson 2, "Compliance and Regulatory Frameworks" + quiz p17-q10, p17-q11, p17-q15 |
| Audits                                                                   | Done   | Lesson 2, "Audits and Assessments" + quiz p17-q14, p17-q16                |
| Third-party / vendor risk                                                | Done   | Lesson 2, "Third-Party and Vendor Risk Management" + quiz p17-q12, p17-q17 |
| Business impact analysis                                                 | Done   | Lesson 2, "Business Impact Analysis (BIA)" + quiz p17-q13                 |
| Lab — simulated risk assessment for a fictional company                  | Done   | `p17-lab-0` "Conduct a Security Risk Assessment"                          |

### Lessons

| #   | Lesson                                    | Topics covered                                                                                     |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------|
| 0   | Risk Management & Governance                | Risk register, ALE/SLE/ARO, avoid/transfer/mitigate/accept, policy/standard/procedure/guideline hierarchy, awareness training |
| 1   | Compliance, Audits & Third-Party Risk       | GDPR/HIPAA/PCI DSS/SOC 2, internal vs external audits, vendor risk & right-to-audit, BIA/MTD, privacy vs security scope |

19 quiz questions across the two lessons (mix of MCQ and scenario), consistent with Phases 14–16.

### Labs

| #   | Lab                                                     | What it exercises                                                                 |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------|
| 0   | Conduct a Security Risk Assessment (`p17-lab-0`)         | Asset/threat identification, risk register gap analysis, ALE calculation, treatment recommendation |
| 1   | Assess Vendor & Compliance Risk (`p17-lab-1`)            | Vendor due-diligence gaps, unowned audit findings, BIA-driven prioritisation      |

### Prepared simulator commands (`src/sim/phase17Commands.ts`)

7 commands, deterministic, labelled `simulated`, for a fictional company ("Meridian Retail Co."): `show asset inventory`, `show threat catalog`, `show risk register`, `show risk calculation`, `show vendor risk assessment`, `show compliance audit findings`, `show business impact analysis`.

### Supporting code

- [src/data/phase17.ts](../src/data/phase17.ts) — lessons, quizzes, labs, `PHASE_17` export.
- [src/components/GrcView.tsx](../src/components/GrcView.tsx) — interactive UI (risk treatment matching, document hierarchy classification, governance gap audit, GRC knowledge check, summary).
- [src/lib/grcEngine.ts](../src/lib/grcEngine.ts) — pure grading functions for the interactive exercises.
- [src/sim/phase17Commands.ts](../src/sim/phase17Commands.ts) — prepared command outputs.
- `src/data/curriculum.ts` — imports/exports `PHASE_17`, included in `PHASES` and `PHASE_OUTLINE` (`status: 'available'`).
- `src/sim/commands.ts` — `...inPhase(17, PHASE_17_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/grc` route (lazy-loaded) and sidebar nav entry, added together per the Phase 15/16 workflow fix.

## 2. 3D Components

Phase 17 re-uses the existing SOC scene (`scene: 'soc'`); GRC content — risk registers, document classification, vendor assessments — is inherently tabular/data-driven and is delivered through `GrcView`, consistent with Phases 13–16.

## 3. Scope Boundary with Phase 18

PROMPT.md lists Business Continuity & Disaster Recovery as Phase 18. Phase 17 intentionally introduces BC/DR and incident response plans only as governance document *types* produced by the risk and compliance program (e.g., the BIA's MTD output feeds recovery planning), without duplicating RTO/RPO/backup-strategy content that belongs to Phase 18. This boundary is called out explicitly in Lesson 2, section "Business Impact Analysis (BIA)".

## 4. Safety Review During Authoring

Every prepared command output in `phase17Commands.ts` was checked against the credential-leak safety regexes before running tests (lesson learned from Phases 14–16). No matches were found — the file contains only fictional company/vendor names, dollar figures, and dates, with no literal `password=`, `secret:`, `api-key`, or similar patterns.

## 5. Tests

- All 701 tests pass across 18 test files (`npm test -- --run`).
- Curriculum structural checks: unique lesson/lab/quiz IDs, answer indices in range, explanations >10 chars, domain tags present (`Security Program Management and Oversight`), lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson).
- Roadmap outline: Phase 17 listed with `status: 'available'`.
- Simulator safety: every Phase 17 prepared command is provenance-labelled `simulated`, uses only fictional company data, and contains no real credentials, keys, or tokens.

## 6. Build

`npm run build` completes with zero TypeScript errors. `GrcView` is code-split into its own 19.75 kB chunk (5.65 kB gzipped), loaded lazily via `React.lazy` in `App.tsx`.

## 7. Security Review

- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic, prepared, and labelled `simulated`; the company, vendors, and figures are entirely fictional.
- No real regulatory guidance is presented as legal advice — frameworks (GDPR, HIPAA, PCI DSS, SOC 2) are described at the conceptual level the exam requires, not as compliance counsel.

## 8. Acceptance Criteria

- [x] Phase 17 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are wired into `curriculum.ts` and exported.
- [x] `src/data/phaseIndex.json` matches `PHASES` and includes the phase-17 entry.
- [x] Simulator commands for Phase 17 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 701 tests pass.
- [x] Production build completes without errors.
- [x] `GrcView` is reachable from the main navigation (route + nav entry added together).

## Next Phase

**Phase 18 — Business Continuity & Disaster Recovery**, per `PROMPT.md`. Currently listed as `planned` in `PHASE_OUTLINE`. Awaiting approval to proceed.

---
*Report generated at the completion of Phase 17. All material follows the CompTIA Security+ SY0-701 exam objectives and the platform's phase-gated build process.*
