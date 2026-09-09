# Phase 12 Completion Report — Incident Response

**Exam domain:** Security Operations (4.0, 28% of SY0-701)
**Status:** Complete
**Route:** `/incident-console`
**Tests:** 686 passing across 18 files (51 new in `phase12.test.tsx`, 4 added automatically by the curriculum drift guards)
**Build:** clean — main bundle 266.58 kB (85.93 kB gzipped), Incident Console split at 24.14 kB

This is the phase that closes **IR-2026-0908-01** — the incident the platform has carried since Phase 0. It was triaged in Phase 0, explained in Phase 3, investigated in Phase 7, found on both hosts in Phases 8 and 9, and its firewall gap identified in Phase 11. Here it is contained, eradicated, recovered and closed.

## 1. Features Delivered

| PROMPT.md requirement                    | Status | Evidence                                                                        |
| ---------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Seven IR lifecycle phases                | Done   | `IR_PHASES` — each carries the question it asks, shown on the console's step 1  |
| Eight incident types                     | Done   | `INCIDENT_PATTERNS` — all eight, with indicators, containment priority, mistake |
| Incident Console — open incident         | Done   | Step 1: summary, severity, reference, lifecycle                                 |
| Incident Console — review evidence       | Done   | Step 2: RFC 3227 order of volatility, chain of custody                          |
| Incident Console — build timeline        | Done   | Step 3: 11 events from 6 sources, shuffled, reordered and graded                |
| Incident Console — identify assets       | Done   | Step 4: 6 candidates, 4 genuinely involved, scored both ways                    |
| Incident Console — contain               | Done   | Step 5: 7 options graded on two axes                                            |
| Incident Console — recommend remediation | Done   | Step 6: eradication and recovery kept separate                                  |
| Incident Console — close and report      | Done   | Step 7: blameless lessons, key lesson, report template artifact                 |

### Lessons

| #   | Lesson                                 | Topics covered                                                                    |
| --- | -------------------------------------- | --------------------------------------------------------------------------------- |
| 0   | The Incident Response Lifecycle        | Seven phases, preparation, detection vs analysis, blameless review                |
| 1   | Evidence, Volatility and Containment   | Order of volatility, chain of custody, two-axis containment, ransomware exception |
| 2   | Incident Types and the Response Report | Eight incident types, characteristic mistakes, report structure, scope            |

Ten quiz questions across the three lessons.

### Labs

| #   | Lab                                     | What it exercises                                        |
| --- | --------------------------------------- | -------------------------------------------------------- |
| 0   | Work the Lifecycle and Handle Evidence  | Seven phases, volatility ordering, custody               |
| 1   | Contain Without Destroying Evidence     | Timeline reconstruction, scoping, two-axis containment   |
| 2   | Close the Incident and Write the Report | Eradication, recovery, lessons learned, report structure |

### Prepared artifacts (8, all in the closed allowlist)

`explain ir lifecycle` · `explain order of volatility` · `explain containment tradeoff` · `show incident timeline` · `show eradication checklist` · `show lessons learned` · `compare incident types` · `show ir report template`

## 2. The Two-Axis Containment Model

The design decision this phase is built on. Every containment action carries two independent booleans rather than a single correctness flag:

| Action                                  | Stops attacker | Preserves evidence | Recommended |
| --------------------------------------- | -------------- | ------------------ | ----------- |
| Capture memory from WS-01, then isolate | yes            | yes                | yes         |
| Disable analyst1 and revoke sessions    | yes            | yes                | yes         |
| Isolate SRV-01 and preserve the disk    | yes            | yes                | yes         |
| Block 203.0.113.55 at the perimeter     | **no**         | yes                | **yes**     |
| Reimage WS-01 immediately               | **yes**        | **no**             | **no**      |
| Reboot WS-01                            | no             | no                 | no          |
| Monitor and do nothing                  | no             | yes                | no          |

The three bolded rows are why the model needs two axes. Blocking the C2 address contains nothing on its own and is still the right call. Reimaging genuinely stops the attacker on that host and is still wrong — it destroys the answer to _how they got in_, and the credentials remain valid. A single right/wrong flag cannot say either of those things.

