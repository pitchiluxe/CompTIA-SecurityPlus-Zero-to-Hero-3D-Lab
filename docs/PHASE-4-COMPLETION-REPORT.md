# Phase 4 Completion Report — Security Architecture

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**, Domain 3.0 — **18%**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 5

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 4)                                             | Status | Where                                                                  |
| --------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| Teach 17 named topics (segmentation → redundancy)                           | Done   | `src/data/phase4.ts` — 4 lessons, 28 sections                          |
| 3D: Internet → Firewall → DMZ → Core → Users / Servers / Management / Guest | Done   | `src/data/networkZones.ts`, `src/scenes/ZoneScene.tsx`                 |
| "Allow the learner to inspect security boundaries"                          | Done   | Six inspectable boundaries with controls, allowed, denied, and purpose |

### Lessons

| #   | Lesson                                                | Topics covered                                          |
| --- | ----------------------------------------------------- | ------------------------------------------------------- |
| 0   | Segmentation, VLANs and Security Zones                | Segmentation, VLANs, security zones, DMZ                |
| 1   | Boundary Controls                                     | Firewalls, IDS, IPS, WAF, forward and reverse proxies   |
| 2   | Trust, Access and Deception                           | Zero Trust, VPN, NAC, honeypots, honeynets              |
| 3   | Secure Architecture, Redundancy and High Availability | Secure design, redundancy, HA, single points of failure |

16 new quiz questions, each tagged with an SY0-701 domain and a tracked concept.

### Labs

| Lab                                           | Focus                                                   |
| --------------------------------------------- | ------------------------------------------------------- |
| `p4-lab-0` Map the Security Zones             | Seven zones by trust; three boundaries inspected        |
| `p4-lab-1` Place the Boundary Controls        | IDS/IPS/WAF by placement; control dependency ordering   |
| `p4-lab-2` Trace Flows Across Zone Boundaries | Permitted vs denied flow; routing as the policy enabler |
| `p4-lab-3` Review the Architecture            | Single points of failure; deception assets              |

10 new prepared artifacts in `src/sim/phase4Commands.ts`.

---

## 2. Platform Fix — Per-Lab Command Scoping

I flagged this in the Phase 1, 2, and 3 reports. Rather than note it a fourth time, it is now fixed.

**The problem:** `help` listed all 55 commands regardless of context. In a Phase 0 lab that was both noise and a **spoiler** — it revealed Phase 3's phishing headers and ransomware timeline before the learner had met them.

**The fix:** every command carries a `phase` number, applied once at composition time rather than repeated on each entry (`PreparedCommand` = `Omit<SimCommand, 'phase'>`). `listCommands(maxPhase)` scopes the listing, and `LabView` derives the cap from the lab's own `phaseId`, surfacing that lab's step commands first.

Verified in the browser: a Phase 0 lab now shows 7 lab commands plus 5 phase-appropriate ones — 12 instead of 55, with no later-phase content visible.

The allowlist itself is unchanged. This scopes the **listing**, not the safety boundary.

---

## 3. 3D Features

`src/scenes/ZoneScene.tsx` — the architecture as stacked tiers.

Height encodes trust: Internet at the top, descending through DMZ and Core to the four segments. The 3D and 2D layouts share that vertical grammar, so the mental model transfers between them.

- Seven zone platforms, sized by tier, coloured by zone
- Six boundary gates rendered as torus rings at tier midpoints, individually clickable
- Selecting a zone shows its trust level, VLAN, network, contents, and rules
- Selecting a boundary shows controls, allowed traffic, denied traffic, and what it exists to prevent
- A boundary list sorted by **trust delta**, steepest first
- **2D fallback** (`src/scenes/ZoneFallback2D.tsx`): same tiers, gates on the connecting links, keyboard-accessible

### Trust delta as the organising idea

Each zone carries a numeric trust level, and `trustDelta()` computes the change a boundary spans. This makes an argument the prose alone would only assert: the steepest boundary in the design (Users → Management, Δ40) is the one with a deny-all rule rather than a curated port list. A test asserts that relationship holds, so the data cannot drift away from the lesson.

`src/data/networkZones.ts` is the single source of truth for the 3D scene, the 2D fallback, the detail panels, and the `show zones` transcript. A test asserts the transcript names every zone in the data, and that the Core network still matches the Phase 0 estate (`192.168.1.0/24`).

---

## 4. Tests

```
Test Files  10 passed (10)
Tests       278 passed (278)     (Phase 3 finished at 235)
```

New file `tests/phase4.test.tsx` (37 tests):

