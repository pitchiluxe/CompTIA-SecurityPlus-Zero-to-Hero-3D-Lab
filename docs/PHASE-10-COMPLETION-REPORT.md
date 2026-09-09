# Phase 10 Completion Report — Vulnerability Management

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 11

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 10)                                          | Status   | Where                                                            |
| ------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| Teach 11 named topics (vulnerabilities → vulnerability reports)           | Done     | `src/data/phase10.ts` — 3 lessons, 19 sections                   |
| Tools taught safely (Nmap, OpenVAS, Nessus, Wireshark)                    | Done     | Taught by what they produce and how to read it; nothing executed |
| Lab producing findings, severity, evidence, risk, remediation, validation | Done     | `p10-lab-3`, with all six elements asserted by test              |
| "Only authorized/isolated environments"                                   | Honoured | Authorisation stated in the artifacts and asserted by test       |

### Lessons

| #   | Lesson                                                   | Topics covered                                                  |
| --- | -------------------------------------------------------- | --------------------------------------------------------------- |
| 0   | Vulnerabilities, CVE and CVSS                            | Vulnerabilities, CVE, CVSS, risk prioritisation                 |
| 1   | Vulnerability Scanning, False Positives and Verification | Scanning, false positives, validation, authorisation            |
| 2   | Prioritisation, Remediation and Validation               | Prioritisation, remediation, patch and configuration management |

11 quiz questions. 8 new prepared artifacts (128 commands total).

---

## 2. A Real CVSS v3.1 Calculator

CVSS has a published, deterministic formula, so this implements it properly rather than hard-coding severity labels. A learner changes a metric and watches the score move — which is what makes the central lesson land.

**Verified against nine officially published vectors**, each asserted by test:

| Vector                                | Score |
| ------------------------------------- | ----- |
| `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` | 9.8   |
| `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H` | 7.5   |
| `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` | 7.8   |
| `AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N` | 6.1   |
| `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N` | 5.9   |
| `AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N` | 4.3   |
| `AV:P/AC:H/PR:H/UI:R/S:U/C:L/I:N/A:N` | 1.6   |
| `AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H` | 10.0  |

The detail worth getting right is **Roundup**. CVSS 3.1 specifies it on integer arithmetic precisely because `Math.ceil(x * 10) / 10` gives wrong answers for values already exact at one decimal place. The spec's integer form is used verbatim, with a comment explaining why.

**Browser-verified live**: changing Attack Vector to Adjacent gives 8.8 High; adding Scope: Changed gives 9.6 Critical. Both match published values.

The calculator also names the single metric change that would most reduce the score, which teaches the reframe: controls do not sit beside a vulnerability, they change the terms of the vector. Putting a service behind a VPN _is_ a change from `AV:N` to `AV:A`.

---

## 3. The Central Lesson — Score Is Not Exposure

The phase's argument is that a scanner's output is not a work list, and it is built to demonstrate that rather than assert it.

Eight findings, of which **two are false positives** and **one is confirmed-but-constrained**:

- **Struts RCE, 9.8** — false positive. The host runs nginx serving static content with no Java runtime at all. Four commands settle it.
- **Default credentials, 9.6** — false positive by _host attribution_: the scanner probed a different device across a VLAN boundary and misattributed the response. A different failure mode from a bad signature, and worth teaching separately.
- **PostgreSQL RCE, 10.0** — genuinely installed, but bound to loopback. **Not** a false positive; a local attacker or compromised web app could still reach it. Only the priority changes.

That last distinction is the one I was most careful about. Conflating _confirmed-but-constrained_ with _false positive_ is how real findings quietly stay open, so the data models them as separate categories and a test asserts the artifact says so explicitly.

**Browser-verified**: sorting by raw score puts the 10.0 loopback database first; sorting by real exposure puts the 9.8 reachable SSH finding first. A test asserts these two orderings actually differ, so the lesson cannot silently stop demonstrating itself.

---

## 4. Tools and Authorisation

PROMPT.md lists Nmap, OpenVAS, Nessus and Wireshark, with the constraint _"Only authorized/isolated environments."_

