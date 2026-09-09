# Phase 8 Completion Report — Windows Security

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 9

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 8)                              | Status | Where                                                                    |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| Teach 16 named topics (Windows accounts → Kerberos concepts) | Done   | `src/data/phase8.ts` — 5 lessons, 32 sections                            |
| Six named labs                                               | Done   | All six, matching the spec's list exactly                                |
| "Create users/groups in an isolated lab"                     | Done   | Simulated enumeration plus real commands scoped to a VM the learner owns |
| "Harden a Windows endpoint"                                  | Done   | Interactive 24-item configuration audit                                  |

### Lessons

| #   | Lesson                                              | Topics covered                                           |
| --- | --------------------------------------------------- | -------------------------------------------------------- |
| 0   | Accounts, Groups and the Windows Privilege Model    | Accounts, groups, UAC, AD and Kerberos from the endpoint |
| 1   | NTFS Permissions and the Share Interaction          | NTFS, permissions, inheritance, share interaction        |
| 2   | Defender, Firewall and Endpoint Controls            | Defender, firewall, BitLocker                            |
| 3   | Event Viewer, Sysmon and PowerShell Logging         | Event Viewer, Sysmon, PowerShell security                |
| 4   | Services, Scheduled Tasks, Registry and Persistence | Services, processes, scheduled tasks, registry           |

16 quiz questions. 12 new prepared artifacts (107 commands total).

---

## 2. Two Hands-On Labs, Handled Honestly

PROMPT.md asks for hands-on user creation and endpoint hardening. CLAUDE.md requires labs stay isolated to owned or authorised environments. These are not in tension, and the resolution is to do both rather than pick one:

- The **simulated walkthrough** runs in-platform against WS-01, using real PowerShell syntax so nothing has to be unlearned.
- The **hands-on portion** is marked `ON YOUR OWN VM ONLY` with explicit scoping to a machine the learner owns or is authorised to administer.

A test asserts both hands-on labs carry that scoping language. Pretending a simulation is hands-on would have been the dishonest option; so would dropping the hands-on requirement because it was awkward.

The troubleshooting entry reinforces it: _"Commands refused → you need administrative rights on YOUR OWN lab VM. Never work around this on a machine you do not administer."_

---

## 3. The Hardening Audit

"Harden a Windows endpoint" needed a gradeable form. A **configuration audit** is the real skill: given the current state of a host, which settings are findings and which are already correct?

24 settings across 8 categories — 10 genuine findings, 14 already compliant. Grading names both error directions plus a third metric:

- **Missed findings** — real misconfigurations called compliant; the host stays exposed.
- **False findings** — correct settings flagged; wastes remediation effort and credibility.
- **High-severity missed** — the access paths an attacker could actually use.

Browser-verified: flagging every setting scores **10/24 with 14 false findings**. An auditor who flags everything is not auditing, and the scoring says so.

Three items are deliberately constructed so the headline reading is wrong:

