# Phase 1 Completion Report — Computer, Network & Security Foundations

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 2

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 1)                   | Status | Where                                         |
| ------------------------------------------------- | ------ | --------------------------------------------- |
| Teach 22 named topics (architecture → VPNs)       | Done   | `src/data/phase1.ts` — 4 lessons, 26 sections |
| Lab: explore a Windows endpoint                   | Done   | `p1-lab-0`                                    |
| Lab: explore a Linux endpoint                     | Done   | `p1-lab-1`                                    |
| Lab: inspect processes                            | Done   | `p1-lab-2`                                    |
| Lab: inspect network configuration                | Done   | `p1-lab-3`                                    |
| Lab: identify listening ports                     | Done   | `p1-lab-4`                                    |
| Lab: trace a client-to-server connection          | Done   | `p1-lab-5`                                    |
| 3D: User → Endpoint → Network → Server → Controls | Done   | `src/scenes/PathScene.tsx`                    |

### Lessons

| #   | Lesson                                                    | Topics covered                                                        |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| 0   | Computers, Operating Systems and Processes                | Computer architecture, OS, filesystems, processes, users, permissions |
| 1   | The Command Line on Windows and Linux                     | Windows basics, Linux basics, command line                            |
| 2   | Networking Foundations                                    | LAN/WAN, TCP/IP, IPv4/IPv6, DNS, DHCP, ports, protocols               |
| 3   | Network Devices, Secure Protocols and the Connection Path | Routers, switches, firewalls, VPNs, HTTP/HTTPS, SSH                   |

15 new quiz questions, every one tagged with an SY0-701 domain and a tracked concept.

### Simulation engine

22 new prepared commands in `src/sim/phase1Commands.ts`, composed with Phase 0's set:

- **Windows:** systeminfo, net user, net localgroup administrators, icacls, tasklist /svc, route print, arp -a, ping, tracert, nslookup, ipconfig /displaydns
- **Linux:** uname -a, ls -la /var/www, id, cat /etc/passwd, ps aux, ip route, dig, curl (HTTP and HTTPS), ssh -v, ip -6 addr
- **Platform:** trace connection ws-01 srv-01

The allowlist is now split per phase (`PHASE_0_COMMANDS`, `PHASE_1_COMMANDS`) and composed into `SIM_COMMANDS`, so each phase's prepared evidence stays reviewable on its own. The closed-allowlist safety contract is unchanged.

---

## 2. 3D Features

`src/scenes/PathScene.tsx` — the connection path as a walkable scene.

- Five stage pillars laid out left to right, coloured per stage
- A request packet travels the path continuously on one lane; a response returns on a parallel lane
- The stage the packet is currently passing **lights up and fades**, so the sequence reads without any text
- Click a pillar to select it; selection ring plus a detail panel showing that stage's controls and detection opportunities
- Orbit / pan / zoom, clamped above the floor
- **2D fallback** (`src/scenes/PathFallback2D.tsx`): the same five stages, both lanes, keyboard-accessible

Both scenes now share one extracted Three.js chunk rather than duplicating it.

### One source of truth

`src/data/connectionPath.ts` holds the path. The 3D scene, the 2D fallback, the detail panels, and the `trace connection` simulator output all describe the same nine steps. A test asserts the flattened step list ends at step 9, matching the transcript numbering, so the visualisation and the lab evidence cannot drift apart.

Each stage carries `controls` and `detectionOpportunities` as **separate** fields. That is the teaching point of the phase: a control that blocks and a control that sees are different things, and TLS removes the second without touching the first.

---

## 3. Tests

```
Test Files  7 passed (7)
Tests       144 passed (144)     (Phase 0 finished at 112)
```

New file `tests/phase1.test.tsx` (21 tests):

| Group                      | Covers                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Phase 1 curriculum         | Asserts all 19 required topic keywords appear; all six named labs present                                             |
| Phase 1 simulated evidence | Cross-command consistency, DNS-to-IP linkage, HTTP vs HTTPS disclosure, host key redaction, IPv6 documentation ranges |
| Connection path data       | Stage order, left-to-right positions, controls and detection present, nine-step numbering                             |
| PathFallback2D / PathView  | 2D fallback, stage selection, controls and detection rendering                                                        |
| Phase 1 labs               | Linux lab surfaces the world-writable file; trace lab shows all nine steps; verification gating                       |
| Phase 1 quizzes            | Grading and mastery recording                                                                                         |

### Tests generalised, not just added

Four Phase 0 tests asserted _snapshots of progress_ rather than invariants — `expect(PHASES).toHaveLength(1)` had to fail the moment Phase 1 shipped. Those are now phase-agnostic and cover every future phase automatically:

- Every built phase has lessons, labs, and a consistent item count
- Every phase has a unique id and number
- Every lesson and lab is tagged with its own phase id
- Lab completeness and id uniqueness now iterate all phases, not just Phase 0

