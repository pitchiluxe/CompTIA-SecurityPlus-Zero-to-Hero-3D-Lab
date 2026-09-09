// ---------------------------------------------------------------------------
// Phase 6 — cryptographic operations and the demonstration chain.
//
// PROMPT.md: "Make the learner distinguish encryption vs hashing vs encoding
// vs signing." That confusion is the single most common conceptual failure in
// the whole syllabus, so it gets a dedicated model and a graded exercise.
//
// All digest and encoding values below are REAL and verifiable. A learner can
// reproduce every one of them, which is the point — invented values would
// teach the shape while quietly undermining the lesson.
// ---------------------------------------------------------------------------

export type CryptoOperationId = 'encoding' | 'hashing' | 'encryption' | 'signing';

export type CryptoOperation = {
  id: CryptoOperationId;
  title: string;
  color: string;
  /** One-line definition. */
  definition: string;
  reversible: 'Yes, trivially' | 'No, by design' | 'Yes, with the key';
  needsKey: boolean;
  /** The security property it actually provides. */
  provides: string[];
  /** What it explicitly does NOT provide. */
  doesNotProvide: string[];
  /** The misuse that follows from confusing it with something else. */
  commonMisuse: string;
  examples: string[];
};

export const CRYPTO_OPERATIONS: CryptoOperation[] = [
  {
    id: 'encoding',
    title: 'Encoding',
    color: '#64748b',
    definition:
      'Transforming data into another representation so it survives transport or storage. It is a format change, not a security measure.',
    reversible: 'Yes, trivially',
    needsKey: false,
    provides: ['Safe transport of binary data through text-only channels', 'Interoperability'],
    doesNotProvide: [
      'Confidentiality',
      'Integrity',
      'Authenticity',
      'Any security property at all',
    ],
    commonMisuse:
      'Treating Base64 as if it hides something. Anyone can decode it in one command with no key and no effort. "It looked encrypted" has appeared in real breach reports.',
    examples: ['Base64', 'URL encoding', 'ASCII / UTF-8', 'Hexadecimal'],
  },
  {
    id: 'hashing',
    title: 'Hashing',
    color: '#22c55e',
    definition:
      'A one-way function producing a fixed-length digest from any input. The same input always gives the same digest; you cannot work backwards.',
    reversible: 'No, by design',
    needsKey: false,
    provides: ['Integrity checking', 'Fixed-length fingerprints', 'Deduplication and comparison'],
    doesNotProvide: [
      'Confidentiality — the digest is not a hidden copy of the data',
      'Authenticity on its own — anyone can hash anything',
      'Any way to recover the original input',
    ],
    commonMisuse:
      'Calling hashing "one-way encryption". It is not encryption at all, because encryption is defined by being reversible with a key. Also: hashing passwords without a salt, which rainbow tables defeat instantly.',
    examples: ['SHA-256', 'SHA-3', 'MD5 (broken)', 'SHA-1 (broken)'],
  },
  {
    id: 'encryption',
    title: 'Encryption',
    color: '#3b82f6',
    definition:
      'A reversible transformation using a key. Without the key the ciphertext is unreadable; with the key the original is recovered exactly.',
    reversible: 'Yes, with the key',
    needsKey: true,
    provides: ['Confidentiality'],
    doesNotProvide: [
      'Integrity on its own — ciphertext can be altered',
      'Authenticity on its own — anyone with the key can encrypt',
      'Non-repudiation with a shared symmetric key',
    ],
    commonMisuse:
      'Assuming encryption also proves the message was not tampered with. It does not, which is why authenticated encryption modes such as AES-GCM exist — they add an integrity tag alongside the confidentiality.',
    examples: ['AES-256-GCM', 'ChaCha20-Poly1305', 'RSA (for key transport)', 'ECDH-derived keys'],
  },
  {
    id: 'signing',
    title: 'Digital signing',
    color: '#a855f7',
    definition:
      'Hashing the data, then encrypting the digest with a private key. Anyone with the public key can verify it, but only the private key holder could have produced it.',
    reversible: 'No, by design',
    needsKey: true,
    provides: ['Integrity', 'Authenticity', 'Non-repudiation'],
    doesNotProvide: [
      'Confidentiality — a signed message is still readable by anyone',
      'Protection if the private key is stolen',
    ],
    commonMisuse:
      'Believing a signed document is also a secret one. Signing and encrypting are separate operations; a signed email is fully readable unless it was also encrypted.',
    examples: ['RSA-PSS', 'ECDSA', 'Ed25519', 'The signature on a TLS certificate'],
  },
];

