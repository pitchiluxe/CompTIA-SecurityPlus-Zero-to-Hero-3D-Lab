# Phase 0 Completion Report — Platform Foundation & Security Lab

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701** (5 domains · 90 questions · 90 minutes · 750/900 to pass)
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 1

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 0)     | Status | Where                                                              |
| ----------------------------------- | ------ | ------------------------------------------------------------------ |
| Professional dashboard              | Done   | `src/components/Dashboard.tsx`                                     |
| Course roadmap                      | Done   | `src/components/Roadmap.tsx` (28 phases, 5 domains with weights)   |
| Domain / lesson navigation          | Done   | `src/components/AppLayout.tsx`, `src/App.tsx`                      |
| Lab library                         | Done   | `src/components/LabLibrary.tsx`                                    |
| Progress tracking                   | Done   | `src/store/useProgressStore.ts`                                    |
| Quiz engine                         | Done   | `src/lib/quizEngine.ts`, `src/components/QuizView.tsx`             |
| Mastery tracking (0–6)              | Done   | `src/store/useMasteryStore.ts`, `src/lib/srs.ts`                   |
| Notes / bookmarks                   | Done   | `src/store/useNotesStore.ts`, `src/components/NotesView.tsx`       |
| Evidence collection                 | Done   | `src/store/useEvidenceStore.ts`, `src/components/EvidenceView.tsx` |
| GitHub project generator foundation | Done   | `src/lib/githubGenerator.ts`, `src/components/GitHubView.tsx`      |

### Beyond the minimum

- **Spaced repetition** (`src/lib/srs.ts`) — Leitner intervals keyed to the 0–6 ladder (0d/1d/2d/4d/7d/14d/30d). Correct answers advance one level; a miss drops two.
- **Mock exam mode** — timed (1 min/question), answers hidden until submit, per-domain breakdown, weighted scaled score, readiness verdict.
- **Deterministic simulation engine** (`src/sim/`) — pure-function lab runner plus a closed-allowlist command simulator.

---

## 2. Labs

### Lab 0 — Enter the SOC Environment (`p0-lab-0`)

Navigate the SOC room, inspect all 9 devices, record roles and addressing. 5 steps, 2 evidence templates, challenge = build a full asset inventory.

### Lab 1 — First Triage: Host Command Line (`p0-lab-1`)

Establish a Windows baseline and attribute one anomalous outbound connection. 7 steps across Windows and Linux, 2 evidence templates, challenge = write an escalation note that preserves volatile evidence.

Both labs carry every section PROMPT.md requires: objective · security concepts · environment · topology · prerequisites · steps · expected results · verification · troubleshooting · challenge · evidence · security lesson. A test asserts this structurally (`tests/curriculum.test.ts`), so a future lab cannot ship incomplete.

---

## 3. 3D Features

`src/scenes/SOCScene.tsx` — React Three Fiber, loaded lazily.

- SOC room: floor, grid, video wall reading live alert count, contact shadows, three-point lighting
- 9 interactive devices: firewall, Windows endpoint, Linux server, switch, router, access point, analyst workstation, SIEM, monitoring display
- Colour is semantic: red = enforcement point, purple = identity/analytics, blue = endpoint, green = server
- Click to inspect (IP, MAC, interfaces, users, security state, recent events); hover highlight; selection ring
- Alerting devices pulse; WS-01 alerts on purpose — it is the host investigated in Lab 1
- Animated event-flow beads from each device to the SIEM, making log aggregation visible rather than decorative
- Orbit / pan / zoom with damping, clamped so the camera cannot go under the floor
- **2D fallback** (`src/scenes/Fallback2D.tsx`): SVG topology, keyboard-accessible, same device data, with collision avoidance so no two devices collapse onto one node

Fallback triggers on three paths: no WebGL support, a React render error in the canvas, or a **WebGL context-loss event** (found during browser verification — see §6).

---

## 4. Tests

```
Test Files  6 passed (6)
Tests       112 passed (112)
```

| File                        | Covers                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `tests/quizEngine.test.ts`  | Grading (MCQ/scenario/PBQ), weak-concept collection, domain weighting, scaled score, seeded shuffle |
| `tests/srs.test.ts`         | Mastery ladder, review intervals, due ordering, mastery percentage                                  |
| `tests/simEngine.test.ts`   | Allowlist safety, determinism, step advance, verification gating, evidence rendering                |
| `tests/stores.test.ts`      | Progress, mastery, notes, evidence persistence                                                      |
| `tests/curriculum.test.ts`  | Exam blueprint, quiz data integrity, lab completeness, SOC device data safety                       |
| `tests/components.test.tsx` | Dashboard, roadmap, SOC 2D fallback, lesson, lab terminal, quiz flows, notes, evidence              |

Verification also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

**Browser-verified** (dev server, real rendering): dashboard, roadmap, SOC 2D fallback with all 9 devices distinct, device inspection panel, lab terminal executing `netstat -ano` with the correct provenance badge and teaching note.

---

## 5. Security Review

