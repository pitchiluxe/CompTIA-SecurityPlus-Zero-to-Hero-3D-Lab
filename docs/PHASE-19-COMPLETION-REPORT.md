# Phase 19 Completion Report — Security Hardening

**Exam domain:** Security Operations (4.0, SY0-701)
**Status:** Complete
**Route:** `/security-hardening`
**Tests:** 707 passing across 18 files (3 new since Phase 18: phase structure, quiz integrity, lab completeness for the new phase)
**Build:** clean — `SecurityHardeningView` chunk 20.81 kB (5.89 kB gzipped), zero TypeScript errors

## 1. Design Note: Consolidation, Not Duplication

PROMPT.md's Phase 19 outline is deliberately brief — Windows/Linux/Network bullet lists plus one lab — because Windows Security (Phase 8), Linux Security (Phase 9), and Network Security (Phase 11) already cover most of the named topics (firewalls, permissions, SSH, services, segmentation) in depth. Rather than re-teaching that material, Phase 19 is built as a **consolidation and extension** phase:

- It teaches the cross-platform pattern that the same five control categories (firewall, patching, access control, logging, service minimisation) recur on every platform — a synthesis skill not explicitly taught before.
- It adds genuinely new depth PROMPT.md calls out that no prior phase covered: **patch management as a process** (pilot rings), **PowerShell security controls** (Constrained Language Mode, script block/module logging, AMSI), the **secure network management plane** (jump hosts, centralised AAA, CIS Benchmarks), and explicit ACL design (explicit-permit/implicit-deny).
- Its lab explicitly cross-references and follows up on findings from Phase 8, Phase 9, and Phase 11 (e.g., closing the flat-management-network gap identified in the Phase 11 network review).

This avoids duplicate content while still fully satisfying every PROMPT.md bullet for this phase.

## 2. Features Delivered

| PROMPT.md requirement (Phase 19 — Security Hardening) | Status | Evidence                                                                 |
| --------------------------------------------------------- | ------ | ----------------------------------------------------------------------------|
| Windows: Firewall, Defender, user rights, services         | Done   | Lesson 1, "Windows Endpoint Hardening" (recap + synthesis)                |
| Windows: Patch management                                    | Done (new depth) | Lesson 1, "Patch Management as a Process" + quiz p19-q1, p19-q6, p19-q8    |
| Windows: Logging, PowerShell controls                       | Done (new depth) | Lesson 1, "PowerShell Security Controls" + quiz p19-q2, p19-q3            |
| Linux: SSH, permissions, firewall, services, updates, logging | Done   | Lesson 1, "Linux Endpoint Hardening" + quiz p19-q4, p19-q7                |
| Network: SSH, disable unused ports, strong auth              | Done   | Lesson 2, "Reducing Network Attack Surface" + "Strong Authentication for Infrastructure" + quiz p19-q10, p19-q11, p19-q15 |
| Network: Segmentation, ACLs                                  | Done   | Lesson 2, "Segmentation and ACLs" + quiz p19-q12, p19-q16                 |
| Network: Secure management                                   | Done (new depth) | Lesson 2, "Secure Management Plane" + quiz p19-q13, p19-q18               |
| Lab — harden a deliberately insecure authorized VM            | Done   | `p19-lab-0` (Windows/Linux endpoints) and `p19-lab-1` (network devices) together cover the requirement across the full stack |

### Lessons

| #   | Lesson                                    | Topics covered                                                                                    |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0   | Cross-Platform Endpoint Hardening           | Hardening baseline mindset, Windows hardening, patch management process, PowerShell security controls, Linux hardening (SELinux/AppArmor) |
| 1   | Network & Infrastructure Hardening          | Network attack surface reduction, TACACS+/RADIUS, ACL design, secure management plane/jump hosts, CIS Benchmarks and drift |

19 quiz questions across the two lessons (mix of MCQ and scenario), consistent with Phases 14–18.

### Labs

