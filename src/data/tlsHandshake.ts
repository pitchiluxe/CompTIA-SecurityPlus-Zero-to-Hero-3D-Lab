import type { CryptoOperationId } from './cryptoOperations';

// ---------------------------------------------------------------------------
// Phase 6 — the TLS 1.3 handshake, as a message exchange.
//
// Extends the Phase 1 connection path at the point where it says "TLS
// handshake completes". Source of truth for the 3D scene, the 2D fallback,
// and the `trace tls handshake` transcript.
//
// Each step names which of the four operations it uses, so the handshake
// doubles as the worked example for lesson 0's distinction.
// ---------------------------------------------------------------------------

export type HandshakeParty = 'client' | 'server';

export type HandshakeStep = {
  order: number;
  /** Which side sends this message. */
  from: HandshakeParty;
  title: string;
  /** What travels in the message. */
  carries: string;
  /** What this step establishes that the previous one did not. */
  establishes: string;
  /** Operations from lesson 0 that appear here. */
  operations: CryptoOperationId[];
  /** The misconception this step corrects, where there is one. */
  note?: string;
};

export const TLS_HANDSHAKE: HandshakeStep[] = [
  {
    order: 1,
    from: 'client',
    title: 'Client Hello',
    carries: 'Supported TLS versions, cipher suites, and the client ECDHE key share',
    establishes: 'What the client can do, and half of the key exchange material',
    operations: ['encoding'],
    note: 'TLS 1.3 sends the key share immediately rather than waiting, which is why it completes in one round trip instead of two.',
  },
  {
    order: 2,
    from: 'server',
    title: 'Server Hello',
    carries: 'Chosen cipher suite and the server ECDHE key share',
    establishes: 'The agreed algorithms, and the other half of the exchange',
    operations: ['encoding'],
  },
  {
    order: 3,
    from: 'server',
    title: 'Certificate',
    carries: 'The leaf certificate plus any intermediates',
    establishes: 'A claimed identity and a public key, vouched for by a CA',
    operations: ['encoding'],
    note: 'Presenting a certificate proves nothing on its own — certificates are public documents that anyone can copy. Step 4 is what makes it mean something.',
  },
  {
    order: 4,
    from: 'server',
    title: 'Certificate Verify',
    carries: 'A signature over the handshake transcript, made with the server private key',
    establishes: 'That the server actually holds the private key matching the certificate',
    operations: ['hashing', 'signing'],
    note: 'This is the step learners most often miss. Without it, anyone could replay a copied certificate.',
  },
  {
    order: 5,
    from: 'client',
    title: 'Certificate validation',
    carries: '(no message — the client checks locally)',
    establishes:
      'That the chain reaches a trusted root, the dates are valid, the SAN matches the hostname, and it is not revoked',
    operations: ['hashing', 'signing'],
    note: 'Validation happens before the session is used. Agreeing a key with an unverified server would defeat the entire purpose.',
  },
  {
    order: 6,
    from: 'client',
    title: 'Key derivation',
    carries: '(no message — both sides compute independently)',
    establishes: 'Identical session keys on both sides, derived from the ECDHE exchange',
    operations: ['hashing'],
    note: 'The session key is never transmitted. Both sides compute the same value from material an eavesdropper saw, which is the property that makes Diffie-Hellman remarkable.',
  },
  {
    order: 7,
    from: 'client',
    title: 'Finished',
    carries: 'A MAC over the whole handshake transcript',
    establishes: 'That neither side saw a tampered handshake — downgrade protection',
    operations: ['hashing'],
  },
  {
    order: 8,
    from: 'server',
    title: 'Application data',
    carries: 'The actual HTTP request and response, encrypted',
    establishes: 'Confidentiality and integrity for everything that follows',
    operations: ['encryption'],
    note: 'From here on it is symmetric AES-GCM. All the asymmetric work happened once, in the handshake.',
  },
];

export function getHandshakeStep(order: number): HandshakeStep | undefined {
  return TLS_HANDSHAKE.find((s) => s.order === order);
}

/** Steps in which a given operation appears — used by the lab challenge. */
export function stepsUsingOperation(op: CryptoOperationId): HandshakeStep[] {
  return TLS_HANDSHAKE.filter((s) => s.operations.includes(op));
}
