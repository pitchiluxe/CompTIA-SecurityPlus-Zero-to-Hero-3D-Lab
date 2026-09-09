// ---------------------------------------------------------------------------
// Phase 5 — the employee identity lifecycle.
//
// PROMPT.md specifies exactly this chain:
//   HR System -> Identity Platform -> Account Creation -> MFA -> SSO ->
//   Application Access -> Authorization -> Audit Logs -> Deprovisioning
//
// Source of truth for the 3D scene, the 2D fallback, the troubleshooting
// workbench, and the `trace identity lifecycle` simulator artifact.
//
// Every stage carries its failure modes, because "design AND troubleshoot the
// workflow" is the phase requirement — a lifecycle you cannot debug is a
// diagram, not a skill.
// ---------------------------------------------------------------------------

export type LifecycleStageId =
  | 'hr-system'
  | 'identity-platform'
  | 'account-creation'
  | 'mfa'
  | 'sso'
  | 'application-access'
  | 'authorization'
  | 'audit-logs'
  | 'deprovisioning';

export type LifecycleStage = {
  id: LifecycleStageId;
  order: number;
  title: string;
  /** System of record or enforcement point at this stage. */
  system: string;
  /** Where the stage sits in the 3D scene: angle around the identity ring. */
  angle: number;
  color: string;
  summary: string;
  /** What this stage produces for the next one. */
  produces: string[];
  /** Controls that belong here. */
  controls: string[];
  /** How this stage goes wrong, and what the learner would observe. */
  failureModes: { symptom: string; cause: string; fix: string }[];
  /** Which of Joiner / Mover / Leaver this stage participates in. */
  jml: ('joiner' | 'mover' | 'leaver')[];
};