| Control                 | Implementation                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No command execution    | `src/sim/commands.ts` is a closed allowlist lookup. There is no `exec`, no shell, no fallthrough path. Unknown input returns a refusal message.                               |
| Shell metacharacters    | Treated as ordinary unrecognised text. Tested with `rm -rf /`, `whoami; rm -rf /`, `whoami && curl …`, `$(whoami)`.                                                           |
| Provenance labelling    | `Provenance` is a **required** field on every simulated output, so a lab author cannot forget it. Rendered as a badge on every transcript line.                               |
| No real secrets         | Test asserts no output matches password/API-key/secret/private-key/bearer patterns. Test asserts no credential-shaped keys in device security state.                          |
| No real network targets | Test asserts every device IP is RFC 1918 or RFC 5737 documentation space. The one external address used in the C2 narrative (`203.0.113.55`) is RFC 5737 documentation space. |
| Authorisation framing   | The Nmap prepared output carries an explicit authorisation note; the dashboard states the scanning rule; the GitHub generator warns about redaction before publishing.        |
| No personal data        | None collected. All learner state is `localStorage` on the learner's own machine; there is no backend and no telemetry.                                                       |

---

## 6. Defects Found and Fixed

Six real defects were found in the existing scaffold and during verification:

1. **`submitAttempt` passed the wrong argument** — `gradeQuiz(attempt.results, results)` instead of `attempt.questions`, so `weakConcepts` was always empty and spaced repetition would silently never fire. Fixed; regression test added.
2. **Zustand v5 infinite render loop** — `useMasteryStore((s) => s.getWeakAreas())` returned a new array every render, which `useSyncExternalStore` reads as a changed snapshot. Crashed the dashboard with "Maximum update depth exceeded". Fixed by selecting stable state and deriving in `useMemo`.
3. **Tailwind v3 directives against Tailwind v4** — `@tailwind base;` produced no output, so every `bg-panel`/`text-muted` class in the components resolved to nothing. Replaced with `@import 'tailwindcss'` and a `@theme` token block.
4. **`persist` used the removed `getStorage` option** — silently no-op in Zustand v5. Migrated all four stores to `createJSONStorage`.
5. **`phasePercent` was mathematically incapable of a partial result** — it divided stored rows by stored rows, always yielding 0% or 100%. Reworked to take the curriculum total.
6. **WebGL context loss showed a blank white canvas** — found in browser verification. The error boundary catches React errors but not a lost GPU context. Added a `webglcontextlost` handler that switches to the 2D topology.

Also fixed: two SOC devices shared an `(x, z)` position and collapsed onto one node in the top-down 2D view; `@testing-library/dom` was a required peer that was never installed; a React 19 `set-state-in-effect` anti-pattern in the exam timer.

---

## 7. Known Issues and Limitations

- **3D scene not visually confirmed on this machine.** The verification browser's GPU dropped the WebGL context (`THREE.WebGLRenderer: Context Lost`) before a frame could be captured. All 3D modules loaded (HTTP 200) and Three.js initialised, and the app correctly degraded to 2D. **Please open `/soc` on your own machine to confirm the 3D room renders.**
- **TypeScript pinned to 6.0.3, not 7.** `typescript-eslint` hard-refuses to load against TS 7 (it dropped the JS compiler API the lint ecosystem reads ASTs through). Chose a linter that runs over marginally faster compiles. Vite and Vitest do not use `tsc`, so only `npm run lint` and the build's typecheck step are affected. Revisit when typescript-eslint ships TS 7 support (their issue #10940).
- **`npm install` needs `--legacy-peer-deps`** because `typescript-eslint` declares a `<6.1.0` peer range. Documented in the README.
- **3D chunk is 1.02 MB** (282 kB gzipped). It is code-split and only fetched when WebGL is available and the SOC route is open — the initial bundle is 329 kB (102 kB gzipped). Further splitting of `drei` is possible if needed.
- **Content is Phase 0 scope only** — 1 lesson, 5 quiz questions, 2 labs, 12 simulated commands. Phases 1–27 are declared in the roadmap and marked Planned.
- **Scaled score is an approximation.** CompTIA does not publish its scaling algorithm; the linear 100–900 mapping is declared as such in code and in the UI.

---

## 8. Documentation

- `ARCHITECTURE.md` — architecture proposal, updated with what was actually built
- `README.md` — project overview and how to run
- `docs/PHASE-0-COMPLETION-REPORT.md` — this document
- In-repo: the GitHub generator produces a 7-file documented repository per lab (README, architecture, evidence, logs, reports, troubleshooting, lessons-learned)

---

## 9. Acceptance Criteria

> **PROMPT.md:** "Learner can enter the lab, inspect systems, navigate the roadmap, and track progress."

| Criterion                        | Status              | Evidence                                                                                            |
| -------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| Learner can enter the lab        | **Pass**            | `/soc` and `/lab/:labId` render; lab terminal verified in a real browser                            |
| Learner can inspect systems      | **Pass**            | Device panel opens from 3D click, 2D click, and the device list; test-covered                       |
| Learner can navigate the roadmap | **Pass**            | 28 phases with domain mapping; test-covered                                                         |
| Learner can track progress       | **Pass**            | Phase %, mastery %, weak areas, evidence count, review queue; test-covered                          |
| 3D renders on capable hardware   | **Unverified here** | Code loads and initialises; the verification browser lost its GPU context. Needs your confirmation. |

No acceptance criterion was skipped. The one criterion not verified is stated explicitly rather than assumed.

---

## 10. Next Phase

**Phase 1 — Computer, Network & Security Foundations.** Proposed scope: OSI/TCP-IP model teaching, IP addressing and subnetting practice, ports and protocols, a network topology 3D scene extending the SOC room, and a packet-path visualisation. Simulated commands would extend to `ping`, `tracert`/`traceroute`, `nslookup`/`dig`, and `arp -a`.

**Awaiting your approval before starting.**
