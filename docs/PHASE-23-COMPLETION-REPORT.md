# Phase 23 Completion Report — Full SOC Capstone

**Exam domain:** Security Operations (4.0, SY0-701)
**Status:** Complete
**Route:** `/soc-capstone`
**Tests:** 745 passing across 19 files (26 new in `tests/phase23.test.tsx`, plus curriculum drift guards picking up Phase 23 automatically)
**Build:** clean — `SocCapstoneView` code-split chunk (17.61 kB / 4.64 kB gzip), zero TypeScript errors

## 1. Concept

Phase 12's completion report flagged its own limitation: one incident is worked end to end, and "if Phase 23 (SOC Capstone) needs a second full case, ransomware is the one to build, since it is the exception to capture-before-contain." This phase is exactly that second full case — `IR-2026-0909-01`, an enterprise ransomware event via a compromised vendor VPN account — reusing the same `Incident` data model and grading engines (`irEngine.ts`) as Phase 12's `IR-2026-0908-01`, plus a new triage exercise reusing Phase 7's `triageEngine.ts`.

## 2. Features Delivered

| PROMPT.md requirement (Phase 23 — Full SOC Capstone) | Status | Evidence |
| --- | --- | --- |
| Enterprise environment: Internet → Firewall → Network → Servers → Endpoints → Identity Infrastructure → SIEM/EDR | Done | `INCIDENT.timeline`/`affectedAssets` span VPN-GW-01, CORE-FW-01, FILESRV-02, APPSRV-03, vendor-support (identity), SIEM correlation |
| Simulated multi-stage incident: phishing → compromised credentials → suspicious authentication → malicious process → lateral movement → alert → incident response | Done | 8-event timeline in `inc-1`: phishing delivery, credential submission, VPN auth (no MFA), loader execution, SMB lateral movement, shadow-copy deletion, mass rename, SIEM correlation |
| 1. Detect | Done | Console step 1 — incident summary, severity, topology |
| 2. Triage | Done | Console step 2 — 4-alert triage exercise (`capstoneAlerts.ts` + `gradeTriage`) |
| 3. Investigate | Done | Console step 3 — 8-event timeline reconstruction (`gradeTimeline`/`shuffledTimeline`) |
| 4. Collect evidence | Done | Console step 4 — order of volatility + affected-asset scoping (`gradeAssets`) |
| 5. Contain | Done | Console step 5 — two-axis containment, demonstrating the ransomware isolate-first exception |
| 6. Recommend remediation | Done | Console step 6 — eradication checklist |
| 7. Recover | Done | Console step 7 — recovery plan, separated from eradication |
| 8. Document lessons learned | Done | Console step 8 — blameless lessons learned + key lesson |

### Lessons

| # | Lesson | Topics covered |
| --- | --- | --- |
| 0 | The Full Attack Chain, End to End | Vendor/third-party initial access, one missing control (MFA) undoing downstream defenses, lateral movement via shared credentials (Phase 22 callback), correlation across log sources (Phase 7 callback) |
| 1 | Ransomware Response and the Order-of-Volatility Exception | Ransomware's signature (mass rename, shadow-copy deletion, ransom note, pre-encryption exfiltration), the isolate-first exception, two-axis containment across multiple hosts, why "restore from backup" ≠ "closed," blameless lessons learned |

19 quiz questions across the two lessons, consistent with Phases 20–22.

### Labs

| # | Lab | What it exercises |
| --- | --- | --- |
| 0 | Detect, Triage, Investigate, and Collect Evidence (`p23-lab-0`) | Console steps 1–4 |
| 1 | Contain, Remediate, Recover, and Document (`p23-lab-1`) | Console steps 5–8, including the ransomware containment exception |

### Prepared simulator commands (`src/sim/phase23Commands.ts`)

8 commands, deterministic, labelled `simulated`, `tool: 'platform'`: `show vpn authentication log`, `show ransomware detection alert`, `explain ransomware containment exception`, `show capstone timeline`, `show capstone containment options`, `show capstone eradication checklist`, `show capstone recovery plan`, `show capstone lessons learned`.

### Supporting code