| #   | Lab                                                          | What it exercises                                                                 |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------|
| 0   | Harden a Windows and Linux Endpoint Baseline (`p19-lab-0`)   | Cross-category findings across two hosts: patch backlog, missing Constrained Language Mode, permissive SELinux, unnecessary services |
| 1   | Harden the Network Management Plane (`p19-lab-1`)            | Legacy protocols left enabled, unused ports, flat management VLAN with no jump host, deny-list-only ACL, CIS Benchmark cross-mapping |

### Prepared simulator commands (`src/sim/phase19Commands.ts`)

8 commands, deterministic, labelled `simulated`: `show endpoint hardening baseline`, `show patch management status`, `show powershell security config`, `show linux service baseline`, `show network device hardening`, `show management plane config`, `show acl review`, `show cis benchmark gaps`.

### Supporting code

- [src/data/phase19.ts](../src/data/phase19.ts) — lessons, quizzes, labs, `PHASE_19` export.
- [src/components/SecurityHardeningView.tsx](../src/components/SecurityHardeningView.tsx) — interactive UI (control category classification, platform identification, hardening gap audit, knowledge check, summary). Named distinctly from the pre-existing Phase 8 `HardeningAuditView.tsx` to avoid collision.
- [src/lib/hardeningEngine.ts](../src/lib/hardeningEngine.ts) — pure grading functions for the interactive exercises.
- [src/sim/phase19Commands.ts](../src/sim/phase19Commands.ts) — prepared command outputs.
- `src/data/curriculum.ts` — imports/exports `PHASE_19`, included in `PHASES` and `PHASE_OUTLINE` (`status: 'available'`).
- `src/sim/commands.ts` — `...inPhase(19, PHASE_19_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/security-hardening` route (lazy-loaded) and sidebar nav entry, added together per the established Phase 15+ workflow.

## 3. Safety Review During Authoring

Every prepared command output in `phase19Commands.ts` was checked against the credential-leak safety regexes (`password=`, `secret:`, `api-key`, private-key blocks, bearer tokens) before running tests. No matches were found.

## 4. Tests

- All 707 tests pass across 18 test files (`npm test -- --run`).
- Curriculum structural checks: unique lesson/lab/quiz IDs, answer indices in range, explanations >10 chars, domain tags present (`Security Operations`), lab completeness (objective, securityConcepts, environment, topology, prerequisites, steps, expectedResults, verification, troubleshooting, challenge, evidence, securityLesson).
- Roadmap outline: Phase 19 listed with `status: 'available'`.
- Simulator safety: every Phase 19 prepared command is provenance-labelled `simulated` and contains no real credentials, keys, or tokens.

## 5. Build

`npm run build` completes with zero TypeScript errors. `SecurityHardeningView` is code-split into its own 20.81 kB chunk (5.89 kB gzipped), loaded lazily via `React.lazy` in `App.tsx`.

## 6. Security Review

- No real secrets, credentials, private keys, API tokens, or personal information are included.
- All simulator outputs are deterministic, prepared, and labelled `simulated`; hostnames and device names are fictional.
- No functional exploit or configuration-bypass tooling is included — findings are presented purely as recognise-and-remediate audit content.

## 7. Acceptance Criteria

- [x] Phase 19 appears in the roadmap outline with status **available**.
- [x] Lessons and labs are wired into `curriculum.ts` and exported.
- [x] `src/data/phaseIndex.json` matches `PHASES` and includes the phase-19 entry.
- [x] Simulator commands for Phase 19 are in the closed allowlist (`src/sim/commands.ts`).
- [x] All 707 tests pass.
- [x] Production build completes without errors.
- [x] `SecurityHardeningView` is reachable from the main navigation (route + nav entry added together), distinct from the pre-existing Phase 8 Hardening Audit view.

## Next Phase

**Phase 20 — Security Automation**, per `PROMPT.md`. Currently listed as `planned` in `PHASE_OUTLINE`. Awaiting approval to proceed.

---
*Report generated at the completion of Phase 19. All material follows the CompTIA Security+ SY0-701 exam objectives and the platform's phase-gated build process.*
