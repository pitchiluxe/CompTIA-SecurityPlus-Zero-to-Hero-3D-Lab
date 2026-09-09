import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  CLASSIFY_ITEMS,
  CRYPTO_CHAIN,
  CRYPTO_OPERATIONS,
  SAMPLE_BASE64,
  SAMPLE_PLAINTEXT,
  SAMPLE_SHA256,
  SAMPLE_TAMPERED,
  TAMPERED_SHA256,
  getChainStage,
  getClassifyItem,
  getOperation,
} from '../src/data/cryptoOperations';
import { TLS_HANDSHAKE, getHandshakeStep, stepsUsingOperation } from '../src/data/tlsHandshake';
import { PHASE_6 } from '../src/data/phase6';
import {
  countAnswered,
  gradeClassification,
  isClassificationComplete,
  type ClassifyAnswer,
} from '../src/lib/cryptoClassify';
import { CryptoView } from '../src/components/CryptoView';
import { TlsFallback2D } from '../src/scenes/TlsFallback2D';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_6_COMMANDS } from '../src/sim/phase6Commands';
import { runCommand } from '../src/sim/commands';
import { __setWebGLAvailable } from '../src/lib/webgl';
import { useMasteryStore } from '../src/store/useMasteryStore';
import { useProgressStore } from '../src/store/useProgressStore';

function renderAt(path: string, pattern: string, element: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={pattern} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

/** Answer every classification item correctly. */
function perfectClassification(): ClassifyAnswer {
  return Object.fromEntries(CLASSIFY_ITEMS.map((i) => [i.id, i.answer]));
}

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 6 cryptographic values are real', () => {
  // The whole lesson depends on these being verifiable. Inventing them would
  // teach the shape while quietly undermining the point, so they are checked
  // against Node's own crypto implementation.
  it('publishes a genuine SHA-256 digest for the sample message', () => {
    const actual = createHash('sha256').update(SAMPLE_PLAINTEXT).digest('hex');
    expect(SAMPLE_SHA256).toBe(actual);
  });

  it('publishes a genuine digest for the tampered message', () => {
    const actual = createHash('sha256').update(SAMPLE_TAMPERED).digest('hex');
    expect(TAMPERED_SHA256).toBe(actual);
  });

  it('publishes a genuine Base64 encoding of the sample message', () => {
    expect(SAMPLE_BASE64).toBe(Buffer.from(SAMPLE_PLAINTEXT).toString('base64'));
  });

  it('demonstrates the avalanche effect — a one-character change alters the whole digest', () => {
    expect(SAMPLE_TAMPERED.length).toBe(SAMPLE_PLAINTEXT.length + 1);

    // Compare digests position by position: a proportional change would leave
    // most characters intact. The avalanche effect means almost none survive.
    const shared = [...SAMPLE_SHA256].filter((c, i) => c === TAMPERED_SHA256[i]).length;
    expect(shared / SAMPLE_SHA256.length).toBeLessThan(0.25);
  });

  it('keeps digest length constant regardless of input size', () => {
    expect(SAMPLE_SHA256).toHaveLength(64);
    expect(TAMPERED_SHA256).toHaveLength(64);
  });
});

