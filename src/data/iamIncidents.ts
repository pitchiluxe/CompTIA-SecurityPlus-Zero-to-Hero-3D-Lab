import type { LifecycleStageId } from './identityLifecycle';

// ---------------------------------------------------------------------------
// Phase 5 — IAM troubleshooting scenarios.
//
// PROMPT.md: "Make the learner design and troubleshoot the workflow."
//
// Each incident presents a symptom plus observable evidence. The learner
// diagnoses three things in order: which lifecycle stage failed, the root
// cause, and the correct fix. Diagnosing the stage first matters — an engineer
// who cannot localise a fault will fix the wrong layer.
//
// All people and systems are fictional.
// ---------------------------------------------------------------------------

export type DiagnosisOption = {
  id: string;
  text: string;
  correct: boolean;
  /** Why this is right, or the specific misconception it represents. */
  rationale: string;
};

export type IamIncident = {
  id: string;
  title: string;
  /** What the user or service desk reports. */
  symptom: string;
  /** Observable facts the learner reasons over. */
  evidence: string[];
  correctStage: LifecycleStageId;
  /** Why that stage, revealed after grading. */
  stageRationale: string;
  causeOptions: DiagnosisOption[];
  fixOptions: DiagnosisOption[];
  debrief: string;
  conceptIds: string[];
};

