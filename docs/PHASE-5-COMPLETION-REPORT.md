# Phase 5 Completion Report — Identity & Access Management

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 6

> **All 3D scenes now verified rendering.** This report closes the item carried open since Phase 0. See §3.

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 5)                             | Status | Where                                                           |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| "Make IAM a major career-oriented component"                | Done   | 6 lessons, 5 labs, 22 quiz questions — the largest phase so far |
| Teach 29 named topics (identity → Zero Trust)               | Done   | `src/data/phase5.ts` — 6 lessons, 42 sections                   |
| Major lab: the 10-stage employee lifecycle                  | Done   | `src/data/identityLifecycle.ts`, `p5-lab-0`                     |
| "Make the learner design **and troubleshoot** the workflow" | Done   | `IamTroubleshootView` — 3 incidents, 3-part diagnosis           |
| 3D: interactive identity architecture                       | Done   | `src/scenes/IdentityScene.tsx` — verified rendering             |

### Lessons

| #   | Lesson                                          | Topics covered                                                                      |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0   | Identity and the AAA Model in Practice          | Identity, authentication, authorisation, accounting, identity providers             |
| 1   | Authentication Factors, MFA and Password Policy | MFA, factor categories, phishing-resistant MFA, password policy                     |
| 2   | SSO, Federation, SAML, OAuth and OpenID Connect | SSO, federation, SAML, OAuth, OIDC                                                  |
| 3   | Directory Services — LDAP, AD and Kerberos      | LDAP, Active Directory, Kerberos, directory attacks                                 |
| 4   | Authorization Models                            | RBAC, ABAC, least privilege, PAM, conditional access                                |
| 5   | The Identity Lifecycle and Non-Human Identities | JML, provisioning, deprovisioning, service accounts, machine identity, certificates |

### Labs

| Lab                                               | Focus                                                          |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `p5-lab-0` Design the Employee Lifecycle          | The nine stages, what each produces, controls per stage        |
| `p5-lab-1` Authentication, MFA and Federation     | Factor strength, SAML/OIDC structure, conditional access       |
| `p5-lab-2` Directory Services and Kerberos        | LDAP objects, ticket cache, systematic Kerberos diagnosis      |
| `p5-lab-3` Authorization, Privilege Creep and PAM | Access review by peer comparison, RBAC/ABAC, orphaned accounts |
| `p5-lab-4` Troubleshoot the Identity Workflow     | All three incidents in the troubleshooting workbench           |

14 new prepared artifacts in `src/sim/phase5Commands.ts` (75 commands total).

---

## 2. The Troubleshooting Workbench

PROMPT.md asks the learner to **design and troubleshoot** the workflow. Design alone is a diagram; troubleshooting is the skill.

Three incidents, each diagnosed in three parts **in order**: which lifecycle stage failed, the root cause, then the fix. Localising first is deliberate — an engineer who cannot localise a fault fixes the wrong layer.

1. **The leaver who still has access** — the account was disabled correctly, but the OAuth refresh token was never revoked. The decisive clue is an _absence_: no sign-in event at the IdP, meaning the application never asked. Noticing an absence is harder than noticing a presence.
2. **The mover who kept everything** — 47 entitlements against a peer median of 12. Two other movers show the pattern, so the answer is a process fix, not an individual action.
3. **MFA was enabled and the attacker got in anyway** — a relayable push factor. The tempting wrong fixes ("disable MFA", "retrain the user") are both included as distractors with rationale.

Every wrong option carries a rationale explaining the _misconception_, and grading shows the learner's own choice before the correction. Mastery credit requires all three parts — getting the cause right while mislocating the stage is not a solved incident.

---

## 3. 3D Scenes — All Six Verified

**This closes the open item from Phases 0–4.** WebGL held in the verification browser for the first time, and all six scenes were confirmed rendering and interactive:

| Scene              | Phase | Verified                                                                 |
| ------------------ | ----- | ------------------------------------------------------------------------ |
| SOC Environment    | 0     | Room, video wall, 9 devices, event-flow beads                            |
| Connection Path    | 1     | Five stage pillars, selection ring, request/response lanes               |
| Defence in Depth   | 2     | Seven concentric rings around the glowing asset core                     |
| Attack Chain       | 3     | Six nodes with actor-encoded geometry (octahedra, spheres, prism)        |
| Security Zones     | 4     | Stacked tiers from red Internet down to segments, yellow boundary gates  |
| Identity Lifecycle | 5     | Nine-node ring; **click-to-inspect confirmed** updating the detail panel |

Earlier reports were honest that this was unverified rather than assuming it worked. It works.

### The identity scene

A **ring rather than a line**, because the lifecycle genuinely closes: deprovisioning returns the identity to HR's authority, and a rehire rejoins the loop rather than starting a new one — which is exactly why identity matching at stage 2 matters. An identity token travels the ring, lighting each stage as it passes. The JML filter dims stages outside the selected flow.

---

## 4. Platform Fix — Route-Level Code Splitting

Flagged in the Phase 4 report as worth doing "during Phase 5 or 6". Done.

Every route except the Dashboard now loads on navigation. I expected modest gains because the curriculum text is imported by `curriculum.ts`, which the Dashboard needs regardless — but the standalone data files (`networkZones`, `attackChain`, `defenceLayers`, `riskScenarios`, `connectionPath`, `identityLifecycle`, `iamIncidents`) are only reachable through their own views and split out cleanly.

|                                         | Main bundle | Gzipped    |
| --------------------------------------- | ----------- | ---------- |
| Phase 4, before splitting               | 605 kB      | 187 kB     |
| Phase 4, after splitting                | 424 kB      | 134 kB     |
| **Phase 5, with all its content added** | **477 kB**  | **150 kB** |