export const IDENTITY_LIFECYCLE: LifecycleStage[] = [
  {
    id: 'hr-system',
    order: 1,
    title: 'HR System',
    system: 'HR platform — authoritative source',
    angle: 0,
    color: '#38bdf8',
    summary:
      'HR is the authoritative source of identity. A person exists because HR says they do, with a start date, a job title, a manager, and a department. Every downstream system derives from this record, which is why an identity programme that is not driven by HR drifts within months.',
    produces: ['Employee record', 'Job title and department', 'Start and end dates', 'Manager'],
    controls: ['Authoritative source designation', 'Change approval in HR', 'Data quality checks'],
    failureModes: [
      {
        symptom: 'New starter has no account on day one',
        cause: 'HR record created after the start date, so no trigger fired in time',
        fix: 'Require HR records to be created ahead of the start date, and alert on records created retroactively',
      },
      {
        symptom: 'A leaver still has access weeks after departure',
        cause: 'HR termination not recorded, so no deprovisioning trigger was ever sent',
        fix: 'Reconcile active accounts against HR monthly; treat unmatched accounts as findings',
      },
    ],
    jml: ['joiner', 'mover', 'leaver'],
  },
  {
    id: 'identity-platform',
    order: 2,
    title: 'Identity Platform',
    system: 'IdP / IGA — identity governance',
    angle: 40,
    color: '#818cf8',
    summary:
      'The identity platform consumes the HR record and decides what the person should have. This is where birthright entitlements are calculated from role and department, and where the identity is joined to any existing records. It is also the identity provider that later authenticates the user.',
    produces: ['Unique identity', 'Birthright entitlement set', 'Role assignment'],
    controls: [
      'Role-based birthright provisioning',
      'Segregation-of-duties checks',
      'Access request and approval workflow',
    ],
    failureModes: [
      {
        symptom: 'A mover keeps their old department access after transferring',
        cause: 'The role change added new entitlements but never removed the previous ones',
        fix: 'Recalculate the full entitlement set on role change rather than only adding, and run access reviews',
      },
      {
        symptom: 'A user accumulates far more access than peers in the same role',
        cause: 'Privilege creep from repeated exception requests never revisited',
        fix: 'Time-bound exception grants and compare entitlements against the role baseline',
      },
    ],
    jml: ['joiner', 'mover', 'leaver'],
  },
  {
    id: 'account-creation',
    order: 3,
    title: 'Account Creation',
    system: 'Active Directory / cloud directory',
    angle: 80,
    color: '#a855f7',
    summary:
      'Provisioning writes the account into the directory: a user object, group memberships derived from the role, a home organisational unit, and an initial credential. Automated provisioning matters because manual account creation is where inconsistency and orphaned accounts begin.',
    produces: ['Directory account', 'Group memberships', 'Initial credential'],
    controls: [
      'Automated provisioning from the identity platform',
      'Naming standards',
      'Initial credential delivered out of band',
    ],
    failureModes: [
      {
        symptom: 'Account exists in the directory but not in the identity platform',
        cause: 'Created manually, bypassing the provisioning workflow — an orphaned account',
        fix: 'Restrict manual creation, and reconcile the directory against the identity platform',
      },
      {
        symptom: 'Two accounts exist for the same person',
        cause: 'Join logic failed to match a rehire or a name change to the existing identity',
        fix: 'Improve identity matching rules and review duplicate detection reports',
      },
    ],
    jml: ['joiner', 'mover'],
  },
  {
    id: 'mfa',
    order: 4,
    title: 'MFA Enrolment',
    system: 'Authenticator / FIDO2 security key',
    angle: 120,
    color: '#22c55e',
    summary:
      'The user enrols a second factor. Factor choice matters enormously: SMS and push codes can be relayed by an attacker in real time, while FIDO2 or WebAuthn binds cryptographically to the real origin and simply will not respond to a lookalike domain. This is the control that would have ended the Phase 3 attack chain.',
    produces: ['Registered authenticator', 'Recovery method'],
    controls: [
      'Phishing-resistant MFA (FIDO2/WebAuthn) where possible',
      'Enrolment from a trusted context',
      'Recovery process that is not weaker than the primary factor',
    ],
    failureModes: [
      {
        symptom: 'MFA is enabled but an attacker still authenticates as the user',
        cause:
          'The factor was SMS or push, which an attacker can relay or fatigue the user into approving',
        fix: 'Move to phishing-resistant factors; enable number matching if push must remain',
      },
      {
        symptom: 'Attacker enrols their own authenticator on a compromised account',
        cause: 'Enrolment allowed from an unverified context with no step-up verification',
        fix: 'Require an existing strong factor or a verified device to register a new authenticator',
      },
    ],
    jml: ['joiner'],
  },
  {
    id: 'sso',
    order: 5,
    title: 'SSO / Federation',
    system: 'SAML or OIDC federation',
    angle: 160,
    color: '#eab308',
    summary:
      'The identity provider authenticates once and issues an assertion or token that applications trust. SAML carries an XML assertion; OpenID Connect carries an ID token layered on OAuth. Federation means the application never sees the password — it trusts the IdP, which is both the benefit and the concentration of risk.',
    produces: ['SAML assertion or OIDC ID token', 'Session at the IdP'],
    controls: [
      'Signed assertions with validated certificates',
      'Short token lifetimes',
      'Audience and issuer validation at the service provider',
    ],
    failureModes: [
      {
        symptom: 'An application rejects a valid login with a signature error',
        cause:
          'The IdP signing certificate rotated and the service provider still holds the old one',
        fix: 'Automate metadata refresh and alert ahead of certificate expiry',
      },
      {
        symptom: 'A user remains signed in to an application after being disabled centrally',
        cause:
          'The application session outlives the IdP session; no single logout or token revocation',
        fix: 'Shorten application session lifetimes and implement session revocation on deprovisioning',
      },
    ],
    jml: ['joiner', 'mover'],
  },
  {
    id: 'application-access',
    order: 6,
    title: 'Application Access',
    system: 'Service provider / relying party',
    angle: 200,
    color: '#f59e0b',
    summary:
      'The application receives the assertion and establishes a session. Conditional access evaluates here or at the IdP: who the user is, what device they are on, where they are, and what they are asking for. This is where Zero Trust stops being a slogan and becomes a policy evaluation.',
    produces: ['Application session', 'Conditional access decision'],
    controls: [
      'Conditional access policy (device compliance, location, risk)',
      'Step-up authentication for sensitive actions',
      'Session lifetime and re-evaluation',
    ],
    failureModes: [
      {
        symptom: 'A compliant user is repeatedly blocked from an application',
        cause: 'Conditional access policy is too broad, or the device compliance signal is stale',
        fix: 'Scope policy to the resources that need it and verify the compliance signal freshness',
      },
      {
        symptom: 'Access succeeds from an unmanaged device',
        cause: 'The policy was set to report-only, or the application was excluded',
        fix: 'Move policies out of report-only and audit exclusion lists regularly',
      },
    ],
    jml: ['joiner', 'mover'],
  },
  {
    id: 'authorization',
    order: 7,
    title: 'Authorization',
    system: 'RBAC / ABAC policy evaluation',
    angle: 240,
    color: '#ef4444',
    summary:
      'Authentication established who; authorization decides what. RBAC grants through role membership and is simple to audit. ABAC evaluates attributes — department, clearance, time, device, data classification — and is far more expressive but far harder to reason about. Most real environments use RBAC with a few ABAC conditions layered on.',
    produces: ['Effective permissions', 'Authorization decision per request'],
    controls: [
      'Role-based access with a defined role catalogue',
      'Attribute conditions for context-sensitive resources',
      'Least privilege and periodic access review',
    ],
    failureModes: [
      {
        symptom: 'A user can read records outside their department',
        cause: 'The role is too coarse, granting at application scope rather than data scope',
        fix: 'Split the role, or add an attribute condition on department',
      },
      {
        symptom: 'Nobody can explain why a user has a permission',
        cause: 'Role explosion — hundreds of overlapping roles with no catalogue',
        fix: 'Role mining and consolidation, then govern new role creation',
      },
    ],
    jml: ['joiner', 'mover'],
  },
  {
    id: 'audit-logs',
    order: 8,
    title: 'Audit Logs',
    system: 'SIEM — identity telemetry',
    angle: 280,
    color: '#06b6d4',
    summary:
      'Accounting closes the AAA loop. Identity telemetry — sign-ins, failures, MFA prompts, entitlement changes, privileged elevations — is among the highest-value data a SOC holds, because every attack chain crosses identity somewhere. This is also what makes non-repudiation possible.',
    produces: ['Sign-in and audit events', 'Entitlement change history', 'Evidence for review'],
    controls: [
      'Centralised identity log collection',
      'Alerting on privileged changes',
      'Retention aligned to investigation needs',
    ],
    failureModes: [
      {
        symptom: 'An investigation cannot determine who granted a permission',
        cause: 'Entitlement changes are not logged, or are logged without the acting identity',
        fix: 'Log the actor, the target, the change, and the approval reference on every grant',
      },
      {
        symptom: 'Privileged actions are attributed to a shared account',
        cause: 'Administrators share a credential — the Phase 2 non-repudiation failure',
        fix: 'Individual named admin accounts with PAM checkout and session recording',
      },
    ],
    jml: ['joiner', 'mover', 'leaver'],
  },
  {
    id: 'deprovisioning',
    order: 9,
    title: 'Deprovisioning',
    system: 'Identity platform — leaver process',
    angle: 320,
    color: '#64748b',
    summary:
      'The leaver process disables the account, revokes sessions and tokens, reclaims licences, and transfers data ownership. Ordering matters: disable before delete, so evidence survives. The most common real-world failure is not that deprovisioning is wrong but that it is slow — and every day of delay is a live credential nobody is watching.',
    produces: ['Disabled account', 'Revoked sessions and tokens', 'Reassigned data ownership'],
    controls: [
      'HR-triggered automatic disable',
      'Token and session revocation, not just password reset',
      'Periodic reconciliation against HR',
    ],
    failureModes: [
      {
        symptom: 'A departed employee still accesses an application days later',
        cause:
          'The directory account was disabled but the application session or OAuth token was never revoked',
        fix: 'Revoke tokens and sessions as part of deprovisioning, not just the directory account',
      },
      {
        symptom: 'Service accounts break when their owner leaves',
        cause: 'A named human account was used as a service identity',
        fix: 'Use dedicated service accounts with documented ownership and no interactive logon',
      },
    ],
    jml: ['leaver'],
  },
];

export function getLifecycleStage(id: LifecycleStageId): LifecycleStage | undefined {
  return IDENTITY_LIFECYCLE.find((s) => s.id === id);
}

/** Stages that participate in a given Joiner / Mover / Leaver flow. */
export function stagesForJML(flow: 'joiner' | 'mover' | 'leaver'): LifecycleStage[] {
  return IDENTITY_LIFECYCLE.filter((s) => s.jml.includes(flow));
}

/** Every failure mode across the lifecycle, for the troubleshooting workbench. */
export function allFailureModes() {
  return IDENTITY_LIFECYCLE.flatMap((stage) =>
    stage.failureModes.map((f) => ({ ...f, stageId: stage.id, stageTitle: stage.title }))
  );
}