describe('Phase 6 content safety', () => {
  const allText = PHASE_6_COMMANDS.map((c) => `${c.output} ${c.teaches ?? ''}`).join('\n');

  it('contains no private key material', () => {
    expect(allText).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(runCommand('show certificate srv-01').output).toMatch(/\[REDACTED/);
  });

  it('redacts the certificate public key and signature rather than fabricating them', () => {
    const out = runCommand('show certificate srv-01').output;
    expect(out).toMatch(/Public Key: \[REDACTED/);
    expect(out).toMatch(/Signature: \[REDACTED\]/);
  });
});

describe('Phase 6 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_6.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'encryption',
      'hashing',
      'encoding',
      'symmetric',
      'asymmetric',
      'aes',
      'rsa',
      'ecc',
      'sha-256',
      'digital signature',
      'certificate',
      'pki',
      'certificate authority',
      'lifecycle',
      'tls',
      'https',
      'key exchange',
      'key management',
    ];

    for (const topic of required) {
      expect(text, `Phase 6 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('devotes the first lesson to the four-way distinction PROMPT.md asks for', () => {
    const first = PHASE_6.lessons[0];
    expect(first.title).toMatch(/Encryption vs Hashing vs Encoding vs Signing/);
    expect(first.concepts).toEqual(
      expect.arrayContaining(['encryption', 'hashing', 'encoding', 'digital-signatures'])
    );
  });

  it('ships five lessons and four labs', () => {
    expect(PHASE_6.lessons).toHaveLength(5);
    expect(PHASE_6.labs).toHaveLength(4);
  });
});

describe('crypto operation data', () => {
  it('models exactly the four operations', () => {
    expect(CRYPTO_OPERATIONS.map((o) => o.id)).toEqual([
      'encoding',
      'hashing',
      'encryption',
      'signing',
    ]);
  });

  it('separates all four by reversibility and key use', () => {
    // The two questions that place any operation must actually discriminate.
    const signatures = CRYPTO_OPERATIONS.map((o) => `${o.reversible}|${o.needsKey}`);
    expect(new Set(signatures).size).toBe(4);
  });

  it('records that encoding provides no security property', () => {
    const encoding = getOperation('encoding')!;
    expect(encoding.needsKey).toBe(false);
    expect(encoding.doesNotProvide.join(' ')).toMatch(/any security property/i);
  });

  it('records that encryption alone does not provide integrity', () => {
    expect(getOperation('encryption')!.doesNotProvide.join(' ')).toMatch(/integrity/i);
  });

  it('records that signing does not provide confidentiality', () => {
    expect(getOperation('signing')!.doesNotProvide.join(' ')).toMatch(/confidentiality/i);
  });

  it('gives only signing non-repudiation', () => {
    const withNonRepudiation = CRYPTO_OPERATIONS.filter((o) =>
      o.provides.join(' ').toLowerCase().includes('non-repudiation')
    );
    expect(withNonRepudiation.map((o) => o.id)).toEqual(['signing']);
  });

  it('gives every operation a common misuse worth teaching', () => {
    for (const o of CRYPTO_OPERATIONS) {
      expect(o.commonMisuse.length, `${o.id} has no misuse noted`).toBeGreaterThan(60);
    }
  });
});

describe('demonstration chain', () => {
  it('follows the six stages PROMPT.md specifies', () => {
    expect(CRYPTO_CHAIN.map((s) => s.id)).toEqual([
      'plaintext',
      'hash',
      'encryption',
      'signature',
      'certificate',
      'tls',
    ]);
  });

  it('states what each stage adds that the previous one lacked', () => {
    for (const s of CRYPTO_CHAIN) {
      expect(s.adds.length, `${s.id} adds nothing`).toBeGreaterThan(10);
      expect(s.input.length).toBeGreaterThan(0);
      expect(s.output.length).toBeGreaterThan(0);
    }
  });

  it('shows the real digest in the hash stage output', () => {
    expect(getChainStage('hash')!.output).toContain(SAMPLE_SHA256);
  });

  it('maps chain stages to real operations where one applies', () => {
    const ids = new Set(CRYPTO_OPERATIONS.map((o) => o.id));
    for (const s of CRYPTO_CHAIN) {
      if (s.operation) expect(ids).toContain(s.operation);
    }
  });
});

describe('classification exercise data', () => {
  it('covers all four operations', () => {
    const covered = new Set(CLASSIFY_ITEMS.map((i) => i.answer));
    expect(covered.size).toBe(4);
  });

  it('includes the classic traps', () => {
    // Base64 mistaken for encryption, bcrypt mistaken for encryption, and HMAC
    // mistaken for signing are the three that cost people marks and incidents.
    const base64 = CLASSIFY_ITEMS.find((i) => i.artifact === SAMPLE_BASE64)!;
    expect(base64.answer).toBe('encoding');

    const bcrypt = CLASSIFY_ITEMS.find((i) => i.artifact.includes('bcrypt'))!;
    expect(bcrypt.answer).toBe('hashing');

    const hmac = CLASSIFY_ITEMS.find((i) => i.artifact.includes('HMAC'))!;
    expect(hmac.answer).toBe('hashing');
    expect(hmac.rationale).toMatch(/non-repudiation/i);
  });

  it('gives every item a substantive rationale', () => {
    for (const i of CLASSIFY_ITEMS) {
      expect(i.rationale.length, `${i.id} rationale too thin`).toBeGreaterThan(60);
    }
  });

  it('resolves an item by id', () => {
    expect(getClassifyItem('ci0')?.answer).toBe('encoding');
    expect(getClassifyItem('nope')).toBeUndefined();
  });
});

describe('classification grading', () => {
  it('scores a perfect classification', () => {
    const result = gradeClassification(perfectClassification());
    expect(result.correctCount).toBe(CLASSIFY_ITEMS.length);
    expect(result.percentage).toBe(100);
    expect(result.confusedPairs).toHaveLength(0);
  });

  it('scores an empty classification as zero rather than crashing', () => {
    const result = gradeClassification({});
    expect(result.correctCount).toBe(0);
    expect(result.items.every((i) => !i.answered)).toBe(true);
  });

  it('reports which confusions the learner actually made', () => {
    // Call both hashing items encryption — the classic error.
    const answer: ClassifyAnswer = { ...perfectClassification() };
    const hashingItems = CLASSIFY_ITEMS.filter((i) => i.answer === 'hashing');
    for (const i of hashingItems) answer[i.id] = 'encryption';

    const result = gradeClassification(answer);
    const pair = result.confusedPairs.find(
      (p) => p.chose === 'encryption' && p.actual === 'hashing'
    );
    expect(pair?.count).toBe(hashingItems.length);
  });

  it('tracks completeness and answered count', () => {
    expect(isClassificationComplete({})).toBe(false);
    expect(countAnswered({})).toBe(0);
    expect(isClassificationComplete(perfectClassification())).toBe(true);
    expect(countAnswered(perfectClassification())).toBe(CLASSIFY_ITEMS.length);
  });
});

describe('TLS handshake data', () => {
  it('orders eight steps from client hello to application data', () => {
    expect(TLS_HANDSHAKE.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(TLS_HANDSHAKE[0].title).toBe('Client Hello');
    expect(TLS_HANDSHAKE[7].title).toBe('Application data');
  });

  it('uses all four operations across the handshake', () => {
    const used = new Set(TLS_HANDSHAKE.flatMap((s) => s.operations));
    expect(used.size).toBe(4);
  });

  it('validates the certificate before switching to application data', () => {
    const validate = TLS_HANDSHAKE.find((s) => s.title === 'Certificate validation')!;
    const appData = TLS_HANDSHAKE.find((s) => s.title === 'Application data')!;
    expect(validate.order).toBeLessThan(appData.order);
  });

  it('notes that presenting a certificate alone proves nothing', () => {
    expect(getHandshakeStep(3)!.note).toMatch(/proves nothing on its own/i);
    expect(getHandshakeStep(4)!.title).toBe('Certificate Verify');
  });

  it('finds the steps using a given operation', () => {
    const signing = stepsUsingOperation('signing').map((s) => s.order);
    expect(signing).toContain(4);
    expect(stepsUsingOperation('encryption').map((s) => s.order)).toContain(8);
  });
});

describe('Phase 6 simulated evidence', () => {
  it('states the two questions that place any operation', () => {
    const out = runCommand('compare crypto operations').output;
    expect(out).toMatch(/Is it reversible\?/);
    expect(out).toMatch(/Does it need a key\?/);
  });

  it('shows the real digest and a reproducible command', () => {
    const out = runCommand('hash sample').output;
    expect(out).toContain(SAMPLE_SHA256);
    expect(out).toMatch(/sha256sum/);
  });

  it('demonstrates the avalanche effect with both real digests', () => {
    const out = runCommand('hash tampered').output;
    expect(out).toContain(SAMPLE_SHA256);
    expect(out).toContain(TAMPERED_SHA256);
  });

  it('states plainly that Base64 provides no confidentiality', () => {
    const out = runCommand('encode sample').output;
    expect(out).toContain(SAMPLE_BASE64);
    expect(out).toMatch(/NO KEY WAS USED/);
    expect(out).toMatch(/NO confidentiality/);
  });

  it('explains forward secrecy as protection against retroactive decryption', () => {
    const out = runCommand('explain forward secrecy').output;
    expect(out).toMatch(/retroactively/i);
    expect(out).toMatch(/stay unreadable/i);
  });

  it('separates the four causes of a certificate error', () => {
    const out = runCommand('diagnose certificate errors').output;
    for (const cause of ['Expired', 'Name mismatch', 'Untrusted issuer', 'Revoked']) {
      expect(out).toContain(cause);
    }
  });

  it('keeps the handshake transcript consistent with the handshake data', () => {
    const out = runCommand('trace tls handshake').output;
    expect(out).toMatch(/CERT VERIFY/);
    expect(out).toMatch(/ALL FOUR OPERATIONS APPEAR/);
  });
});

describe('TlsFallback2D', () => {
  it('renders one accessible control per handshake step', () => {
    render(<TlsFallback2D selectedOrder={null} onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^Inspect step / })).toHaveLength(
      TLS_HANDSHAKE.length
    );
  });

  it('reports the selected step', async () => {
    const user = userEvent.setup({ delay: null });
    const seen: number[] = [];
    render(<TlsFallback2D selectedOrder={null} onSelect={(o) => seen.push(o)} />);

    await user.click(screen.getByRole('button', { name: /Inspect step 4 Certificate Verify/ }));
    expect(seen).toEqual([4]);
  });
});

describe('CryptoView', () => {
  it('opens on the four operations with their misuses', () => {
    renderAt('/crypto', '/crypto', <CryptoView />);

    expect(screen.getByRole('heading', { name: 'Encoding' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Digital signing' })).toBeInTheDocument();
    expect(screen.getAllByText(/Common misuse:/)).toHaveLength(4);
  });

  it('walks the demonstration chain and shows the real digest', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'Demonstration chain' }));
    await user.click(screen.getByRole('button', { name: '2. Hash' }));

    expect(screen.getByTestId('chain-output')).toHaveTextContent(SAMPLE_SHA256);
  });

  it('blocks classification submission until every artifact is classified', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'Classify the artifact' }));
    expect(screen.getByRole('button', { name: 'Submit classification' })).toBeDisabled();
    expect(screen.getByText(`0 of ${CLASSIFY_ITEMS.length} classified`)).toBeInTheDocument();
  });

  it('grades a perfect classification and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'Classify the artifact' }));
    for (const item of CLASSIFY_ITEMS) {
      const op = getOperation(item.answer)!;
      await user.click(
        screen.getByRole('button', { name: `${item.artifact.slice(0, 32)}: ${op.title}` })
      );
    }
    await user.click(screen.getByRole('button', { name: 'Submit classification' }));

    expect(screen.getByTestId('classify-score')).toHaveTextContent(`${CLASSIFY_ITEMS.length}/`);
    expect(useMasteryStore.getState().getLevel('encoding')).toBe(1);
    expect(useMasteryStore.getState().getLevel('hashing')).toBe(1);
  });

  it('names the confusion when the learner mixes hashing with encryption', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'Classify the artifact' }));
    for (const item of CLASSIFY_ITEMS) {
      // Deliberately call every hashing artifact encryption.
      const chosen = item.answer === 'hashing' ? 'encryption' : item.answer;
      const op = getOperation(chosen)!;
      await user.click(
        screen.getByRole('button', { name: `${item.artifact.slice(0, 32)}: ${op.title}` })
      );
    }
    await user.click(screen.getByRole('button', { name: 'Submit classification' }));

    expect(screen.getByText('Confusions to review')).toBeInTheDocument();
    expect(screen.getByText(/You called hashing/)).toBeInTheDocument();
    expect(useMasteryStore.getState().getLevel('hashing')).toBe(0);
  });

  it('falls back to the 2D sequence diagram on the TLS tab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'TLS handshake' }));
    expect(screen.getByTestId('tls-fallback-2d')).toBeInTheDocument();
    expect(screen.getByText(/WebGL is unavailable/)).toBeInTheDocument();
  });

  it('shows a handshake step with what it establishes and the operations used', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/crypto', '/crypto', <CryptoView />);

    await user.click(screen.getByRole('button', { name: 'TLS handshake' }));
    await user.click(screen.getByRole('button', { name: '4. Certificate Verify' }));

    expect(
      screen.getByRole('heading', { name: /Step 4 — Certificate Verify/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Operations used here')).toBeInTheDocument();
    expect(screen.getByText(/most often miss/)).toBeInTheDocument();
  });
});

describe('Phase 6 labs and quizzes', () => {
  it('shows the avalanche effect in the discrimination lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p6-lab-0', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'hash tampered{Enter}');

    // The phrase appears in both the output header and the teaching note.
    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getAllByText(/avalanche effect/i).length).toBeGreaterThan(0);
    expect(within(transcript).getByText(new RegExp(TAMPERED_SHA256))).toBeInTheDocument();
  });

  it('walks the chain of trust in the PKI lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p6-lab-2', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'show certificate chain{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/Private key held OFFLINE/)).toBeInTheDocument();
  });

  it('grades the four-way distinction quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p6-lesson-0', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'It is Base64 encoding, which requires no key and is trivially reversible by anyone',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('encoding')).toBe(1);
  });
});