export function getOperation(id: CryptoOperationId): CryptoOperation | undefined {
  return CRYPTO_OPERATIONS.find((o) => o.id === id);
}

// ---------------------------------------------------------------------------
// The demonstration chain PROMPT.md specifies:
//   Plaintext -> Hash -> Encryption -> Digital Signature -> Certificate -> TLS
// ---------------------------------------------------------------------------

export type ChainStageId =
  'plaintext' | 'hash' | 'encryption' | 'signature' | 'certificate' | 'tls';

export type ChainStage = {
  id: ChainStageId;
  order: number;
  title: string;
  color: string;
  /** Which of the four operations this stage is an instance of, if any. */
  operation?: CryptoOperationId;
  summary: string;
  /** Worked example: what goes in. */
  input: string;
  /** Worked example: what comes out. Real values throughout. */
  output: string;
  /** What this stage adds that the previous one did not have. */
  adds: string;
};

/** The sample message used throughout the demonstration. */
export const SAMPLE_PLAINTEXT = 'Transfer $500 to account 12345';
export const SAMPLE_TAMPERED = 'Transfer $5000 to account 12345';

/** Real SHA-256 digests — verifiable with any tool. */
export const SAMPLE_SHA256 = 'f66dafe909e28736e0d388a69f66aff66a2bc24d1b061d486e0ec7a489c4cabb';
export const TAMPERED_SHA256 = '1bb7c2daf1af64faaad954903c47272ed90f816560dfefd615ae3136ff21fd6c';
export const SAMPLE_BASE64 = 'VHJhbnNmZXIgJDUwMCB0byBhY2NvdW50IDEyMzQ1';

export const CRYPTO_CHAIN: ChainStage[] = [
  {
    id: 'plaintext',
    order: 1,
    title: 'Plaintext',
    color: '#e5e7eb',
    summary:
      'The original message, readable by anyone who can see it. Everything that follows is about adding a property this does not have.',
    input: '(the message itself)',
    output: SAMPLE_PLAINTEXT,
    adds: 'Nothing yet — this is the starting point.',
  },
  {
    id: 'hash',
    order: 2,
    title: 'Hash',
    color: '#22c55e',
    operation: 'hashing',
    summary:
      'A fixed-length fingerprint. Change one character of the input and the entire digest changes — the avalanche effect. Note the digest is not smaller-but-readable; it is not the message at all.',
    input: SAMPLE_PLAINTEXT,
    output: `SHA-256: ${SAMPLE_SHA256}`,
    adds: 'Integrity checking. You can now detect that the message changed — but not who changed it.',
  },
  {
    id: 'encryption',
    order: 3,
    title: 'Encryption',
    color: '#3b82f6',
    operation: 'encryption',
    summary:
      'The message is transformed with a key so only a key holder can read it. AES-GCM is used here because it is an authenticated mode: it produces an integrity tag alongside the ciphertext.',
    input: SAMPLE_PLAINTEXT,
    output: 'AES-256-GCM ciphertext + 128-bit auth tag  [ciphertext redacted]',
    adds: 'Confidentiality. The message is now unreadable without the key.',
  },
  {
    id: 'signature',
    order: 4,
    title: 'Digital signature',
    color: '#a855f7',
    operation: 'signing',
    summary:
      'The digest from stage 2 is encrypted with the sender private key. Anyone holding the public key can verify it; only the private key holder could have produced it. Note that signing operates on the hash, not the whole message — which is why hashing came first.',
    input: `SHA-256 digest (${SAMPLE_SHA256.slice(0, 16)}…)`,
    output: 'Ed25519 signature  [signature redacted]',
    adds: 'Authenticity and non-repudiation. You now know who sent it, and they cannot credibly deny it.',
  },
  {
    id: 'certificate',
    order: 5,
    title: 'Certificate',
    color: '#eab308',
    summary:
      'A certificate binds a public key to an identity, and is itself signed by a certificate authority. It answers the question the previous stage leaves open: you can verify the signature, but how do you know the public key belongs to who it claims?',
    input: 'Public key + subject name + validity period',
    output: 'X.509 certificate signed by the issuing CA',
    adds: 'Trusted binding of key to identity, anchored in a CA you already trust.',
  },
  {
    id: 'tls',
    order: 6,
    title: 'TLS session',
    color: '#38bdf8',
    summary:
      'The handshake authenticates the server via its certificate, agrees a fresh symmetric key by ephemeral key exchange, and switches to symmetric encryption for the actual data. Asymmetric crypto establishes trust; symmetric crypto does the work.',
    input: 'Certificate + ephemeral key exchange',
    output: 'Authenticated, encrypted session with forward secrecy',
    adds: 'All of it at once — confidentiality, integrity, and server authenticity, on a fresh key.',
  },
];

