# Phase 7 Completion Report — Security Operations / SOC

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**, Domain 4.0 — the largest at **28%**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 8

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 7)                                                                        | Status | Where                                                      |
| ------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------- |
| Teach 16 named topics (SIEM → web logs)                                                                | Done   | `src/data/phase7.ts` — 4 lessons, 23 sections              |
| SOC dashboard: alerts, severity, source, destination, timestamp, user, host, IOC, investigation status | Done   | `SocConsoleView` — all nine columns, asserted by test      |
| Investigation lab: failed logins → successful login → unusual location → suspicious process            | Done   | Investigation console with cross-source pivoting           |
| "Make the learner investigate the evidence"                                                            | Done   | Pivot-driven, not scripted — the learner drives the search |

### Lessons

| #   | Lesson                                      | Topics covered                                            |
| --- | ------------------------------------------- | --------------------------------------------------------- |
| 0   | The SOC Toolchain                           | SIEM, EDR, XDR, SOAR, log management                      |
| 1   | Reading the Log Sources                     | Windows event IDs, Linux logs, firewall, DNS, web proxy   |
| 2   | Alert Triage and the False Positive Problem | Triage loop, enrichment, alert fatigue, tuning            |
| 3   | Threat Intelligence, IOCs and IOAs          | IOC vs IOA, durable detection, tuning without blind spots |

13 quiz questions. 8 new prepared artifacts (95 commands total).

---

## 2. The Investigation Lab

PROMPT.md's example sequence — _multiple failed logins → successful login → unusual location → suspicious process_ — is the incident this platform has carried since Phase 0. Here the learner finally works it as an analyst rather than reading about it.

**Pivoting is the mechanic.** Every log event is keyed by shared indicators (host, user, source IP, destination IP, PID, domain) rather than stored as prose. The learner types an indicator and gets every event matching it across all six sources. That supports genuine investigation — searching, following, backtracking — instead of a scripted reveal where clicking "next" advances a story.

Browser-verified: pivoting on `WS-01` returns **10 events across 4 sources** (DNS, web proxy, Windows, EDR) in chronological order.

The data encodes two teaching points that tests assert directly:

- **The failed logons use different usernames**, not different passwords — `analyst`, `a.analyst`, `analyst.1`, then success on `analyst1`. That means the attacker already had the password and was guessing the naming convention, which is a completely different story from a brute-force. A test asserts the usernames are all distinct and the source address is singular.
- **The beacon is regular, not large.** Three flows exactly five minutes apart at ~4 KB each. A test computes the inter-arrival gaps and asserts they are identical, because regularity is the detection signal and volume is a distractor.

---

## 3. The False Positive Problem

A triage lab where every alert is a real incident teaches the wrong reflex. Two of the five alerts are noise:

- **4.2 GB outbound transfer at 03:00.** Alarming until enrichment: a cron job started four seconds earlier, the destination is the documented backup store, the permitting policy is literally named `backup-egress`, and the Linux log records successful completion. Volume alone is not evidence.
- **Privilege escalation via sudo.** analyst1 holds exactly one scoped sudo grant for that command — the least-privilege configuration established back in Phase 1. Alerting on every sudo produces noise that trains analysts to ignore it.

Grading names **both error directions separately** rather than reporting a single score:

- **Missed incidents** — real incidents closed as noise. The dangerous error; an attacker keeps working.
- **False escalations** — noise escalated as real. The expensive error; it burns analyst hours and credibility.

A test asserts that **escalating everything scores poorly**. That instinct is real and needs to be penalised — it converts a detection problem into a capacity problem, and the queue gets skimmed anyway.

---

## 4. Tests

```
Test Files  13 passed (13)
Tests       433 passed (433)     (Phase 6 finished at 384)
```

New file `tests/phase7.test.tsx` (44 tests):

