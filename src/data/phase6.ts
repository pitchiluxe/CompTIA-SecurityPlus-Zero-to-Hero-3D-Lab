import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 6 — Cryptography & PKI
// Aligned with CompTIA Security+ SY0-701
//
// PROMPT.md's stated goal for this phase: "Make the learner distinguish
// encryption vs hashing vs encoding vs signing." That confusion causes more
// wrong answers than any other single misconception, so lesson 0 is entirely
// about it and everything after builds on the distinction.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p6-lesson-0',
    phaseId: 'phase-6',
    title: 'Encryption vs Hashing vs Encoding vs Signing',
    objectives: [
      'Separate the four operations by reversibility and key use',
      'State which security property each one actually provides',
      'Identify an operation from the shape of its output',
      'Explain why encoding provides no security at all',
    ],
    concepts: ['encryption', 'hashing', 'encoding', 'digital-signatures'],
    homework:
      'Produce four short examples — one each of encryption, hashing, encoding, and signing — and write the property that makes each one unsuitable as a substitute for the others.',
    careerConnection:
      'This distinction shows up in every security interview and most incident reports. "The data was encoded, not encrypted" is a sentence you will need to say to a manager one day.',
    sections: [
      {
        id: 'p6-l0-s0',
        title: 'Concept — Two questions separate all four',
        body: 'Ask two things about any transformation: is it reversible, and does it need a key? Encoding is reversible with no key. Hashing is not reversible and needs no key. Encryption is reversible with a key. Signing is not reversible and uses a key — specifically a private one. Those two questions place every cryptographic operation you will meet, and they are faster than trying to recognise output formats.',
      },
      {
        id: 'p6-l0-s1',
        title: 'Concept — Encoding is not security',
        body: 'Base64, URL encoding, hexadecimal, ASCII: all of these change how data is represented so it survives a channel that would otherwise mangle it. None involves a key, and anyone can reverse any of them in one command. Encoding provides confidentiality to nobody. The reason it gets confused with encryption is purely visual — Base64 looks scrambled, and "it looked encrypted" has genuinely appeared in breach reports.',
      },
      {
        id: 'p6-l0-s2',
        title: 'Concept — Hashing is one-way by design',
        body: 'A hash function takes any input and produces a fixed-length digest. Same input, same digest, always. Different input, wildly different digest — the avalanche effect. You cannot work backwards, and that is the point rather than a limitation. The tell in output is constant length: a SHA-256 digest is 64 hex characters whether you hashed one word or a gigabyte, whereas ciphertext grows with its input.',
      },
      {
        id: 'p6-l0-s3',
        title: 'Concept — "One-way encryption" is not a thing',
        body: 'You will hear hashing described as one-way encryption. It is worth resisting, because encryption is *defined* by being reversible with a key — a transformation you cannot reverse is not encryption, it is a hash. The phrase causes real errors: people store passwords "encrypted" and are then surprised that an attacker who steals the key recovers every password, when hashing would have made that impossible.',
      },
      {
        id: 'p6-l0-s4',
        title: 'Concept — What each one actually provides',
        body: 'Encryption provides confidentiality and nothing else — ciphertext can still be altered, which is why authenticated modes like AES-GCM add an integrity tag. Hashing provides integrity checking. Signing provides integrity, authenticity, and non-repudiation, because only the private key holder could have produced it. Encoding provides none of the three. Match the requirement to the property and the right operation follows.',
      },
      {
        id: 'p6-l0-s5',
        title: 'Example — The avalanche effect, verifiable',
        body: '"Transfer $500 to account 12345" hashes to f66dafe9…c4cabb. Add one character to make it $5000 and it becomes 1bb7c2da…21fd6c. Not similar — completely different. That is what makes a digest useful for integrity: any change at all, however small, is obvious. You can verify both values yourself with any hashing tool, and you should.',
      },
      {
        id: 'p6-l0-s6',
        title: 'Scenario — Signed does not mean secret',
        body: 'A colleague sends a digitally signed email containing salary figures and says it is protected. It is not. Signing proves who sent it and that nobody altered it; the contents are fully readable by anyone who intercepts it. Confidentiality would require encrypting it as well. Signing and encrypting are independent operations and you frequently want both.',
      },
      {
        id: 'p6-l0-s7',
        title: 'Review — What must stick',
        body: 'Reversible + no key = encoding, and it secures nothing. Not reversible + no key = hashing, giving integrity. Reversible + key = encryption, giving confidentiality. Not reversible + private key = signing, giving integrity, authenticity, and non-repudiation. Constant output length means a digest. Signed is not secret.',
      },
    ],
    quiz: [
      {
        id: 'p6-q0',
        type: 'scenario',
        stem: 'An application stores values as VHJhbnNmZXIgJDUwMCB0byBhY2NvdW50IDEyMzQ1 and the developer says the data is protected. What is wrong?',
        options: [
          'Nothing — that is strong encryption',
          'It is Base64 encoding, which requires no key and is trivially reversible by anyone',
          'The key length is too short',
          'It should use a longer hash algorithm',
        ],
        answer: 1,
        explanation:
          'Base64 is a representation change, not a security control. No key is involved, so anyone can decode it instantly. Encoding provides confidentiality to nobody.',
        examClue:
          'If a transformation needs no key, it is not providing confidentiality — regardless of how scrambled it looks.',
        domain: 'General Security Concepts',
        conceptId: 'encoding',
      },
      {
        id: 'p6-q1',
        type: 'mcq',
        stem: 'Which pair of properties uniquely identifies hashing?',
        options: [
          'Reversible, requires a key',
          'Not reversible, requires no key',
          'Reversible, requires no key',
          'Not reversible, requires a private key',
        ],
        answer: 1,
        explanation:
          'Hashing is one-way and keyless. Reversible with a key is encryption; reversible without one is encoding; not reversible with a private key is signing.',
        domain: 'General Security Concepts',
        conceptId: 'hashing',
      },
      {
        id: 'p6-q2',
        type: 'scenario',
        stem: 'A digitally signed email contains confidential salary data. What protection does the signature provide?',
        options: [
          'Confidentiality — the contents are hidden from interceptors',
          'Integrity, authenticity and non-repudiation, but the contents remain readable',
          'Both confidentiality and integrity',
          'Only non-repudiation',
        ],
        answer: 1,
        explanation:
          'Signing proves origin and detects alteration. It does not hide anything — the message is fully readable unless it was also encrypted. Signing and encrypting are separate operations.',
        examClue: 'If the question asks about confidentiality, look for encryption, never signing.',
        domain: 'General Security Concepts',
        conceptId: 'digital-signatures',
      },
      {
        id: 'p6-q3',
        type: 'mcq',
        stem: 'Why is describing hashing as "one-way encryption" misleading?',
        options: [
          'Because hashing is faster than encryption',
          'Because encryption is defined by being reversible with a key, so an irreversible transformation is not encryption',
          'Because hashing always uses a key',
          'Because encryption cannot be applied to passwords',
        ],
        answer: 1,
        explanation:
          'The phrase leads people to store passwords reversibly. Encrypted passwords can all be recovered by an attacker who steals the key; hashed passwords cannot be recovered at all.',
        domain: 'General Security Concepts',
        conceptId: 'hashing',
      },
    ],
  },

  {
    id: 'p6-lesson-1',
    phaseId: 'phase-6',
    title: 'Symmetric Encryption and the Key Distribution Problem',
    objectives: [
      'Describe symmetric encryption and name AES as the standard',
      'Explain why AES-GCM is preferred over unauthenticated modes',
      'State the key distribution problem in one sentence',
      'Explain why symmetric crypto does the bulk of real work',
    ],
    concepts: ['symmetric-encryption', 'aes', 'key-management'],
    homework:
      'Explain in writing why symmetric encryption alone cannot secure a first contact between two strangers, then name the mechanism that solves it.',
    careerConnection:
      'Every disk encryption, database encryption, and TLS session in your estate is doing symmetric crypto underneath. Knowing which mode and why is a real design conversation.',
    sections: [
      {
        id: 'p6-l1-s0',
        title: 'Concept — One key, both directions',
        body: 'Symmetric encryption uses the same key to encrypt and decrypt. AES is the standard, typically with 128- or 256-bit keys, and it is fast — fast enough to encrypt a disk or a network stream without anyone noticing. That speed is why symmetric crypto does essentially all the actual data protection in practice, with asymmetric crypto reserved for establishing keys.',
      },
      {
        id: 'p6-l1-s1',
        title: 'Concept — Modes matter more than the algorithm',
        body: 'AES is a block cipher, so a mode of operation determines how blocks are chained. The one to remember is GCM, because it is authenticated: alongside the ciphertext it produces an authentication tag that detects tampering. Unauthenticated modes leave you with confidentiality but no integrity, and an attacker who can flip bits in ciphertext can sometimes flip corresponding bits in plaintext. If a question offers AES-GCM against an unauthenticated mode, GCM is the answer.',
      },
      {
        id: 'p6-l1-s2',
        title: 'Concept — The key distribution problem',
        body: 'Here is the whole difficulty in one sentence: to talk securely with someone, you both need the same key, but you need a secure channel to share it — and if you had a secure channel you would not need the encryption. This is why asymmetric cryptography was invented, and why every symmetric system needs an answer to "how did both ends get this key".',
      },
      {
        id: 'p6-l1-s3',
        title: 'Concept — Key management is the hard part',
        body: 'Algorithms are the easy part; keys are where systems fail. Keys must be generated with real randomness, stored somewhere the application can reach but an attacker cannot, rotated on a schedule, and destroyed when retired. Hardware security modules and cloud key vaults exist for exactly this. A common real finding is an encryption key sitting in the same repository as the code that uses it, which reduces the encryption to decoration.',
      },
      {
        id: 'p6-l1-s4',
        title: 'Example — Where the work actually happens',
        body: 'In a TLS session the asymmetric operations happen once, during the handshake, to authenticate the server and agree a key. Everything after that — every byte of the actual page — is protected with symmetric encryption using that agreed key. Asymmetric establishes trust; symmetric does the work. Keep that division in mind and the handshake stops looking arbitrary.',
      },
      {
        id: 'p6-l1-s5',
        title: 'Review — What must stick',
        body: 'Symmetric: one key both ways, fast, AES is the standard. Prefer authenticated modes — AES-GCM gives integrity alongside confidentiality. The key distribution problem is why asymmetric crypto exists. Key management, not algorithm choice, is where real systems fail. Symmetric does the bulk work; asymmetric bootstraps it.',
      },
    ],
    quiz: [
      {
        id: 'p6-q4',
        type: 'mcq',
        stem: 'Why is AES-GCM generally preferred over an unauthenticated AES mode?',
        options: [
          'It uses a longer key',
          'It provides an authentication tag, adding integrity to the confidentiality',
          'It is significantly faster in all cases',
          'It does not require an initialisation vector',
        ],
        answer: 1,
        explanation:
          'Encryption alone gives confidentiality but not integrity — ciphertext can be altered. GCM is an authenticated mode: the tag detects tampering, which unauthenticated modes cannot.',
        domain: 'General Security Concepts',
        conceptId: 'aes',
      },
      {
        id: 'p6-q5',
        type: 'scenario',
        stem: 'Two systems need to exchange encrypted data but have never communicated before. What problem does symmetric encryption alone face?',
        options: [
          'AES is too slow for network traffic',
          'They need to share a key, but sharing it securely requires a secure channel they do not yet have',
          'Symmetric encryption cannot protect data in transit',
          'Key length limits make it unsuitable',
        ],
        answer: 1,
        explanation:
          'This is the key distribution problem, and it is why asymmetric cryptography exists. Public key methods let two parties agree a shared secret over a channel an eavesdropper can watch.',
        domain: 'General Security Concepts',
        conceptId: 'key-management',
      },
      {
        id: 'p6-q6',
        type: 'scenario',
        stem: 'An audit finds an application AES key committed to the same source repository as the application. Why is this a serious finding?',
        options: [
          'AES keys must never be stored in text form',
          'Anyone with repository access can decrypt the data, so the encryption protects against nothing they cannot already reach',
          'The key length becomes invalid once stored',
          'It prevents key rotation entirely',
        ],
        answer: 1,
        explanation:
          'Encryption is only as good as key custody. A key stored alongside the data it protects reduces the control to decoration — which is why key vaults and HSMs exist.',
        domain: 'Security Architecture',
        conceptId: 'key-management',
      },
    ],
  },

  {
    id: 'p6-lesson-2',
    phaseId: 'phase-6',
    title: 'Asymmetric Encryption, RSA, ECC and Key Exchange',
    objectives: [
      'Explain the public/private key pair and which key does what',
      'Contrast RSA with ECC on key size and use',
      'Describe ephemeral key exchange and forward secrecy',
      'Explain hybrid cryptography and why it is universal',
    ],
    concepts: ['asymmetric-encryption', 'rsa', 'ecc', 'key-exchange', 'forward-secrecy'],
    homework:
      'Write down which key encrypts and which key decrypts for confidentiality, then repeat it for a signature. Note that the pairing reverses, and say why.',
    careerConnection:
      'Forward secrecy is a question you will be asked in any TLS configuration review, and the answer distinguishes people who have read about crypto from people who have configured it.',
    sections: [
      {
        id: 'p6-l2-s0',
        title: 'Concept — Two keys, opposite roles',
        body: 'An asymmetric key pair consists of a public key you distribute freely and a private key you never share. What one encrypts, the other decrypts. Encrypt with someone public key and only their private key opens it — that is confidentiality. Encrypt a digest with your private key and anyone can verify it with your public key — that is a signature. Same mathematics, opposite direction, entirely different purpose.',
      },
      {
        id: 'p6-l2-s1',
        title: 'Concept — RSA and ECC',
        body: 'RSA is the long-established algorithm, based on the difficulty of factoring large numbers, and needs large keys — 2048 bits minimum, 3072 or 4096 for longer-term security. Elliptic curve cryptography achieves comparable strength with far smaller keys: a 256-bit ECC key is roughly equivalent to a 3072-bit RSA key. Smaller keys mean less computation and less bandwidth, which is why ECC dominates in mobile, IoT, and modern TLS.',
      },
      {
        id: 'p6-l2-s2',
        title: 'Concept — Key exchange and forward secrecy',
        body: 'Diffie-Hellman lets two parties derive a shared secret over a channel an eavesdropper can fully observe, without ever transmitting the secret. The ephemeral variants — DHE and ECDHE — generate a fresh key pair for every session and discard it afterwards. That gives forward secrecy: an attacker who records traffic today and later steals the server private key still cannot decrypt those recorded sessions, because the session keys no longer exist anywhere.',
      },
      {
        id: 'p6-l2-s3',
        title: 'Concept — Hybrid cryptography',
        body: 'Asymmetric operations are slow — orders of magnitude slower than symmetric ones. So essentially every real system is hybrid: asymmetric cryptography authenticates the parties and establishes a shared symmetric key, then symmetric cryptography protects the actual data. TLS, encrypted email, and signed software updates all work this way. If you ever wonder why a protocol uses both, this is the answer.',
      },
      {
        id: 'p6-l2-s4',
        title: 'Scenario — Why forward secrecy is worth configuring',
        body: 'An adversary captures encrypted traffic and stores it, unable to read it. Two years later they compromise the server and obtain its private key. Without forward secrecy, every recorded session is now decryptable retroactively. With ECDHE, the session keys were ephemeral and destroyed at the time, so the stored traffic stays unreadable. This is a real threat model, and it is why modern TLS configurations require ephemeral key exchange.',
      },
      {
        id: 'p6-l2-s5',
        title: 'Review — What must stick',
        body: 'Public key encrypts for confidentiality; private key signs for authenticity. RSA needs big keys; ECC gets equivalent strength from small ones. Ephemeral key exchange (DHE/ECDHE) gives forward secrecy, so stealing the server key later does not decrypt recorded sessions. Everything real is hybrid: asymmetric to bootstrap, symmetric to work.',
      },
    ],
    quiz: [
      {
        id: 'p6-q7',
        type: 'mcq',
        stem: 'To send a confidential message to Priya, which key do you use?',
        options: [
          'Your private key',
          'Priya public key',
          'Your public key',
          'A shared symmetric key you both already know',
        ],
        answer: 1,
        explanation:
          'Encrypting with the recipient public key means only their private key can open it. Encrypting with your own private key would be signing — verifiable by everyone, secret from nobody.',
        examClue:
          'Confidentiality uses the recipient key. Authenticity uses your own. Ask who you are protecting against.',
        domain: 'General Security Concepts',
        conceptId: 'asymmetric-encryption',
      },
      {
        id: 'p6-q8',
        type: 'scenario',
        stem: 'An attacker records encrypted sessions today and steals the server private key two years later. Which configuration prevents them decrypting the recorded traffic?',
        options: [
          'A longer RSA key',
          'Ephemeral key exchange (ECDHE), giving forward secrecy',
          'AES-256 instead of AES-128',
          'Certificate pinning',
        ],
        answer: 1,
        explanation:
          'Ephemeral exchange generates a fresh key pair per session and discards it. The session keys no longer exist, so the stolen long-term key cannot reconstruct them. Larger keys and stronger ciphers do not address retroactive decryption at all.',
        domain: 'Security Architecture',
        conceptId: 'forward-secrecy',
      },
      {
        id: 'p6-q9',
        type: 'mcq',
        stem: 'Why is a 256-bit ECC key considered comparable to a 3072-bit RSA key?',
        options: [
          'ECC keys are stored more efficiently',
          'The elliptic curve problem is harder per bit, so equivalent security needs far fewer bits',
          'ECC uses symmetric encryption internally',
          'RSA keys include redundant padding',
        ],
        answer: 1,
        explanation:
          'The underlying hard problems differ in difficulty per bit. That efficiency is why ECC dominates where computation and bandwidth are constrained — mobile, IoT, and modern TLS.',
        domain: 'General Security Concepts',
        conceptId: 'ecc',
      },
      {
        id: 'p6-q10',
        type: 'mcq',
        stem: 'Why do TLS and most other real protocols use both asymmetric and symmetric cryptography?',
        options: [
          'For regulatory compliance',
          'Asymmetric establishes trust and agrees a key; symmetric is fast enough to protect the actual data',
          'Symmetric encryption cannot be used over networks',
          'To support older clients',
        ],
        answer: 1,
        explanation:
          'Asymmetric operations are orders of magnitude slower. Using them only for the handshake and switching to symmetric for the session is what makes encrypted browsing practical.',
        domain: 'General Security Concepts',
        conceptId: 'key-exchange',
      },
    ],
  },

  {
    id: 'p6-lesson-3',
    phaseId: 'phase-6',
    title: 'Hashing in Practice — SHA-256, Salting, HMAC and Signatures',
    objectives: [
      'Explain collision resistance and why MD5 and SHA-1 are retired',
      'Describe salting and why unsalted password hashes fail',
      'Distinguish an HMAC from a digital signature',
      'Walk the signing and verification process',
    ],
    concepts: ['sha-256', 'hashing', 'hmac', 'digital-signatures', 'salting'],
    homework:
      'Explain why a salt defeats a precomputed table but not a targeted guess, and why HMAC is not the same thing as hashing a message with a key prepended.',
    careerConnection:
      'The HMAC-versus-signature distinction decides whether you have non-repudiation, and that comes up in every API security design review.',
    sections: [
      {
        id: 'p6-l3-s0',
        title: 'Concept — Collision resistance, and what broke',
        body: 'A hash function is collision resistant if nobody can find two different inputs producing the same digest. MD5 and SHA-1 both failed this — practical collisions exist for both, which means an attacker can craft a benign document and a malicious one sharing a digest. Neither is acceptable for signatures or integrity today. SHA-256 and the SHA-3 family are the current answer.',
      },
      {
        id: 'p6-l3-s1',
        title: 'Concept — Why unsalted password hashes fail',
        body: 'Hashing is deterministic, which is exactly the problem for passwords: the same password always produces the same digest, so an attacker precomputes digests for millions of common passwords once and looks up your entire stolen database instantly. That precomputed table is a rainbow table. A salt — unique random data per user, stored alongside the hash — makes every stored digest different even for identical passwords, so no precomputed table applies.',
      },
      {
        id: 'p6-l3-s2',
        title: 'Concept — Password hashing needs to be slow',
        body: 'General-purpose hashes are designed to be fast, which helps an attacker guessing billions of candidates. Password hashing functions — bcrypt, scrypt, Argon2 — are deliberately slow and memory-hard, with a tunable work factor. Note this is still hashing: bcrypt output is not reversible and bcrypt is not encryption. Salting and work factors change the economics, not the direction.',
      },
      {
        id: 'p6-l3-s3',
        title: 'Concept — HMAC versus digital signature',
        body: 'An HMAC is a keyed hash using a secret shared by both parties. It proves integrity and that the message came from someone holding the key. A digital signature uses a private key that only one party holds. The consequence is decisive: with an HMAC both parties could have produced it, so neither can be held to it — no non-repudiation. With a signature only the private key holder could have, so they cannot credibly deny it.',
      },
      {
        id: 'p6-l3-s4',
        title: 'Concept — How signing and verification actually work',
        body: 'Signing: hash the message, then encrypt that digest with your private key. The signature travels alongside the message. Verifying: hash the received message yourself, decrypt the signature with the sender public key to recover their digest, and compare. If they match, the message is unaltered and came from the private key holder. Note why hashing comes first — signing a fixed-size digest is far cheaper than signing a whole document.',
      },
      {
        id: 'p6-l3-s5',
        title: 'Review — What must stick',
        body: 'Collision resistance retired MD5 and SHA-1; use SHA-256 or SHA-3. Salt every password hash, uniquely per user, to defeat rainbow tables. Use bcrypt, scrypt, or Argon2, which are deliberately slow — and are still hashing. HMAC gives integrity and authenticity but not non-repudiation because the key is shared. Signing hashes first, then encrypts the digest with a private key.',
      },
    ],
    quiz: [
      {
        id: 'p6-q11',
        type: 'mcq',
        stem: 'Why are MD5 and SHA-1 unsuitable for digital signatures?',
        options: [
          'They produce digests that are too short to transmit',
          'Practical collisions exist, so two different documents can share a digest',
          'They require a key, which complicates distribution',
          'They are too slow for modern hardware',
        ],
        answer: 1,
        explanation:
          'A collision lets an attacker produce a benign document and a malicious one with the same digest — a signature over one validates the other. That destroys the integrity guarantee entirely.',
        domain: 'General Security Concepts',
        conceptId: 'sha-256',
      },
      {
        id: 'p6-q12',
        type: 'scenario',
        stem: 'A stolen database contains unsalted SHA-256 password hashes. Why is this nearly as bad as storing them in plaintext?',
        options: [
          'SHA-256 is reversible with the right tool',
          'Hashing is deterministic, so precomputed rainbow tables reveal common passwords instantly',
          'The hashes can be used directly as passwords',
          'SHA-256 has known collisions',
        ],
        answer: 1,
        explanation:
          'Identical passwords produce identical digests, so an attacker looks up precomputed tables rather than cracking anything. A per-user salt makes every stored digest unique and renders precomputation useless.',
        examClue:
          'When a question mentions stored password hashes, check for a salt before anything else.',
        domain: 'Security Architecture',
        conceptId: 'salting',
      },
      {
        id: 'p6-q13',
        type: 'scenario',
        stem: 'Two services authenticate API requests with HMAC-SHA256 using a shared secret. Why does this provide no non-repudiation?',
        options: [
          'HMAC is not cryptographically secure',
          'Both parties hold the same key, so either could have produced any given HMAC',
          'HMAC does not include the message contents',
          'SHA-256 is deprecated for this use',
        ],
        answer: 1,
        explanation:
          'Non-repudiation requires that only one party could have produced the value. A shared key means both could, so neither can be held to it. A digital signature with a private key provides what an HMAC cannot.',
        domain: 'Security Architecture',
        conceptId: 'hmac',
      },
      {
        id: 'p6-q14',
        type: 'pbq',
        stem: 'Order the steps of creating a digital signature: [0] Encrypt the digest with the private key, [1] Hash the message, [2] Attach the signature to the message.',
        options: [
          'Hash the message',
          'Encrypt the digest with the private key',
          'Attach the signature to the message',
        ],
        answer: [0, 1, 2],
        explanation:
          'Hash first, then encrypt the digest with the private key, then attach. Hashing first is what makes signing cheap — the asymmetric operation runs over a fixed-size digest rather than the whole document.',
        domain: 'General Security Concepts',
        conceptId: 'digital-signatures',
      },
    ],
  },

  {
    id: 'p6-lesson-4',
    phaseId: 'phase-6',
    title: 'PKI, Certificates and the TLS Handshake',
    objectives: [
      'Explain what a certificate binds and who vouches for it',
      'Describe the chain of trust from root to leaf',
      'Walk the certificate lifecycle including revocation',
      'Trace the TLS handshake and name what each step establishes',
      'Explain HTTPS as HTTP carried inside a TLS session',
    ],
    concepts: ['pki', 'certificates', 'certificate-authority', 'certificate-lifecycle', 'tls'],
    homework:
      'Open a site in your browser, inspect its certificate, and write down the issuer, validity dates, and subject. Then state what would happen at each step of the handshake if the issuer were not trusted.',
    careerConnection:
      'Certificate expiry causes more outages than most attacks. Being the person who understands the chain and the lifecycle is genuinely valuable.',
    sections: [
      {
        id: 'p6-l4-s0',
        title: 'Concept — What a certificate is',
        body: 'A certificate is a signed statement binding a public key to an identity, with a validity period. Signing your own would prove nothing, so a certificate authority signs it — an organisation whose own certificate your operating system or browser already trusts. This answers the question public key cryptography leaves open: you can verify a signature, but how do you know the public key belongs to who it claims?',
      },
      {
        id: 'p6-l4-s1',
        title: 'Concept — The chain of trust',
        body: 'A root CA certificate is self-signed and pre-installed in your trust store — trust has to start somewhere, and it starts there. Roots sign intermediates, intermediates sign leaf certificates for actual servers. Validation walks the chain upward until it reaches a root you already trust. Intermediates exist so the root private key can stay offline: if an intermediate is compromised it can be revoked without invalidating every certificate the root ever signed.',
      },
      {
        id: 'p6-l4-s2',
        title: 'Concept — The certificate lifecycle',
        body: 'A key pair is generated, a certificate signing request goes to the CA, the CA validates the requester controls the name and issues the certificate, it is deployed, and it expires. Renewal must happen before expiry — and expiry is an outage, not a warning. Revocation handles compromise before expiry, published through certificate revocation lists or OCSP. Note that revocation checking is imperfect in practice, which is one reason short-lived certificates have become the preferred answer.',
      },
      {
        id: 'p6-l4-s3',
        title: 'Concept — What validation actually checks',
        body: 'A client validating a certificate checks several things: the signature chains to a trusted root, the current time falls within the validity period, the name matches what was requested, the certificate has not been revoked, and it is being used for a permitted purpose. Any one failing invalidates it. "Certificate error" in a browser means one of these specific checks failed, and knowing which one turns a scary dialogue into a diagnosis.',
      },
      {
        id: 'p6-l4-s4',
        title: 'Concept — The TLS handshake',
        body: 'The client offers its supported versions and cipher suites. The server chooses, presents its certificate, and both sides perform an ephemeral key exchange. The client validates the certificate chain, both derive the same session keys from the exchange, and they switch to symmetric encryption. Everything after that is AES. Notice the handshake does all four operations from lesson 0: hashing, asymmetric encryption, signature verification, and finally symmetric encryption.',
      },
      {
        id: 'p6-l4-s5',
        title: 'Concept — HTTPS is HTTP over TLS',
        body: 'HTTPS is not a separate protocol with its own rules. It is ordinary HTTP carried inside a TLS session — the same requests, the same headers, the same status codes, wrapped in the encryption the handshake established. This matters practically: everything you learned about HTTP in Phase 1 still applies, and a WAF inspecting HTTPS traffic is inspecting decrypted HTTP after the proxy terminated TLS. The "S" is the transport, not a different application protocol.',
      },
      {
        id: 'p6-l4-s6',
        title: 'Scenario — Reading a certificate failure',
        body: 'A browser reports a certificate error. Which check failed? Expired means the validity period passed — a lifecycle failure. Name mismatch means the certificate is for a different hostname. Untrusted issuer means the chain does not reach a root in the trust store, common with an internal CA not distributed to clients. Revoked means the CA has withdrawn it. Four very different problems behind one warning.',
      },
      {
        id: 'p6-l4-s7',
        title: 'Review — What must stick',
        body: 'A certificate binds a public key to a name and is signed by a CA. Trust chains from leaf through intermediates to a pre-trusted root, and intermediates keep the root key offline. Lifecycle: generate, CSR, issue, deploy, renew before expiry, revoke on compromise. Validation checks chain, time, name, revocation, and purpose. The TLS handshake authenticates, agrees an ephemeral key, then switches to symmetric.',
      },
    ],
    quiz: [
      {
        id: 'p6-q15',
        type: 'mcq',
        stem: 'What does a certificate authority actually attest to when it signs a certificate?',
        options: [
          'That the website content is safe',
          'That the public key in the certificate belongs to the named subject',
          'That the server is free of vulnerabilities',
          'That the connection will be encrypted',
        ],
        answer: 1,
        explanation:
          'A CA vouches for the binding between a key and an identity, nothing more. It makes no claim about the safety or honesty of the site — which is why a phishing site can hold a perfectly valid certificate.',
        examClue: 'A certificate proves control of a name, never trustworthiness of the operator.',
        domain: 'General Security Concepts',
        conceptId: 'certificate-authority',
      },
      {
        id: 'p6-q16',
        type: 'scenario',
        stem: 'Why do CAs sign leaf certificates with intermediate certificates rather than directly with the root?',
        options: [
          'It makes validation faster',
          'The root private key can stay offline, and a compromised intermediate can be revoked without invalidating everything the root signed',
          'Roots are not permitted to sign leaf certificates',
          'It reduces the certificate file size',
        ],
        answer: 1,
        explanation:
          'The root key is the ultimate trust anchor and is kept offline. Intermediates do the day-to-day signing and are individually revocable, which contains the damage of a compromise.',
        domain: 'Security Architecture',
        conceptId: 'pki',
      },
      {
        id: 'p6-q17',
        type: 'scenario',
        stem: 'A browser shows a certificate error stating the issuer is not trusted, on an internal application. What is the most likely cause?',
        options: [
          'The certificate has expired',
          'The certificate was issued by an internal CA whose root is not in the client trust store',
          'The hostname does not match',
          'The certificate has been revoked',
        ],
        answer: 1,
        explanation:
          'An untrusted issuer means the chain does not reach a root the client already trusts. For internal CAs the fix is distributing the root to client trust stores, not disabling the warning.',
        domain: 'Security Operations',
        conceptId: 'certificates',
      },
      {
        id: 'p6-q18',
        type: 'pbq',
        stem: 'Order the TLS handshake steps: [0] Switch to symmetric encryption for application data, [1] Client offers supported versions and cipher suites, [2] Client validates the certificate chain, [3] Server presents its certificate and cipher choice, [4] Ephemeral key exchange derives session keys.',
        options: [
          'Client offers supported versions and cipher suites',
          'Server presents its certificate and cipher choice',
          'Client validates the certificate chain',
          'Ephemeral key exchange derives session keys',
          'Switch to symmetric encryption for application data',
        ],
        answer: [1, 3, 2, 4, 0],
        explanation:
          'Offer, select and present, validate, exchange, then switch to symmetric. Validation must precede the key exchange completing — agreeing a key with an unverified server would defeat the point.',
        domain: 'Security Architecture',
        conceptId: 'tls',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p6-lab-0',
    phaseId: 'phase-6',
    title: 'Distinguish Encryption, Hashing, Encoding and Signing',
    objective:
      'Apply all four operations to the same message, compare the outputs, and classify unfamiliar artifacts correctly.',
    securityConcepts: ['Encryption', 'Hashing', 'Encoding', 'Digital signatures'],
    environment: 'Deterministic simulator with real, verifiable digest and encoding values',
    topology: 'One sample message transformed four ways',
    prerequisites: ['Complete Phase 5'],
    steps: [
      {
        id: 's0',
        instruction:
          'Compare the four operations by reversibility, key use, and property provided.',
        command: 'compare crypto operations',
        expected: 'Four rows; only encoding provides no security property.',
      },
      {
        id: 's1',
        instruction: 'Hash the sample message and note the digest length.',
        command: 'hash sample',
        expected: 'A 64-character SHA-256 digest you can verify independently.',
      },
      {
        id: 's2',
        instruction: 'Change one character and hash again to see the avalanche effect.',
        command: 'hash tampered',
        expected: 'A completely different digest, not a similar one.',
      },
      {
        id: 's3',
        instruction: 'Encode the same message and compare against the hash.',
        command: 'encode sample',
        expected: 'Base64 output, trivially reversible with no key.',
      },
      {
        id: 's4',
        instruction: 'Open the Crypto Workbench and complete the classification exercise.',
        expected: 'Eight artifacts classified into the four operations, with rationale.',
      },
    ],
    expectedResults: [
      'Four operations distinguished by reversibility and key use',
      'Avalanche effect observed directly',
      'Encoding recognised as providing no security',
      'Classification exercise completed',
    ],
    verification: [
      'Learner can state the two questions that separate all four operations',
      'Learner can explain why "one-way encryption" is a misleading phrase',
      'Learner can identify a digest by its constant length',
    ],
    troubleshooting: [
      'Digest looks like ciphertext → check the length. Digests are constant; ciphertext grows with input.',
      'Unsure whether something is encoding → ask whether a key is needed. No key means no confidentiality.',
    ],
    challenge:
      'A developer says user data is "encrypted with Base64". Write the three sentences you would send them: what Base64 actually is, what it does and does not provide, and what they should use instead for the requirement they actually have.',
    evidence: [
      {
        id: 'ev0',
        label: 'Operation comparison',
        type: 'report',
        placeholder: 'Operation, reversible?, key?, provides, common misuse',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Two questions place any cryptographic operation: is it reversible, and does it need a key. Everything else is detail. The single most expensive confusion in this space is treating encoding as if it were encryption.',
  },

  {
    id: 'p6-lab-1',
    phaseId: 'phase-6',
    title: 'Symmetric, Asymmetric and Key Exchange',
    objective:
      'Compare symmetric with asymmetric cryptography, examine key strengths, and explain why every real system is hybrid.',
    securityConcepts: ['AES', 'RSA', 'ECC', 'Key exchange', 'Forward secrecy'],
    environment: 'Deterministic simulator — all key material redacted',
    topology: 'Reference cryptographic configuration',
    prerequisites: ['Complete "Distinguish Encryption, Hashing, Encoding and Signing"'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare symmetric and asymmetric cryptography on speed and purpose.',
        command: 'compare symmetric asymmetric',
        expected: 'Symmetric is fast and does the bulk work; asymmetric bootstraps trust.',
      },
      {
        id: 's1',
        instruction: 'Compare key strengths across algorithms.',
        command: 'show key strengths',
        expected: '256-bit ECC roughly equivalent to 3072-bit RSA.',
      },
      {
        id: 's2',
        instruction: 'Review how ephemeral key exchange provides forward secrecy.',
        command: 'explain forward secrecy',
        expected: 'Recorded traffic stays unreadable even if the long-term key is later stolen.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the encrypted response you saw in Phase 1.',
        command: 'curl -i https://srv-01.lab.local',
        expected: 'TLS response — this lab explains the machinery behind it.',
      },
    ],
    expectedResults: [
      'Symmetric and asymmetric roles distinguished',
      'Key strength equivalences understood',
      'Forward secrecy explained as a threat-model property',
      'Phase 1 TLS response connected to Phase 6 mechanics',
    ],
    verification: [
      'Learner can state the key distribution problem in one sentence',
      'Learner can explain why systems are hybrid',
      'Learner can explain what forward secrecy protects against specifically',
    ],
    troubleshooting: [
      'Confused about which key encrypts → recipient public key for confidentiality, your private key for signing.',
      'Forward secrecy feels abstract → the threat is retroactive decryption of recorded traffic.',
    ],
    challenge:
      'A TLS configuration review offers RSA key transport or ECDHE. Write the recommendation in four sentences, naming the specific threat that decides it and what an attacker would have to do for the weaker option to hurt you.',
    evidence: [
      {
        id: 'ev0',
        label: 'Cryptographic recommendation',
        type: 'report',
        placeholder: 'Option, property, threat addressed, recommendation',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      "Asymmetric cryptography establishes trust; symmetric cryptography does the work. Forward secrecy is the property that makes today's recorded traffic safe from tomorrow's key compromise, and it costs nothing to enable.",
  },

  {
    id: 'p6-lab-2',
    phaseId: 'phase-6',
    title: 'Certificates, PKI and the Trust Chain',
    objective:
      'Inspect a certificate, walk the chain to its root, and diagnose the four distinct causes of a certificate error.',
    securityConcepts: ['PKI', 'Certificate authority', 'Chain of trust', 'Certificate lifecycle'],
    environment: 'Deterministic simulator — certificate structure with key material redacted',
    topology: 'srv-01.lab.local leaf → internal intermediate → internal root',
    prerequisites: ['Complete "Symmetric, Asymmetric and Key Exchange"'],
    steps: [
      {
        id: 's0',
        instruction: 'Inspect the server certificate.',
        command: 'show certificate srv-01',
        expected: 'Subject, issuer, validity, key usage, SAN — public key redacted.',
      },
      {
        id: 's1',
        instruction: 'Walk the chain from leaf to root.',
        command: 'show certificate chain',
        expected: 'Three certificates; the root is self-signed and pre-trusted.',
      },
      {
        id: 's2',
        instruction: 'Review the certificate lifecycle including revocation.',
        command: 'show certificate lifecycle',
        expected: 'Generate, CSR, issue, deploy, renew, revoke — with expiry as an outage.',
      },
      {
        id: 's3',
        instruction: 'Review the four distinct causes of a certificate error.',
        command: 'diagnose certificate errors',
        expected: 'Expired, name mismatch, untrusted issuer, revoked — different fixes each.',
      },
    ],
    expectedResults: [
      'Certificate fields read and interpreted',
      'Chain walked from leaf to trusted root',
      'Lifecycle understood with renewal before expiry',
      'Four error causes distinguished',
    ],
    verification: [
      'Learner can explain what a CA actually attests to',
      'Learner can explain why intermediates exist',
      'Learner can name which validation check produced a given error',
    ],
    troubleshooting: [
      'Certificate error on an internal site → most often an internal root missing from the client trust store.',
      'Wondering why a phishing site has a valid certificate → a certificate proves control of a name, not honesty.',
    ],
    challenge:
      'Your organisation runs an internal CA. Write the four steps required so that internal HTTPS sites do not produce warnings on managed devices, and explain what would go wrong if the root private key were kept online.',
    evidence: [
      {
        id: 'ev0',
        label: 'Certificate analysis',
        type: 'report',
        placeholder: 'Subject, issuer, validity, chain, validation checks',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'A certificate proves that a CA vouched for a key-to-name binding. It says nothing about whether the operator is honest — which is why the padlock never meant safe, and why Phase 3 phishing sites had perfectly valid certificates.',
  },

  {
    id: 'p6-lab-3',
    phaseId: 'phase-6',
    title: 'Trace the TLS Handshake',
    objective:
      'Follow a TLS handshake step by step, name what each step establishes, and identify all four cryptographic operations within it.',
    securityConcepts: ['TLS', 'HTTPS', 'Key exchange', 'Certificate validation'],
    environment: 'Deterministic simulator — prepared handshake trace',
    topology: 'WS-01 client → srv-01.lab.local, TLS 1.3',
    prerequisites: ['Complete "Certificates, PKI and the Trust Chain"'],
    steps: [
      {
        id: 's0',
        instruction: 'Trace the full handshake.',
        command: 'trace tls handshake',
        expected: 'Client hello through to encrypted application data.',
      },
      {
        id: 's1',
        instruction: 'Confirm which certificate the server presented.',
        command: 'show certificate srv-01',
        expected: 'The leaf certificate validated during the handshake.',
      },
      {
        id: 's2',
        instruction: 'Confirm the key exchange provides forward secrecy.',
        command: 'explain forward secrecy',
        expected: 'Ephemeral exchange; session keys discarded after use.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the Phase 1 connection path this extends.',
        command: 'trace connection ws-01 srv-01',
        expected: 'Step 8 of that path is the handshake this lab expands.',
      },
    ],
    expectedResults: [
      'Handshake traced end to end',
      'All four cryptographic operations located within it',
      'Forward secrecy confirmed in the exchange',
      'Phase 1 path connected to Phase 6 mechanics',
    ],
    verification: [
      'Learner can order the handshake steps',
      'Learner can explain why validation must precede key agreement',
      'Learner can point to where each of the four operations occurs',
    ],
    troubleshooting: [
      'Unsure why both crypto types appear → asymmetric authenticates and agrees the key; symmetric protects the data.',
      'Handshake order unclear → offer, select, validate, exchange, switch.',
    ],
    challenge:
      'Find all four operations from lesson 0 inside the handshake — hashing, encoding, encryption, and signing — and name the exact step where each appears. One of them appears more than once; say where and why.',
    evidence: [
      {
        id: 'ev0',
        label: 'Handshake analysis',
        type: 'report',
        placeholder: 'Step, what it establishes, which operation is in use',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The TLS handshake is the whole phase in one exchange: hashing, asymmetric key agreement, signature verification, and a switch to symmetric encryption. Understanding it once means understanding why every piece exists.',
  },
];

export const PHASE_6: Phase = {
  id: 'phase-6',
  number: 6,
  title: 'Cryptography & PKI',
  description:
    'The machinery underneath everything earlier phases relied on. Four operations that get constantly confused, symmetric and asymmetric cryptography, hashing and signatures, and the certificate trust chain that makes TLS possible.',
  examDomain: 'General Security Concepts',
  scene: 'tls',
  lessons: LESSONS,
  labs: LABS,
};