- [src/data/incidents.ts](../src/data/incidents.ts) — added `inc-1` (the ransomware capstone incident) to the existing `INCIDENTS` array, reusing the `Incident` type from Phase 12 unchanged.
- [src/data/capstoneAlerts.ts](../src/data/capstoneAlerts.ts) — 4 alerts for the capstone's triage step, reusing Phase 7's `Alert` type.
- [src/data/phase23.ts](../src/data/phase23.ts) — lessons, quizzes, labs, `PHASE_23` export.
- [src/components/SocCapstoneView.tsx](../src/components/SocCapstoneView.tsx) — 8-step interactive console, reusing `gradeContainment`/`gradeAssets`/`gradeTimeline`/`shuffledTimeline` from `irEngine.ts` (Phase 12) and `gradeTriage`/`isTriageComplete` from `triageEngine.ts` (Phase 7) against the new incident/alerts, with no engine changes required.
- [src/sim/phase23Commands.ts](../src/sim/phase23Commands.ts) — prepared command outputs, `tool: 'platform'`.
- `src/data/curriculum.ts` — imports/exports `PHASE_23`, included in `PHASES`, `PHASE_OUTLINE` status flipped `planned` → `available`.
- `src/sim/commands.ts` — `...inPhase(23, PHASE_23_COMMANDS)` added to the closed allowlist.
- `src/App.tsx` / `src/components/AppLayout.tsx` — `/soc-capstone` route (lazy-loaded) and sidebar nav entry ("Full SOC Capstone", `Award` icon), added together.
- [tests/phase23.test.tsx](../tests/phase23.test.tsx) — 26 new tests covering incident data integrity, containment/asset/timeline/triage grading, curriculum safety scanning, and console UI interaction.

## 3. Design Notes: The Ransomware Exception, Made Concrete

The pedagogical payoff of this phase is a direct, gradeable contrast with Phase 12:

| | IR-2026-0908-01 (Phase 12) | IR-2026-0909-01 (Phase 23) |
| --- | --- | --- |
| Recommended first action | Capture memory, **then** isolate | **Isolate** immediately, capture what remains after |
| Why | Single static host; evidence outweighs the few minutes lost containing it | Active multi-host encryption; every minute of delay costs more spread |
| "Capture first" option here | *(is* the recommended action)* | Explicitly `recommended: false` — `rco1` in `inc-1`, with a rationale directly naming the Phase 12 contrast |

`gradeContainment(INCIDENT, ['rco1'])` (capture-memory-first alone) reports `contained: false` for the capstone incident — the exact opposite of what the same *style* of action would report for Phase 12's case — and a dedicated test in `phase23.test.tsx` asserts this directly, so the platform's own test suite encodes the exception rather than only describing it in prose.

## 4. Reuse Over Reinvention

No changes were needed to `irEngine.ts`, `triageEngine.ts`, `incidents.ts`'s types, or `socTelemetry.ts`'s `Alert` type — every grading function in this phase is a call to an existing, already-tested pure function against new data. This was a deliberate design choice: a capstone that reused prior phases' skills only reused their *engines* would be shallow synthesis; reusing the same generic engines against a genuinely new incident and alert set is what makes the capstone claim credible.

## 5. Safety Review During Authoring

All hostnames (FILESRV-02, APPSRV-03, VPN-GW-01, CORE-FW-01, BACKUP-SRV-01), usernames (vendor-support), and addresses are fictional; no real IP appears — the incident's timeline and commands reference systems by name only, with no address literals requiring range validation beyond what `tests/phase23.test.tsx`'s regex scan already confirms returns zero matches. Grepped `incidents.ts`'s new block, `capstoneAlerts.ts`, `phase23Commands.ts`, and `phase23.ts` against all credential-leak safety patterns before running tests — no matches.

## 6. Test & Build Verification

- `npm run gen:index` — regenerated `src/data/phaseIndex.json` to include Phase 23.
- `npm test -- --run` — 745 tests passing across 19 files (up from 719 in Phase 22 plus the 26 new Phase 23 tests, net of one drift-guard addition).
- `npm run build` — clean production build; `SocCapstoneView` chunk (17.61 kB / 4.64 kB gzip) code-split correctly; `irEngine`/`triageEngine` now split as their own shared chunks since two views depend on them.

## 7. Known Issues / Follow-ups

None outstanding. Both incidents (`inc-0`, `inc-1`) are independently addressable via `getIncident()`, and `IncidentConsoleView` continues to render only `INCIDENTS[0]` (Phase 12's case) while `SocCapstoneView` renders `inc-1` explicitly — the two consoles are intentionally separate views over a shared data/engine layer, not one view branching on an id.

## 8. Next Phase

Phase 24 — Security+ Exam Preparation: domain quizzes, scenario and performance-based questions, timed assessments, mock exams, weak-area review, and adaptive testing — drawing on the full question bank this platform has accumulated across all 23 built phases.