- **UAC is "Enabled"** — and `ConsentPromptBehaviorAdmin` is 0, so administrators elevate silently. The dashboard-level answer is correct and the host is not protected.
- **Defender reports fully healthy** — every status field reads True, while `ExclusionPath` covers the entire `C:\` drive.
- **SystemHealthCheck sits in the list as a config item** — and it is not one. Hidden PowerShell, SYSTEM privilege, 30-minute interval, created two minutes after the Phase 7 intrusion. That is active persistence, and deleting it as a tidy-up would destroy the evidence.

The remediation output makes the sequencing argument explicitly: remove the local administrator membership **first**, because while it stands every other change can be reversed from the endpoint.

---

## 4. Tests

```
Test Files  14 passed (14)
Tests       476 passed (476)     (Phase 7 finished at 433)
```

New file `tests/phase8.test.tsx` (36 tests):

| Group                      | Covers                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 8 curriculum         | All 16 topics; all six named labs; hands-on labs scoped to owned machines                                                                                                                                     |
| Windows baseline data      | Findings and compliant both present; every category populated; severity only on findings; substantive rationale; the headline-looks-right traps; persistence flagged high                                     |
| Audit grading              | Perfect audit; missed finding named; false finding named; high-severity counted separately; flag-everything penalised; call-everything-compliant penalised; empty input                                       |
| Phase 8 simulated evidence | Defender healthy vs excluded; UAC enabled vs prompt behaviour; public profile disabled; malicious vs legitimate task; script block logging off; most-restrictive rule; remediation sequencing; no credentials |
| HardeningAuditView         | All items grouped by category; submission gating; grading; both error directions; high-severity callout                                                                                                       |
| Labs and quizzes           | Two labs end to end; privilege model quiz                                                                                                                                                                     |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 5. Defects Found and Fixed

**Three content gaps, all caught by the coverage test.**

- PROMPT.md lists "Windows accounts" and my prose never used the phrase — the topic was taught but the naming was oblique. Fixed in the lesson text.
- PROMPT.md lists **Active Directory security basics and Kerberos concepts** for this phase, and I had covered neither, having done both thoroughly in Phase 5. Rather than duplicate, I added two sections covering them _from the endpoint perspective_: domain principals appearing in local group membership, Group Policy as both hardening mechanism and target, and Kerberos tickets cached in memory being why Sysmon event 10 matters. Genuinely different content, and a real gap the test caught.
- Three compliant baseline items had one-line rationales ("Real-time scanning is on. Correct."). A compliant setting deserves explanation as much as a finding does — expanded rather than lowering the quality bar.

**A flaky test, fixed at the cause.** Three audit tests walk all 24 baseline items and passed in isolation but timed out at 5s under full-suite load. I first tried `userEvent.setup({ delay: null })` — a real improvement, applied across all nine test files, but not the actual cost here. The cost is `getByRole` with a name filter recomputing accessible names across the tree on each of 24 lookups. Since that work is genuine rather than wasteful, the honest fix was an explicit 20s timeout on those three tests with a comment explaining why, not a trimmed assertion.

**Two brittle test queries.** A category label collided with a setting of the same name ("User Account Control"), and a task name appeared in both output and teaching note. Both scoped rather than loosened.

---

## 6. Security Review

| Control              | Result                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- |
| No command execution | Unchanged — 107 commands in the same closed allowlist                               |
| Hands-on scoping     | Both hands-on labs explicitly scoped to owned/authorised machines, asserted by test |
| No credentials       | Asserted by test across all Phase 8 artifacts                                       |
| Real command syntax  | Deliberate — the PowerShell is correct so learners can run it on their own VM       |
| Persistence content  | Framed as detection and investigation; the lab directs investigation before removal |

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **No 3D scene for this phase.** Like Phase 7, PROMPT.md specifies labs rather than a visualisation, and the Phase 0 SOC room already contains WS-01 and DC-01. The phase reuses `scene: 'soc'`.
- **The audit is a single 24-item pass.** Good for teaching discrimination once; a learner repeating it will remember verdicts rather than reason. The engine takes its item list as a parameter, so randomised subsets are a data-only change.
- **The three slow tests are slow for a real reason** and now carry a 20s budget. If more audit-style views land, the accessible-name query cost is worth revisiting properly — probably by querying once outside the loop.
- **Main bundle is 599 kB** (186 kB gzipped), approaching the 605 kB that prompted route splitting in Phase 5. Curriculum text is the growth, and it is all reachable from Dashboard. Splitting the curriculum index from full lesson bodies is the next meaningful step.

---

## 8. Acceptance Criteria

| Criterion                                      | Status   | Evidence                                                          |
| ---------------------------------------------- | -------- | ----------------------------------------------------------------- |
| All 16 named topics taught                     | **Pass** | 16-keyword coverage test, including the AD/Kerberos gap it caught |
| Six named labs delivered                       | **Pass** | Title-matching test against PROMPT.md's list                      |
| Hands-on work stays in owned environments      | **Pass** | Scoping language asserted by test on both hands-on labs           |
| Hardening is practised, not just described     | **Pass** | 24-item audit; browser-verified that flag-everything scores 10/24 |
| Findings distinguished from compliant settings | **Pass** | Both error directions plus high-severity tracked separately       |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 9 — Linux Security.** The natural counterpart, and the environment is already in place: SRV-01 has been present since Phase 0, Phase 1 covered permissions and sudo scope, and Phase 7 established the log sources.

Expect users and groups, file permissions and special bits, sudo configuration, SSH hardening, systemd services, auditd, and the Linux equivalents of the persistence mechanisms covered here — which gives a natural comparison against the Windows model just built.

**Awaiting your approval before starting.**
