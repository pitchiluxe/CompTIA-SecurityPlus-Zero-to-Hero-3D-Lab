import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 27 — Security+ to IAM Career Bridge
// Aligned with CompTIA Security+ SY0-701
//
// PROMPT.md: continuously connect Security+ concepts to IAM (authentication,
// authorization, MFA, SSO, RBAC, Zero Trust and identity, privileged access,
// identity events in logs, IAM incident investigation), then introduce the
// vendor platforms — concepts BEFORE vendor-specific implementations.
// ---------------------------------------------------------------------------

// ---------- Lesson 1: How Security+ Identity Controls Are Actually Implemented ----------

const LESSON_27_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p27-l1-s0',
    title: 'Concept — What the Bridge Actually Adds',
    body:
      'Security+ teaches what an identity control is; an IAM job asks how it is built, what it writes to a log, and what you do when it fails. Those three additions — implementation, log evidence, investigation habit — are the entire bridge, and they are added to concepts this platform has already taught and mastery-tracked since Phase 5. Nothing in this phase is a new concept; every bridge topic starts from a concept ID you already have a mastery level for, which is why the bridge can tell you exactly which underlying concept to revisit when an implementation detail refuses to make sense.',
  },
  {
    id: 'p27-l1-s1',
    title: 'Concept — Authentication Is a Protocol Exchange, and the Protocol Decides Your Evidence',
    body:
      'Authentication in the exam is "prove the claimed identity." In implementation it is a protocol exchange against a directory or an identity provider, and which protocol was used decides what evidence you get afterwards. On-premises Windows authentication is Kerberos against a domain controller: a ticket-granting ticket, then one service ticket per resource, so the password is never replayed to each service — and the paper trail is 4768/4769. An LDAP simple bind authenticates directly against a directory entry, which is exactly why it must be wrapped in TLS. Modern web authentication happens at the identity provider and returns a signed token rather than a shared password, which is the property that makes SSO and conditional access possible at all.',
  },
  {
    id: 'p27-l1-s2',
    title: 'Concept — Authorization Is the One You Can Enumerate',
    body:
      'Authorization is implemented as an entitlement attached to something you can list: a group membership, a directory role, an ACL entry, a role claim inside a token, or a policy evaluated against attributes at access time. That listability is the practical difference from authentication — you can enumerate who holds an entitlement today, which is precisely what an access review does, and you cannot meaningfully enumerate "who could authenticate." One consequence bites constantly in practice: when a token carries group or role claims, the authorization decision was frozen at issuance, so removing a group membership does not take effect until that token expires.',
  },
  {
    id: 'p27-l1-s3',
    title: 'Concept — MFA: Some Second Factors Are Resistible, One Kind Is Not',
    body:
      'MFA is implemented as an additional challenge after the primary credential is accepted, and the implementation choice decides whether it survives a real attacker rather than a checkbox. A TOTP code or SMS message is a shared secret the user can be talked into reading aloud or typing into an attacker-controlled page. A push approval can be worn down by repeated prompts until someone taps accept. FIDO2/WebAuthn differs in kind rather than degree: the private key never leaves the authenticator and the signature is bound to the origin, so a proxy phishing site has nothing it can replay. Number matching and push throttling mitigate push fatigue; origin binding removes the attack.',
  },
  {
    id: 'p27-l1-s4',
    title: 'Concept — SSO Is Federation, and Its Failures Are Token Failures',
    body:
      'SSO is implemented as federation between a service provider and an identity provider that trust each other through a certificate or published key: the user hits the application, is redirected, authenticates once, and returns holding a signed SAML assertion or an OIDC ID token, plus an OAuth access token for APIs. The user\'s password never reaches the application. Three implementation details cause most real incidents — assertion signature validation skipped or misconfigured, token lifetimes that outlive an access revocation, and OAuth consent grants that keep working after a password reset because the refresh token was never revoked. All three are token problems, not password problems, which is why "we reset the password" is not containment in a federated estate.',
  },
  {
    id: 'p27-l1-s5',
    title: 'Concept — RBAC Fails by Drift, Not by Design',
    body:
      'RBAC is implemented as a role definition (a named permission bundle), an assignment to a principal, and usually a scope the assignment applies to. The model is rarely the problem; the drift is. Roles get created per person instead of per job, users accumulate assignments as they change teams, nobody removes the old ones, and "role-based" quietly degrades into per-user access with extra administrative steps. Working implementations therefore pair RBAC with two things the exam does not emphasise: periodic certification, and role mining that derives what the roles should be from what people actually use.',
  },
  {
    id: 'p27-l1-s6',
    title: 'Example — One Sign-In, Read Four Ways',
    body:
      'A single successful sign-in record answers four different bridge questions at once. Authentication: which protocol and which directory or provider accepted it, and what was written (4624 with its Logon Type, or a provider sign-in record). MFA: which method actually satisfied the challenge — an SMS code and a passkey are not the same outcome. SSO: whether the application authenticated locally or accepted a federated assertion, which tells you whether a token now exists that outlives a password reset. Authorization: what the account could do next, which lives in its group and role assignments rather than in the sign-in record at all. Same event, four readings — this is what "connect the concepts to implementation" means in practice.',
  },
  {
    id: 'p27-l1-s7',
    title: 'Review — What Must Stick',
    body:
      'The bridge adds implementation, log evidence, and investigation habit to concepts you already hold — it does not add concepts. Authentication is a protocol exchange and the protocol decides your evidence. Authorization is the enumerable one, which is why access reviews exist, and role claims inside a token freeze the decision until expiry. Not all second factors are equal: shared secrets are phishable, origin-bound keys are not. SSO is federation, and its characteristic failures are token failures — which is why a password reset alone never contains a federated compromise. RBAC fails by drift, and certification plus role mining are the countermeasures.',
  },
];

