# Phase 13 — Threat Intelligence Completion Report

## Features
- **Lesson 1 — Intelligence Lifecycle and Feed Quality**: Covers the six phases of the intelligence lifecycle, STIX/TAXII distinction, the two‑axis Admiralty Code, and feed triage using relevance, rating, and confidence score. Includes a multiple‑choice and a scenario quiz.
- **Lesson 2 — From IOCs to TTPs – Building Durable Detections**: Covers the IOC vs IOA distinction, the Pyramid of Pain, MITRE ATT&CK mapping of the IR‑2026‑0908‑01 incident, and threat actor types (emphasising that attribution to a named group is the least actionable output). Includes a multiple‑choice and a scenario quiz.
- **Lab 1 — Triage Threat Intelligence Feeds**: Learners practice applying the intelligence lifecycle, STIX/TAXII, and the Admiralty Code to determine whether feed items are actionable. Uses the simulator commands `explain intelligence lifecycle`, `explain admiralty code`, and `show intel feed report`.
- **Lab 2 — Classify Indicators and Map the Incident**: Learners practice classifying indicators as IOC or IOA, placing them on the Pyramid of Pain, mapping the incident to ATT&CK techniques, and explaining why actor type matters more than group name. Uses the simulator commands `explain ioc vs ioa`, `show pyramid of pain`, `show attack mapping`, and `compare threat actors`.

## Labs
| Lab | Title | Objective | Commands |
|-----|-------|-----------|----------|
| p13‑lab‑0 | Triage Threat Intelligence Feeds | Apply lifecycle, STIX/TAXII, Admiralty Code to determine feed actionability | `explain intelligence lifecycle`, `explain admiralty code`, `show intel feed report` |
| p13‑lab‑1 | Classify Indicators and Map the Incident | Classify IOC/IOA, place on Pyramid of Pain, map to ATT&CK, explain actor‑type strategy | `explain ioc vs ioa`, `show pyramid of pain`, `show attack mapping`, `compare threat actors` |

## 3D Components
- The Phase 13 scene re‑uses the existing SOC room (`scene: 'soc'`); no new 3D objects are required because the threat‑intelligence content is delivered through the `ThreatIntelView` UI component, which already renders interactive exercises in the browser.

## Tests
- All 689 curriculum tests pass, including:
  - Phase structure consistency (lessons, labs, unique IDs)
  - Roadmap outline matching (`status: 'available'` for Phase 13)
  - Lab command allowlist integration (simulator commands for Phase 13 are included)
  - Quiz integrity (unique IDs, answer indices within range, explanations >10 chars, domain tags)
  - Lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson)
- Build (`npm run build`) succeeds with zero TypeScript errors.

## Security Review
- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic and labelled as `SIMULATED OUTPUT`; no real tools execute against live systems.
- IOCs and IOAs are discussed as concepts only; no functional detection logic is exposed that could be reused against unauthorized targets.

## Known Issues
- The `FEED_ITEMS` import was temporarily removed from `ThreatIntelView.tsx` to resolve a build‑time unused‑import error; the component still functions correctly using the imported data from `threatIntel.ts`.
- The phase index was regenerated (`npm run gen:index`) and validated against the test suite.

## Acceptance Criteria
- [x] Phase 13 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are correctly wired into `curriculum.ts` and exported.
- [x] Phase index JSON (`src/data/phaseIndex.json`) matches `PHASES` and includes phase‑13 entries.
- [x] Simulator commands for Phase 13 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 689 curriculum tests pass.
- [x] Production build (`npm run build`) completes without errors.

## Evidence
- `src/data/phase13.ts` – lessons, labs, and `PHASE_13` export.
- `src/data/curriculum.ts` – imports and exports `PHASE_13`, added to `PHASES` array and `PHASE_OUTLINE`.
- `src/sim/commands.ts` – includes `...inPhase(13, PHASE_13_COMMANDS)`.
- `scripts/genPhaseIndex.script.ts` – regenerates `src/data/phaseIndex.json`.
- `tests/curriculum.test.ts` – validates all structural constraints.
- `ThreatIntelView.tsx` – UI component that presents the six interactive exercise steps.

## Next Phase
- **Phase 14 — Cloud Security** (aligned with CompTIA Security+ SY0‑701 Domain 5: Cloud Security). The outline already lists Phase 14 as **planned**; after approval, the same workflow (create data file, update curriculum, regenerate index, run tests) will be followed.

---
*Report generated automatically at the completion of Phase 13. All material follows the CompTIA Security+ SY0‑701 exam objectives and the platform's phase‑gated build process.*