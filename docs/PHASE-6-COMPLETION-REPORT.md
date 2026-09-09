# Phase 6 Completion Report — Cryptography & PKI

**Project:** CompTIA Security+ Zero-to-Hero Professional 3D Lab Platform
**Exam alignment:** CompTIA Security+ **SY0-701**
**Date:** 2026-09-08
**Status:** Complete — awaiting approval before Phase 7

---

## 1. Features Delivered

| Requirement (PROMPT.md Phase 6)                                                          | Status | Where                                                               |
| ---------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| Teach 18 named topics (encryption → key management)                                      | Done   | `src/data/phase6.ts` — 5 lessons, 37 sections                       |
| Interactive demonstration: plaintext → hash → encryption → signature → certificate → TLS | Done   | `CryptoView` "Demonstration chain" tab                              |
| **"Make the learner distinguish encryption vs hashing vs encoding vs signing"**          | Done   | Lesson 0 entirely, plus a graded 8-artifact classification exercise |
| 3D (implied by the global requirements' "encryption/TLS flow")                           | Done   | `src/scenes/TlsScene.tsx` — verified rendering                      |

### Lessons

| #   | Lesson                                                | Topics covered                                          |
| --- | ----------------------------------------------------- | ------------------------------------------------------- |
| 0   | Encryption vs Hashing vs Encoding vs Signing          | The four operations, what each provides, common misuses |
| 1   | Symmetric Encryption and the Key Distribution Problem | AES, modes, key management                              |
| 2   | Asymmetric Encryption, RSA, ECC and Key Exchange      | RSA, ECC, key exchange, forward secrecy, hybrid crypto  |
| 3   | Hashing in Practice                                   | SHA-256, collisions, salting, HMAC, signatures          |
| 4   | PKI, Certificates and the TLS Handshake               | PKI, CAs, chain of trust, lifecycle, TLS, HTTPS         |

19 quiz questions. 12 new prepared artifacts (87 commands total).

---

## 2. The Core Requirement — Four Operations

PROMPT.md names one explicit goal for this phase, and it is the distinction that causes more wrong answers than any other single misconception. It gets three treatments:

**A model** (`cryptoOperations.ts`) — each operation carries what it _provides_ and what it explicitly _does not_, plus the misuse that follows from confusing it with something else. A test asserts only signing has non-repudiation, that encryption alone lacks integrity, and that encoding provides nothing.

**Two questions that place any operation:** is it reversible, and does it need a key? A test asserts these two attributes uniquely discriminate all four — if a future edit made two operations share both answers, the framing would silently stop working and the test would catch it.

**A graded exercise** — eight artifacts to classify, deliberately including the three traps: Base64 mistaken for encryption, bcrypt mistaken for encryption, and HMAC mistaken for signing. Grading reports the _specific confusion_ ("you called hashing encryption 3 times") rather than a bare score, and mastery credit for an operation requires getting every artifact of that type right.

---

## 3. Real, Verifiable Values

Every digest and encoding in this phase is genuine. `Transfer $500 to account 12345` really does hash to `f66dafe9…c4cabb`, and a learner can reproduce it with `sha256sum`.

**A test verifies this against Node's own crypto implementation** rather than trusting the constants. It also asserts the avalanche effect quantitatively: fewer than 25% of digest characters survive a one-character input change.

This mattered enough to do properly. Invented digest values would teach the shape of the lesson while quietly undermining its claim — a learner who checked would find the platform was making things up, on the one topic where "verify it yourself" is the entire point.

Key material is a different case and is always redacted: no private keys, no session keys, no fabricated certificate bytes.

---

## 4. 3D — The TLS Handshake

`src/scenes/TlsScene.tsx` extends the Phase 1 connection path at the exact point where it previously said "TLS handshake completes".

Drawn as a **sequence diagram** — the conventional representation for a message exchange, with client and server lifelines and messages crossing between them. Steps 5 and 6 are local computation rather than transmission, so they render as short bars on one lifeline instead of crossing arrows; nothing travels the wire during validation or key derivation.

Selecting a step shows what it carries, what it establishes, and which of the four operations it uses. **All four appear across the eight steps**, which makes the handshake the worked example for lesson 0.

The step learners most often miss is called out explicitly: presenting a certificate proves nothing on its own, because certificates are public documents anyone can copy. Step 4, Certificate Verify, is where the server signs the transcript to prove it holds the private key.

Verified rendering in the browser, along with the classification exercise showing the real Base64 and SHA-256 values.

---

## 5. Tests

```
Test Files  12 passed (12)
Tests       384 passed (384)     (Phase 5 finished at 326)
```

New file `tests/phase6.test.tsx` (53 tests):

| Group                             | Covers                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Cryptographic values are real** | Digests and Base64 verified against Node crypto; avalanche effect measured; constant digest length |
| Content safety                    | No private key material; certificate public key and signature redacted                             |
| Phase 6 curriculum                | All 18 required topics; lesson 0 devoted to the four-way distinction                               |
| Crypto operation data             | Four operations, discriminated by the two questions, correct properties, misuses present           |
| Demonstration chain               | Six stages in PROMPT.md's order, real digest in the hash stage                                     |
| Classification data               | All four covered, the three classic traps present, substantive rationale                           |
| Classification grading            | Perfect, empty, confusion reporting, completeness tracking                                         |
| TLS handshake data                | Eight ordered steps, all four operations used, validation precedes application data                |
| TlsFallback2D / CryptoView        | 2D fallback, chain walking, submission gating, grading, confusion display                          |
| Phase 6 labs and quizzes          | Two labs end to end, four-way distinction quiz                                                     |

Also run: `npx tsc --noEmit` clean · `npx eslint .` clean · `npm run build` succeeds.

---

## 6. Defects Found and Fixed

**A genuine content gap, caught by the coverage test.** PROMPT.md lists HTTPS as a required topic and my five lessons never mentioned it — I had covered TLS thoroughly and treated HTTPS as implied. It is not implied; it is a distinct thing worth saying, because learners routinely believe HTTPS is a separate protocol rather than HTTP carried inside a TLS session. Added as a concept section in lesson 4, with the practical consequence spelled out: a WAF inspecting HTTPS is inspecting decrypted HTTP after the proxy terminated TLS.

The right fix here was the content, not the test. The test was doing exactly its job.

**A tsconfig gap.** The crypto verification test imports `node:crypto`, which needs `@types/node` and `"node"` in the tsconfig types array. Tests passed (Vitest transpiles without typechecking) but `npm run build` failed. Installed and configured.

---

## 7. Known Issues and Limitations

- Carried forward: TypeScript pinned to 6.0.3 for `typescript-eslint` compatibility; `npm install` needs `--legacy-peer-deps`.
- **The classification exercise has eight artifacts.** Enough to cover all four operations and the three classic traps, but a larger bank would support repeat practice. The engine takes an item list as a parameter, so extending it is data-only.
- **No hands-on key generation.** The phase teaches key sizes and equivalences but never has the learner generate a key pair, because doing that safely in-browser would mean either real key material in the platform or a fake that undermines the "real values" principle. A future phase with a sandboxed terminal could revisit it.
- **The demonstration chain shows encryption output as redacted** rather than real ciphertext. Unlike digests, ciphertext depends on a key and an IV, so a "real" value would be meaningless without publishing the key. Redaction is the honest choice here.
- Seven 3D scenes now share one Three.js chunk; the main bundle is 520 kB (163 kB gzipped), still below Phase 4's pre-splitting 605 kB.

---

## 8. Acceptance Criteria

| Criterion                                        | Status              | Evidence                                                                                                |
| ------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| All 18 named topics taught                       | **Pass**            | 18-keyword coverage test, including the HTTPS gap it caught                                             |
| Interactive demonstration of the six-stage chain | **Pass**            | `CryptoView` chain tab, each stage showing input, output, and what it adds                              |
| Learner distinguishes the four operations        | **Pass**            | Dedicated lesson, model with provides/does-not-provide, graded 8-item exercise with confusion reporting |
| Values are trustworthy                           | **Pass**            | Digests verified against Node crypto by test                                                            |
| 3D encryption/TLS flow                           | **Pass — verified** | Sequence-diagram scene, browser-verified, all four operations mapped across it                          |

No acceptance criterion was skipped.

---

## 9. Next Phase

**Phase 7 — Security Operations / SOC.** This is the largest exam domain at **28%** and the natural home for everything built so far: the Phase 0 SOC room, the Phase 3 attack chain, the Phase 4 zone telemetry, and the Phase 5 identity logs all feed a SOC.

Expect it to cover monitoring, SIEM, log analysis, alerting, triage, and the analyst workflow. The platform already has the raw material — an incident that has run since Phase 0 and now has a fully explained six-stage chain behind it — so Phase 7 can put the learner in the analyst's seat rather than introducing a new scenario.

**Awaiting your approval before starting.**