const LESSON_27_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p27-q0',
    type: 'mcq',
    stem: 'What does the Security+-to-IAM bridge add to a concept the learner has already studied?',
    options: [
      'How the control is actually implemented, what it writes to a log, and what an analyst does when it fails',
      'An entirely new set of identity concepts that replace the earlier ones',
      'Vendor console click-paths, taught before the underlying concepts',
      'A separate mastery-tracking system specific to identity work',
    ],
    answer: 0,
    explanation:
      'The bridge deliberately adds implementation detail, log evidence, and investigation habit on top of existing tracked concepts — it introduces no parallel concept taxonomy and no separate mastery system.',
    domain: 'Security Architecture',
    conceptId: 'iam-implementation',
  },
  {
    id: 'p27-q1',
    type: 'mcq',
    stem: 'Why does Kerberos authentication avoid replaying the user\'s password to every service they access?',
    options: [
      'The client obtains a ticket-granting ticket once, then presents a per-service ticket to each resource',
      'Kerberos encrypts the password and sends it to each service individually',
      'Kerberos requires the user to re-enter the password for every resource',
      'Kerberos does not authenticate users, only computers',
    ],
    answer: 0,
    explanation:
      'Ticket-based authentication is the point of Kerberos: authenticate once to the KDC for a TGT, then present service tickets. The password itself never reaches the individual services — and 4768/4769 are the resulting audit trail.',
    domain: 'Security Architecture',
    conceptId: 'kerberos',
  },
  {
    id: 'p27-q2',
    type: 'mcq',
    stem: 'What practical property distinguishes authorization from authentication in an enterprise identity estate?',
    options: [
      'Authorization is an entitlement you can enumerate — you can list who holds it today, which is what an access review does',
      'Authorization happens before authentication in every protocol flow',
      'Authorization is never recorded in any log, unlike authentication',
      'Authorization applies only to service accounts, not to human users',
    ],
    answer: 0,
    explanation:
      'Entitlements (group memberships, directory roles, ACL entries, role claims) are listable, which is exactly what makes access reviews and certification campaigns possible. "Who could authenticate" is not meaningfully enumerable in the same way.',
    domain: 'Security Architecture',
    conceptId: 'authorization',
  },
  {
    id: 'p27-q3',
    type: 'mcq',
    stem: 'Why does FIDO2/WebAuthn resist phishing in a way that a TOTP code or SMS message does not?',
    options: [
      'The private key never leaves the authenticator and the signature is bound to the origin, so a proxy site has nothing it can replay',
      'The codes it generates are longer and therefore harder to guess',
      'It requires the user to be physically present in the office',
      'It rotates the user\'s password automatically after each sign-in',
    ],
    answer: 0,
    explanation:
      'TOTP and SMS are shared secrets a user can be talked into typing into an attacker-controlled page. Origin binding means the signature is only valid for the real site, so relaying it fails — a difference in kind, not degree.',
    domain: 'Security Architecture',
    conceptId: 'phishing-resistant-mfa',
  },
  {
    id: 'p27-q4',
    type: 'mcq',
    stem: 'In a federated SSO implementation, what does the application actually receive after the user authenticates?',
    options: [
      'A signed assertion or token from the identity provider — the user\'s password never reaches the application',
      'The user\'s password, forwarded securely by the identity provider',
      'A hash of the user\'s password for local verification',
      'Nothing — the application must independently prompt for credentials again',
    ],
    answer: 0,
    explanation:
      'Federation means the identity provider authenticates and returns a signed SAML assertion or OIDC ID token. Keeping the password away from the application is the security benefit; the resulting token is also the thing a password reset does not revoke.',
    domain: 'Security Architecture',
    conceptId: 'federation',
  },
  {
    id: 'p27-q5',
    type: 'mcq',
    stem: 'What is the characteristic failure mode of RBAC in a real deployment?',
    options: [
      'Drift — roles created per person rather than per job, and assignments accumulating as people change teams without old ones being removed',
      'The model itself is mathematically unsound and cannot express real permissions',
      'RBAC cannot be logged, so changes are invisible',
      'RBAC only works if every user has exactly one role for their entire employment',
    ],
    answer: 0,
    explanation:
      'RBAC decays rather than breaks. Per-person roles and accumulated assignments turn it into per-user access with extra steps, which is why certification campaigns and role mining exist as countermeasures.',
    domain: 'Security Architecture',
    conceptId: 'rbac',
  },
  {
    id: 'p27-q6',
    type: 'scenario',
    stem: 'A user is removed from a security group that granted access to a finance application, but they continue to reach it for another 50 minutes. The removal was applied correctly. What is the most likely explanation?',
    options: [
      'Their existing token still carries the group or role claim, so the authorization decision stays frozen until the token expires',
      'Group removals never affect application access in any implementation',
      'The user must have re-added themselves to the group',
      'The application does not perform authorization at all',
    ],
    answer: 0,
    explanation:
      'When authorization travels as a claim inside an issued token, the decision was made at issuance. Until the token expires or is revoked, the removal has no effect — which is why revocation, not just removal, is part of identity containment.',
    examClue:
      'When an access change appears not to take effect, look for a cached or token-borne decision before assuming the change failed.',
    domain: 'Security Architecture',
    conceptId: 'authorization',
  },
  {
    id: 'p27-q7',
    type: 'scenario',
    stem: 'An account receives 19 push approval prompts in four minutes, and the 20th is approved. The sign-in then succeeds from an unfamiliar network. What has most likely happened, and what implementation change addresses it?',
    options: [
      'MFA fatigue — the user approved a prompt to make them stop; move to number matching as a mitigation and to an origin-bound factor such as a passkey as the fix',
      'A network fault duplicated one legitimate prompt; no change is needed',
      'The account has no MFA configured, so the prompts are unrelated to the sign-in',
      'Push notifications are inherently phishing-resistant, so the sign-in must be legitimate',
    ],
    answer: 0,
    explanation:
      'Repeated prompts followed by an approval is the push-fatigue signature. Number matching raises the effort required; an origin-bound factor removes the possibility of an attacker driving the prompt at all.',
    domain: 'Security Architecture',
    conceptId: 'mfa',
  },
  {
    id: 'p27-q8',
    type: 'scenario',
    stem: 'An analyst is asked in an interview: "how would you check whether an account had more access than it should?" Which answer reflects the implementation-level understanding this lesson teaches?',
    options: [
      'Enumerate the account\'s group memberships and role assignments, then compare them against peers in the same job function to find entitlements only this account holds',
      'Check whether the account\'s password meets the current complexity policy',
      'Confirm the account can authenticate successfully to the domain',
      'Verify the account has MFA registered on at least one method',
    ],
    answer: 0,
    explanation:
      'Excess access is an authorization question, answered by enumerating and peer-comparing entitlements. Password policy and MFA registration are authentication properties and say nothing about what the account may do.',
    domain: 'Security Architecture',
    conceptId: 'least-privilege',
  },
  {
    id: 'p27-q-pbq',
    type: 'pbq',
    stem: 'Order the events in an enterprise web application sign-in with federation.',
    options: [
      'User enters credentials at the corporate identity provider',
      'Identity provider validates the credentials and issues a token',
      'Application receives the token and validates the signature',
      'Application checks the user\'s authorization and serves the resource',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'Authentication is proving who you are to the IdP, then exchanging a trust token with the application, and finally the application decides what that identity is allowed to do.',
    domain: 'Security Architecture',
    conceptId: 'authentication',
  },
];