Phase 5 added six lessons, five labs, and three new views and the bundle is still 21% smaller than Phase 4 was.

---

## 5. Tests

```
Test Files  11 passed (11)
Tests       326 passed (326)     (Phase 4 finished at 278)
```

New file `tests/phase5.test.tsx` (42 tests):

| Group                             | Covers                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Content safety**                | Signature and key redaction, no hashes or bearer tokens, Kerberos cache without session keys                                   |
| Phase 5 curriculum                | All 30 required topic keywords; depth appropriate to a major component                                                         |
| Identity lifecycle data           | Nine stages in PROMPT.md's order, completeness, ring placement, JML flow scoping                                               |
| IAM incident data                 | Stage references resolve, one correct cause and fix each, rationale on every option                                            |
| Troubleshoot engine               | Perfect, empty, and partial diagnoses; wrong-choice explanation; independent field grading                                     |
| Phase 5 simulated evidence        | Lifecycle trace, disable-vs-revoke, factor relay resistance, ID vs access token, peer-median review, Kerberos failure ordering |
| IdentityFallback2D / IdentityView | 2D fallback, stage detail with failure modes, JML narrowing                                                                    |
| IamTroubleshootView               | Evidence rendering, submission gating, grading, mastery withheld on partial correctness                                        |
| Phase 5 labs and quizzes          | Two labs end to end, federation quiz grading                                                                                   |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 6. Security Review

| Control                         | Result                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| No command execution            | Unchanged — Phase 5 artifacts join the same closed allowlist                                           |
| **Signatures and key material** | SAML signatures, OIDC signatures, and the `kid` are all `[REDACTED]`. Asserted by test                 |
| **No password hashes**          | The directory artifact states explicitly that no hash is displayed, here or anywhere. Asserted by test |
| **No session keys**             | The Kerberos ticket cache states session keys are not displayed. Asserted by test                      |
| No credential values            | Tested against bcrypt, LM:NT pair, and bearer-token patterns                                           |
| No real organisations or people | All fictional                                                                                          |

The teaching value of a SAML assertion or an OIDC token is its **structure** — which fields exist and which the relying party must validate. None of it requires real bytes, so none is present.

---

## 7. Defects Found and Fixed

**A false positive in an existing safety test.** The Phase 0 pattern `/bearer\s+[a-z0-9]/i` fired on the sentence _"it states what the bearer MAY DO"_ — correct prose explaining what a bearer token is. The test was right to be strict and the pattern was wrong: a real bearer credential is a long opaque string in an `Authorization` header. Tightened to `/bearer\s+[A-Za-z0-9._~+/-]{20,}/`, which still catches a leaked token but no longer flags the sentence that teaches what one is.

**A recurrence of the Phase 4 spacing defect.** `<span>9</span><span class="ml-2">of 9 stages</span>` produced the text content `9of 9`. Same root cause as Phase 4 — a CSS margin creating visual space that contributes nothing to text content. Fixed with an explicit `{' '}`.

That this recurred is worth noting: it is a pattern I should watch for whenever a number and its unit are adjacent spans.

---

## 8. Known Issues and Limitations

- **The `<Text>` labels in the SOC scene are small at default zoom.** Legible when you zoom in, and the camera supports it, but the initial framing could be tighter. Worth a pass when Phase 23 builds the SOC capstone on that scene.
- Carried forward: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **Three troubleshooting incidents.** The engine supports any number; authoring cost is the constraint (each needs four cause options and four fix options with substantive rationale). Phase 22 asks for ten scenarios and this engine is the foundation for it.
- **Zone-to-device linkage is still descriptive strings** (noted in Phase 4). Phase 5 did not need it; Phase 11 should do it.
- The `identity` scene and `zones` scene both model trust, but do not cross-reference each other — the Management zone requires MFA and a jump host, which is a Phase 5 concept expressed in Phase 4 data. A typed link would be neat and is not needed yet.

---

## 9. Acceptance Criteria

| Criterion                                 | Status              | Evidence                                                                             |
| ----------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| IAM is a major career-oriented component  | **Pass**            | Largest phase: 6 lessons, 42 sections, 5 labs, 22 questions, 2 new interactive views |
| All 29 named topics taught                | **Pass**            | 30-keyword coverage test                                                             |
| The 10-stage lifecycle modelled           | **Pass**            | Nine stages matching PROMPT.md's chain, asserted by test                             |
| Learner can **design** the workflow       | **Pass**            | `p5-lab-0` plus the interactive lifecycle view with controls per stage               |
| Learner can **troubleshoot** the workflow | **Pass**            | Three incidents, three-part diagnosis, browser-verified                              |
| Interactive identity architecture in 3D   | **Pass — verified** | Ring scene rendering, click-to-inspect confirmed in the browser                      |

No acceptance criterion was skipped, and for the first time none is left unverified.

---

## 10. Next Phase

**Phase 6 — Cryptography & PKI.** From the roadmap: symmetric and asymmetric cryptography, hashing, digital signatures, certificates, certificate authorities, and the trust chain.

Phase 5 has already laid groundwork: certificates appeared as machine identity, SAML assertions are signed, FIDO2 is origin-bound cryptography, and Kerberos tickets are encrypted. Phase 6 explains the machinery underneath all of it — and the SAML signature this phase deliberately redacted is the natural worked example for "what does signing actually prove".

The 3D opportunity the global requirements list is the **encryption/TLS flow**, which extends the Phase 1 connection path at the point where it currently says "TLS handshake completes".

**Awaiting your approval before starting.**
