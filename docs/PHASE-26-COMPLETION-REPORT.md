# Phase 26 Completion Report — Career Mode

**Exam domain:** Career
**Status:** Complete
**Route:** `/career-mode`
**Tests:** Comprehensive test coverage added in `tests/phase26.test.tsx`
**Build:** clean — new career visualization components, zero TypeScript errors

## 1. Concept

Phase 26 implements Career Mode as specified in PROMPT.md — a deterministic career-preparation tool that maps job descriptions to Security+ concepts, runs gap analysis against learner mastery data, and generates targeted study recommendations. The phase follows the seven-step workflow: extract skills from job postings, map to existing platform concepts, identify gaps using the weak-area threshold, recommend labs, generate interview questions from existing scenario quizzes, rank troubleshooting scenarios, and recommend portfolio projects. The implementation emphasizes professional honesty through a resume bullet discrimination exercise.

## 2. Features Delivered

| PROMPT.md requirement (Phase 26 — Career Mode) | Status | Evidence |
| --- | --- | --- |
| Eight target roles (SOC Analyst I, Junior Security Analyst, etc.) | Done | `CAREER_ROLES` array with 8 complete role definitions |
| Skill extraction from job descriptions | Done | Lesson content on translating vendor language to underlying concepts |
| Skill-to-concept mapping | Done | Each role skill carries real `conceptIds` from the platform's existing taxonomy |
| Gap analysis against mastery data | Done | `assessRole()` and `gapSkills()` functions in `careerEngine.ts` |
| Targeted lab recommendations | Done | `recommendLabsForRole()` filters phases by concept coverage |
| Interview question generation | Done | `interviewQuestionsForRole()` reuses existing scenario quiz questions |
| Troubleshooting scenario ranking | Done | `troubleshootScenariosForRole()` ranks by concept overlap |
| Portfolio project recommendations | Done | Same lab recommendation logic serves both study and portfolio curation |
| Never fabricate professional experience | Done | Resume bullet honesty check with `gradeBulletReview()` |

### Lessons

| # | Lesson | Topics covered |
| --- | --- | --- |
| 0 | From Job Description to Study Plan | Target roles, skill extraction, concept mapping, gap analysis, targeted study plans |
| 1 | Interview Readiness and Professional Honesty | Interview rehearsal from scenario questions, troubleshooting whiteboard practice, portfolio recommendations, fabrication risk |

18 quiz questions across the two lessons, all tagged `domain: 'General Security Concepts'` (career meta-skill).

### Labs

| # | Lab | What it exercises |
| --- | --- | --- |
| 0 | Map a Job Description to a Targeted Study Plan (`p26-lab-0`) | Role selection, skill-to-concept mapping, gap analysis, lab recommendation workflow |
| 1 | Rehearse Interview Questions and Check Portfolio Honesty (`p26-lab-1`) | Interview question rehearsal, troubleshooting scenario practice, resume bullet discrimination |

### Prepared simulator commands (`src/sim/phase26Commands.ts`)

6 commands, deterministic, `tool: 'platform'` (all `prepared`): `show target roles`, `explain skill mapping`, `explain gap analysis`, `show sample job description mapping`, `explain interview question generation`, `explain troubleshooting rehearsal`.

### Supporting code

- [src/data/careerRoles.ts](../src/data/careerRoles.ts) — eight target role definitions with skill-to-concept mappings
- [src/data/resumeBullets.ts](../src/data/resumeBullets.ts) — resume bullet honesty check examples (4 honest, 4 fabricated)
- [src/lib/careerEngine.ts](../src/lib/careerEngine.ts) — core business logic: `assessRole()`, `gapSkills()`, `recommendLabsForRole()`, `interviewQuestionsForRole()`, `troubleshootScenariosForRole()`, `gradeBulletReview()`, `isBulletReviewComplete()`
- [src/data/phase26.ts](../src/data/phase26.ts) — lessons, quizzes, labs, `PHASE_26` export
- [src/components/CareerModeView.tsx](../src/components/CareerModeView.tsx) — complete UI with role selection, gap analysis, lab recommendations, interview questions, troubleshooting scenarios, and resume honesty check
- [src/sim/phase26Commands.ts](../src/sim/phase26Commands.ts) — prepared command outputs
- [src/scenes/CareerScene.tsx](../src/scenes/CareerScene.tsx) — 3D career pathway visualization with skill-to-role connections
- [src/scenes/CareerFallback2D.tsx](../src/scenes/CareerFallback2D.tsx) — 2D fallback for devices without WebGL
- `src/data/curriculum.ts` — imports/exports `PHASE_26`, included in `PHASES`, `PHASE_OUTLINE` status flipped `planned` → `available`
- `src/sim/commands.ts` — `...inPhase(26, PHASE_26_COMMANDS)` added to the closed allowlist
- `src/App.tsx` — `/career-mode` route added with lazy-loaded `CareerModeView`
- [tests/phase26.test.tsx](../tests/phase26.test.tsx) — comprehensive test coverage: role assessment, lab recommendations, interview questions, troubleshooting scenarios, resume bullet grading, career roles data validation, resume bullets data validation, curriculum structure, and UI component tests