| Group                      | Covers                                                                                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 7 curriculum         | All 16 required topics; correct exam domain                                                                                                                                       |
| SOC telemetry data         | All nine dashboard columns; false positives present; all six sources populated; PROMPT.md's investigation sequence in order; username-variant pattern; beacon regularity computed |
| Pivoting                   | Cross-source pivots by PID, address and host; empty result for unknown indicators; case-insensitivity                                                                             |
| Triage grading             | Perfect triage; missed incident named; false escalation named; escalate-everything penalised; empty input; status mapping                                                         |
| Phase 7 simulated evidence | SOAR detects nothing; IOC/IOA durability; rule uses regularity not volume; enrichment named as the skipped step                                                                   |
| SOC Console                | Every required column rendered; submission gating; grading; severity filter; pivot across sources; honest empty result; timeline                                                  |
| Labs and quizzes           | Two labs end to end; triage quiz grading and mastery                                                                                                                              |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 5. Defects Found and Fixed

**The roadmap drift guard fired, exactly as designed.** I marked Phase 7 available in the outline but a string replacement silently failed to add `PHASE_7` to the `PHASES` array. The invariant test from Phase 3 — _available outline entries must exactly equal built phases_ — caught it immediately. Without that test the phase would have appeared unlocked in the roadmap and been unreachable.

**A brittle assertion I wrote in an earlier phase.** `expect(getAllByText('Planned').length).toBeGreaterThan(20)` was a magic number that shrinks every time a phase lands, and it failed at exactly 20. Replaced with the real invariant: `PHASE_OUTLINE.length - PHASES.length`. It now stays correct for every remaining phase rather than needing a manual bump each time.

This is worth flagging as my own earlier mistake rather than an incidental fix — a test that needs editing every phase is a test that will eventually get edited carelessly.

---

## 6. Security Review

| Control                  | Result                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| No command execution     | Unchanged — Phase 7 artifacts are entries in the same closed allowlist (95 commands)             |
| Log data                 | All fictional; RFC 5737/1918 addresses throughout                                                |
| No credentials           | No passwords, hashes, tokens or key material in any telemetry                                    |
| Attack content           | Defensive framing only — detection, triage and investigation                                     |
| Insider-adjacent content | The sudo alert resolves as a false positive, reinforcing that legitimate access is not suspicion |

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **One incident, five alerts.** Enough to teach discrimination and pivoting, but a larger corpus would support repeat practice without memorisation. The pivot and grading engines both take their data as parameters, so extending is data-only. Phase 22 (Troubleshooting Center) asks for ten scenarios and can reuse this machinery.
- **No 3D scene for this phase.** PROMPT.md specifies a dashboard and an investigation lab, not a visualisation, and the Phase 0 SOC room already provides the spatial view of this environment. Building a decorative scene would have contradicted the "functional, not decorative" rule in CLAUDE.md. The phase reuses `scene: 'soc'`.
- **Timestamps are display strings, not real dates.** Fine for a single simulated day and it keeps the data readable, but a multi-day scenario would need proper date handling — the beacon-interval test already has to parse `HH:MM` manually.
- **Pivoting matches whole values only.** Exact-match on an indicator is the right default for precision, but a real SIEM supports substring and CIDR matching. Worth revisiting if Phase 22 needs it.
- Main bundle 554 kB (173 kB gzipped), still below the pre-splitting 605 kB despite seven more phases of content.

---

## 8. Acceptance Criteria

| Criterion                                    | Status   | Evidence                                                                          |
| -------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| All 16 named topics taught                   | **Pass** | 15-keyword coverage test across 4 lessons                                         |
| Dashboard shows all nine required fields     | **Pass** | Column-header test; browser-verified                                              |
| Investigation follows PROMPT.md's sequence   | **Pass** | Test asserts failures → success → process creation, in time order                 |
| Learner investigates rather than being shown | **Pass** | Pivot-driven search across six sources; browser-verified at 10 events / 4 sources |
| Triage is a genuine discrimination           | **Pass** | Two false positives; both error directions graded; escalate-everything penalised  |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 8 — Windows Security.** From PROMPT.md's roadmap this follows the SOC phase and goes deeper on the platform most enterprises actually run.

The groundwork is already in place: WS-01 and DC-01 have been in the environment since Phase 0, Phase 5 covered Active Directory and Kerberos, and Phase 7 established the Windows event IDs. Phase 8 can go into hardening, Group Policy, Defender, BitLocker, and the privilege model rather than re-introducing the platform.

**Awaiting your approval before starting.**
