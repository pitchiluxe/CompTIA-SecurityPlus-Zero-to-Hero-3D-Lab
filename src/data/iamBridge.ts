// ---------------------------------------------------------------------------
// Phase 27 — Security+ to IAM Career Bridge.
//
// PROMPT.md names nine bridge questions ("how authentication is implemented",
// "how authorization is implemented", MFA, SSO, RBAC, Zero Trust and identity,
// privileged access, identity events in logs, IAM incident investigation) and
// six vendor platforms (Microsoft Entra ID, Active Directory, Okta, Ping
// Identity, CyberArk, SailPoint), with one hard rule: teach the underlying
// concepts BEFORE the vendor-specific implementations.
//
// That rule is enforced in data, not prose: every vendor declares the
// prerequisite concept IDs that gate it, and `iamBridgeEngine` refuses to
// unlock the vendor detail until the learner's mastery of those concepts is
// above the same weak-area threshold used everywhere else on this platform.
//
// Every conceptId below is a real conceptId already taught and mastery-tracked
// by an earlier phase (mostly Phase 5 Identity & Access Management, plus
// Phase 4 Zero Trust, Phase 7/8 logging, and Phase 12 incident response).
// Nothing here invents a parallel IAM taxonomy.
//
// No credentials, keys, tokens, or real tenant identifiers appear anywhere in
// this file. Log excerpts use RFC 1918 / RFC 5737 documentation addresses and
// lab-only account names.
// ---------------------------------------------------------------------------

export type IamVendorId =
  | 'active-directory'
  | 'entra-id'
  | 'okta'
  | 'ping-identity'
  | 'cyberark'
  | 'sailpoint';

/** One vendor's implementation of a bridge topic. Named feature, plus why it is the same idea. */
export type VendorMapping = {
  vendorId: IamVendorId;
  feature: string;
  note: string;
};

export type IamBridgeTopic = {
  id: string;
  /** The PROMPT.md bridge question this topic answers. */
  question: string;
  title: string;
  /** Real, already-tracked platform concept IDs this topic bridges from. */
  conceptIds: string[];
  /** What Security+ teaches at the exam level. */
  examView: string;
  /** How the same thing is actually built in an enterprise identity estate. */
  implementation: string;
  /** How the topic shows up in logs — the analyst's actual evidence. */
  logEvidence: string[];
  /** What an IAM analyst does with that evidence. */
  investigation: string;
  vendors: VendorMapping[];
};