// ---------- Lesson 2: Zero Trust, Privileged Access, and IAM Investigation ----------

const LESSON_27_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p27-l2-s0',
    title: 'Concept — Zero Trust Makes Identity the Control Plane',
    body:
      'Once network location confers no trust, the identity provider becomes the policy enforcement point — which is why Zero Trust is an identity project in practice whatever the network diagram suggests. It is implemented as conditional access policy: on every authentication, evaluate signals (user risk, sign-in risk, device compliance, location, application sensitivity, client app) and decide allow, step up to a stronger factor, or block. Two properties matter beyond the exam definition. Decisions are continuous rather than once-at-login, so a session can be re-evaluated when risk changes. And policy is evaluated per resource, because "verified once, trusted everywhere" is precisely the implicit trust Zero Trust exists to remove.',
  },
  {
    id: 'p27-l2-s1',
    title: 'Concept — The Finding Is Usually the Exclusion',
    body:
      'When you review a suspicious sign-in in a Zero Trust estate, read the policy evaluation result before you read anything about the user. A sign-in that succeeded because it fell into a policy exclusion is a policy finding, not a user finding: the control did not fail, it was never applied. Break-glass accounts, legacy service accounts that cannot do modern authentication, and "temporary" carve-outs from a rollout are the standing exclusions in most environments, and they are where attackers land for exactly that reason. An exclusion list nobody reviews is a documented set of paths where your controls do not run.',
  },
  {
    id: 'p27-l2-s2',
    title: 'Concept — Privileged Access Is Four Stacked Controls',
    body:
      'PAM is implemented as four controls that stack, all shrinking the same two quantities — how long privilege exists, and how many places a privileged credential can be stolen from. Vaulting removes the standing shared password and rotates it. Brokering routes the admin through a proxy that holds the credential, so the human never learns it. Just-in-time elevation grants the privileged role for a bounded window with an approval and a stated reason, so there is no standing admin. Session recording makes the activity reviewable afterwards. The audit test that proves any of it works is reconciliation: every privileged action should match an activation or checkout record, and privileged activity without one means either an unmanaged standing account or a credential used outside the broker.',
  },
  {
    id: 'p27-l2-s3',
    title: 'Concept — Identity Telemetry Comes From Three Places',
    body:
      'Identity evidence arrives from the directory (Kerberos and logon events, account and group changes), the identity provider (sign-in logs, which MFA method was satisfied, conditional-access results, token and consent issuance), and the endpoint (interactive logons, privilege assignment, process creation under the account). None of the three is sufficient alone: a directory shows the group change but not the risky sign-in that preceded it, and a provider shows the token issuance but not what the account then did on a host. The events themselves are also not automatic — advanced audit policy must be enabled before the incident, which is why accounting is a control rather than a by-product. An event that was never logged cannot be investigated afterwards.',
  },
  {
    id: 'p27-l2-s4',
    title: 'Concept — Identity Containment Has Its Own Checklist',
    body:
      'For an identity incident the IR lifecycle is unchanged but the containment actions are specific, and this is the checklist a host-focused analyst routinely gets wrong. Reset the credential. Revoke sessions and refresh tokens. Remove attacker-registered MFA methods. Review and revoke OAuth consent grants. Reverse group, role, and delegation changes made while the account was held. Then re-check the account against its peers for residual entitlements. The credential reset alone leaves three working paths: a refresh token issued before the reset, an attacker-registered authenticator that satisfies MFA on the new password, and a consent grant with offline access that needs no password at all.',
  },
  {
    id: 'p27-l2-s5',
    title: 'Concept — Concepts Before Vendors, and Why the Order Is Fixed',
    body:
      'Vendor features are interchangeable; the concepts are not. Entra ID Conditional Access, Okta adaptive authentication, and Ping policy orchestration are three products implementing one idea — evaluate signals at access time, then allow, step up, or block. Learn the idea and all three become configuration you can read. Learn the console first and you can operate one product without being able to explain, defend, or troubleshoot the decision it made, which is precisely what an interview probes and what an incident review demands. This platform enforces the order in data rather than advice: each vendor stays locked until every one of its prerequisite concepts is above the weak-area threshold.',
  },
  {
    id: 'p27-l2-s6',
    title: 'Concept — The Vendor Landscape, Read as Categories',
    body:
      'Six platforms, four categories. Active Directory is the on-premises directory (Kerberos, LDAP) still underneath most hybrid estates. Microsoft Entra ID, Okta, and Ping Identity are identity providers and federation platforms — Entra ID tied to the Microsoft estate with Conditional Access and PIM, Okta vendor-neutral with a large application catalogue, Ping strongest where standards must be translated and authentication journeys orchestrated. CyberArk is privileged access management: vault, broker, record. SailPoint is identity governance: role modelling, certification campaigns, joiner/mover/leaver automation. Read job postings by category, not by name — "Okta or Ping" is asking for federation, "CyberArk or Delinea" is asking for privileged access, and the category tells you which concepts to study.',
  },
  {
    id: 'p27-l2-s7',
    title: 'Example — One Prepared Timeline, Read End to End',
    body:
      'A prepared timeline for one lab account shows: 23 failed sign-ins from an unfamiliar network, then a success with SMS satisfying MFA, a risk detection, a new authenticator app registered, an OAuth consent grant with offline access to a third-party mail client, a 4728 adding the account to Helpdesk Operators, a 4624 Logon Type 3 to a file server, and a 4672 privileged logon. Read the shape rather than the lines: spray, success on a weak second factor, persistence, privilege, use. Any single line is noise; the order is the incident. And the containment implied by that order is five actions long, only the first of which is a password reset.',
  },
  {
    id: 'p27-l2-s8',
    title: 'Review — What Must Stick',
    body:
      'Zero Trust relocates enforcement to the identity provider, evaluated per resource and continuously — and the finding is usually an exclusion, not a user. PAM is vault, broker, just-in-time, and record, proven by reconciling privileged actions against activation records. Identity telemetry needs all three sources correlated on the account, and only exists if auditing was configured beforehand. Identity containment is a five-step checklist where the password reset is step one of five, and the test is "what could the attacker still do?" Concepts come before vendors because products are interchangeable and concepts transfer; the six platforms are best read as four categories.',
  },
];

