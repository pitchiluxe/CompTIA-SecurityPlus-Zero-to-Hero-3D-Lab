# Phase 27 Completion Report — Security+ → IAM Career Bridge

**Exam domain:** Career
**Status:** Complete
**Route:** `/iam-bridge`
**Tests:** `tests/phase27.test.tsx` — 43 tests, all passing
**Full suite:** 864 tests across 23 files, all passing
**Build:** clean (`tsc -b && vite build`), zero TypeScript errors

## 1. Concept

Phase 27 is the final phase of the roadmap and closes the platform's stated goal: **ZERO → Security+ → hands-on labs → SOC/IAM skills → portfolio → interviews → junior cybersecurity professional.**

PROMPT.md asks for two things and one hard rule. The two things: continuously connect Security+ concepts to IAM by explaining, for each relevant lesson, how authentication, authorization, MFA, SSO, and RBAC are implemented, how Zero Trust affects identity, how privileged access is managed, how identity events appear in logs, and how IAM incidents are investigated; then introduce Microsoft Entra ID, Active Directory, Okta, Ping Identity, CyberArk, and SailPoint. The rule: **teach the underlying concepts before the vendor-specific implementations.**

Two implementation decisions carry the phase:

1. **The rule is enforced in data, not prose.** Every vendor declares the prerequisite concept IDs that gate it, and `iamBridgeEngine.vendorGate()` refuses to reveal vendor detail until *every* prerequisite is above the same weak-area threshold (mastery 2) the rest of the platform uses. Deliberately stricter than an average — "learn the concept first" fails if one prerequisite is missing even when the others are strong. The gate also names which concepts to revisit, so a lock is a study instruction rather than a dead end.

2. **"Continuously" is implemented, not promised.** `topicsForConcepts()` maps any lesson's concept list onto the bridge topics those concepts feed, and `LessonView` renders an IAM career bridge panel on every lesson that has an identity dimension. Phase 5's SSO lesson now links to "How does SSO work?"; Phase 0's orientation lesson correctly shows nothing.

Every bridge topic and every vendor gate is built on concept IDs that earlier phases already teach and mastery-track (`authentication`, `kerberos`, `ldap`, `authorization`, `least-privilege`, `abac`, `mfa`, `phishing-resistant-mfa`, `sso`, `federation`, `saml`, `oidc`, `oauth`, `rbac`, `zero-trust`, `conditional-access`, `pam`, `privilege-escalation`, `windows-logs`, `event-viewer`, `siem`, `accounting`, `ir-lifecycle`, `alert-triage`, `evidence-handling`, `containment`, `directory-attacks`, `identity-provider`, `account-lifecycle`, `active-directory`). No parallel IAM taxonomy was introduced — a test asserts this.

## 2. Features Delivered

| PROMPT.md requirement (Phase 27) | Status | Evidence |
| --- | --- | --- |
| How authentication is implemented | Done | `authentication-implementation` topic — Kerberos TGT/service tickets, LDAP simple bind, token-based provider auth; 4624/4625/4768/4769 evidence |
| How authorization is implemented | Done | `authorization-implementation` topic — entitlements as enumerable objects; 4728/4732/4756/4672; token-frozen decisions |
| How MFA works | Done | `mfa-implementation` topic — shared-secret vs origin-bound factors, push fatigue, method-registration persistence |
| How SSO works | Done | `sso-implementation` topic — federation trust, SAML assertion / OIDC token, the three token-level failure modes |
| How RBAC works | Done | `rbac-implementation` topic — role definition/assignment/scope, drift, certification and role mining |
| How Zero Trust affects identity | Done | `zero-trust-identity` topic — identity as policy enforcement point, signals → allow/step-up/block, "the finding is usually the exclusion" |
| How privileged access is managed | Done | `privileged-access` topic — vaulting, brokering, just-in-time, recording, plus the reconciliation audit test |
| How identity events appear in logs | Done | `identity-events-logs` topic — the three telemetry sources and the full event-ID set; `explain identity event ids` command |
| How IAM incidents are investigated | Done | `iam-incident-investigation` topic — per-account timeline plus the six-step identity containment checklist |
| Continuously connect concepts to IAM | Done | `topicsForConcepts()` + IAM career bridge panel in `LessonView`, live on every identity-bearing lesson in every earlier phase |
| Introduce Entra ID, AD, Okta, Ping, CyberArk, SailPoint | Done | `IAM_VENDORS` — six platforms, four categories, each with prerequisite concepts and concept-first guidance |
| Teach concepts before vendor implementations | Done | `vendorGate()` requires every prerequisite concept above mastery 2; locked vendors show the concepts to revisit instead of the product detail |

