# Phase 2 Completion Report — Security Fundamentals

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 3

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 2)                                                   | Status | Where                                                                |
| --------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| Teach 16 named concepts (CIA → control taxonomies)                                | Done   | `src/data/phase2.ts` — 4 lessons, 27 sections                        |
| Interactive scenarios: asset, threat, vulnerability, risk, control, residual risk | Done   | `src/components/ScenarioWorkbench.tsx` + `src/data/riskScenarios.ts` |
| 3D: security controls visual (per ARCHITECTURE.md)                                | Done   | `src/scenes/ControlsScene.tsx`                                       |

### Lessons

| #   | Lesson                               | Concepts covered                                                                            |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| 0   | The CIA Triad and the AAA Model      | CIA, authentication, authorisation, accounting, non-repudiation                             |
| 1   | Security Principles                  | Least privilege, defence in depth, Zero Trust, attack surface                               |
| 2   | The Language of Risk                 | Threat, vulnerability, exploit, risk, inherent vs residual, four treatments                 |
| 3   | Security Controls and Their Two Axes | Preventive/detective/corrective, physical/technical/administrative, deterrent, compensating |

16 new quiz questions, each tagged with an SY0-701 domain and a tracked concept.

### Labs

| Lab                                             | Focus                                                        |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `p2-lab-0` Classify the Control Inventory       | 12-control inventory classified on both axes                 |
| `p2-lab-1` Map Defence in Depth to a Real Asset | Seven layers, attack surface enumeration, layer independence |
| `p2-lab-2` Run a Full Risk Assessment           | Worked assessment plus all three interactive scenarios       |

### Simulation engine

7 new prepared artifacts in `src/sim/phase2Commands.ts`: `list controls`, `classify control c-04 / c-05 / c-12`, `show attack surface srv-01`, `show defense layers`, `assess risk northwind-vpn`. Composed into the same closed allowlist (now 41 commands across three phases).

---

## 2. The Interactive Scenario Workbench

This was the phase's distinctive requirement and needed a new interaction type.

**Design decision that matters:** all six fields draw from **one shared option pool**, and each option is correct for exactly one field. Six independent dropdowns would let a learner pattern-match each field separately. With a shared pool, placing "unpatched VPN appliance" requires deciding it is a vulnerability and _not_ a threat — the exact distinction Security+ tests hardest.

Three scenarios, all fictional organisations:

1. **The unpatched remote access appliance** — a technical vulnerability, with a second plausible weakness ("nobody reviews VPN logs") deliberately included as a distractor.
2. **The finance department wire transfer** — business email compromise where the vulnerability and both controls are entirely **administrative**. Candidates who only look for missing patches misclassify this.
3. **The shared administrator account** — an AAA failure where non-repudiation is impossible by design, with "restore from backup" as a distractor that resolves the incident without touching the risk.

Grading explains **the learner's own wrong choice** before giving the right answer. Telling someone only the correct answer skips the misconception that produced the error.

---

## 3. 3D Features

`src/scenes/ControlsScene.tsx` — defence in depth as concentric rings around one asset.

Phase 1's path was linear (a packet travels A→B). Defence in depth is concentric, so reusing that layout would have misrepresented the concept.

- Seven rings, outermost (Policy) to innermost (Data), each rotating slightly slower than the one outside it
- The asset sits at the centre and pulses red only when every layer has failed
- **Layers can be failed interactively** — a failed ring sinks, dims, and goes dashed while the inner ones stay lit, and a counter reports what still protects the asset
- **2D fallback** (`src/scenes/ControlsFallback2D.tsx`): nested SVG circles, keyboard-accessible, failed layers dashed

Making "assume every control eventually fails" an _action_ rather than a sentence is the point. A learner can fail the perimeter and read that six layers still stand.

`src/data/defenceLayers.ts` is the single source of truth — the 3D scene, the 2D fallback, the detail panels, and the `show defense layers` transcript all render the same seven layers. A test asserts the transcript names every layer in the data.

---

## 4. Tests

```
Test Files  8 passed (8)
Tests       193 passed (193)     (Phase 1 finished at 144)
```

New file `tests/phase2.test.tsx` (45 tests):

| Group                             | Covers                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 curriculum                | All 21 required concept keywords present; lessons and labs shipped                                                               |
| Risk scenario data integrity      | All six fields exercised, exactly one correct option per field, distractors present with substantive rationale                   |
| riskEngine grading                | Perfect, empty, and partial assessments; wrong-choice explanations; distractors incorrect in every slot                          |
| riskEngine shared pool            | Move-not-duplicate semantics, clearing, `assignedElsewhere`, completeness                                                        |
| Defence layer data                | Seven ordered layers, descending radii, both-axis classification, survival computation                                           |
| Phase 2 simulated evidence        | Backup-is-corrective, compensating vs corrective, attack surface beyond ports, inherent vs residual, transcript/data consistency |
| ScenarioWorkbench                 | Field rendering, submission gating, move semantics, grading, mastery credit and its absence                                      |
| ControlsView / ControlsFallback2D | 2D fallback, layer failure, full breach, restore, both-axis control display                                                      |
| Phase 2 labs                      | Both labs run end to end in the simulator                                                                                        |