const LESSON_27_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p27-q9',
    type: 'mcq',
    stem: 'Why is Zero Trust described as an identity project in practice?',
    options: [
      'Removing implicit network trust makes the identity provider the policy enforcement point for every access decision',
      'Zero Trust replaces all network controls with identity controls and eliminates the need for segmentation',
      'Zero Trust applies only to identity systems and not to any other asset class',
      'Identity teams are traditionally the ones who own firewall rules',
    ],
    answer: 0,
    explanation:
      'When location no longer confers trust, something must evaluate each access request — and that something is the identity provider. Network controls still matter; they simply stop being the source of trust.',
    domain: 'Security Architecture',
    conceptId: 'zero-trust',
  },
  {
    id: 'p27-q10',
    type: 'mcq',
    stem: 'What does a conditional access policy actually evaluate, and what does it decide?',
    options: [
      'Signals such as user risk, sign-in risk, device compliance, location, and application sensitivity — deciding allow, step up to a stronger factor, or block',
      'Only the user\'s password strength, deciding accept or reject',
      'Only the source IP address, deciding whether it is on the corporate network',
      'Nothing at sign-in time; it applies retroactively during monthly reviews',
    ],
    answer: 0,
    explanation:
      'Conditional access is the policy-engine concept implemented: multiple signals in, a three-way decision out, evaluated per resource on every authentication rather than once at login.',
    domain: 'Security Architecture',
    conceptId: 'conditional-access',
  },
  {
    id: 'p27-q11',
    type: 'mcq',
    stem: 'Which four controls make up a privileged access management implementation?',
    options: [
      'Credential vaulting, brokered sessions, just-in-time elevation, and session recording',
      'Password complexity, password history, password expiry, and password length',
      'Firewall rules, IDS signatures, WAF policies, and proxy allowlists',
      'Antivirus, EDR, host firewall, and disk encryption',
    ],
    answer: 0,
    explanation:
      'All four shrink the same two quantities — how long privilege exists and how many places a privileged credential can be stolen from. Password policy is a different control entirely.',
    domain: 'Security Operations',
    conceptId: 'pam',
  },
  {
    id: 'p27-q12',
    type: 'mcq',
    stem: 'Which three sources must be correlated to build a complete identity incident timeline?',
    options: [
      'The directory or domain controller, the identity provider, and the endpoint',
      'The firewall, the web proxy, and the mail gateway',
      'The vulnerability scanner, the asset inventory, and the patch server',
      'The identity provider alone, since it records every identity event',
    ],
    answer: 0,
    explanation:
      'None of the three is sufficient alone: the directory shows the group change but not the risky sign-in, and the provider shows the token issuance but not what the account did on a host.',
    domain: 'Security Operations',
    conceptId: 'identity-telemetry',
  },
  {
    id: 'p27-q13',
    type: 'mcq',
    stem: 'Why must advanced audit policy be considered a security control rather than a by-product of running a directory?',
    options: [
      'Identity events exist as evidence only if auditing was configured to record them before the incident — an unlogged event cannot be investigated afterwards',
      'Audit policy encrypts the event log so attackers cannot read it',
      'Audit policy prevents group membership changes from being made at all',
      'Audit policy is enabled by default for every useful event, so it needs no attention',
    ],
    answer: 0,
    explanation:
      'This is accounting, the third A of AAA, in operational form. The useful identity events are not all logged by default, and the configuration decision has to be made before you need the evidence.',
    domain: 'Security Operations',
    conceptId: 'accounting',
  },
  {
    id: 'p27-q14',
    type: 'mcq',
    stem: 'Why does this platform keep vendor-specific IAM detail locked until the prerequisite concepts are above the weak-area threshold?',
    options: [
      'Vendor features are interchangeable implementations of concepts that transfer — knowing the console without the concept means being unable to explain, defend, or troubleshoot the decision the product made',
      'Vendor documentation is legally restricted to certified professionals',
      'The concepts are harder than the products, so they must be studied in a fixed order for difficulty reasons',
      'Vendor platforms change so rarely that learning them first would be equally effective',
    ],
    answer: 0,
    explanation:
      'Conditional Access, Okta adaptive authentication, and Ping orchestration are one idea in three products. The concept is what survives a change of employer, console, or interview question.',
    domain: 'General Security Concepts',
    conceptId: 'concept-before-vendor',
  },
  {
    id: 'p27-q15',
    type: 'scenario',
    stem: 'A compromised account had its password reset 20 minutes ago, yet mail is still being exfiltrated through a third-party client. Which containment step was most likely missed?',
    options: [
      'The OAuth consent grant and refresh tokens were never revoked, so the third-party client retains access without needing the password',
      'The password reset was not strong enough and must be repeated with a longer password',
      'The account needs to be deleted, as no other containment is possible',
      'The mail server needs a reboot to clear cached sessions',
    ],
    answer: 0,
    explanation:
      'A consent grant with offline access, or a refresh token issued before the reset, keeps working independently of the password. Revocation is a separate action from resetting — this is step two of the identity containment checklist.',
    examClue:
      'When access survives a credential change, look for a token, a consent grant, or a delegation rather than assuming the credential change failed.',
    domain: 'Security Operations',
    conceptId: 'iam-containment',
  },
  {
    id: 'p27-q16',
    type: 'scenario',
    stem: 'A sign-in from an unfamiliar country succeeded on an account despite a policy that should require a compliant device. The policy is enabled and correctly configured. What should the analyst check first?',
    options: [
      'Whether the account or application falls into a policy exclusion, meaning the control was never applied rather than having failed',
      'Whether the user\'s password was recently changed',
      'Whether the endpoint has antivirus definitions up to date',
      'Whether the identity provider was offline at the time',
    ],
    answer: 0,
    explanation:
      'Read the policy evaluation result before the user. Break-glass accounts, legacy service accounts, and temporary carve-outs are standing exclusions, and a success inside one is a policy finding, not a control failure.',
    domain: 'Security Architecture',
    conceptId: 'zero-trust',
  },
  {
    id: 'p27-q17',
    type: 'scenario',
    stem: 'A privileged action is found in a domain controller log with no matching vault checkout or just-in-time activation record. What does this indicate?',
    options: [
      'Either an unmanaged standing privileged account or a credential used outside the broker — both of which defeat the PAM controls entirely',
      'A normal condition, since privileged actions are not expected to correlate with activation records',
      'That the PAM platform is functioning correctly and no follow-up is required',
      'That the log entry is corrupt and should be discarded',
    ],
    answer: 0,
    explanation:
      'Reconciling privileged actions against activation or checkout records is the audit test that proves the PAM controls are actually in the access path rather than merely deployed. An unreconciled action is the finding.',
    domain: 'Security Operations',
    conceptId: 'pam',
  },
  {
    id: 'p27-q18',
    type: 'scenario',
    stem: 'A job posting asks for "experience administering Okta or Ping Identity." Read as a category rather than a product list, what is it actually asking for?',
    options: [
      'Federation and single sign-on skills — SAML/OIDC assertion flows, application onboarding, and sign-on policy',
      'Privileged access management skills — vaulting, session brokering, and recording',
      'Identity governance skills — access certification campaigns and role mining',
      'On-premises directory administration — Kerberos and LDAP troubleshooting',
    ],
    answer: 0,
    explanation:
      'Both named products are identity providers and federation platforms, so the underlying request is federation and SSO. CyberArk would signal PAM, SailPoint would signal governance, and Active Directory would signal on-premises directory work.',
    domain: 'General Security Concepts',
    conceptId: 'concept-before-vendor',
  },
  {
    id: 'p27-q19',
    type: 'scenario',
    stem: 'A learner whose mastery of federation, SAML, and OIDC is at level 1 wants to skip ahead and study the Okta admin console. What does this phase\'s gating logic do, and why?',
    options: [
      'It keeps the Okta detail locked and names the specific prerequisite concepts to revisit, because an application integration is configuration of an assertion flow that must be understood first',
      'It unlocks the vendor detail anyway, since consoles can be learned independently of the protocols beneath them',
      'It permanently blocks the learner from ever viewing that vendor\'s material',
      'It unlocks the vendor detail because the average of the three concept levels is what matters, not each one',
    ],
    answer: 0,
    explanation:
      'The gate requires every prerequisite concept to be above the threshold, not the average — "learn the concept first" fails if one prerequisite is missing even when the others are strong. The gate also names which concepts to revisit.',
    domain: 'General Security Concepts',
    conceptId: 'concept-before-vendor',
  },
];