**Rebooting fails both tests.** It destroys memory — where a living-off-the-land attack's only malicious content ever existed — and the scheduled task re-establishes the beacon at startup. It is the most decisive-feeling action available and it achieves the opposite of both goals. `gradeContainment` reports `contained: false, evidencePreserved: false` for it, and a test asserts exactly that.

Containment is graded as a property of the whole selection (`chosen.some(o => o.stopsAttacker)`), not per option, so a plan of "block the C2 and nothing else" correctly reports the attacker as still working.

## 3. Timeline Reconstruction

Eleven events, six sources: DNS log, web proxy, Windows Security (4625/4624/4688), Linux `auth.log`, firewall flows, EDR, filesystem and systemd. No single source saw the whole attack — which is the point.

- Shuffled with a **seeded xorshift32**, so the exercise is reproducible: a learner retrying, or comparing with someone else, gets the same starting order. Tests assert determinism, that the result is a genuine permutation, and that it is never accidentally already sorted.
- **Partial credit per position.** Nine of eleven in sequence is real progress and a binary score cannot distinguish it from having no idea.
- **Event times are hidden until submission.** The times are the answer; correlation is the skill.
- Dwell time as taught: 20 min 12 s from first DNS query to EDR detection, 11 minutes from first beacon.

## 4. Scoping

Six candidate assets, four genuinely involved. FW-01 permitted and logged the egress but was not compromised; SW-01 shows no evidence at all. Selecting them inflates the incident, and `gradeAssets` reports `falselyIncluded` separately from `missed` — over-scoping and under-scoping are different failures.

The trap is SRV-01: the alert named WS-01, and eradication that follows the alert rather than the investigation leaves an attacker with a root systemd unit on the second host. A test asserts that scoping to WS-01 alone reports SRV-01 as missed.

## 5. Tests

**51 new tests** in `tests/phase12.test.tsx`, plus 4 the existing `it.each` drift guards in `tests/curriculum.test.ts` generated for Phase 12 without modification. 686 total across 18 files.

| Group               | Count | What it covers                                                                  |
| ------------------- | ----- | ------------------------------------------------------------------------------- |
| Containment grading | 7     | Both axes independently, reboot failing both, empty plan, credit for restraint  |
| Timeline grading    | 3     | Chronological order, partial credit, wrong-length rejection                     |
| Timeline shuffling  | 3     | Determinism per seed, permutation invariant, never pre-sorted                   |
| Asset scoping       | 3     | Perfect scope, over-scoping penalty, SRV-01 missed when scope follows the alert |
| Incident data set   | 12    | Chronology, source diversity, all 8 patterns, volatility ranks 1–8, rationales  |
| Prepared commands   | 4     | Allowlist registration, provenance labels, refusal, teaching notes              |
| Incident Console UI | 9     | All seven steps, both axes rendered, mastery recorded, blameless lessons        |
| Curriculum & safety | 7     | Lab template completeness, concept coverage, address ranges, no credentials     |
| Labs and quizzes    | 3     | Lifecycle artifact, containment matrix layout, quiz grading and mastery         |

Drift guards in `tests/curriculum.test.ts` picked up Phase 12 automatically — the `it.each` over `PHASES` and the invariant that available outline entries exactly equal built phases both passed without modification.

## 6. Defects Found and Fixed

