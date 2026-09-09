# Phase 25 Completion Report — GitHub Cybersecurity Portfolio

**Exam domain:** Career
**Status:** Complete
**Route:** `/github` (extended, no new route — Portfolio Overview mode added alongside the existing Single Lab mode)
**Tests:** 783 passing across 21 files (15 new in `tests/phase25.test.tsx`, plus curriculum drift guards picking up Phase 25 automatically)
**Build:** clean — `GitHubView` chunk grew modestly to 10.59 kB / 3.80 kB gzip, zero TypeScript errors

## 1. Concept

Phase 0 already built a working per-lab GitHub project generator (`githubGenerator.ts`, `GitHubView.tsx`) — investigation before writing code found it had zero test coverage and two concrete gaps against PROMPT.md's Phase 25 spec: the `configs/` and `screenshots/` folders named in the spec were never generated, and the `reports/` file listed section *names* (Findings, Remediation, Validation) without pulling any real lab content into them. There was also no portfolio-level view — only ever one lab's repository at a time, with no way to see coverage across everything built so far. This phase closes both gaps and adds the aggregate view, rather than rebuilding the generator from scratch.

## 2. Features Delivered

| PROMPT.md requirement (Phase 25 — GitHub Cybersecurity Portfolio) | Status | Evidence |
| --- | --- | --- |
| README.md, architecture/, configs/, screenshots/, logs/, evidence/, reports/, troubleshooting/, lessons-learned/ | Done | `generateProject()` now emits all nine paths; `configs/` and `screenshots/` were the two gaps closed this phase |
| Project summary, objectives, architecture, technologies, implementation, findings, remediation, validation, lessons learned | Done | README now includes a **Technologies** section (new); `reports/README.md` now pulls real **Findings** (`expectedResults`), **Remediation** (`troubleshooting`), and **Validation** (`verification`) content instead of bare section headers |
| Never include secrets or sensitive information | Done (verified) | Redaction checklists added to `configs/README.md` and `screenshots/README.md`; a test scans every generated file for every built lab against the platform's four credential-leak patterns |

### Lessons

| # | Lesson | Topics covered |
| --- | --- | --- |
| 0 | What Makes a Security Portfolio Repo Credible | Repo vs. certificate, the nine-folder skeleton, README anatomy in order, redaction discipline applied every time, findings/severity/evidence/remediation/validation structure, how a reviewer actually reads a repo |
| 1 | Building the Portfolio, Lab by Lab | Curation (5-8 labs, not all of them), role-tailored selection, evidence as proof vs. generated skeleton, domain-grouped portfolio indexing, honest provenance framing in claims |

19 quiz questions across the two lessons, all tagged `domain: 'General Security Concepts'` (career/documentation meta-skill, consistent with the Phase 24 precedent for non-technical-domain content).

### Labs

| # | Lab | What it exercises |
| --- | --- | --- |
| 0 | Generate and Review a Professional Lab Repository (`p25-lab-0`) | Folder structure, README anatomy, redaction checklist, findings/remediation/validation — then generating and reviewing one real lab repository |
| 1 | Curate a Role-Targeted Portfolio Index (`p25-lab-1`) | Portfolio curation principles, domain-grouped indexing, honest provenance framing — then generating and reviewing the full portfolio index |

### Prepared simulator commands (`src/sim/phase25Commands.ts`)

8 commands, deterministic, `tool: 'platform'` (7 `simulated`, 1 `prepared` for the sample findings entry): `show portfolio folder structure`, `show readme anatomy`, `explain redaction checklist`, `explain findings remediation validation`, `explain portfolio curation`, `show portfolio index format`, `explain provenance labeling in evidence`, `show sample findings entry`.

### Supporting code

- [src/lib/githubGenerator.ts](../src/lib/githubGenerator.ts) — extended `generateProject()` with `configs/README.md` and `screenshots/README.md`, a `labTechnologies()` section, and a rewritten `labReportsReadme()` that pulls real lab content; added `repoNameFor()` (shared slug logic) and a new `generatePortfolio(phases)` function producing a domain-grouped `PORTFOLIO.md` index across every built phase.
- [src/data/phase25.ts](../src/data/phase25.ts) — lessons, quizzes, labs, `PHASE_25` export.
- [src/components/GitHubView.tsx](../src/components/GitHubView.tsx) — added a Single Lab / Portfolio Overview mode toggle; Portfolio Overview shows domain coverage stats and the generated `PORTFOLIO.md` content, reusing the existing file-viewer/copy UI.
- [src/sim/phase25Commands.ts](../src/sim/phase25Commands.ts) — prepared command outputs, `tool: 'platform'`.
- `src/data/curriculum.ts` — imports/exports `PHASE_25`, included in `PHASES`, `PHASE_OUTLINE` status flipped `planned` → `available`.
- `src/sim/commands.ts` — `...inPhase(25, PHASE_25_COMMANDS)` added to the closed allowlist.
- No new route or nav entry was needed — Phase 0's `/github` route already existed and now serves both modes.
- [tests/phase25.test.tsx](../tests/phase25.test.tsx) — 15 new tests, the **first test coverage `githubGenerator.ts`/`GitHubView.tsx` have ever had** (Phase 0 shipped this feature with zero tests): file-skeleton completeness, real-content pull-through, portfolio aggregation correctness, a full-catalogue credential-leak scan across every generated file for every built lab, and `GitHubView` mode-switching UI tests.

## 3. Design Notes

- **Extend, don't rebuild.** As with Phases 23 and 24, the guiding principle was to find and close the specific gap against the spec rather than replace working infrastructure. `generateProject()`'s existing 7 files, repo-naming logic, and `GitHubView`'s existing file-browser UI are all unchanged in behaviour for existing callers — only new files and new content were added.
- **No new `types.ts` schema.** Findings/Remediation/Validation content is derived from `Lab.expectedResults` / `Lab.troubleshooting` / `Lab.verification` — fields that already exist and are already required (and tested) on every lab across all 25 phases — rather than adding new fields to the `Lab` type, which would have required touching curriculum data for every prior phase.
- **Portfolio types stay local.** `PortfolioSummary` and `PortfolioDomainSummary` are defined and exported from `githubGenerator.ts` itself rather than added to the shared `types.ts`, since nothing outside the GitHub view/generator needs them.
- **Retroactive test coverage.** Discovering that a Phase 0 feature had zero tests was itself a finding worth recording: the credential-leak scan added here (`tests/phase25.test.tsx`) now runs against every lab in every phase's generated output, closing a real gap in the platform's own safety-testing coverage, not just Phase 25's new content.

## 4. Test & Build Verification

- `npm run gen:index` — regenerated `src/data/phaseIndex.json` to include Phase 25.
- `npm test -- --run` — 783 tests passing across 21 files (up from 765 in Phase 24 plus the 15 new Phase 25 tests, net of drift-guard additions).
- `npm run build` — clean production build; `GitHubView` chunk grew from ~5.9 kB to 10.59 kB / 3.80 kB gzip to accommodate the portfolio mode, no other chunks affected.

## 5. Next Phase

Phase 26 — Career Mode: given a job description for one of the target roles (SOC Analyst I, Junior IAM Engineer, etc.), extract required skills, map them to Security+ concepts, identify gaps against the learner's own mastery data, build targeted labs, generate interview and troubleshooting questions, and recommend which of this phase's portfolio projects to feature — the role-tailored curation this phase introduced conceptually becomes a concrete, job-description-driven tool.