// ---------- Lab 1: Trace an Identity Incident Across Three Log Sources ----------

const LAB_27_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the identity event IDs an IAM analyst reads, grouped by what they prove.',
    command: 'explain identity event ids',
    expected:
      'Authentication, account/group management, and privilege event IDs, with the note that advanced audit policy must be enabled first.',
  },
  {
    id: 's1',
    instruction: 'Review the prepared per-account timeline spanning identity provider, directory, and endpoint.',
    command: 'show identity timeline',
    expected:
      'A single lab account\'s events in time order across three sources: spray, success, persistence, privilege, use.',
  },
  {
    id: 's2',
    instruction: 'Review how Zero Trust policy evaluation appears in that timeline, and where exclusions hide.',
    command: 'explain zero trust identity',
    expected: 'Signals, the allow/step-up/block decision, and why the exclusion is usually the finding.',
  },
  {
    id: 's3',
    instruction: 'Review the identity containment checklist and compare it against the timeline you just read.',
    command: 'show iam containment checklist',
    expected: 'Six containment steps, with the password reset explicitly identified as only the first.',
  },
];

const LAB_27_0: Lab = {
  id: 'p27-lab-0',
  phaseId: 'phase-27',
  title: 'Trace an Identity Incident Across Three Log Sources',
  objective:
    'Read a prepared per-account identity timeline spanning identity provider, directory, and endpoint; state the attack shape it shows; and produce the containment checklist it requires, explaining why a credential reset alone leaves working access paths.',
  securityConcepts: [
    'Identity event IDs and what each proves',
    'Correlating provider, directory, and endpoint telemetry on one account',
    'Zero Trust policy evaluation and exclusions',
    'Identity containment: sessions, tokens, MFA methods, consent grants',
  ],
  environment:
    'Deterministic simulator with prepared identity log excerpts — no directory, identity provider, or live system is queried; all accounts and addresses are lab-only',
  topology:
    'Three telemetry sources for one lab account: identity provider sign-in and audit logs, domain controller Security log, and endpoint Security log (192.168.20.0/24 lab segment)',
  prerequisites: [
    'Complete Phase 5 (Identity & Access Management) so authentication, MFA, SSO, and RBAC concepts are in place',
    'Complete Phase 12 (Incident Response) so the IR lifecycle is familiar before it is applied to identity',
  ],
  steps: LAB_27_0_STEPS,
  expectedResults: [
    'Learner can name what each identity event ID in the timeline proves',
    'Learner states the attack shape (spray, weak-factor success, persistence, privilege, use) rather than listing individual lines',
    'Learner identifies the two persistence actions that survive a password reset',
    'Learner produces the full containment checklist in order, with the credential reset as step one of six',
  ],
  verification: [
    'Learner can explain why 4728 timestamped inside the incident window differs in meaning from one dated two years earlier',
    'Learner can state which MFA method satisfied the successful sign-in and why that matters',
    'Learner can name at least three containment steps beyond the credential reset and what each one closes',
    'Learner can explain why a sign-in that succeeded inside a policy exclusion is a policy finding rather than a control failure',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Timeline looks like unrelated noise → read it as a shape, not as lines. Group the events into spray, success, persistence, privilege, and use before interpreting any single entry.',
    'Unsure whether an event is persistence or use → ask whether it would still grant access after a password reset. MFA method registration and consent grants would; a network logon would not.',
    'Cannot find an expected event in the timeline → it may never have been logged. Advanced audit policy is a prerequisite, and its absence is itself a finding to report.',
  ],
  challenge:
    'Write the escalation note for this timeline: three sentences of observation, assessment, and recommendation, followed by the containment checklist in the order you would execute it. Include, for each step, the specific access path that step closes. Do not recommend any action that destroys the timeline evidence.',
  evidence: [
    {
      id: 'ev0',
      label: 'Annotated identity timeline',
      type: 'log',
      placeholder: 'Paste the timeline and annotate each line with what it proves and which source it came from',
    },
    {
      id: 'ev1',
      label: 'Escalation note and containment checklist',
      type: 'report',
      placeholder: 'Observation, assessment, recommendation, then each containment step and the access path it closes',
    },
  ],
  securityLesson:
    'Identity incidents are contained wrong more often than they are detected wrong. The password reset feels like the fix, so the refresh token, the attacker-registered authenticator, and the consent grant are left in place — and the account is compromised again within the hour. The habit that prevents this is a question, asked after every containment step: what could the attacker still do?',
};

