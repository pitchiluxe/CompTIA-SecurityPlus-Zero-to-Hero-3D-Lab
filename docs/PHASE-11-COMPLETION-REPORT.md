# Phase 11 Completion Report — Network Security

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 12

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 11)                 | Status | Where                                                  |
| ------------------------------------------------ | ------ | ------------------------------------------------------ |
| Teach 12 named topics (firewalls → DNS security) | Done   | `src/data/phase11.ts` — 3 lessons, 22 sections         |
| "Build and secure an enterprise network"         | Done   | Full config across 8 areas, built on the Phase 4 zones |
| "Inject safe configuration errors"               | Done   | 8 errors among 20 items, spanning every area           |
| "Make the learner identify them"                 | Done   | Review with **no recommended values shown**            |

### Lessons

| #   | Lesson                                         | Topics covered                                     |
| --- | ---------------------------------------------- | -------------------------------------------------- |
| 0   | Firewalls, ACLs and Rule Order                 | Firewalls, ACLs, rule ordering, stateful filtering |
| 1   | Segmentation, VLANs and Monitoring             | Segmentation, VLANs, IDS/IPS, monitoring           |
| 2   | Wireless, NAC, VPN and Infrastructure Services | Wireless, NAC, VPN, DHCP, DNS, secure protocols    |

10 quiz questions. 8 new prepared artifacts (136 commands total).

---

## 2. Computed Firewall Rule Analysis

The phase's technical centrepiece is a **shadowing analyser** that computes whether a rule can ever fire, from CIDR and port containment — not from a hard-coded answer.

Rules evaluate top-down, first match wins. A broad permit above a specific deny makes the deny dead code, and the config still reads correctly line by line. That is the most common serious firewall finding in real environments and the hardest to spot by reading.

The analyser distinguishes two cases:

- **Redundant** — the shadowing rule has the same action, so the later rule is merely dead weight.
- **Contradicted** — the actions differ, so the intent of the later rule is actively defeated.

**Browser-verified**: the lab rule set shows **4 unreachable rules**, all shadowed by the `permit ip any any` at sequence 20. Using the reorder control drops that to **1**, and restoring returns it to 4.

That residual **1** is worth noting, because it emerged from the logic rather than being designed: moving the permit-any to sequence 55 still leaves it shadowing the explicit deny-all at 60. Relocating the rule fixes most of the damage but not all — the correct fix is deleting it. A scripted 4→0 would have taught something slightly false.

Supporting the analyser: CIDR parsing that normalises host bits (so `192.168.1.5/24` and `192.168.1.0/24` compare as the same network, as a firewall would treat them), port-range containment, and protocol coverage where `ip` subsumes `tcp` and `udp`. All asserted by test, including malformed-input rejection.

---

## 3. Errors Injected Without Hints

PROMPT.md asks for injected errors the learner identifies. The important design decision is what the review **does not** show.

Phase 8's hardening audit displayed current-versus-recommended side by side, which makes the answer largely mechanical. This one shows the configuration exactly as it would appear on the device, with no recommended value and no annotation. The learner has to know what right looks like — the difference between following a checklist and reviewing a network.

**A test asserts the config text never leaks its own verdict**, scanning for words like "error", "should be" or "recommended" in the configuration itself.

Eight errors across the areas, including:

- A `permit ip any any` commented _"Temporary — added during the migration, 2025-03"_, over a year old
- A trunk with `native vlan 1` and `allowed vlan all` — double-tagging plus carrying management and guest
- Corporate wireless on WPA2-**PSK**, which cannot participate in a leaver process
- NAC ports set `force-authorized` "for the conference room", which disables 802.1X on exactly the ports most likely to be abused
- An inline IPS with a signature set over a year old and `fail-open` enabled

Critically, **twelve items are correct**, including two that look questionable and are legitimate design trade-offs: an alert-only IDS and a split-tunnel VPN. Flagging those wastes the network team's time, and a test asserts that flagging everything scores badly.

---

## 4. Tests

```
Test Files  17 passed (17)
Tests       631 passed (631)     (Phase 10 finished at 574)
```

New file `tests/phase11.test.tsx` (53 tests):

