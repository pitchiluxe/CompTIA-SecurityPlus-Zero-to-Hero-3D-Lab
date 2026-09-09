# Phase 9 Completion Report — Linux Security

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 10

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 9)                      | Status | Where                                                               |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| Teach 13 named topics (users → secure configuration) | Done   | `src/data/phase9.ts` — 4 lessons, 24 sections                       |
| Five named labs                                      | Done   | All five, matching the spec's list exactly                          |
| "Create users" / "Harden SSH" (hands-on)             | Done   | Simulated review plus real commands scoped to a VM the learner owns |

### Lessons

| #   | Lesson                                      | Topics covered                                       |
| --- | ------------------------------------------- | ---------------------------------------------------- |
| 0   | Users, Groups and sudo                      | Users, groups, sudo, least privilege                 |
| 1   | File Permissions and the Special Bits       | Permissions, file permissions, SUID/SGID/sticky      |
| 2   | SSH, Services and systemd                   | SSH, systemd, services, firewall, package management |
| 3   | Linux Logs, auditd and Secure Configuration | Logs, auditd, secure configuration, platform mapping |

13 quiz questions. 13 new prepared artifacts (120 commands total).

---

## 2. The Bundle Split (carried over from Phase 8)

I flagged this in the last two reports and said it was worth doing rather than deferring again. It was — and the result was considerably better than I predicted.

The problem: `curriculum.ts` statically imports every phase file, and `Dashboard` imports `curriculum.ts` for progress totals. Because Dashboard is the eager landing route, every phase's full text — lesson bodies, quiz questions, lab steps, evidence templates — was in the initial bundle.

The fix: `src/data/phaseIndex.json` holds only what Dashboard needs (ids, titles, descriptions, lesson and lab names). It is **generated from the real curriculum** rather than transcribed, via `npm run gen:index`. Dashboard imports only the index, so the full curriculum now travels with the lazily-loaded route chunks that actually use it.

**Main bundle: 599 kB → 262 kB (186 kB → 84 kB gzipped), a 56% reduction.** I had predicted "moderate benefit"; it was larger than that.

Five drift guards in `tests/curriculum.test.ts` assert the index matches `PHASES` exactly — ids, numbers, titles, descriptions, every lesson and lab, and the item count. **One of them fired immediately** when I added Phase 9 without regenerating, which is precisely the intended behaviour: forgetting `npm run gen:index` fails the suite rather than shipping stale data.

Adding Phase 9 afterwards moved the main bundle by less than 1 kB, which confirms the split is doing its job.

---

## 3. Linux as the Counterpart, Not a Repeat

Phase 8 and Phase 9 ask identical questions — who has privilege, what runs at boot, what is logged, what is exposed — so the phase is built to make that transfer explicit rather than leaving it implied.

The **same attacker** is on both hosts, at the same timestamps:

|                     | Windows (WS-01)                             | Linux (SRV-01)                                                     |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| Privilege           | analyst1 added to local Administrators      | deploy holds `(ALL : ALL) NOPASSWD: ALL`                           |
| Escalation via file | Writable service binary                     | SUID root `/usr/local/bin/backup-helper`                           |
| Persistence         | Scheduled task, hidden PowerShell as SYSTEM | systemd unit: root, `Restart=always`, `WantedBy=multi-user.target` |
| Logging gap         | Script block logging off                    | auditd not watching `/etc/systemd/system/` or `/usr/local/bin/`    |

A test asserts both hosts' artifacts carry timestamps inside the same incident window, so the two phases cannot drift into telling different stories. The closing lesson provides the full concept mapping — RID 500 to UID 0, UAC to sudo, Sysmon to auditd — and a PBQ tests it.

Two teaching points I was careful to get right:

- **The log contradicts the obvious reading.** Over a thousand SSH password failures followed by a success — but the success reads `Accepted publickey`. The brute force never worked; the attacker already had a key. An analyst counting only failures and successes reaches the opposite conclusion.
- **The SSH lockout sequencing.** Disabling password authentication before verifying key login works is how people lock themselves out of remote hosts, and recovery needs console access they may not have. The artifact leads with `ORDER MATTERS`, and a quiz question tests it.

---

## 4. Tests

```
Test Files  15 passed (15)
Tests       513 passed (513)     (Phase 8 finished at 476)
```

New file `tests/phase9.test.tsx` (26 tests):