| Group                      | Covers                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 curriculum         | All 17 required topic keywords; lessons, labs, exam domain                                                                                           |
| Network zone data          | Seven zones, trust ordering, Guest placement, VLAN/CIDR presence, RFC 1918 only, tier layout, Phase 0 consistency                                    |
| Boundary data              | Zone references resolve, completeness, trust delta computation, steepest-gets-strictest, DMZ direction rule, guest routing                           |
| Phase 4 simulated evidence | Trust ordering, IDS/IPS/WAF placement, guest denial at layer 3, inter-VLAN policy point, two SPOFs, honeypot confidence, data/transcript consistency |
| **Scoped command help**    | Phase tagging, listing widens with phase, early phases exclude later evidence                                                                        |
| ZoneFallback2D / ZonesView | 2D fallback, zone and boundary selection, panel exclusivity, delta ordering                                                                          |
| Phase 4 labs               | Two labs run end to end                                                                                                                              |
| Phase 4 quizzes            | Grading and mastery recording                                                                                                                        |

**Six tests appeared for free** again from the parameterised suites (235 → 241 before any Phase 4 test existed), and the lab-to-allowlist guard verified all 16 Phase 4 step commands.

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified**: the zone architecture in 2D with all seven zones and six gates; selecting Users → Management showing its deny-all policy and rationale; the boundary list ordered Δ40 → Δ5; and the scoped `help` output in a Phase 0 lab.

---

## 5. Security Review

| Control                   | Result                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| No command execution      | Unchanged — Phase 4 artifacts join the same closed allowlist (now 65 commands)                                               |
| Command scoping           | Scopes the `help` listing only. `runCommand` still matches against the full allowlist, so no lab can be broken by the change |
| Addressing                | All zone networks asserted RFC 1918 by test; Core matches the existing Phase 0 estate                                        |
| No real organisations     | Reference architecture only; no vendor or customer named beyond generic product categories                                   |
| No credentials or secrets | None present                                                                                                                 |

---

## 6. Defects Found and Fixed

**One real accessibility defect, found by a failing test.**

The boundary and zone buttons rendered as `<span class="mr-2">Δ40</span>Users → Management`. `mr-2` is a CSS margin — it produces visual spacing but contributes nothing to text content, so the accessible name a screen reader announces was `Δ40Users → Management`, run together. The zone chips had the same problem (`Internet0`).

I found this while debugging a test that could not locate a button by name. The tempting fix was to loosen the test regex; the correct fix was an explicit `{' '}` in the markup, which gives both the assertion and the screen reader a real word boundary. Three buttons corrected.

**One layout defect, found in the browser.** The four segment boxes in the 2D fallback overlapped: the offset-to-pixel scale (24 px/unit) was smaller than the box width required (168 px across a 5-unit step needs ≥ 38 px/unit). Now derived from the box width rather than hard-coded, so the two cannot disagree again.

---

## 7. Known Issues and Limitations

- **3D still not visually confirmed on this machine.** The verification browser's GPU continues to drop the WebGL context. All five scenes load and degrade correctly to 2D. **Please open `/zones`, `/attack-chain`, `/controls`, `/path`, and `/soc` on your own machine to confirm the 3D renders.**
- Carried forward: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **The main bundle is now 605 kB** (187 kB gzipped) as curriculum accumulates. The 3D chunk stays separate and shared across all five scenes. Route-level code splitting of the curriculum data is the obvious next optimisation, and I would suggest doing it during Phase 5 or 6 rather than later.
- **Zone-to-device linkage is descriptive, not structural.** `networkZones.ts` names WS-01, SRV-01, and DC-01 in its `contains` lists as strings rather than referencing `socDevices.ts` entries. Making that a typed cross-reference (as the attack chain does with defence layers) would let the SOC scene colour devices by zone. Worth doing when Phase 11 revisits network security.
- The allowlist is 65 commands, but `help` is now scoped, so this is no longer a usability concern.

---

## 8. Acceptance Criteria

| Criterion                                           | Status                 | Evidence                                                                |
| --------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| All 17 named topics taught                          | **Pass**               | 4 lessons, 28 sections; 17-keyword coverage test                        |
| 3D enterprise architecture with the specified tiers | **Pass (2D verified)** | Seven zones in the exact PROMPT.md structure; 2D browser-verified       |
| Learner can inspect security boundaries             | **Pass**               | Six boundaries with controls, allowed, denied, purpose, and trust delta |
| Zones reflect real trust relationships              | **Pass**               | Trust ordering asserted; steepest delta matched to strictest control    |
| Labs runnable end to end                            | **Pass**               | Two automated, boundary inspection browser-verified                     |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 5 — Identity & Access Management.** CLAUDE.md marks this a **major career component**, and PROMPT.md pairs it with Phase 27 (the Security+ → IAM career bridge).

Scope from the roadmap: MFA, SSO, SAML, OAuth, Active Directory, Kerberos, plus the identity lifecycle. The natural 3D deliverable is the authentication flow, which the global 3D requirements list explicitly — and Phase 4 has just built the thing it plugs into. Zero Trust needs identity to make an access decision; NAC supplied the device half in this phase, and Phase 5 supplies the rest.

The existing estate already has DC-01 in the Servers zone and a Management zone reachable only with MFA via a jump host, so the identity architecture extends what is there rather than introducing a new environment.

**Awaiting your approval before starting.**