| Group                 | Covers                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CIDR containment      | Host-bit normalisation, malformed rejection, supernet/subnet, disjoint, identical                                                                          |
| Port containment      | Single, range, `any`, malformed rejection                                                                                                                  |
| **Rule shadowing**    | Broad-over-specific, direction, protocol coverage, redundant vs contradicted, correctly-ordered set, evaluation by sequence not array order                |
| The lab rule set      | Broad permit present, explicit deny-all, all shadowing traced to seq 20, **reordering reduces it**                                                         |
| Phase 11 curriculum   | All 12 topics; builds on Phase 4 zones                                                                                                                     |
| Injected errors       | Errors and correct both present; every area populated; **config never leaks its verdict**; severity only on errors; questionable-but-correct items present |
| Config review grading | Perfect, missed error, false error, flag-everything penalised, high-severity counted                                                                       |
| Simulated evidence    | Match counters, first-match-wins, IDS/IPS placement, VLAN hopping, SSID hiding, NAC exemptions, DHCP/DNS controls, NTP rationale                           |
| NetworkReviewView     | No recommended values shown; submission gating; grading; **analysis recomputes on reorder**                                                                |
| Labs and quizzes      | Two labs end to end; rule-ordering quiz                                                                                                                    |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 5. Defects Found and Fixed

**Two content gaps, both caught by the coverage test.** PROMPT.md lists **VPN** and **secure protocols** for this phase and neither appeared in my lesson text. Both had been covered elsewhere — VPN in Phase 4 as a trust boundary and Phase 6 as cryptography; secure protocols in Phases 1 and 6 for application traffic — and I had treated them as done.

They are not the same content from a network-security angle, so rather than cross-reference I added:

- VPN as network configuration: site-to-site versus remote access, IPsec versus TLS, and split tunnelling as a genuine trade-off rather than an error.
- Secure protocols on the **infrastructure itself** — SSH not Telnet, HTTPS not HTTP, SNMPv3 not v1/v2c, syslog over TLS. A network whose devices are managed in cleartext has a management plane an on-path attacker can read. This had genuinely never been covered.

**A stray object key.** I left `button: undefined` in a lesson section while drafting. Removed before the typecheck, which would have rejected it.

---

## 6. Security Review

| Control               | Result                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| No command execution  | Unchanged — 136 commands in the same closed allowlist                              |
| Credentials in config | Wireless PSK shown as `[REDACTED]`; no key material anywhere                       |
| Addressing            | RFC 1918 throughout, consistent with the Phase 4 zones                             |
| Attack content        | Defensive framing — VLAN hopping and rogue DHCP described as conditions to prevent |
| Analyser input        | Parsers reject malformed CIDR and ports rather than throwing, asserted by test     |

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **The shadowing analyser handles the common cases, not all of them.** It detects a single earlier rule fully containing a later one. It does not detect _cumulative_ shadowing, where several earlier rules together cover a later one without any single rule doing so. That is a genuinely harder analysis and it is not what the phase is teaching, but the limitation is real and worth stating rather than implying the tool is complete.
- **IPv4 only.** The CIDR logic does not handle IPv6, which Phase 1 explicitly taught is usually enabled whether or not anyone planned for it. A rule set analyser that ignores IPv6 would miss real findings in a real environment.
- **The reorder control offers one fix**, not free rearrangement. Drag-to-reorder would let learners experiment properly and is a UI change rather than a logic one — the analysis already recomputes from whatever order it is given.
- **20 config items, one network.** Enough to teach the discrimination; a learner repeating it will remember verdicts. The engine takes its item list as a parameter.
- Main bundle 265 kB (86 kB gzipped), up 1 kB.

---

## 8. Acceptance Criteria

| Criterion                            | Status   | Evidence                                                                               |
| ------------------------------------ | -------- | -------------------------------------------------------------------------------------- |
| All 12 named topics taught           | **Pass** | 13-keyword coverage test, including the two gaps it caught                             |
| Enterprise network built and secured | **Pass** | 8 config areas on the Phase 4 zone architecture                                        |
| Configuration errors injected safely | **Pass** | 8 errors among 20 items; no credentials; RFC 1918 only                                 |
| Learner identifies them unaided      | **Pass** | No recommended values shown, asserted by test; correct-but-questionable items included |
| Analysis is real, not scripted       | **Pass** | Computed from CIDR/port containment; browser-verified 4 → 1 → 4 on reorder             |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 12 — Incident Response.** The platform is unusually well positioned for it: the Phase 7 investigation established the timeline, Phases 8 and 9 found the persistence on both hosts, and Phase 10 supplied the remediation vocabulary.

Expect the IR lifecycle (preparation, identification, containment, eradication, recovery, lessons learned), evidence handling and chain of custody, and containment decisions under time pressure. The natural exercise is running the incident this platform has carried since Phase 0 through a full response — which would finally close it.

**Awaiting your approval before starting.**
