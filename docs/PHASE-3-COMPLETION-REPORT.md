# Phase 3 Completion Report — Threats, Vulnerabilities & Attacks

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**, Domain 2.0 — the largest at **22%**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 4

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 3)                                               | Status   | Where                                                        |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| Teach 27 named topics (malware → IoT attacks)                                 | Done     | `src/data/phase3.ts` — 5 lessons, 35 sections                |
| Safe simulation: Email → User → Credential capture → Suspicious login → Alert | Done     | `src/data/attackChain.ts`, `src/scenes/AttackChainScene.tsx` |
| Simulated incidents and evidence                                              | Done     | `src/sim/phase3Commands.ts` — 14 prepared artifacts          |
| "Do not implement credential theft against real users/systems"                | Honoured | No credential-handling code exists anywhere in the project   |

### Lessons

| #   | Lesson                                             | Topics covered                                                                          |
| --- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 0   | Malware — Classifying by Propagation and Behaviour | Malware, virus, worm, trojan, ransomware, spyware, rootkit, botnet, living off the land |
| 1   | Social Engineering and the Phishing Family         | Phishing, spear phishing, whaling, smishing, vishing, social engineering principles     |
| 2   | Password Attacks and Insider Threats               | Brute force, password spraying, credential stuffing, insider threat                     |
| 3   | Attack Categories Across the Estate                | Web, network, wireless, application, cloud, mobile, IoT, supply chain                   |
| 4   | The Attack Chain — Putting It Together             | Chain reconstruction, detection opportunities, correlation                              |

20 new quiz questions, each tagged with an SY0-701 domain and a tracked concept.

### Labs

| Lab                                            | Focus                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `p3-lab-0` Analyse a Phishing Email            | Five header indicators, URL analysis, family classification              |
| `p3-lab-1` Identify Malware from Behaviour     | Telemetry-based classification, ransomware ordering, rootkit discrepancy |
| `p3-lab-2` Investigate a Password Attack       | Three campaigns distinguished by log shape                               |
| `p3-lab-3` Attack Categories Across the Estate | Category-to-defence mapping, supply chain, insider                       |
| `p3-lab-4` Walk the Attack Chain End to End    | Full six-stage reconstruction of the Phase 0 incident                    |

---

## 2. Content Safety — the defining constraint of this phase

Phase 3 is the first phase where teaching the subject could slide into teaching how to _perform_ it. The framing applied throughout: **recognition and defence only**. Every attack is described by the evidence it leaves and the control that catches it.

Concretely:

- **No executable technique.** No working payloads, encoded commands, injection strings, or attack tooling. A test asserts the entire phase's text against patterns for script tags, encoded PowerShell, `Invoke-Expression`, pipe-to-shell, and `eval`.
- **No credential handling.** The credential-capture stage is labelled `SIMULATED ONLY` in its own summary text and states that the platform "does not implement, host, or capture anything". A test asserts both phrases are present.
- **No credentials or key material.** A test asserts the phase text against patterns for password assignments, PEM private keys, bcrypt hashes, and LM:NT hash pairs.
- **Reserved identifiers only.** A test extracts every domain and IP from the phase content and asserts they fall in RFC 2606 reserved domains (`.example`, `.test`, `.invalid`, `.local`) or RFC 5737 / RFC 1918 address space.
- **Transcript labelling.** The chain transcript opens with `NOTHING IS EXECUTED. This describes evidence, not actions.` — asserted by test.
- **Insider cases framed as process.** The insider artifact states that no indicator alone proves malice and that investigations follow HR and legal process. Both asserted by test. This matters because insider investigations concern a real person.
- **UI disclaimer.** The attack chain view carries a permanent banner: no malicious code, credential capture, or attack tooling exists in this project.

These are tests rather than review notes deliberately — a future phase cannot quietly regress them.

---

## 3. 3D Features

`src/scenes/AttackChainScene.tsx` — the six-stage chain.

Phase 2's scene lets you **fail** a defence layer; Phase 3 inverts the same interaction grammar so you **break** an attack link. That polarity flip is the teaching point: you need to stop one stage, not all six.

- Six nodes left to right, with geometry encoding the actor — attacker stages are angular octahedra, user stages are spheres, the defender stage is a hexagonal prism
- A compromise pulse travels the rail and **stops at the first broken link**, turning green
- Breaking a link marks it green and dashed; downstream stages dim out
- A status readout reports either "Chain complete — compromise reaches command and control" or "Contained at stage N"
- **2D fallback** (`src/scenes/AttackChainFallback2D.tsx`): rail runs red to the break point and green after it, so containment is legible with no animation at all

### Cross-linking the three models

Each attack stage names the **Phase 2 defence layer** and, where applicable, the **Phase 1 connection-path stage** it maps to. Tests assert both cross-references resolve against the real data, so the three models cannot drift apart. The chain is not a fourth mental model — it is the two existing ones seen from the attacker's side.

The chain also finally explains the incident that has run through the platform since Phase 0: the PowerShell beacon to `203.0.113.55` was **stage 5 of 6**, and four earlier stages had each left evidence.

---

## 4. Tests

```
Test Files  9 passed (9)
Tests       235 passed (235)     (Phase 2 finished at 193)
```

New file `tests/phase3.test.tsx` (36 tests):