These are taught by **what each produces and how to read it**, never by executing anything. The scanning artifact leads with the authorisation requirement rather than appending it: scan only what you own or are contracted to test, with written scope and an agreed window, because scanning is intrusive and unauthorised scanning may be unlawful. A test asserts that constraint appears before the technical content.

CVE identifiers are placeholders in a `CVE-2026-1000x` range, asserted by test, so nothing here can be mistaken for live advisory data.

---

## 5. Tests

```
Test Files  16 passed (16)
Tests       574 passed (574)     (Phase 9 finished at 513)
```

New file `tests/phase10.test.tsx` (56 tests):

| Group               | Covers                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CVSS calculator** | Nine published vectors; zero-impact case; Roundup on integer arithmetic; all five severity bands; format/parse round-trip; malformed input rejected; scope-changed scores higher; reduction identified |
| Phase 10 curriculum | All 11 topics; the six report elements; authorisation stated in the scan lab                                                                                                                           |
| Findings data       | Confirmed and false positives both present; vectors stored not scores; scanner and verification evidence; constrained finding outscores the top real one; placeholder CVEs                             |
| Triage grading      | Perfect; missed vulnerability; false report; confirm-everything penalised                                                                                                                              |
| Prioritisation      | Naive ordering descends by score; false positives excluded; constrained ranks last; **the two orderings differ**                                                                                       |
| Simulated evidence  | Authorisation first; what CVSS cannot know; report is not a work list; both verifications; chaining distinguishes a pentest; exposure ordering; two-sided validation                                   |
| VulnManagementView  | Score computed; recalculates on change; reduction shown; submission gating; grading; both orderings rendered                                                                                           |
| Labs and quizzes    | Two labs end to end; CVSS quiz                                                                                                                                                                         |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 6. Defects Found and Fixed

**One content gap, caught by the coverage test.** PROMPT.md lists "vulnerability scanning" and my lesson was titled "Scanning, False Positives and Verification" — the topic was taught but never named. Retitled; it reads better anyway.

**No other defects.** The CVSS implementation passed all nine published vectors on first run, which I attribute to implementing the spec's Roundup verbatim rather than approximating it — that is the step where an otherwise-correct implementation usually goes wrong.

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **Base metrics only.** CVSS also defines Temporal and Environmental metric groups, and the Environmental group is precisely where "is this reachable in my network" would formally live. Teaching Base plus explicit judgement is the right depth for Security+, but a learner moving into vulnerability management professionally will meet the other two.
- **CVSS v4.0 exists** and is not covered. SY0-701 targets v3.1, so this is correct for the exam, and it will need revisiting when the objectives move.
- **Eight findings, one estate.** Enough to teach discrimination and prioritisation; a learner repeating it will remember verdicts. The engines take their data as parameters, so more finding sets are a data-only change.
- **No 3D scene**, consistent with Phases 7–9. The interactive calculator is the phase's centrepiece and a visualisation would have been decoration.
- Main bundle 264 kB (85 kB gzipped) — up 2 kB from Phase 9 despite a full phase of content, which is the split doing its job.

---

## 8. Acceptance Criteria

| Criterion                                                | Status   | Evidence                                                    |
| -------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| All 11 named topics taught                               | **Pass** | 10-keyword coverage test, including the gap it caught       |
| Tools taught safely and only for authorised environments | **Pass** | Authorisation asserted by test; nothing executed            |
| Lab produces all six required report elements            | **Pass** | Asserted by test against `p10-lab-3`                        |
| Scoring is accurate                                      | **Pass** | Nine published CVSS vectors asserted; browser-verified live |
| Prioritisation reflects exposure, not raw score          | **Pass** | Two orderings asserted to differ; browser-verified          |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 11 — Network Security.** The estate already supports it: Phase 4 built the zone architecture, Phase 1 established the connection path, and Phase 7 supplied firewall and DNS telemetry.

Expect firewalls and rule design, IDS/IPS placement, network access control, VPN and remote access, wireless security, and network hardening — with the Phase 4 segmentation model as the foundation rather than a fresh start.

**Awaiting your approval before starting.**