### Lessons

| # | Lesson | Topics covered |
| --- | --- | --- |
| 0 | How Security+ Identity Controls Are Actually Implemented | What the bridge adds; authentication as a protocol exchange; authorization as enumerable entitlements; MFA factor strength; SSO as federation; RBAC drift |
| 1 | Zero Trust, Privileged Access, and IAM Incident Investigation | Identity as control plane; exclusions as findings; four stacked PAM controls; three-source identity telemetry; the identity containment checklist; concepts before vendors; the six-platform landscape as four categories |

**20 quiz questions** (9 + 11), mixed `mcq` and `scenario`, tagged across Security Architecture, Security Operations, and General Security Concepts.

### Labs

| # | Lab | What it exercises |
| --- | --- | --- |
| 0 | Trace an Identity Incident Across Three Log Sources (`p27-lab-0`) | Reading identity event IDs, correlating provider/directory/endpoint telemetry on one account, naming the attack shape, producing the containment checklist and what each step closes |
| 1 | Map Vendor Features Back to the Concepts They Implement (`p27-lab-1`) | Concept-before-vendor classification, identifying which vendors are gated and by which concepts, reading job postings by category rather than product name |

### Prepared simulator commands (`src/sim/phase27Commands.ts`)

9 commands, all `tool: 'platform'`, deterministic, closed allowlist:
`show iam bridge topics`, `explain concept before vendor`, `show iam vendor landscape`, `explain identity event ids`, `show identity timeline` (prepared), `show iam containment checklist`, `explain zero trust identity`, `explain privileged access management`, `show iam career ladder`.

### Interactive 3D

`IamBridgeScene.tsx` renders the bridge as **three tiers** — concept foundation (bottom), implementation topic (middle), vendor platform (top) — with concept→topic and topic→vendor edges and animated flow particles. The scene is functional rather than decorative: a vendor whose prerequisite concepts are weak renders **locked** (red, dimmed, `locked — concepts first`), its edge dashes, and its flow particle stops. A bridge topic resting on weak concepts renders dimmed. Orbit/pan/zoom, click-to-inspect, and world-space labels follow the existing scene conventions.

`IamBridgeFallback2D.tsx` is a full SVG equivalent with the same three tiers, the same lock and weak states, keyboard-accessible nodes, and a legend — so the gating rule is visible without WebGL.

### Supporting code