// ---------- Lab 2: Map Vendor Features Back to the Concepts They Implement ----------

const LAB_27_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Review the nine bridge topics and the concept IDs each one builds on.',
    command: 'show iam bridge topics',
    expected: 'Nine implementation questions, each tagged with concepts already tracked by earlier phases.',
  },
  {
    id: 's1',
    instruction: 'Review why the concept must be learned before the vendor implementation.',
    command: 'explain concept before vendor',
    expected: 'Three products, one idea — plus the threshold rule that gates each vendor.',
  },
  {
    id: 's2',
    instruction: 'Review the six vendor platforms as four categories, with their prerequisite concepts.',
    command: 'show iam vendor landscape',
    expected: 'Directory/IdP, PAM, and IGA categories, each vendor listed with the concepts that gate it.',
  },
  {
    id: 's3',
    instruction: 'Review privileged access management as four stacked controls before reading any PAM vendor detail.',
    command: 'explain privileged access management',
    expected: 'Vaulting, brokering, just-in-time, and recording, plus the reconciliation audit test.',
  },
  {
    id: 's4',
    instruction: 'Review how the bridge topics map onto the IAM career ladder.',
    command: 'show iam career ladder',
    expected: 'Entry, junior-mid, and specialist rows, each with the concepts that row is assessed on.',
  },
];