export function getChainStage(id: ChainStageId): ChainStage | undefined {
  return CRYPTO_CHAIN.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// The discrimination exercise: given an artifact, name the operation.
// ---------------------------------------------------------------------------

export type ClassifyItem = {
  id: string;
  /** What the learner is shown. */
  artifact: string;
  /** Supporting detail, if the artifact alone is ambiguous. */
  hint?: string;
  answer: CryptoOperationId;
  /** Why it is that operation, and what makes it look like another. */
  rationale: string;
};

export const CLASSIFY_ITEMS: ClassifyItem[] = [
  {
    id: 'ci0',
    artifact: SAMPLE_BASE64,
    hint: 'Ends in no padding here; decodes with a single command and no key.',
    answer: 'encoding',
    rationale:
      'Base64. It looks scrambled, which is exactly why it gets mistaken for encryption — but no key is involved and anyone can reverse it instantly. Encoding provides no security property whatsoever.',
  },
  {
    id: 'ci1',
    artifact: SAMPLE_SHA256,
    hint: '64 hexadecimal characters. The same input always produces this exact output.',
    answer: 'hashing',
    rationale:
      'A SHA-256 digest. Fixed length regardless of input size and not reversible. The giveaway is the constant length — encryption output grows with the input, a digest never does.',
  },
  {
    id: 'ci2',
    artifact: 'AES-256-GCM, IV present, 128-bit authentication tag appended',
    answer: 'encryption',
    rationale:
      'Authenticated encryption. A key is required to reverse it, and the auth tag adds integrity on top of the confidentiality that encryption alone provides.',
  },
  {
    id: 'ci3',
    artifact: 'Ed25519 output over a SHA-512 digest, verifiable with the sender public key',
    answer: 'signing',
    rationale:
      'A digital signature. Verifiable by anyone with the public key, producible only by the private key holder — which is what gives it authenticity and non-repudiation.',
  },
  {
    id: 'ci4',
    artifact: 'ROT13 applied to the message body',
    hint: 'A fixed 13-place letter rotation with no key.',
    answer: 'encoding',
    rationale:
      'ROT13 is a substitution with no key and a publicly known transformation, so it is encoding rather than encryption. A "cipher" with no key is not providing confidentiality to anyone.',
  },
  {
    id: 'ci5',
    artifact: 'bcrypt output with a per-user salt and a work factor of 12',
    answer: 'hashing',
    rationale:
      'A password hash. Still one-way and still hashing — the salt defeats rainbow tables and the work factor slows brute force, but neither makes it reversible. bcrypt is not encryption.',
  },
  {
    id: 'ci6',
    artifact: 'HMAC-SHA256 computed with a shared secret key',
    hint: 'Both parties hold the same key.',
    answer: 'hashing',
    rationale:
      'A keyed hash. It provides integrity and authenticity between two parties holding the shared key — but because BOTH hold it, either could have produced it, so it gives no non-repudiation. That is the line between an HMAC and a signature.',
  },
  {
    id: 'ci7',
    artifact: 'The CA operation that produced the issuer field value on an X.509 certificate',
    answer: 'signing',
    rationale:
      'The certificate authority signs the certificate with its private key. That signature is what makes the certificate trustworthy — a certificate is essentially a signed statement binding a key to a name.',
  },
];

export function getClassifyItem(id: string): ClassifyItem | undefined {
  return CLASSIFY_ITEMS.find((i) => i.id === id);
}