| Group                      | Covers                                                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 9 curriculum         | All 13 topics; all five named labs; hands-on labs scoped to owned machines; the closing mapping lesson                                                                                                                                                                             |
| Phase 9 simulated evidence | Hashes redacted; scoped vs unrestricted sudo; SUID enumeration; creation time in the incident window; directory-write semantics; SSH findings; lockout warning; publickey success; three systemd persistence properties; unauthenticated repo; auditd gaps; no credential material |
| Cross-platform continuity  | Same incident window on both hosts; equivalent persistence lessons; Phase 1 sudo grant still consistent                                                                                                                                                                            |
| Labs and quizzes           | Three labs end to end; permissions quiz; every question tagged                                                                                                                                                                                                                     |

Plus five new drift guards for the phase index in `tests/curriculum.test.ts`.

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified**: the investigation lab renders, and `compare windows linux security` returns the full mapping.

---

## 5. Defects Found and Fixed

**The new drift guard caught a real omission on its first outing.** Adding Phase 9 without regenerating the index failed `lists exactly the built phases, in order`. Working exactly as intended.

**A build-only type error.** `PHASE_9.lessons.at(-1)` requires the ES2022 lib and the project targets ES2020. Vitest transpiles without typechecking, so 513 tests passed while `npm run build` failed. Replaced with index arithmetic rather than bumping the project's lib for one test line.

**Two ambiguous test queries** — `NOPASSWD: ALL` and `backup-helper` each appear in both the command output and its teaching note. Scoped rather than loosened, and each now also asserts a second unambiguous string.

**Generator made permanent.** I created the index generator as a throwaway test file, used it, and deleted it — then needed it again an hour later for Phase 9. It is now `scripts/genPhaseIndex.script.ts` behind `npm run gen:index`, with its own vitest config so it never runs in the normal suite. Recreating it every phase was the kind of small repeated cost that quietly compounds.

---

## 6. Security Review

| Control              | Result                                                                           |
| -------------------- | -------------------------------------------------------------------------------- |
| No command execution | Unchanged — 120 commands in the same closed allowlist                            |
| Password hashes      | Redacted in `/etc/shadow` output; a test asserts no crypt-format hash is present |
| SSH keys             | No key material anywhere; a test asserts no `ssh-rsa AAAA…` blob                 |
| Hands-on scoping     | Both hands-on labs scoped to owned/authorised machines, asserted by test         |
| Real command syntax  | Deliberate — learners run the same commands on their own VM                      |
| Persistence content  | Framed as detection and investigation; investigation precedes removal            |

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **No 3D scene**, consistent with Phases 7 and 8. PROMPT.md specifies labs; the Phase 0 SOC room already contains SRV-01. The phase reuses `scene: 'soc'`.
- **The phase index is generated but committed.** That is a deliberate trade — no build step, and drift is caught by test — but it does mean a contributor who edits a lesson title must remember `npm run gen:index`. The failing test tells them exactly that, which is the best available signal short of a pre-commit hook.
- **`phaseIndex.json` duplicates ~11 kB of titles.** Small relative to the 337 kB it removes from the eager bundle, but it is duplication and worth revisiting if the index grows to carry more fields.
- **No hands-on verification of the learner's own VM work.** The labs give real commands and ask for evidence, but nothing checks what they actually ran. That is inherent to not touching the learner's machine, and the evidence-capture panel is the honest substitute.

---

## 8. Acceptance Criteria

| Criterion                                 | Status   | Evidence                                                           |
| ----------------------------------------- | -------- | ------------------------------------------------------------------ |
| All 13 named topics taught                | **Pass** | 13-keyword coverage test                                           |
| Five named labs delivered                 | **Pass** | Title-matching test against PROMPT.md's list                       |
| Hands-on work stays in owned environments | **Pass** | Scoping asserted on both hands-on labs                             |
| Linux concepts connected to Windows       | **Pass** | Dedicated mapping lesson, PBQ, and cross-platform continuity tests |
| Deferred bundle split delivered           | **Pass** | 599 kB → 262 kB, with five drift guards                            |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 10 — Vulnerability Management.** The natural continuation: Phases 8 and 9 found misconfigurations by hand, and Phase 10 covers finding them systematically — scanning, CVE and CVSS, prioritisation, remediation tracking, and the difference between a vulnerability scan and a penetration test.

The environment already supports it. The Phase 1 nmap output exists, both hosts now have known findings, and the Phase 2 risk vocabulary gives the prioritisation language. Expect the same discrimination pattern: a scanner reports many things, and deciding which actually matter is the skill.

**Awaiting your approval before starting.**