const LAB_27_1: Lab = {
  id: 'p27-lab-1',
  phaseId: 'phase-27',
  title: 'Map Vendor Features Back to the Concepts They Implement',
  objective:
    'Complete the concept-before-vendor exercise: given a named feature from Entra ID, Active Directory, Okta, Ping Identity, CyberArk, or SailPoint, identify which of the nine bridge topics it implements, then read a job posting by category rather than by product name.',
  securityConcepts: [
    'Concept-before-vendor discipline',
    'Vendor feature to underlying concept mapping',
    'IAM vendor categories: directory, identity provider, PAM, governance',
    'Reading job postings by category',
  ],
  environment:
    'Deterministic reference material and a classification exercise — no vendor tenant, trial, licence, or API is involved at any point',
  topology: 'Not applicable — this lab is a concept-mapping exercise',
  prerequisites: [
    'Complete Phase 27 Lab 0 (Trace an Identity Incident Across Three Log Sources)',
    'Complete Phase 26 (Career Mode) so skill-to-concept mapping is already familiar',
  ],
  steps: LAB_27_1_STEPS,
  expectedResults: [
    'Learner classifies every vendor feature in the exercise to the bridge topic it implements',
    'Learner can state which vendor platforms are currently gated for them and which concepts unlock each one',
    'Learner names the four vendor categories and one platform in each',
    'Learner reads a sample job posting by category and states which concepts it is really asking about',
  ],
  verification: [
    'Learner can explain why Conditional Access, Okta adaptive authentication, and Ping orchestration are one concept in three products',
    'Learner can distinguish a just-in-time elevation feature (privileged access) from a conditional access policy (Zero Trust), which are commonly confused',
    'Learner can name their weakest gated prerequisite concept and the vendor it currently blocks',
    'Learner can restate a product-named job requirement as the underlying concept requirement',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'A vendor stays locked despite strong mastery elsewhere → the gate requires every prerequisite concept above the threshold, not the average. Check which specific concept it names as missing.',
    'Confusing PIM with Conditional Access → ask what is being decided. Time-bound elevation with approval is privileged access; evaluating signals to allow, step up, or block is Zero Trust policy.',
    'Two topics both seem to fit a feature → pick the one whose failure the feature exists to prevent. Certification campaigns exist because entitlements accumulate, which makes them authorization rather than authentication.',
  ],
  challenge:
    'Find one real, publicly posted IAM job description and rewrite every product name in it as the underlying concept and bridge topic it implies. Then list, from your own mastery data, which of those concepts are currently gaps — that list is your study plan for that specific role.',
  evidence: [
    {
      id: 'ev0',
      label: 'Vendor feature classification results',
      type: 'log',
      placeholder: 'Your topic choice for each vendor feature, plus the rationale shown after grading',
    },
    {
      id: 'ev1',
      label: 'Job posting translated to concepts',
      type: 'report',
      placeholder: 'Each product name in the posting, the concept it implies, and whether it is currently a gap for you',
    },
  ],
  securityLesson:
    'Product knowledge expires with the product; the concept behind it transfers to the next console, the next employer, and the next interview. This is why the order is fixed rather than advisory — a candidate who can explain what a policy engine evaluates will learn any vendor\'s console in a week, while a candidate who only knows one console cannot explain the decision it made when an incident review asks.',
};