Two genuinely new invariants:

- **Roadmap drift guard** — the set of phases marked `available` in the outline must exactly equal the set of built phases. Catches building a phase and forgetting to flip its flag.
- **Lab-to-allowlist guard** — every lab step that names a command must reference a command that exists in the simulator allowlist. This caught nothing on first run, which is the point: all 39 Phase 1 step commands were verified to resolve.

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified**: the connection path view (2D fallback, all five stages, stage selection updating the detail panel), the roadmap showing both phases with correct lesson and lab counts, and `route print` executing in lab `p1-lab-3` with its provenance badge and teaching note.

---

## 4. Security Review

All Phase 0 controls hold. Phase 1 additions were reviewed against the same rules:

| Control               | Result                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No command execution  | Unchanged — Phase 1 commands are entries in the same closed allowlist                                                                                         |
| No real secrets       | The `ssh -v` output redacts the host key fingerprint (`SHA256:V0xLQb...redacted...`) rather than printing a plausible-looking real one. Test asserts this     |
| No real credentials   | `/etc/passwd` output shows `x` placeholders only; no hashes anywhere                                                                                          |
| Addressing            | All IPv4 in RFC 1918; the one external address is RFC 5737 documentation space; IPv6 uses `2001:db8::/32` (RFC 3849 documentation) and `fe80::/10` link-local |
| Authorisation framing | The Nmap step in `p1-lab-4` repeats the authorisation note in its troubleshooting section                                                                     |
| Evidence coherence    | A test asserts `route print`, `ipconfig /all`, `ip route`, and the path trace agree on the gateway — learners never reason over contradictory evidence        |

### A note on the world-writable file

`p1-lab-1` deliberately presents `deploy.sh` as mode 777 so learners find a real privilege-escalation pattern. This is prepared text in a simulator; nothing on the learner's machine is modified, and the lab's challenge asks for the remediation, not the exploitation.

---

## 5. Defects Found and Fixed

1. **Dashboard and Roadmap hardcoded `PHASE_0`.** Both would have silently ignored Phase 1. Dashboard now computes the current phase as the earliest built phase with unfinished work and reports course-wide totals; Roadmap resolves each outline entry against the built phases.
2. **Phase-count assertions in the test suite** — four tests encoded "there is exactly one phase". Generalised as described above.

No defects were found in the Phase 0 runtime code during this phase.

---

## 6. Known Issues and Limitations

- **3D still not visually confirmed on this machine.** The verification browser's GPU continues to drop the WebGL context. Both scenes load and initialise, and both correctly degrade to 2D. **Please open `/path` and `/soc` on your own machine to confirm the 3D renders.**
- Carried forward from Phase 0: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **The 3D chunk is still ~1 MB** but is now shared between both scenes rather than duplicated, and is still only fetched when WebGL is available and a 3D route is open.
- **Phase 1 has no PBQ-style drag-and-drop**, only the ordering PBQ format built in Phase 0. Richer PBQ interactions are worth building when a phase needs them.
- The command allowlist is global rather than per-lab, so `help` now lists 34 commands. If it grows much further, scoping the listing per lab would be worthwhile.

---

## 7. Acceptance Criteria

PROMPT.md states no explicit acceptance line for Phase 1, so these are derived from its Teach / Labs / 3D sections:

| Criterion                         | Status                 | Evidence                                                                                    |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| All 22 named topics taught        | **Pass**               | 4 lessons, 26 sections; keyword coverage test                                               |
| All six named labs delivered      | **Pass**               | `p1-lab-0` … `p1-lab-5`; test asserts each by name                                          |
| Every lab fully documented        | **Pass**               | Structural completeness test now covers all phases                                          |
| 3D visualises the five-stage path | **Pass (2D verified)** | Scene built and code-split; 2D fallback browser-verified. 3D render needs your confirmation |
| Labs runnable end to end          | **Pass**               | Browser-verified in `p1-lab-3`; automated in `p1-lab-1` and `p1-lab-5`                      |
| Progress and mastery integrate    | **Pass**               | Quiz grading records Phase 1 concepts; dashboard tracks both phases                         |

No acceptance criterion was skipped.

---

## 8. Next Phase

**Phase 2 — Security Fundamentals.** Scope from PROMPT.md: CIA triad, AAA, non-repudiation, least privilege, defence in depth, Zero Trust, attack surface, threat/vulnerability/exploit/risk, and the control taxonomies (preventive/detective/corrective, physical/technical/administrative).

The distinctive requirement is **interactive scenarios**: given a business scenario, the learner identifies asset, threat, vulnerability, risk, control, and residual risk. That needs a new interaction type beyond the current MCQ/scenario/PBQ set — a structured scenario workbench with per-field grading. The Phase 1 connection path gives it somewhere concrete to attach: every control the learner names can be placed at a stage they have already walked.

**Awaiting your approval before starting.**
