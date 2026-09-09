import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  IDENTITY_LIFECYCLE,
  allFailureModes,
  getLifecycleStage,
  stagesForJML,
} from '../src/data/identityLifecycle';
import { IAM_INCIDENTS, getIncident } from '../src/data/iamIncidents';
import { PHASE_5 } from '../src/data/phase5';
import { gradeDiagnosis, isDiagnosisComplete, type Diagnosis } from '../src/lib/troubleshootEngine';
import { IdentityView } from '../src/components/IdentityView';
import { IamTroubleshootView } from '../src/components/IamTroubleshootView';
import { IdentityFallback2D } from '../src/scenes/IdentityFallback2D';
import { LabView } from '../src/components/LabView';
import { QuizView } from '../src/components/QuizView';
import { PHASE_5_COMMANDS } from '../src/sim/phase5Commands';
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

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ progress: {} });
  useMasteryStore.setState({ mastery: {} });
  __setWebGLAvailable(false);
});

describe('Phase 5 content safety', () => {
  const allText = PHASE_5_COMMANDS.map((c) => `${c.output} ${c.teaches ?? ''}`).join('\n');

  it('redacts all signatures and key material', () => {
    // SAML and OIDC artifacts teach structure; they must never carry usable bytes.
    expect(runCommand('show saml assertion').output).toMatch(/\[REDACTED/);
    expect(runCommand('show oidc token').output).toMatch(/\[REDACTED/);
    expect(allText).not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
  });

  it('never displays a password hash or credential value', () => {
    expect(allText).not.toMatch(/\$2[aby]\$\d{2}\$/); // bcrypt
    expect(allText).not.toMatch(/[0-9a-f]{32}:[0-9a-f]{32}/i); // LM:NT pair
    expect(allText).not.toMatch(/bearer\s+[A-Za-z0-9._~+/-]{20,}/);
    // The directory artifact says so explicitly.
    expect(runCommand('show ad user priya.raman').output).toMatch(/no password hash is displayed/i);
  });

  it('shows the Kerberos cache without session keys', () => {
    const out = runCommand('klist').output;
    expect(out).toMatch(/Session keys are not displayed/);
  });
});

describe('Phase 5 curriculum', () => {
  it('teaches every topic PROMPT.md lists for this phase', () => {
    const text = PHASE_5.lessons
      .flatMap((l) => [l.title, ...l.objectives, ...l.sections.map((s) => `${s.title} ${s.body}`)])
      .join(' ')
      .toLowerCase();

    const required = [
      'identity',
      'authentication',
      'authoris', // authorisation / authorization, British spelling used throughout
      'accounting',
      'mfa',
      'sso',
      'federation',
      'saml',
      'oauth',
      'openid connect',
      'ldap',
      'active directory',
      'kerberos',
      'rbac',
      'abac',
      'least privilege',
      'pam',
      'password',
      'lifecycle',
      'joiner',
      'mover',
      'leaver',
      'provisioning',
      'deprovisioning',
      'service account',
      'machine identit',
      'certificate',
      'identity provider',
      'conditional access',
      'zero trust',
    ];

    for (const topic of required) {
      expect(text, `Phase 5 never mentions "${topic}"`).toContain(topic);
    }
  });

  it('ships the depth a major career component warrants', () => {
    expect(PHASE_5.lessons).toHaveLength(6);
    expect(PHASE_5.labs).toHaveLength(5);
    const questions = PHASE_5.lessons.flatMap((l) => l.quiz);
    expect(questions.length).toBeGreaterThanOrEqual(20);
  });
});

describe('identity lifecycle data', () => {
  it('models the nine stages PROMPT.md specifies, in order', () => {
    expect(IDENTITY_LIFECYCLE.map((s) => s.id)).toEqual([
      'hr-system',
      'identity-platform',
      'account-creation',
      'mfa',
      'sso',
      'application-access',
      'authorization',
      'audit-logs',
      'deprovisioning',
    ]);
    expect(IDENTITY_LIFECYCLE.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('gives every stage a system, what it produces, controls, and failure modes', () => {
    for (const s of IDENTITY_LIFECYCLE) {
      expect(s.system.length, `${s.id} has no system`).toBeGreaterThan(0);
      expect(s.produces.length, `${s.id} produces nothing`).toBeGreaterThan(0);
      expect(s.controls.length, `${s.id} has no controls`).toBeGreaterThan(0);
      expect(s.failureModes.length, `${s.id} has no failure modes`).toBeGreaterThan(0);
    }
  });

  it('gives every failure mode a symptom, a cause, and a fix', () => {
    for (const f of allFailureModes()) {
      expect(f.symptom.length).toBeGreaterThan(10);
      expect(f.cause.length).toBeGreaterThan(10);
      expect(f.fix.length).toBeGreaterThan(10);
    }
  });

  it('places stages around the ring without collisions', () => {
    const angles = IDENTITY_LIFECYCLE.map((s) => s.angle);
    expect(new Set(angles).size).toBe(angles.length);
  });

  it('assigns each stage to at least one JML flow', () => {
    for (const s of IDENTITY_LIFECYCLE) {
      expect(s.jml.length, `${s.id} belongs to no flow`).toBeGreaterThan(0);
    }
  });

  it('scopes the joiner, mover and leaver flows to different stage sets', () => {
    const joiner = stagesForJML('joiner').map((s) => s.id);
    const leaver = stagesForJML('leaver').map((s) => s.id);

    expect(joiner).toContain('mfa');
    expect(joiner).not.toContain('deprovisioning');
    expect(leaver).toContain('deprovisioning');
    expect(leaver).not.toContain('mfa');
  });

  it('resolves a stage by id', () => {
    expect(getLifecycleStage('sso')?.title).toBe('SSO / Federation');
    // @ts-expect-error probing an invalid id at runtime
    expect(getLifecycleStage('nope')).toBeUndefined();
  });
});

describe('IAM incident data', () => {
  it('names a correct stage that exists in the lifecycle', () => {
    const ids = new Set(IDENTITY_LIFECYCLE.map((s) => s.id));
    for (const inc of IAM_INCIDENTS) {
      expect(ids, `${inc.id} names unknown stage ${inc.correctStage}`).toContain(inc.correctStage);
    }
  });

  it('defines exactly one correct cause and one correct fix per incident', () => {
    for (const inc of IAM_INCIDENTS) {
      expect(inc.causeOptions.filter((o) => o.correct)).toHaveLength(1);
      expect(inc.fixOptions.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it('gives every option a rationale, including the wrong ones', () => {
    for (const inc of IAM_INCIDENTS) {
      for (const o of [...inc.causeOptions, ...inc.fixOptions]) {
        expect(o.rationale.length, `${inc.id}/${o.id} rationale too thin`).toBeGreaterThan(40);
      }
    }
  });

  it('supplies evidence that makes the diagnosis decidable', () => {
    for (const inc of IAM_INCIDENTS) {
      expect(inc.evidence.length, `${inc.id} has too little evidence`).toBeGreaterThanOrEqual(4);
    }
  });

  it('resolves an incident by id', () => {
    expect(getIncident('p5-incident-0')?.correctStage).toBe('deprovisioning');
    expect(getIncident('nope')).toBeUndefined();
  });
});

describe('troubleshoot engine', () => {
  const incident = IAM_INCIDENTS[0];
  const perfect: Diagnosis = {
    stage: incident.correctStage,
    cause: incident.causeOptions.find((o) => o.correct)!.id,
    fix: incident.fixOptions.find((o) => o.correct)!.id,
  };

  it('scores a fully correct diagnosis', () => {
    const result = gradeDiagnosis(incident, perfect);
    expect(result.correctCount).toBe(3);
    expect(result.percentage).toBe(100);
  });

  it('scores an empty diagnosis as zero rather than crashing', () => {
    const result = gradeDiagnosis(incident, {});
    expect(result.correctCount).toBe(0);
    expect(result.fields).toHaveLength(3);
    expect(result.fields.every((f) => !f.answered)).toBe(true);
  });

  it('explains the learner own wrong choice before correcting it', () => {
    const wrongCause = incident.causeOptions.find((o) => !o.correct)!;
    const result = gradeDiagnosis(incident, { ...perfect, cause: wrongCause.id });
    const cause = result.fields.find((f) => f.field === 'cause')!;

    expect(cause.correct).toBe(false);
    expect(cause.rationale.startsWith(wrongCause.rationale)).toBe(true);
    expect(cause.rationale).toContain('The correct answer is');
  });

  it('grades the stage independently of the cause and fix', () => {
    const result = gradeDiagnosis(incident, { ...perfect, stage: 'mfa' });
    expect(result.fields.find((f) => f.field === 'stage')!.correct).toBe(false);
    expect(result.fields.find((f) => f.field === 'cause')!.correct).toBe(true);
    expect(result.correctCount).toBe(2);
  });

  it('requires all three parts before a diagnosis is complete', () => {
    expect(isDiagnosisComplete({})).toBe(false);
    expect(isDiagnosisComplete({ stage: 'mfa', cause: 'c0' })).toBe(false);
    expect(isDiagnosisComplete(perfect)).toBe(true);
  });
});

describe('Phase 5 simulated evidence', () => {
  it('traces all nine lifecycle stages', () => {
    const out = runCommand('trace identity lifecycle').output;
    for (const stage of IDENTITY_LIFECYCLE) {
      expect(out.toUpperCase(), `${stage.title} missing`).toContain(
        stage.title.toUpperCase().split(' /')[0].split(' ')[0]
      );
    }
  });

  it('separates disable from revoke in the leaver flow', () => {
    const out = runCommand('show leaver flow').output;
    expect(out).toMatch(/Disable the account/);
    expect(out).toMatch(/Revoke sessions and tokens/);
    expect(out).toMatch(/DIFFERENT ACTIONS/);
  });

  it('marks only FIDO2 as relay-resistant', () => {
    const out = runCommand('compare mfa factors').output;
    expect(out).toMatch(/FIDO2 \/ WebAuthn\s+Have\s+NO/);
    expect(out).toMatch(/Push approval\s+Have\s+YES/);
  });

  it('distinguishes an ID token from an access token', () => {
    const out = runCommand('show oidc token').output;
    expect(out).toMatch(/states WHO the user is/);
    expect(out).toMatch(/Never use an access token as proof of identity/);
  });

  it('shows privilege creep against a peer median', () => {
    const out = runCommand('show access review').output;
    expect(out).toMatch(/47/);
    expect(out).toMatch(/PEER MEDIAN/);
    expect(out).toMatch(/systemic/);
  });

  it('distinguishes reconciliation from access review', () => {
    const out = runCommand('show orphaned accounts').output;
    expect(out).toMatch(/Reconciliation finds accounts NOBODY KNOWS ABOUT/);
    expect(out).toMatch(/different controls/);
  });

  it('lists the three Kerberos failure causes in order', () => {
    const out = runCommand('explain kerberos flow').output;
    expect(out.indexOf('Clock skew')).toBeLessThan(out.indexOf('SPN missing'));
    expect(out.indexOf('SPN missing')).toBeLessThan(out.indexOf('DNS misresolution'));
  });
});

describe('IdentityFallback2D', () => {
  it('renders one accessible control per lifecycle stage', () => {
    render(<IdentityFallback2D selectedId={null} onSelect={() => {}} />);
    expect(screen.getAllByRole('button', { name: /^Inspect stage / })).toHaveLength(
      IDENTITY_LIFECYCLE.length
    );
  });

  it('reports the selected stage', async () => {
    const user = userEvent.setup({ delay: null });
    const seen: string[] = [];
    render(<IdentityFallback2D selectedId={null} onSelect={(id) => seen.push(id)} />);

    await user.click(screen.getByRole('button', { name: /Inspect stage 9 Deprovisioning/ }));
    expect(seen).toEqual(['deprovisioning']);
  });
});

describe('IdentityView', () => {
  it('falls back to the 2D lifecycle when WebGL is unavailable', () => {
    renderAt('/identity', '/identity', <IdentityView />);
    expect(screen.getByTestId('identity-fallback-2d')).toBeInTheDocument();
  });

  it('shows a stage with what it produces, its controls, and how it fails', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/identity', '/identity', <IdentityView />);

    await user.click(screen.getByRole('button', { name: '9. Deprovisioning' }));

    expect(screen.getByRole('heading', { name: /Stage 9 — Deprovisioning/ })).toBeInTheDocument();
    expect(screen.getByText('How this stage fails')).toBeInTheDocument();
    expect(screen.getByText(/still accesses an application days later/)).toBeInTheDocument();
  });

  it('narrows the stage list when a JML flow is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/identity', '/identity', <IdentityView />);

    expect(screen.getByTestId('flow-stage-count')).toHaveTextContent('9 of 9');

    await user.click(screen.getByRole('button', { name: 'Leaver' }));
    const leaverCount = stagesForJML('leaver').length;
    expect(screen.getByTestId('flow-stage-count')).toHaveTextContent(`${leaverCount} of 9`);
  });
});

describe('IamTroubleshootView', () => {
  it('renders the first incident with its evidence', () => {
    renderAt('/iam-troubleshoot', '/iam-troubleshoot', <IamTroubleshootView />);

    expect(screen.getByText('The leaver who still has access')).toBeInTheDocument();
    expect(screen.getByText('Evidence')).toBeInTheDocument();
    expect(
      screen.getByText(/No sign-in event appears at the identity provider/)
    ).toBeInTheDocument();
  });

  it('blocks submission until all three parts are answered', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-troubleshoot', '/iam-troubleshoot', <IamTroubleshootView />);

    const submit = screen.getByRole('button', { name: 'Submit diagnosis' });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Stage: 9. Deprovisioning' }));
    expect(screen.getByText('1 of 3 parts answered')).toBeInTheDocument();
    expect(submit).toBeDisabled();
  });

  it('grades a correct diagnosis and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-troubleshoot', '/iam-troubleshoot', <IamTroubleshootView />);

    const incident = IAM_INCIDENTS[0];
    await user.click(screen.getByRole('button', { name: 'Stage: 9. Deprovisioning' }));
    await user.click(
      screen.getByRole('button', {
        name: `Root cause: ${incident.causeOptions.find((o) => o.correct)!.text}`,
      })
    );
    await user.click(
      screen.getByRole('button', {
        name: `Correct fix: ${incident.fixOptions.find((o) => o.correct)!.text}`,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Submit diagnosis' }));

    expect(screen.getByTestId('diagnosis-score')).toHaveTextContent('3/3');
    expect(screen.getByText('Debrief')).toBeInTheDocument();
    expect(useMasteryStore.getState().getLevel('deprovisioning')).toBe(1);
  });

  it('withholds mastery credit when any part is wrong', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-troubleshoot', '/iam-troubleshoot', <IamTroubleshootView />);

    const incident = IAM_INCIDENTS[0];
    // Right cause and fix, wrong stage — an incident is not solved by luck.
    await user.click(screen.getByRole('button', { name: 'Stage: 4. MFA Enrolment' }));
    await user.click(
      screen.getByRole('button', {
        name: `Root cause: ${incident.causeOptions.find((o) => o.correct)!.text}`,
      })
    );
    await user.click(
      screen.getByRole('button', {
        name: `Correct fix: ${incident.fixOptions.find((o) => o.correct)!.text}`,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Submit diagnosis' }));

    expect(screen.getByTestId('diagnosis-score')).toHaveTextContent('2/3');
    expect(useMasteryStore.getState().getLevel('deprovisioning')).toBe(0);
  });

  it('moves between incidents and clears the previous diagnosis', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/iam-troubleshoot', '/iam-troubleshoot', <IamTroubleshootView />);

    await user.click(screen.getByRole('button', { name: /2\. The mover who kept everything/ }));
    expect(screen.getByText(/Daniel Okonkwo/)).toBeInTheDocument();
    expect(screen.getByText('0 of 3 parts answered')).toBeInTheDocument();
  });
});

describe('Phase 5 labs and quizzes', () => {
  it('traces the lifecycle in the design lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p5-lab-0', '/lab/:labId', <LabView />);

    await user.type(
      screen.getByLabelText('Simulated command input'),
      'trace identity lifecycle{Enter}'
    );

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/\[9\] DEPROVISIONING/)).toBeInTheDocument();
  });

  it('reads the Kerberos ticket cache in the directory lab', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/lab/p5-lab-2', '/lab/:labId', <LabView />);

    await user.type(screen.getByLabelText('Simulated command input'), 'klist{Enter}');

    const transcript = screen.getByTestId('lab-transcript');
    expect(within(transcript).getByText(/ticket-granting ticket/)).toBeInTheDocument();
  });

  it('grades the federation quiz and records mastery', async () => {
    const user = userEvent.setup({ delay: null });
    renderAt('/quiz/p5-lesson-2', '/quiz/:lessonId', <QuizView />);

    await user.click(
      screen.getByRole('button', {
        name: 'OAuth grants delegated authorisation; the token states what the bearer may do, not who they are',
      })
    );
    expect(screen.getByText('Correct')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit quiz/ }));
    expect(useMasteryStore.getState().getLevel('oauth')).toBe(1);
  });
});