// ---------- Lessons ----------

const LESSON_27_L1: Lesson = {
  id: 'p27-lesson-0',
  phaseId: 'phase-27',
  title: 'How Security+ Identity Controls Are Actually Implemented',
  objectives: [
    'State what the bridge adds to a concept already studied: implementation, log evidence, investigation habit',
    'Explain authentication as a protocol exchange, and how the protocol determines the available evidence',
    'Explain why authorization is enumerable, and why token-borne role claims delay revocation',
    'Distinguish phishable second factors from origin-bound ones, and name the mitigation versus the fix',
    'Explain SSO as federation and identify its three characteristic token-level failures',
    'Explain RBAC drift and the two countermeasures real implementations pair with it',
  ],
  sections: LESSON_27_L1_SECTIONS,
  quiz: LESSON_27_L1_QUIZ,
  concepts: [
    'iam-implementation',
    'authentication',
    'authorization',
    'mfa',
    'sso',
    'rbac',
    'kerberos',
    'federation',
    'phishing-resistant-mfa',
    'least-privilege',
  ],
  homework:
    'Take one sign-in from your own account history and read it four ways: authentication, MFA method, federation, and what the account could then do. Write down which of the four the sign-in record cannot tell you.',
  careerConnection:
    'IAM Analyst / Junior IAM Engineer — this is the difference between reciting that SSO uses SAML and being able to say what the assertion contains, what it does not revoke, and which log records it.',
};

const LESSON_27_L2: Lesson = {
  id: 'p27-lesson-1',
  phaseId: 'phase-27',
  title: 'Zero Trust, Privileged Access, and IAM Incident Investigation',
  objectives: [
    'Explain why Zero Trust makes the identity provider the policy enforcement point',
    'Read a suspicious sign-in policy-evaluation-first and recognise an exclusion as a policy finding',
    'Name the four stacked PAM controls and the reconciliation test that proves they work',
    'Correlate identity telemetry across provider, directory, and endpoint on a single account',
    'Execute the identity containment checklist in order and state what each step closes',
    'Apply the concepts-before-vendors rule and read the six-platform landscape as four categories',
  ],
  sections: LESSON_27_L2_SECTIONS,
  quiz: LESSON_27_L2_QUIZ,
  concepts: [
    'zero-trust',
    'conditional-access',
    'pam',
    'identity-telemetry',
    'iam-containment',
    'concept-before-vendor',
    'accounting',
    'ir-lifecycle',
  ],
  homework:
    'Write the identity containment checklist from memory, and beside each step name the access path it closes. Then pick one vendor platform and find where in its console each step would be performed.',
  careerConnection:
    'IAM Engineer / PAM and IGA tracks — the containment checklist and the reconciliation test are both things an interviewer can hear you either have or do not have within about ten seconds.',
};

// ---------------------------------------------------------------------------
// Phase 27 export
// ---------------------------------------------------------------------------

export const PHASE_27: Phase = {
  id: 'phase-27',
  number: 27,
  title: 'Security+ to IAM Career Bridge',
  description:
    'Connect every relevant Security+ concept to how identity is actually implemented, logged, and investigated — authentication, authorization, MFA, SSO, RBAC, Zero Trust, privileged access, identity telemetry, and IAM incident containment — then meet the vendor platforms, gated behind the concepts they implement.',
  examDomain: 'Career',
  scene: 'iam-bridge',
  lessons: [LESSON_27_L1, LESSON_27_L2],
  labs: [LAB_27_0, LAB_27_1],
};