| Group                      | Covers                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Content safety**         | Executable-payload patterns, credential/key patterns, reserved domains and addresses, simulation labelling, insider process framing  |
| Phase 3 curriculum         | All 23 required topic keywords; five lessons and five labs; correct exam domain                                                      |
| Attack chain data          | Six stages in PROMPT.md's order, left-to-right layout, evidence and detection per stage, cross-links to Phase 1 and Phase 2 data     |
| Phase 3 simulated evidence | Three password-attack shapes, lockout blindness, ransomware ordering, rootkit discrepancy, five phishing indicators, Phase 0 linkage |
| AttackChainFallback2D      | Accessible controls per stage, broken labelling, containment readout                                                                 |
| AttackChainView            | 2D fallback, disclaimer, containment at earliest break, reset, stage detail                                                          |
| Phase 3 labs               | Three labs run end to end in the simulator                                                                                           |
| Phase 3 quizzes            | Grading, mastery recording, domain/concept tagging on every question                                                                 |

**Six tests appeared for free** again — the parameterised suites picked up Phase 3's phase entry and five labs automatically (193 → 199 before any Phase 3 test was written). The lab-to-allowlist guard from Phase 1 also verified all 22 Phase 3 lab step commands resolve.

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified**: the attack chain in 2D with all six stages and the simulation disclaimer; breaking stage 2 (rail turns green, "CONTAINED at stage 2", downstream stages dim, status badge flips); and the phishing lab running `show email headers phish-01` with its provenance badge, five indicators, and teaching note.

---

## 5. Security Review

| Control                   | Result                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| No command execution      | Unchanged — Phase 3 artifacts are entries in the same closed allowlist (now 55 commands) |
| No attack tooling         | Asserted by test across all phase content                                                |
| No credential handling    | No such code exists; the simulated stage says so explicitly, asserted by test            |
| No real organisations     | All fictional (Northwind, Harbour, Cedar continue from Phase 2)                          |
| Reserved identifiers only | Asserted by test over every domain and address in the phase                              |
| Insider content           | Framed as indicators requiring HR and legal process, never unilateral analyst action     |
| Authorisation framing     | Unchanged from earlier phases                                                            |

---

## 6. Defects Found and Fixed

**None.** Phase 3's 36 tests passed on first run, and no regressions appeared in the 199 pre-existing tests.

This is worth stating plainly rather than treating as unremarkable: the reason is that Phases 1 and 2 established the data-driven patterns (cross-linked source-of-truth files, parameterised structural tests, the closed-allowlist contract) that Phase 3 simply extended. The lab-to-allowlist guard in particular would have caught any mistyped step command immediately.

---

## 7. Known Issues and Limitations

- **3D still not visually confirmed on this machine.** The verification browser's GPU continues to drop the WebGL context. All four scenes load and degrade correctly to 2D. **Please open `/attack-chain`, `/controls`, `/path`, and `/soc` on your own machine to confirm the 3D renders.**
- Carried forward: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **The main bundle has grown to 541 kB** (168 kB gzipped) as curriculum content accumulates. The 3D chunk is still separate and shared across all four scenes. Curriculum data is a natural candidate for route-level code splitting once Phase 5 or 6 lands.
- **One attack chain, not several.** PROMPT.md asks for the phishing chain specifically and that is what is built. Phase 22 (Troubleshooting Center) asks for ten distinct scenarios, and the chain data model is shaped to support more when that phase arrives.
- **The command allowlist is now 55 entries** and `help` lists all of them. Per-lab scoping should be done soon — this is the third phase in which I have noted it.
- Vitest constructs jsdom nine times (once per test file); suite runtime is ~14s, still below the threshold where the isolation trade-off would be worth making.

---

## 8. Acceptance Criteria

PROMPT.md gives no explicit acceptance line for Phase 3, so these derive from its Teach and Safe Simulation sections:

| Criterion                                                           | Status                 | Evidence                                                                                |
| ------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| All 27 named topics taught                                          | **Pass**               | 5 lessons, 35 sections; 23-keyword coverage test                                        |
| Simulated incidents and evidence created                            | **Pass**               | 14 prepared artifacts across phishing, malware, password attacks, supply chain, insider |
| Chain: Email → User → Credential capture → Suspicious login → Alert | **Pass**               | Six stages matching the specified sequence, asserted by test                            |
| Credential theft not implemented against real users/systems         | **Pass**               | No credential-handling code; explicit simulation labelling asserted by test             |
| Attacks framed for recognition and defence                          | **Pass**               | Every stage carries evidence, detection signals, and the control that catches it        |
| 3D visualisation of the chain                                       | **Pass (2D verified)** | Scene built and code-split; 2D browser-verified. 3D needs your confirmation             |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 4 — Security Architecture.** From PROMPT.md's roadmap this covers DMZ, Zero Trust, IDS/IPS, WAF, and network segmentation — 18% of the exam.

This phase has a natural 3D deliverable: the enterprise network architecture (Internet → firewall → DMZ → core), which the global 3D requirements list as "network segmentation" visualisation. It also completes a set: Phase 1 showed the path traffic takes, Phase 2 showed the layers protecting an asset, Phase 3 showed an attack crossing both, and Phase 4 shows the topology those three have been implicitly describing.

The existing SOC devices already model a trust boundary at FW-01, so the segmentation scene can extend the Phase 0 environment rather than introducing a new one.

**Awaiting your approval before starting.**