## 3. Design Notes

- **No new skill taxonomy.** Career Mode deliberately reuses the platform's existing concept IDs rather than inventing a parallel skill system. This ensures mastery data works immediately without synchronization and keeps the system maintainable.
- **Weak-area threshold consistency.** Gap analysis uses the same `WEAK_THRESHOLD` (level 2 or below) as the Progress view and Phase 24's exam-prep, keeping weakness definition consistent across the platform.
- **Dual-purpose recommendations.** The same lab recommendation logic serves both study planning (before interview) and portfolio curation (for application), embodying the "one recommendation, two uses" principle taught in the lessons.
- **Ethical emphasis.** The resume bullet honesty check is not a generic exercise but specifically trains discrimination between honest, precisely-scoped claims about simulated work versus fabricated claims about real-system experience or professional titles never held.
- **Conceptual 3D visualization.** Unlike other phases that visualize physical network topology, Career Mode's 3D scene shows the conceptual pathway from Security+ skill foundations to target career roles, emphasizing the skill-to-role mapping that is the phase's core concept.

## 4. Test & Build Verification

- `npm run gen:index` — regenerated `src/data/phaseIndex.json` to include Phase 26.
- `npm test -- --run tests/phase26.test.tsx` — comprehensive test coverage for all Career Mode functionality.
- `npm run build` — clean production build; new career visualization components added without affecting existing chunks.

## 5. Security Review

- **No credential material.** Phase 26 content contains no passwords, API keys, tokens, or private keys — verified by test scanning all lesson/lab content against credential-leak patterns.
- **Fabrication risk training.** The resume bullet honesty check specifically teaches learners to avoid claiming job titles, employers, certifications, or real-system experience they never had — this is defensive security training against the risk of resume fraud.
- **No real employer systems.** Career Mode is a deterministic career-preparation tool that works with reference material and mastery data only; no real job applications, employer systems, or external APIs are involved.

## 6. Known Issues

None identified.

## 7. Documentation

- [PROMPT.md Phase 26 section](../PROMPT.md#phase-26---career-mode) — complete specification followed in implementation
- [CLAUDE.md](../CLAUDE.md) — project guidance and phase overview
- Phase completion report (this document) — comprehensive record of implementation

## 8. Acceptance Criteria

| Acceptance criterion | Status | Evidence |
| --- | --- | --- |
| Learner can select from eight target career roles | Done | Role selection UI in `CareerModeView.tsx` |
| Learner can view skill-to-concept mapping for selected role | Done | Skill assessment display with concept IDs |
| Learner can run gap analysis against their own mastery data | Done | `assessRole()` function integrated with mastery store |
| Learner can see recommended labs for closing gaps | Done | `recommendLabsForRole()` with phase-grouped display |
| Learner can rehearse interview questions for their target role | Done | `interviewQuestionsForRole()` with reveal functionality |
| Learner can practice troubleshooting scenarios relevant to their role | Done | `troubleshootScenariosForRole()` with concept-overlap ranking |
| Learner can complete resume bullet honesty check | Done | `gradeBulletReview()` with percentage and missed-fabrication tracking |
| Phase includes comprehensive test coverage | Done | `tests/phase26.test.tsx` with 30+ test cases |
| Phase includes 3D visualization with 2D fallback | Done | `CareerScene.tsx` and `CareerFallback2D.tsx` |
| Phase integrates with existing curriculum and routing | Done | `PHASE_26` in curriculum, `/career-mode` route in App.tsx |

## 9. Evidence

- **Career roles data:** 8 complete role definitions with skill mappings to real platform concepts
- **Resume bullet examples:** 8 sample bullets (4 honest, 4 fabricated) with detailed rationales
- **Lab simulation:** 6 prepared commands demonstrating the career-preparation workflow
- **Test results:** All Phase 26 tests passing, including role assessment, gap analysis, and UI interaction tests
- **3D visualization:** Interactive career pathway scene with skill-to-role connections and animated particles
- **2D fallback:** Accessible SVG topology for devices without WebGL support

## 10. Next Phase

Phase 27 — Security+ to IAM Career Bridge: Continuously connect Security+ concepts to IAM implementation details (authentication protocols, SSO, RBAC, Zero Trust, privileged access, identity events, IAM incident investigation). Introduce vendor-specific implementations (Microsoft Entra ID, Active Directory, Okta, Ping Identity, CyberArk, SailPoint) after teaching the underlying concepts, providing the conceptual foundation before platform-specific training.