export const IAM_BRIDGE_TOPICS: IamBridgeTopic[] = [
  {
    id: 'authentication-implementation',
    question: 'How is authentication implemented?',
    title: 'Authentication — from "prove who you are" to a protocol exchange',
    conceptIds: ['authentication', 'identity', 'kerberos', 'ldap'],
    examView:
      'Security+ frames authentication as proving a claimed identity using something you know, have, or are, and separates it cleanly from authorization (what you may then do) and accounting (what was recorded).',
    implementation:
      'In practice authentication is a protocol exchange against a directory or identity provider, and the protocol determines the evidence you get. On-premises Windows authentication is Kerberos against a domain controller: the client gets a TGT, then a service ticket per resource, so the password itself is never replayed to each service. LDAP simple binds authenticate directly against a directory entry, which is why they must be wrapped in TLS. Modern web authentication happens at an identity provider and returns a signed token rather than a shared password, which is what makes SSO and conditional access possible at all.',
    logEvidence: [
      'Windows Security 4624 — successful logon, with a Logon Type that tells you how (2 interactive, 3 network, 10 RDP)',
      'Windows Security 4625 — failed logon, with a status code distinguishing bad password from disabled or locked account',
      'Windows Security 4768 / 4769 — Kerberos TGT and service ticket requests, the on-premises authentication paper trail',
      'Linux /var/log/auth.log — sshd accepted/failed publickey and password entries',
    ],
    investigation:
      'Read the logon type before the outcome. A burst of 4625s at Logon Type 3 from one source is network password guessing; the same volume at Logon Type 2 on a shared kiosk is usually a user with an expired password. The interesting event is almost never the failure on its own — it is the first success that follows a run of failures.',
    vendors: [
      {
        vendorId: 'active-directory',
        feature: 'Kerberos authentication against a domain controller (KDC)',
        note: 'The classic on-premises implementation, and still the reference model for how ticket-based authentication behaves.',
      },
      {
        vendorId: 'entra-id',
        feature: 'Cloud authentication with pass-through, password-hash sync, or federated options',
        note: 'The same authentication decision, relocated to a cloud identity provider that issues tokens instead of tickets.',
      },
      {
        vendorId: 'okta',
        feature: 'Universal Directory plus authentication policies',
        note: 'A vendor-neutral identity provider fronting many directories — the concept is unchanged, the directory is simply no longer the authenticator.',
      },
    ],
  },
  {
    id: 'authorization-implementation',
    question: 'How is authorization implemented?',
    title: 'Authorization — from "what may you do" to an entitlement you can enumerate',
    conceptIds: ['authorization', 'least-privilege', 'abac'],
    examView:
      'Security+ separates authorization from authentication and names the models: DAC, MAC, RBAC, ABAC, and rule-based, all serving least privilege.',
    implementation:
      'Authorization is implemented as an entitlement attached to something you can list: a group membership, a directory role, an ACL entry, an application role claim inside a token, or a policy evaluated at access time against attributes. The practical consequence is that authorization is auditable in a way authentication is not — you can enumerate who holds an entitlement today, which is exactly what an access review does. When a token carries role or group claims, the authorization decision has also been frozen at issuance time, which is why revoking a group membership does not always take effect until the token expires.',
    logEvidence: [
      'Windows Security 4728 / 4732 / 4756 — a member added to a security-enabled group (global, local, universal)',
      'Windows Security 4672 — special privileges assigned to a new logon, i.e. an administrative logon',
      'Identity-provider role assignment / directory role activation entries in an audit log',
      'Application authorization denials, which record the entitlement that was missing',
    ],
    investigation:
      'Work backwards from the entitlement, not the person. When an account did something it should not have been able to do, the question is which group or role granted it, when that grant happened, and who approved it — a 4728 timestamped minutes before the action is a very different incident from one dated two years ago.',
    vendors: [
      {
        vendorId: 'active-directory',
        feature: 'Security groups, delegated OU permissions, and Group Policy',
        note: 'Group membership as the entitlement primitive — simple, and the reason group sprawl is the classic least-privilege failure.',
      },
      {
        vendorId: 'sailpoint',
        feature: 'Identity governance — access certification campaigns and role modelling',
        note: 'Governance tooling exists because entitlements accumulate; it answers "should this person still have this?" rather than "may they?"',
      },
      {
        vendorId: 'entra-id',
        feature: 'App roles, directory roles, and administrative units',
        note: 'The same entitlement idea expressed as claims in an issued token instead of a membership checked at access time.',
      },
    ],
  },
  {
    id: 'mfa-implementation',
    question: 'How does MFA work?',
    title: 'MFA — from "two factors" to a resistible or unresistible second factor',
    conceptIds: ['mfa', 'phishing-resistant-mfa', 'authentication'],
    examView:
      'Security+ requires two factors from different categories — knowledge, possession, inherence — and specifically flags that not all second factors resist phishing.',
    implementation:
      'MFA is implemented as an extra challenge issued after the primary credential is accepted, and the implementation choice decides whether it survives a real attacker. A TOTP code or an SMS message is a shared secret the user can be tricked into reading aloud or typing into an attacker-controlled page. A push approval can be worn down by repeated prompts until someone taps accept. FIDO2 / WebAuthn is different in kind, not degree: the private key never leaves the authenticator and the signature is bound to the origin, so a proxy phishing site cannot replay it. Number matching and push-fatigue throttling are mitigations for push; origin binding is a fix.',
    logEvidence: [
      'Identity-provider sign-in records showing the MFA method actually satisfied on each sign-in',
      'Repeated MFA challenges for one account inside a short window — the push-fatigue signature',
      'A satisfied MFA challenge from an unexpected country or ASN following failed attempts elsewhere',
      'MFA method registration events, which is how an attacker with a session persists',
    ],
    investigation:
      'Confirm which method satisfied the challenge, then check for a method-registration event immediately after. An attacker who reaches the enrolment page and adds their own authenticator no longer needs the stolen password, and every subsequent sign-in will look perfectly legitimate.',
    vendors: [
      {
        vendorId: 'entra-id',
        feature: 'Authentication methods policy, number matching, passkey (FIDO2) support',
        note: 'Method strength is configured centrally — the concept "not all second factors are equal" is a policy setting.',
      },
      {
        vendorId: 'okta',
        feature: 'Authenticator enrolment policies and FastPass',
        note: 'Same phishing-resistance decision, expressed as which authenticators an assurance level accepts.',
      },
      {
        vendorId: 'ping-identity',
        feature: 'MFA policies orchestrated in an authentication flow',
        note: 'Flow-based orchestration makes the step-up decision explicit rather than implicit.',
      },
    ],
  },
  {
    id: 'sso-implementation',
    question: 'How does SSO work?',
    title: 'SSO — from "log in once" to a signed assertion between two parties',
    conceptIds: ['sso', 'federation', 'saml', 'oidc', 'oauth'],
    examView:
      'Security+ covers SSO, federation, SAML, OAuth 2.0, and OIDC, and expects you to know that OAuth is delegated authorization while OIDC is the authentication layer on top of it.',
    implementation:
      'SSO is implemented as federation between a service provider and an identity provider that trust each other via a certificate or published key. The user hits the application, is redirected to the identity provider, authenticates once, and comes back holding a signed assertion (a SAML Response) or a token (an OIDC ID token, plus an OAuth access token for APIs). Nothing about the user\'s password ever reaches the application. Three implementation details cause most real incidents: assertion signature validation being skipped or misconfigured, token lifetimes that outlive an access revocation, and OAuth consent grants that keep working after the user\'s password is reset because the refresh token was never revoked.',
    logEvidence: [
      'Identity-provider sign-in logs showing one authentication followed by several application accesses',
      'Application-side federated logon entries with no local password authentication',
      'OAuth consent-grant and refresh-token issuance events',
      'Token-issuance entries recording the client application, scopes, and lifetime',
    ],
    investigation:
      'After any credential compromise where SSO is in play, resetting the password is not containment. Revoke the sessions and refresh tokens too — otherwise the attacker keeps a working access path the password reset never touched. Phase 5\'s deprovisioning incident is exactly this failure.',
    vendors: [
      {
        vendorId: 'okta',
        feature: 'SAML and OIDC application integrations with a central sign-on policy',
        note: 'The pure federation-hub model — one identity provider fronting a large application catalogue.',
      },
      {
        vendorId: 'entra-id',
        feature: 'Enterprise applications, service principals, and OAuth consent',
        note: 'Adds the consent-grant surface: an app can retain delegated access independent of the password.',
      },
      {
        vendorId: 'ping-identity',
        feature: 'Federation hub and token mediation between standards',
        note: 'Translating between SAML and OIDC is a real enterprise problem; the underlying assertion concept is identical.',
      },
    ],
  },
  {
    id: 'rbac-implementation',
    question: 'How does RBAC work?',
    title: 'RBAC — from "role-based" to a role you can actually name and review',
    conceptIds: ['rbac', 'least-privilege', 'authorization'],
    examView:
      'Security+ defines RBAC as access granted by job role rather than to individuals, and contrasts it with ABAC (attribute-driven) and DAC (owner-driven).',
    implementation:
      'RBAC is implemented as a role definition (a named bundle of permissions), an assignment of that role to a principal, and usually a scope the assignment applies to. The chronic failure is not the model but its drift: roles get created per person instead of per job, users accumulate assignments as they change teams, and nobody removes the old ones — so "role-based" degrades into per-user access with extra steps. Real implementations pair RBAC with periodic certification and with role mining, which derives what the roles should be from what people actually use.',
    logEvidence: [
      'Role assignment and removal entries in a directory audit log',
      'Windows Security 4728 / 4732 group additions, where the group is the role',
      'Access-review or certification campaign decisions (approved, revoked, expired)',
      'Entitlement snapshots over time — the only way to see accumulation',
    ],
    investigation:
      'Compare an account\'s entitlements against the entitlements of its peers in the same job. Phase 5\'s privilege-creep incident is diagnosed exactly this way: the account is not an outlier because it is malicious, it is an outlier because three role changes each added access and none removed any.',
    vendors: [
      {
        vendorId: 'sailpoint',
        feature: 'Role modelling, role mining, and certification campaigns',
        note: 'Governance tooling attacks role drift directly — it exists because RBAC decays without review.',
      },
      {
        vendorId: 'entra-id',
        feature: 'Built-in and custom directory roles with scoped assignments',
        note: 'Scoped assignment is the least-privilege refinement: the same role, limited to where it is needed.',
      },
      {
        vendorId: 'active-directory',
        feature: 'Role groups plus delegated control at the OU level',
        note: 'Where most organisations\' RBAC actually lives, and where most of the sprawl accumulates.',
      },
    ],
  },
  {
    id: 'zero-trust-identity',
    question: 'How does Zero Trust affect identity?',
    title: 'Zero Trust — identity becomes the control plane',
    conceptIds: ['zero-trust', 'conditional-access', 'least-privilege'],
    examView:
      'Security+ describes Zero Trust as "never trust, always verify", with a policy engine, policy administrator, and policy enforcement point, and no implicit trust granted by network location.',
    implementation:
      'When the network perimeter stops conferring trust, the identity provider becomes the enforcement point — which is why Zero Trust is an identity project in practice. It is implemented as conditional access policy: on every authentication, evaluate signals (user risk, sign-in risk, device compliance, location, application sensitivity) and decide allow, block, or step up to a stronger factor. Two properties matter. Decisions are continuous rather than once-at-login, so a session can be re-evaluated when risk changes. And policy has to be evaluated per resource, since "verified once, trusted everywhere" is exactly the implicit trust Zero Trust removes.',
    logEvidence: [
      'Conditional-access policy evaluation results attached to each sign-in (applied, not applied, failed)',
      'Risk detections raised against a user or a specific sign-in',
      'Device compliance state recorded at the moment of access',
      'Session revocation and continuous-evaluation events',
    ],
    investigation:
      'For any suspicious sign-in, read the policy evaluation first. A sign-in that succeeded because it fell into a policy exclusion is a policy finding, not a user finding — and exclusions (break-glass accounts, legacy service accounts, "temporary" carve-outs) are where attackers land, because they are the paths where the controls do not run.',
    vendors: [
      {
        vendorId: 'entra-id',
        feature: 'Conditional Access with risk-based policies and continuous access evaluation',
        note: 'The most widely deployed conditional-access implementation of the policy-engine concept.',
      },
      {
        vendorId: 'okta',
        feature: 'Adaptive authentication with device and network context',
        note: 'Same signals, same allow/step-up/block decision, different policy language.',
      },
      {
        vendorId: 'ping-identity',
        feature: 'Policy orchestration across authentication journeys',
        note: 'Makes the decision tree explicit, which helps when a policy exclusion needs to be defended in a review.',
      },
    ],
  },
  {
    id: 'privileged-access',
    question: 'How is privileged access managed?',
    title: 'Privileged access — from "least privilege" to time-bound, brokered, recorded admin',
    conceptIds: ['pam', 'least-privilege', 'privilege-escalation'],
    examView:
      'Security+ covers privileged access management, just-in-time permissions, password vaulting, and ephemeral credentials as the controls for accounts whose compromise is worst.',
    implementation:
      'PAM is implemented as four controls that stack. Vaulting removes the standing shared password and rotates it. Brokered sessions mean the admin connects through a proxy that holds the credential, so the human never learns it. Just-in-time elevation grants the privileged role for a bounded window with an approval and a stated reason, so there is no standing admin. Session recording plus keystroke logging makes the activity reviewable afterwards. The point of all four is the same: shrink both the window in which privilege exists and the number of places a privileged credential can be stolen from.',
    logEvidence: [
      'Vault credential checkout and check-in events, with the requester and the stated reason',
      'Just-in-time role activation and expiry entries, including approver',
      'Windows Security 4672 — special privileges assigned at logon',
      'Session recordings and command transcripts from the brokered session',
    ],
    investigation:
      'Reconcile every privileged action against an activation record. Privileged activity with no matching checkout or JIT activation is the finding — it means either an unmanaged standing account or a credential used outside the broker, and both defeat the entire control.',
    vendors: [
      {
        vendorId: 'cyberark',
        feature: 'Credential vaulting, session brokering, and session recording',
        note: 'The reference PAM implementation of vault-plus-broker-plus-recording.',
      },
      {
        vendorId: 'entra-id',
        feature: 'Privileged Identity Management — just-in-time, approval-gated role activation',
        note: 'JIT elevation for directory roles: the "no standing admin" concept as a product feature.',
      },
      {
        vendorId: 'active-directory',
        feature: 'Tiered administration, Protected Users, and separate admin workstations',
        note: 'The architectural version of the same idea, built from the directory\'s own primitives.',
      },
    ],
  },
  {
    id: 'identity-events-logs',
    question: 'How do identity events appear in logs?',
    title: 'Identity in logs — the events an IAM analyst actually reads',
    conceptIds: ['windows-logs', 'event-viewer', 'siem', 'accounting'],
    examView:
      'Security+ treats accounting as the third A of AAA and expects you to know that authentication, authorization, and account-management activity must be logged and monitored.',
    implementation:
      'Identity telemetry arrives from three places and has to be correlated across all three: the directory or domain controller (Kerberos and logon events, group and account changes), the identity provider (sign-in logs, MFA method satisfied, conditional-access results, token issuance), and the endpoint (interactive logons, privilege assignment, process creation under the account). None of the three is sufficient alone. A directory shows the group change but not the risky sign-in that preceded it; an identity provider shows the token issuance but not what the account then did on the host.',
    logEvidence: [
      '4624 successful logon and 4625 failed logon, read together with their Logon Type',
      '4720 / 4726 account created and deleted; 4738 account changed',
      '4728 / 4732 / 4756 member added to a security-enabled group',
      '4740 account locked out; 4767 account unlocked',
      '4768 / 4769 / 4771 Kerberos ticket requests and pre-authentication failures',
      'Identity-provider sign-in logs and directory audit logs, joined on the account',
    ],
    investigation:
      'Build the timeline on the account, not the host. A single account\'s events across the identity provider, the directory, and the endpoint, ordered by time, is what turns scattered alerts into a narrative: risky sign-in, MFA satisfied from a new country, method registered, group added, privileged logon.',
    vendors: [
      {
        vendorId: 'active-directory',
        feature: 'Domain controller Security event log and advanced audit policy',
        note: 'The source of truth for on-premises identity events — and it must be explicitly configured to log the useful ones.',
      },
      {
        vendorId: 'entra-id',
        feature: 'Sign-in logs, audit logs, and risk detections',
        note: 'The cloud half of the same timeline; correlating both halves is the actual job.',
      },
      {
        vendorId: 'okta',
        feature: 'System Log with event types per authentication and admin action',
        note: 'Same event categories under different names — the analyst skill transfers directly.',
      },
    ],
  },
  {
    id: 'iam-incident-investigation',
    question: 'How are IAM incidents investigated?',
    title: 'IAM incident investigation — identity-specific triage and containment',
    conceptIds: ['ir-lifecycle', 'alert-triage', 'evidence-handling', 'containment', 'directory-attacks'],
    examView:
      'Security+ expects the incident response lifecycle — preparation, detection, analysis, containment, eradication, recovery, lessons learned — applied to any incident type.',
    implementation:
      'For an identity incident the lifecycle is the same but the artifacts and the containment actions are specific. Detection is usually an impossible-travel, password-spray, or risky-sign-in alert. Analysis is the per-account timeline across identity provider, directory, and endpoint. Containment for identity has its own checklist that a host-focused analyst routinely gets wrong: reset the credential, revoke sessions and refresh tokens, remove attacker-registered MFA methods, review and revoke OAuth consent grants, and check for group or role additions made while the account was held. Recovery has to prove the access path is closed, not merely that the password changed.',
    logEvidence: [
      'The alert that opened the case, with its raised risk detection',
      'Per-account timeline spanning sign-ins, directory changes, and endpoint logons',
      'MFA method registration events during the compromise window',
      'OAuth consent grants and refresh tokens issued during the window',
      'Group, role, and delegation changes made while the account was controlled',
    ],
    investigation:
      'Ask what the attacker could still do after your containment step. If the answer is "sign in with an existing refresh token", "approve their own MFA prompt", or "use the mailbox delegation they added", containment is incomplete regardless of the password reset — and the incident is not closed.',
    vendors: [
      {
        vendorId: 'entra-id',
        feature: 'Risk detections, confirm-compromise, and revoke-sessions actions',
        note: 'Investigation and containment tooling in one place; revoke-sessions is the step most often skipped.',
      },
      {
        vendorId: 'okta',
        feature: 'System Log search plus session and token revocation',
        note: 'Same containment checklist, different console.',
      },
      {
        vendorId: 'cyberark',
        feature: 'Session recordings and forced credential rotation for privileged accounts',
        note: 'When the compromised account was privileged, the recording is the highest-value evidence available.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Vendor platforms — deliberately gated behind their prerequisite concepts.
// ---------------------------------------------------------------------------

export type IamVendor = {
  id: IamVendorId;
  name: string;
  category: string;
  whatItIs: string;
  /** Concepts that must be above the weak-area threshold before vendor detail is useful. */
  prerequisiteConceptIds: string[];
  /** Stated in one line: the concept this product is an implementation of. */
  conceptFirst: string;
};

export const IAM_VENDORS: IamVendor[] = [
  {
    id: 'active-directory',
    name: 'Active Directory',
    category: 'On-premises directory',
    whatItIs:
      'Microsoft\'s on-premises directory service: the authoritative store for accounts, groups, and computers in most enterprises, authenticating them with Kerberos and answering queries over LDAP. Still the substrate underneath most hybrid identity estates, which is why its attack paths remain relevant.',
    prerequisiteConceptIds: ['ldap', 'kerberos', 'active-directory', 'authentication'],
    conceptFirst:
      'Learn ticket-based authentication and directory structure first — every AD attack path (Kerberoasting, delegation abuse, DCSync) is an abuse of a mechanism, and the mechanism has to make sense before the abuse does.',
  },
  {
    id: 'entra-id',
    name: 'Microsoft Entra ID',
    category: 'Cloud identity provider',
    whatItIs:
      'Microsoft\'s cloud identity provider (formerly Azure AD): authenticates users, issues tokens to applications, enforces Conditional Access, and manages privileged roles just-in-time via PIM. Usually synchronised with an on-premises Active Directory, so a hybrid estate has two identity planes to reason about at once.',
    prerequisiteConceptIds: ['identity-provider', 'sso', 'federation', 'conditional-access'],
    conceptFirst:
      'Learn what an identity provider issues and what a policy engine evaluates first — otherwise Conditional Access looks like an arbitrary list of toggles instead of the Zero Trust policy engine it implements.',
  },
  {
    id: 'okta',
    name: 'Okta',
    category: 'Vendor-neutral identity provider',
    whatItIs:
      'A vendor-neutral identity provider that fronts many directories and application types, with a large SAML/OIDC application catalogue, its own sign-on and authenticator policies, and a System Log that carries the authentication and admin audit trail.',
    prerequisiteConceptIds: ['identity-provider', 'sso', 'saml', 'oidc'],
    conceptFirst:
      'Learn the SAML and OIDC assertion flow first — an application integration is configuration of that flow, and misconfigurations (unvalidated signatures, wrong audience) are only visible if you know what the flow is supposed to look like.',
  },
  {
    id: 'ping-identity',
    name: 'Ping Identity',
    category: 'Federation and orchestration',
    whatItIs:
      'A federation and authentication-orchestration platform, common where standards must be translated (SAML to OIDC), where legacy applications need fronting, or where an authentication journey has many conditional branches that need to be explicit and reviewable.',
    prerequisiteConceptIds: ['federation', 'saml', 'oauth'],
    conceptFirst:
      'Learn federation trust and token exchange first — orchestration is the sequencing of those exchanges, so the individual exchange has to be understood before the flow diagram means anything.',
  },
  {
    id: 'cyberark',
    name: 'CyberArk',
    category: 'Privileged access management',
    whatItIs:
      'A privileged access management platform: vaults and rotates privileged credentials, brokers administrative sessions so the human never handles the credential, and records those sessions for later review.',
    prerequisiteConceptIds: ['pam', 'least-privilege', 'privilege-escalation'],
    conceptFirst:
      'Learn why standing privilege is the risk first — vaulting, brokering, and recording are three answers to that one problem, and deploying them without understanding it produces a vault nobody routes through.',
  },
  {
    id: 'sailpoint',
    name: 'SailPoint',
    category: 'Identity governance and administration',
    whatItIs:
      'An identity governance platform: models roles, runs access certification campaigns, automates joiner/mover/leaver provisioning, and reports on who holds which entitlement — the "should they have this?" layer above the "may they?" layer.',
    prerequisiteConceptIds: ['rbac', 'authorization', 'least-privilege', 'account-lifecycle'],
    conceptFirst:
      'Learn entitlement accumulation and the joiner/mover/leaver lifecycle first — governance tooling is worthless if the roles fed into it were never modelled on actual job functions.',
  },
];

export function getVendor(id: string): IamVendor | undefined {
  return IAM_VENDORS.find((v) => v.id === id);
}

export function getBridgeTopic(id: string): IamBridgeTopic | undefined {
  return IAM_BRIDGE_TOPICS.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Concept-before-vendor exercise.
//
// The learner is shown a named vendor feature and must state which underlying
// concept it implements. Getting this right is the whole point of the phase:
// vendor features are interchangeable, the concepts are not.
// ---------------------------------------------------------------------------

export type VendorMappingItem = {
  id: string;
  vendorId: IamVendorId;
  feature: string;
  /** The bridge topic this feature implements — the correct answer. */
  topicId: string;
  rationale: string;
};

export const VENDOR_MAPPING_ITEMS: VendorMappingItem[] = [
  {
    id: 'vm0',
    vendorId: 'entra-id',
    feature: 'Conditional Access policy requiring a compliant device for a sensitive app',
    topicId: 'zero-trust-identity',
    rationale:
      'Evaluating signals on every authentication and deciding allow / step up / block is the Zero Trust policy engine, with identity as the enforcement point.',
  },
  {
    id: 'vm1',
    vendorId: 'cyberark',
    feature: 'Credential checkout from a vault with the session brokered and recorded',
    topicId: 'privileged-access',
    rationale:
      'Vaulting, brokering, and recording are the privileged access controls — they exist to shrink standing privilege and the places a privileged credential can be stolen from.',
  },
  {
    id: 'vm2',
    vendorId: 'okta',
    feature: 'SAML application integration with a central sign-on policy',
    topicId: 'sso-implementation',
    rationale:
      'A trusted identity provider returning a signed assertion to a service provider is federation — the mechanism SSO is built from.',
  },
  {
    id: 'vm3',
    vendorId: 'sailpoint',
    feature: 'Quarterly access certification campaign sent to line managers',
    topicId: 'authorization-implementation',
    rationale:
      'Certification reviews entitlements that already exist, which is authorization — enumerable in a way authentication never is.',
  },
  {
    id: 'vm4',
    vendorId: 'active-directory',
    feature: 'Domain controller issuing a TGT, then a service ticket per resource',
    topicId: 'authentication-implementation',
    rationale:
      'Ticket issuance is authentication: proving the claimed identity once, then presenting a ticket rather than replaying the password to each service.',
  },
  {
    id: 'vm5',
    vendorId: 'entra-id',
    feature: 'Privileged Identity Management activation with approval and an expiry',
    topicId: 'privileged-access',
    rationale:
      'Time-bound, approval-gated elevation is just-in-time privileged access — the "no standing admin" control, not a Zero Trust policy decision.',
  },
  {
    id: 'vm6',
    vendorId: 'okta',
    feature: 'Requiring FastPass or a passkey instead of accepting an SMS code',
    topicId: 'mfa-implementation',
    rationale:
      'Choosing which authenticators an assurance level accepts is the MFA phishing-resistance decision — origin-bound factors versus shared secrets.',
  },
  {
    id: 'vm7',
    vendorId: 'sailpoint',
    feature: 'Role mining to derive job roles from entitlements people actually use',
    topicId: 'rbac-implementation',
    rationale:
      'Role mining is RBAC maintenance: it counters the drift where roles are created per person and never removed as people move teams.',
  },
  {
    id: 'vm8',
    vendorId: 'entra-id',
    feature: 'Confirm-compromise on a risky user, then revoke all sessions and refresh tokens',
    topicId: 'iam-incident-investigation',
    rationale:
      'Session and refresh-token revocation is identity containment — the step a host-focused analyst skips, leaving the attacker a working access path after the password reset.',
  },
  {
    id: 'vm9',
    vendorId: 'active-directory',
    feature: 'Advanced audit policy enabled so group membership changes are recorded',
    topicId: 'identity-events-logs',
    rationale:
      'This is accounting: identity events only exist as evidence if auditing was configured to record them before the incident, not after.',
  },
];