**Four tests appeared for free.** The parameterised phase tests written in Phase 1 (`it.each` over `PHASES` and over all labs) picked up Phase 2 automatically — 144 became 148 before a single Phase 2 test was written. That is the generalisation work paying off.

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified**: the defence-in-depth 2D diagram with all seven rings; failing the Network layer (ring dashes out, counter drops to 6/7, remaining list updates, button flips to Restore); the scenario workbench end to end — placing an option, seeing it marked "currently Asset" under other fields, moving it, and submitting for 6/6 with per-field rationale and debrief.

---

## 5. Security Review

All Phase 0 and 1 controls hold. Phase 2 additions reviewed against the same rules:

| Control               | Result                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No command execution  | Unchanged — Phase 2 commands are entries in the same closed allowlist                                                                                                                        |
| No real organisations | Every scenario organisation is fictional (Northwind Clinic, Harbour Logistics, Cedar Analytics). No real company, person, or breach is described                                             |
| No real secrets       | No credentials, keys, or tokens in any Phase 2 artifact                                                                                                                                      |
| Addressing            | Phase 2 artifacts reuse the existing RFC 1918 / RFC 5737 lab addressing                                                                                                                      |
| Content safety        | Scenarios describe defensive risk assessment. No attack technique is taught, and the wire-transfer scenario describes the fraud pattern only to the level needed to identify the control gap |

---

## 6. Defects Found and Fixed

**One real UX defect, found by a failing test.**

`riskEngine.assign()` supports _moving_ an option between fields — it clears the old slot. But the workbench UI disabled any option already assigned elsewhere, making that move unreachable. A learner who placed "an external attacker scanning the internet" under Vulnerability could not drag it to Threat; they had to work out that they must first click it again in the wrong field to unassign it.

"Actually, this is a threat, not a vulnerability" is precisely the correction the exercise exists to teach, so blocking it fought the pedagogy. Fixed: options held by another field are now dimmed and annotated with which field holds them (`— currently Asset`), and clicking moves them.

Two of my own test-design errors were also corrected, both caused by the fix above: one assertion assumed the disabled behaviour, and one test tried to construct a wrong answer using another field's correct option — which now _moves_ it and leaves that field empty, blocking submission. The second was rewritten to use a distractor, with a comment explaining why.

Also adjusted: the 2D layer diagram's radius scale now reserves 48px of headroom rather than 34px, giving the outermost ring's caption more clearance.

---

## 7. Known Issues and Limitations

- **3D still not visually confirmed on this machine.** The verification browser's GPU continues to drop the WebGL context. All three scenes load and degrade correctly to 2D. **Please open `/controls`, `/path`, and `/soc` on your own machine to confirm the 3D renders.**
- Carried forward: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **Three scenarios is a thin bank.** The workbench supports any number; the constraint is authoring effort per scenario (nine options each with a teaching rationale). Worth expanding when Phase 17 (Governance, Risk & Compliance) revisits risk.
- **Scenario progress is recorded against `phase-2` lesson slots**, reusing the existing progress store rather than adding a scenario-specific store. Adequate now; if scenarios spread across phases, they should get their own progress namespace.
- The command allowlist is now 41 entries and `help` lists all of them. Per-lab scoping is becoming worthwhile.
- Vitest reports jsdom being constructed 8 times (once per test file). Test time is 13s, so this is not yet worth the isolation trade-off of `pool: 'vmThreads'`.

---

## 8. Acceptance Criteria

PROMPT.md gives no explicit acceptance line for Phase 2, so these derive from its Teach and Interactive Scenarios sections:

| Criterion                                        | Status                 | Evidence                                                                    |
| ------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------- |
| All 16 named concepts taught                     | **Pass**               | 4 lessons, 27 sections; 21-keyword coverage test                            |
| Learner identifies asset for a business scenario | **Pass**               | Workbench field, graded, browser-verified                                   |
| Learner identifies threat                        | **Pass**               | Separated from vulnerability by the shared pool                             |
| Learner identifies vulnerability                 | **Pass**               | Distractor weaknesses included to force discrimination                      |
| Learner identifies risk                          | **Pass**               | Correct option states likelihood _and_ impact                               |
| Learner identifies control                       | **Pass**               | Administrative controls represented, not only technical                     |
| Learner identifies residual risk                 | **Pass**               | Correct options state a specific failure mode                               |
| Control taxonomy on both axes                    | **Pass**               | Lesson 3, lab `p2-lab-0`, and the 3D layer panels                           |
| 3D controls visualisation                        | **Pass (2D verified)** | Scene built and code-split; 2D browser-verified. 3D needs your confirmation |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 3 — Threats, Vulnerabilities & Attacks.** This is the largest exam domain at 22% of SY0-701, and the first phase where content safety needs active care: it covers malware, phishing, and attack techniques.

Proposed approach: teach **recognition and defence**, never execution. Malware families as behavioural signatures to spot in prepared telemetry; phishing as indicators to identify in prepared samples; attack techniques framed as "what evidence would this leave". The Phase 1 connection path and Phase 2 control layers give every technique a place to attach — for each attack, which layer should have caught it and what evidence it produced.

The existing SOC incident (PowerShell beaconing to 203.0.113.55) is the natural spine: Phase 3 can finally explain what that attack _was_.

**Awaiting your approval before starting.**