export const IAM_INCIDENTS: IamIncident[] = [
  {
    id: 'p5-incident-0',
    title: 'The leaver who still has access',
    symptom:
      'A manager reports that Priya Raman, who left the company nine days ago, opened a document in the finance application yesterday. Her Active Directory account was disabled on her last day.',
    evidence: [
      'HR termination recorded correctly on the leaving date',
      'Directory account shows Disabled, dated the leaving date',
      'Finance application access log shows activity yesterday',
      'The application authenticates via OIDC and issues 30-day refresh tokens',
      'No sign-in event appears at the identity provider for that access',
    ],
    correctStage: 'deprovisioning',
    stageRationale:
      'The directory account was disabled correctly, so account creation and the IdP are working. The failure is that deprovisioning did not revoke what had already been issued. Note the decisive clue: no IdP sign-in event, which means the application never asked the IdP anything.',
    causeOptions: [
      {
        id: 'c0',
        text: 'The application session and OAuth refresh token were never revoked when the account was disabled',
        correct: true,
        rationale:
          'Disabling a directory account stops future authentication. It does nothing to a token already issued and still within its lifetime — the application simply never asks the IdP again until the token expires.',
      },
      {
        id: 'c1',
        text: 'The directory account was not actually disabled',
        correct: false,
        rationale:
          'The evidence states it was disabled on the leaving date. Read the evidence before hypothesising — this is the most common triage error.',
      },
      {
        id: 'c2',
        text: 'Priya knows another employee password and is using their account',
        correct: false,
        rationale:
          'The access log attributes the activity to her identity, and no IdP sign-in occurred at all. Credential sharing would produce a sign-in event under the other account.',
      },
      {
        id: 'c3',
        text: 'HR failed to record the termination',
        correct: false,
        rationale:
          'The evidence says HR recorded it correctly and the disable fired on time. This would be the cause if the account were still enabled — it is a real failure mode, just not this one.',
      },
    ],
    fixOptions: [
      {
        id: 'f0',
        text: 'Revoke sessions and refresh tokens as part of deprovisioning, and shorten refresh token lifetimes',
        correct: true,
        rationale:
          'Deprovisioning must revoke what was already issued, not only prevent new issuance. Shorter refresh lifetimes bound the window when revocation is missed.',
      },
      {
        id: 'f1',
        text: 'Reset the password on the disabled account',
        correct: false,
        rationale:
          'A password reset does not invalidate an existing token either. This addresses a credential the attacker is not using.',
      },
      {
        id: 'f2',
        text: 'Delete the Active Directory account entirely',
        correct: false,
        rationale:
          'Deleting destroys evidence and still does not revoke the issued token. Disable before delete — and revoke separately.',
      },
      {
        id: 'f3',
        text: 'Require MFA on the finance application',
        correct: false,
        rationale:
          'MFA applies at authentication. The token holder is not authenticating, so MFA is never invoked. A good control, wrong problem.',
      },
    ],
    debrief:
      'The lesson is that "disabled" and "revoked" are different states. Federation means an application can keep working from an issued token without ever consulting the IdP again — so a deprovisioning process that only touches the directory leaves a live credential behind. The absence of an IdP sign-in event is the clue that localises the fault, and noticing an absence is a genuinely harder skill than noticing a presence.',
    conceptIds: ['deprovisioning', 'account-lifecycle', 'oauth', 'sso'],
  },

  {
    id: 'p5-incident-1',
    title: 'The mover who kept everything',
    symptom:
      'An access review flags Daniel Okonkwo as holding 47 entitlements. His peers in the same role hold around 12. He transferred from Finance to Marketing four months ago.',
    evidence: [
      'HR recorded the department change on the transfer date',
      'The identity platform added the Marketing birthright entitlements on that date',
      'The Finance entitlements are still present and still active',
      'No access request or exception exists for the retained Finance access',
      'Two other recent movers show the same pattern',
    ],
    correctStage: 'identity-platform',
    stageRationale:
      'HR did its job — the transfer was recorded. Account creation and authentication are irrelevant here; the account works fine. The fault is in how the identity platform handled the role change: it treated a move as an addition rather than a recalculation.',
    causeOptions: [
      {
        id: 'c0',
        text: 'The mover process adds new entitlements without removing the ones the previous role granted',
        correct: true,
        rationale:
          'This is privilege accumulation, and the pattern across three movers confirms it is systemic rather than a one-off error. A move should recalculate the whole entitlement set, not append to it.',
      },
      {
        id: 'c1',
        text: 'Daniel requested and was granted exceptions to retain Finance access',
        correct: false,
        rationale:
          'The evidence explicitly states no request or exception exists. Legitimate retained access would have an approval record.',
      },
      {
        id: 'c2',
        text: 'The HR transfer was recorded incorrectly',
        correct: false,
        rationale:
          'HR recorded it on the transfer date and the platform acted on it — the Marketing entitlements arrived. The trigger worked; the logic it triggered did not.',
      },
      {
        id: 'c3',
        text: 'Marketing legitimately requires Finance system access',
        correct: false,
        rationale:
          'His peers in the same role hold twelve entitlements. The comparison against role peers is what makes this diagnosable rather than a judgement call.',
      },
    ],
    fixOptions: [
      {
        id: 'f0',
        text: 'Recalculate the full entitlement set on every role change, and run periodic access reviews against role baselines',
        correct: true,
        rationale:
          'Recalculation fixes the systemic cause. Access reviews catch what recalculation misses and detect drift from any other source.',
      },
      {
        id: 'f1',
        text: 'Manually remove Daniel Finance entitlements',
        correct: false,
        rationale:
          'This resolves one case and leaves the process broken. Two other movers already show the same pattern, and every future mover will too.',
      },
      {
        id: 'f2',
        text: 'Disable Daniel account pending investigation',
        correct: false,
        rationale:
          'Disproportionate. Privilege accumulation from a process defect is not misconduct, and treating it as such damages trust for no security gain.',
      },
      {
        id: 'f3',
        text: 'Move Daniel back to Finance',
        correct: false,
        rationale:
          'Reorganising a person around a defect in the provisioning logic is not a security control.',
      },
    ],
    debrief:
      'Privilege creep is the most common finding in any access review, and the mover flow is where it originates. The diagnostic move here is comparison: 47 entitlements means nothing until you know peers hold 12. Note also the systemic signal — three movers with the same pattern says fix the process, not the person. A fix that resolves one case and leaves the process intact is not a fix.',
    conceptIds: ['account-lifecycle', 'rbac', 'least-privilege', 'provisioning'],
  },

  {
    id: 'p5-incident-2',
    title: 'MFA was enabled and the attacker got in anyway',
    symptom:
      'An attacker authenticated successfully as an analyst whose account has MFA enforced. The SOC wants to know how, and whether MFA is worth keeping.',
    evidence: [
      'The account is enrolled for MFA using push notifications',
      'The sign-in log shows a successful MFA challenge, approved',
      'Sign-in came from an ASN the user has never used, at 02:47 local time',
      'The user reports approving "a prompt I thought was the VPN"',
      'A lookalike domain resolved on the user workstation forty seconds before the sign-in',
    ],
    correctStage: 'mfa',
    stageRationale:
      'Authentication and SSO worked exactly as designed — that is the uncomfortable part. The failure is in the factor chosen at enrolment: a push notification is relayable, so the attacker proxied the login and the user approved a prompt the attacker triggered.',
    causeOptions: [
      {
        id: 'c0',
        text: 'The factor was a relayable push notification, so the attacker proxied the authentication in real time',
        correct: true,
        rationale:
          'In an adversary-in-the-middle phishing attack the attacker relays the real login. The MFA prompt is genuine, which is why the user approved it — and why the log shows a legitimate successful challenge.',
      },
      {
        id: 'c1',
        text: 'MFA was not actually enforced on the account',
        correct: false,
        rationale:
          'The sign-in log shows an MFA challenge that was issued and approved. It was enforced; it was defeated.',
      },
      {
        id: 'c2',
        text: 'The attacker stole the MFA secret from the authenticator app',
        correct: false,
        rationale:
          'No evidence supports device compromise, and it is not needed to explain what happened. Prefer the explanation the evidence supports over the more dramatic one.',
      },
      {
        id: 'c3',
        text: 'The conditional access policy was misconfigured',
        correct: false,
        rationale:
          'Conditional access might have caught the unfamiliar ASN and the 02:47 timing — that is a genuine additional gap. But it is not the cause of the MFA bypass, which is the factor type.',
      },
    ],
    fixOptions: [
      {
        id: 'f0',
        text: 'Move to phishing-resistant MFA (FIDO2/WebAuthn), which binds cryptographically to the real origin',
        correct: true,
        rationale:
          'A FIDO2 authenticator will not respond to a lookalike domain, so the relay fails even if the user cooperates fully. This is the control that ends the attack chain rather than raising its cost.',
      },
      {
        id: 'f1',
        text: 'Disable MFA, since it did not prevent the compromise',
        correct: false,
        rationale:
          'MFA still defeats brute force, spraying, and stuffing. Removing a control because it failed against one technique is how environments get worse, not better.',
      },
      {
        id: 'f2',
        text: 'Retrain the user to be more careful with prompts',
        correct: false,
        rationale:
          'Training reduces click rate but never to zero, and here the prompt was genuine. A control that depends on a tired person at 02:47 making a perfect judgement is not a control.',
      },
      {
        id: 'f3',
        text: 'Switch from push notifications to SMS codes',
        correct: false,
        rationale:
          'SMS is relayable in exactly the same way, and additionally exposed to SIM swap. This moves sideways, not forwards.',
      },
    ],
    debrief:
      'Not all MFA is equal, and this is the distinction the exam and the job both care about. Push and SMS prove possession of a factor but not the identity of the site asking — so an attacker who relays the login gets a genuine, approved challenge. FIDO2 binds to the origin, so the relay simply fails. Note also that "disable the control because it failed" is a real instinct worth resisting: MFA still defeats three other attack classes.',
    conceptIds: ['mfa', 'authentication', 'conditional-access', 'zero-trust'],
  },
];

export function getIncident(id: string): IamIncident | undefined {
  return IAM_INCIDENTS.find((i) => i.id === id);
}