| Defect                                                                     | Fix                                                                                                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getByText(/STOPS ATTACKER {2}PRESERVES EVIDENCE/)` never matched          | Testing Library normalises whitespace before matching, collapsing the column gap. Asserted on `textContent` instead, with a comment explaining why |
| `lab.challenge` is optional on the `Lab` type; test treated it as required | `lab.challenge ?? ''` in the text scan, `lab.challenge?.length ?? 0` in the template check                                                         |

Neither was a product defect. Both are recorded because silently rewriting a failing assertion to pass is how coverage rots.

## 7. Security Review

| Check                          | Result                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| No command executes            | Phase 12 adds 8 entries to the same closed allowlist. `runCommand('reboot ws-01')` returns `recognised: false` — asserted |
| Addresses                      | Only 203.0.113.55 (RFC 5737 documentation) and RFC 1918 private ranges. Asserted over all phase text                      |
| No credentials, keys or tokens | Asserted: no private-key blocks, no `password:` or `api_key:` patterns anywhere in Phase 12 text                          |
| No offensive capability        | The phase is entirely defensive — evidence handling, containment, eradication, reporting                                  |
| Provenance labelled            | 5 artifacts `simulated`, 3 `prepared`. Asserted on every entry                                                            |
| Hostnames                      | Lab-local (WS-01, SRV-01, DC-01, FW-01, SW-01) and the `lab.local` suffix                                                 |

The phase teaches evidence _preservation_, not evidence collection tooling — nothing here tells a learner how to image a host, only why the order matters and what a custody gap costs. That keeps it useful and keeps it safe.

## 8. Known Issues and Limitations

| Limitation                                                            | Assessment                                                                                                                                                                                                  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One incident is worked end to end; the other seven types are patterns | Deliberate. Eight full investigations would be eight shallow ones. If Phase 23 (SOC Capstone) needs a second full case, ransomware is the one to build, since it is the exception to capture-before-contain |
| Timeline reordering uses ↑/↓ buttons, not drag-and-drop               | Keyboard-accessible and testable; drag-and-drop would be neither without significant work                                                                                                                   |
| The console always opens `INCIDENTS[0]`                               | There is only one full incident. `getIncident(id)` already exists for when there is a second                                                                                                                |
| No incident-report writing surface                                    | The template is taught as an artifact; the learner writes the report in Notes. A structured report editor would fit Phase 25 (Portfolio) better than here                                                   |
| `ContactShadows` chunk is 1,015 kB                                    | Unchanged from Phase 11 — a drei/three dependency, loaded only when a 3D scene mounts, never on the initial route                                                                                           |

## 9. Acceptance Criteria

| Criterion                                 | Status | Evidence                                                           |
| ----------------------------------------- | ------ | ------------------------------------------------------------------ |
| Seven-phase IR lifecycle taught           | Pass   | `IR_PHASES`, lesson 0, console step 1, test asserts all seven      |
| Eight incident types covered              | Pass   | `INCIDENT_PATTERNS`, test asserts exactly 8 distinct categories    |
| Incident Console with all workflow steps  | Pass   | 7 steps, browser-verified                                          |
| Containment decisions gradeable           | Pass   | Two-axis grading, 7 unit tests, browser-verified                   |
| Order of volatility taught                | Pass   | RFC 3227 ranks 1–8, test asserts ordering without gaps             |
| Chain of custody taught                   | Pass   | Lesson 1, console step 2, coverage test                            |
| Eradication and recovery distinguished    | Pass   | Separate lists, separate console panels, separate test             |
| Lessons learned blameless                 | Pass   | Every item is a control gap; test asserts no user-blaming phrasing |
| Full lab template on every lab            | Pass   | Test iterates all three labs over all template fields              |
| All lab commands resolve in the allowlist | Pass   | Test iterates every step command                                   |
| Lint, typecheck, format, build clean      | Pass   | `eslint` clean, `tsc --noEmit` clean, prettier clean, build clean  |
| No regressions                            | Pass   | 686/686 passing, 18 files                                          |

## 10. Evidence

- Browser-verified at `/incident-console`: incident opens on IR-2026-0908-01; seven lifecycle phases render; timeline shows 11 shuffled events with times hidden; selecting _Reboot WS-01_ and submitting reports **Attacker stopped: No**, **Evidence preserved: No**, _Destroyed by: Reboot WS-01 to clear the malicious process_, 2/7 decisions correct.
- Roadmap shows Phase 12 unlocked with 3 lessons and 3 labs; Phases 13–27 still Planned.
- Zero console errors.
- Nav entry present and routing correctly.

## 11. Next Phase

**Phase 13 — Threat Intelligence** (Threats, Vulnerabilities, and Mitigations). Natural continuation: this phase produced IOCs (203.0.113.55, a lookalike domain, two persistence artifacts) and Phase 7 already taught that IOC-based detection is brittle. Phase 13 should cover IOCs vs TTPs, the MITRE ATT&CK mapping of this exact incident, threat feeds and their quality problems, the intelligence lifecycle, and attribution — including why attribution is usually the least actionable output.