- [src/data/iamBridge.ts](../src/data/iamBridge.ts) — 9 bridge topics (exam view, implementation, log evidence, investigation habit, vendor mappings), 6 gated vendor platforms, 10 concept-before-vendor exercise items
- [src/lib/iamBridgeEngine.ts](../src/lib/iamBridgeEngine.ts) — `topicsForConcept()`, `topicsForConcepts()`, `assessTopic()`, `assessTopics()`, `bridgeReadiness()`, `weakTopics()`, `vendorGate()`, `vendorGates()`, `unlockedVendors()`, `lockedVendors()`, `gradeVendorMapping()`, `isVendorMappingComplete()`
- [src/data/phase27.ts](../src/data/phase27.ts) — lessons, quizzes, labs, `PHASE_27` export
- [src/sim/phase27Commands.ts](../src/sim/phase27Commands.ts) — 9 prepared command outputs
- [src/components/IamBridgeView.tsx](../src/components/IamBridgeView.tsx) — bridge readiness, topic selector, four-panel topic detail, vendor gate grid with locked/unlocked state, concept-before-vendor exercise
- [src/scenes/IamBridgeScene.tsx](../src/scenes/IamBridgeScene.tsx) / [IamBridgeFallback2D.tsx](../src/scenes/IamBridgeFallback2D.tsx) — three-tier 3D scene and 2D fallback
- `src/components/LessonView.tsx` — IAM career bridge panel, driven by `topicsForConcepts(lesson.concepts)`; this is the "continuously connect" delivery
- `src/data/curriculum.ts` — imports/exports `PHASE_27`, included in `PHASES`, outline entry 27 flipped `planned` → `available`
- `src/sim/commands.ts` — `...inPhase(27, PHASE_27_COMMANDS)` added to the closed allowlist
- `src/App.tsx` — `/iam-bridge` route with lazy-loaded `IamBridgeView`
- `src/components/AppLayout.tsx` — added `Security+ → IAM Bridge` nav entry, **and added the missing `Career Mode` entry** (Phase 26's route existed but was unreachable from the sidebar — see Known Issues)
- `src/data/phaseIndex.json` — regenerated via `npm run gen:index`
- [tests/phase27.test.tsx](../tests/phase27.test.tsx) — 43 tests

## 3. Design Notes

- **The gate is stricter than an average, on purpose.** Topic readiness averages concept levels (a soft signal, used for prioritisation). Vendor gating requires *every* prerequisite above threshold, because partial understanding of a protocol produces confident misconfiguration. A test asserts this explicitly: Okta with `oidc` at 0 and everything else at 6 stays locked despite a high average.
- **A lock is a study instruction.** Locked vendors show `conceptFirst` guidance and name the specific concepts still weak, rather than hiding content behind an opaque wall.
- **Investigation habit is a first-class field.** Each topic carries not only implementation and log evidence but the reasoning habit an analyst applies to it ("read the logon type before the outcome", "work backwards from the entitlement", "read the policy evaluation before the user", "reconcile every privileged action against an activation record", "ask what the attacker could still do"). These are the transferable parts.
- **The identity containment checklist is the phase's highest-value artifact.** Reset credential → revoke sessions and refresh tokens → remove attacker-registered MFA methods → revoke OAuth consent grants → reverse group/role/delegation changes → peer-compare for residual entitlements. It appears in a lesson, a lab, a prepared command, and two quiz scenarios, because credential reset alone is the single most common incomplete containment in identity incidents.
- **Vendors read as categories.** The lesson and the `show iam career ladder` command both teach reading a posting by category ("Okta or Ping" = federation; "CyberArk or Delinea" = PAM), which is what makes the concept mapping actionable during a job search — and connects directly back to Phase 26's skill-extraction workflow.
- **3D communicates the rule.** The vertical order of the tiers *is* the rule, and the lock state is rendered rather than described.

## 4. Test & Build Verification

| Step | Result |
| --- | --- |
| `npm run gen:index` | Regenerated `src/data/phaseIndex.json` to include Phase 27; drift tests in `tests/curriculum.test.ts` pass |
| `npx tsc -b` | Clean, zero errors |
| `npx vitest run tests/phase27.test.tsx` | 43/43 passing |
| `npx vitest run` | 864/864 passing across 23 files |
| `npm run build` | Clean; `IamBridgeView` (14.87 kB) and `iamBridgeEngine` (29.39 kB) split into their own lazy chunks — the eager Dashboard bundle is unchanged |
| `npx eslint` on all touched files | Clean (the 10 remaining repo-wide lint errors are pre-existing in `ExamPrepView.tsx`, `phase13.ts`, and `phase14.ts` and were not introduced or touched by this phase) |

Test coverage groups: bridge topic data completeness and concept-tracking, vendor data and gate declarations, continuous connection (`topicsForConcept` / `topicsForConcepts`, including correct silence for non-identity concepts), topic readiness and weak ordering, the concept gate (all-locked at level 0, all-unlocked at level 3, every-prerequisite strictness, missing-concepts ordering), exercise grading and completeness, curriculum/lab structure, simulator allowlist registration, credential and IP-range safety scanning, and eight view tests covering the 2D fallback, topic detail panels, lock/unlock behaviour, readiness reporting, and full exercise grading — plus two tests asserting the bridge panel appears on a Phase 5 identity lesson and is absent from a Phase 0 lesson.

## 5. Security Review

- **No credential material.** No passwords, API keys, tokens, private keys, bearer tokens, or real tenant identifiers appear in any Phase 27 content. A test scans lesson text, lab text, prepared command output, and bridge implementation/log text against credential-leak patterns including a bearer-token pattern.
- **Documentation addresses only.** All IPs in prepared identity evidence are RFC 1918 or RFC 5737 ranges (`192.168.20.0/24`, `198.51.100.77`), asserted by a test that extracts every IP-shaped string from the phase and its commands.
- **Lab-only account names.** The prepared timeline uses `lab\j.okafor` and lab hostnames; no real person, employer, or tenant is referenced.
- **Nothing executes.** All nine commands are `tool: 'platform'` entries in the existing closed allowlist. No directory, identity provider, vendor tenant, licence, trial, or API is contacted at any point — the concept-before-vendor exercise and vendor detail are entirely local reference material.
- **Defensive framing throughout.** Attack paths are named only to explain the mechanism being abused and the evidence it leaves (e.g. Kerberoasting and delegation abuse are referenced as reasons to learn ticket-based authentication first, with no offensive procedure given). The phase's investigation content is detection, evidence handling, and containment.

## 6. Known Issues

- **Fixed in this phase:** Phase 26's `/career-mode` route existed in `App.tsx` but had no sidebar entry, making Career Mode unreachable by navigation. A `Career Mode` nav entry was added alongside the new bridge entry.
- **Adjusted in this phase:** `tests/components.test.tsx` asserted the Roadmap's `Planned` badge count with `getAllByText`, which throws when the count is zero. With Phase 27 built, every outlined phase is now available and the count is legitimately zero, so the assertion was switched to `queryAllByText`. The invariant it tests (`PHASE_OUTLINE.length - PHASES.length`) is unchanged.
- **Pre-existing, out of scope:** 10 repo-wide lint errors remain in `ExamPrepView.tsx` (`react-hooks/purity` on `Date.now()` during an event handler), `phase13.ts` (two `no-explicit-any`), and `phase14.ts` (six `no-useless-escape`). None are in files this phase touched; flagging rather than silently fixing.
- The `curriculum` chunk (948 kB) and the drei `ContactShadows` chunk (1,015 kB) exceed Vite's 500 kB warning threshold. Both are pre-existing, both are lazily loaded, and neither is in the eager landing bundle.

## 7. Documentation

- [PROMPT.md Phase 27 section](../PROMPT.md) — complete specification followed in implementation
- [CLAUDE.md](../CLAUDE.md) — project guidance and phase overview
- [Phase 26 Completion Report](./PHASE-26-COMPLETION-REPORT.md) — the preceding phase, whose skill-to-concept mapping this phase extends into implementation detail
- Phase completion report (this document)

## 8. Acceptance Criteria

| Acceptance criterion | Status | Evidence |
| --- | --- | --- |
| All nine PROMPT.md bridge questions are answered with implementation detail | Done | `IAM_BRIDGE_TOPICS` — 9 topics, each with exam view, implementation, log evidence, and investigation habit; test asserts all nine ids present |
| Each bridge topic builds on concepts earlier phases already track | Done | Test asserts every `conceptIds` entry appears in some phase's lesson `concepts` |
| Identity events in logs are taught concretely, not abstractly | Done | Full event-ID set with what each proves; `explain identity event ids` and `show identity timeline` commands; Lab 0 |
| IAM incident investigation includes identity-specific containment | Done | Six-step checklist in lesson, lab, command, and two quiz scenarios |
| All six vendor platforms are introduced | Done | `IAM_VENDORS` — Entra ID, Active Directory, Okta, Ping Identity, CyberArk, SailPoint; test asserts all six |
| Vendor detail is gated behind its underlying concepts | Done | `vendorGate()` requires every prerequisite above mastery 2; locked vendors show concepts to revisit; 5 engine tests + 2 view tests |
| Security+ concepts are connected to IAM *continuously*, not on one page | Done | IAM career bridge panel in `LessonView` via `topicsForConcepts()`; tests assert presence on a Phase 5 lesson and absence on a Phase 0 lesson |
| Learner can see their own bridge readiness from existing mastery data | Done | `bridgeReadiness()` + readiness card; view test asserts `Topics on solid concepts — 1/9` after seeding one topic |
| Phase includes an interactive 3D visualisation with a 2D fallback | Done | `IamBridgeScene.tsx` (three tiers, lock state rendered) and `IamBridgeFallback2D.tsx` (same tiers, keyboard accessible) |
| Phase integrates with curriculum, simulator allowlist, routing, and navigation | Done | `PHASE_27` in `PHASES`, `inPhase(27, …)` in the allowlist, `/iam-bridge` route, sidebar entry, regenerated `phaseIndex.json` |
| Every lab carries the full PROMPT.md documentation set | Done | Both labs pass the repo-wide `lab completeness` suite in `tests/curriculum.test.ts` |
| No secrets, credentials, or real identifiers in generated content | Done | Credential-pattern and IP-range safety tests |

## 9. Evidence

- **Bridge data:** 9 topics × (exam view + implementation + log evidence + investigation habit + vendor mappings); 6 gated vendor platforms; 10 concept-before-vendor exercise items with rationales
- **Curriculum:** 2 lessons (17 sections), 20 quiz questions, 2 labs with full documentation sets
- **Simulator:** 9 prepared commands, provenance-labelled, closed allowlist, non-executing
- **3D:** three-tier bridge scene where the vendor lock state is rendered in geometry, colour, and particle flow
- **2D fallback:** full SVG equivalent with keyboard-accessible nodes and identical lock/weak states
- **Tests:** 43 Phase 27 tests; 864 platform tests total, all passing
- **Build:** clean production build; new route split into its own lazy chunk

## 10. Next Phase

**None — Phase 27 is the final phase of the PROMPT.md roadmap.** All 28 phases (0–27) are now built and marked `available`; the Roadmap view shows zero remaining planned phases.

The platform now spans the complete stated arc: **ZERO → Security Fundamentals → Security+ → Hands-on Labs → SOC/IAM Skills → GitHub Portfolio → Interviews → Junior Cybersecurity Professional.**

Recommended follow-on work, for approval rather than assumed scope:

1. **Content depth over breadth** — each phase carries 2–5 lessons; the SY0-701 objectives support more per domain, particularly Domain 4.0 (28% of the exam).
2. **Mock exam calibration** — the 100–900 scaling in `examBlueprint.ts` is an explicitly declared linear approximation; a weighted per-domain model would improve readiness accuracy.
3. **Lint debt** — clear the 10 pre-existing errors listed in Known Issues.
4. **Bundle work** — the 948 kB `curriculum` chunk would benefit from per-phase dynamic imports as content depth grows.
5. **Persistence and accessibility passes** — progress currently lives in `localStorage`; and a full keyboard/screen-reader audit of the 3D scenes and their fallbacks has not been performed.
