import type { Lab, Lesson, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 5 — Identity & Access Management
// Aligned with CompTIA Security+ SY0-701
//
// CLAUDE.md marks this a MAJOR CAREER COMPONENT, and PROMPT.md pairs it with
// Phase 27 (the Security+ -> IAM career bridge). Depth here is deliberate.
// ---------------------------------------------------------------------------

const LESSONS: Lesson[] = [
  {
    id: 'p5-lesson-0',
    phaseId: 'phase-5',
    title: 'Identity and the AAA Model in Practice',
    objectives: [
      'Define identity as distinct from an account and from a person',
      'Trace authentication, authorisation, and accounting through real systems',
      'Explain what an identity provider is and why it concentrates risk',
      'Explain why identity is the control plane in a modern estate',
    ],
    concepts: ['identity', 'authentication', 'authorization', 'accounting', 'identity-provider'],
    homework:
      'Write out one real sign-in you performed today and separate it into authentication, authorization, and accounting. State which log would evidence each of the three.',
    careerConnection:
      'IAM Analyst — this vocabulary is the job description. Every ticket you handle is one of the three As, and routing it correctly starts with naming which.',
    sections: [
      {
        id: 'p5-l0-s0',
        title: 'Concept — Identity, account, person',
        body: "These three are routinely conflated and are not the same thing. A person is a human being. An identity is the digital representation of that person in your systems — one identity, ideally, no matter how many systems. An account is one system's local record of that identity. One person, one identity, many accounts. When someone has two identities you get the duplicate-account problem; when one identity is shared by several people you get the Phase 2 non-repudiation failure.",
      },
      {
        id: 'p5-l0-s1',
        title: 'Concept — AAA through real systems',
        body: 'You met AAA as vocabulary in Phase 2. Here it is as plumbing. Authentication: the identity provider validates a credential and a second factor. Authorisation: the application evaluates role membership or attributes against the requested resource. Accounting: the sign-in event, the entitlement change, and the privileged elevation all land in the SIEM. Each A lives in a different system, which is exactly why identity incidents are hard to investigate.',
      },
      {
        id: 'p5-l0-s2',
        title: 'Concept — The identity provider',
        body: 'An IdP is the system that authenticates users and issues assertions other applications trust. Entra ID, Okta, Ping, and Active Directory Federation Services all fill this role. The benefit is enormous: one place to enforce MFA, one place to apply conditional access, one place to revoke. The cost is concentration — compromise the IdP and you have compromised every application that trusts it. This is why the IdP belongs in the most trusted zone, reachable only through the controls Phase 4 described.',
      },
      {
        id: 'p5-l0-s3',
        title: 'Concept — Identity as the control plane',
        body: 'In a network-centric estate, the firewall was the control plane: you decided what could reach what. With cloud services and remote work, the network boundary stopped being where decisions could be made — traffic to a SaaS application never touches your firewall. Identity became the place where policy is enforced instead. This is why "identity is the new perimeter" gets repeated, and why IAM roles have grown so quickly.',
      },
      {
        id: 'p5-l0-s4',
        title: 'Example — One sign-in, three systems',
        body: 'An analyst opens the finance application. The IdP validates the password and the security key — authentication. The application reads the assertion and checks the role grants access to that report — authorisation. The sign-in, the MFA result, and the resource access are written to three different logs and correlated in the SIEM — accounting. When the analyst says "I cannot get in", your first job is deciding which of those three failed.',
      },
      {
        id: 'p5-l0-s5',
        title: 'Scenario — Routing the ticket correctly',
        body: 'A user reports "access denied". If they never got a credential prompt, suspect conditional access or the application registration. If they authenticated and were then refused, that is authorisation — a role or entitlement problem, not a password problem. If they got in but you cannot prove what they did, that is accounting. Three different teams, three different fixes, and the distinction takes about ten seconds to make once you have the model.',
      },
      {
        id: 'p5-l0-s6',
        title: 'Review — What must stick',
        body: 'Person, identity, account are three distinct things. Authentication proves who, authorisation decides what, accounting records the fact. Each lives in a different system. The IdP centralises enforcement and concentrates risk. Identity is the control plane wherever the network boundary no longer sees the traffic.',
      },
    ],
    quiz: [
      {
        id: 'p5-q0',
        type: 'mcq',
        stem: 'A user authenticates successfully but is refused when opening a report. Which control refused them?',
        options: ['Authentication', 'Authorisation', 'Accounting', 'Federation'],
        answer: 1,
        explanation:
          'Authentication already succeeded — identity was established. The refusal is about what that identity is permitted to do, which is authorisation. Resetting their password would achieve nothing.',
        examClue:
          'Successful login followed by a denial is always authorisation, never authentication.',
        domain: 'Security Architecture',
        conceptId: 'authorization',
      },
      {
        id: 'p5-q1',
        type: 'scenario',
        stem: 'Why is compromise of the identity provider considered more serious than compromise of a single application?',
        options: [
          'The IdP stores more data than any application',
          'Every application that trusts the IdP accepts its assertions, so one compromise reaches all of them',
          'IdPs are always internet-facing and applications are not',
          'Applications can be restored from backup and IdPs cannot',
        ],
        answer: 1,
        explanation:
          'Federation means applications trust the IdP rather than verifying users themselves. That centralisation is the benefit and also the concentration of risk — which is why the IdP belongs in the most trusted zone.',
        domain: 'Security Architecture',
        conceptId: 'identity-provider',
      },
      {
        id: 'p5-q2',
        type: 'mcq',
        stem: 'One person has records in five different systems. In IAM terms, how many identities should they have?',
        options: [
          'Five, one per system',
          'One, with five accounts derived from it',
          'One per department they work in',
          'It does not matter as long as access is correct',
        ],
        answer: 1,
        explanation:
          'One person, one identity, many accounts. Multiple identities for one person is the duplicate-account problem, and it breaks both deprovisioning and access review — you will always miss one.',
        domain: 'Security Architecture',
        conceptId: 'identity',
      },
    ],
  },

  {
    id: 'p5-lesson-1',
    phaseId: 'phase-5',
    title: 'Authentication Factors, MFA and Password Policy',
    objectives: [
      'Classify authentication factors by category',
      'Explain why not all MFA resists phishing',
      'State current password policy guidance and why it changed',
      'Choose an appropriate factor for a described threat',
    ],
    concepts: ['mfa', 'authentication', 'password-policy', 'phishing-resistant-mfa'],
    homework:
      'List every MFA method on your own accounts and mark each one phishing-resistant or not. Upgrade the weakest one, and note what changed about the sign-in flow.',
    careerConnection:
      'The single most common IAM project in any organisation is an MFA rollout, and the factor choice is the decision that determines whether it actually helps.',
    sections: [
      {
        id: 'p5-l1-s0',
        title: 'Concept — The factor categories',
        body: 'Something you know: a password or PIN. Something you have: a security key, a phone, a certificate. Something you are: a fingerprint or face. Two supplementary categories appear on the exam — somewhere you are (location) and something you do (behaviour). Multi-factor means factors from different categories. A password plus a security question is not MFA, because both are things you know.',
      },
      {
        id: 'p5-l1-s1',
        title: 'Concept — Not all MFA is equal',
        body: 'This is the distinction that matters most in practice. SMS codes, TOTP codes, and push approvals all prove possession of a factor — but none of them proves the identity of the site asking. An attacker who relays your login in real time receives a genuine prompt that you approve. FIDO2 and WebAuthn are different in kind: the authenticator performs a cryptographic operation bound to the actual origin, so it simply will not respond to a lookalike domain. The relay fails even if the user cooperates completely.',
      },
      {
        id: 'p5-l1-s2',
        title: 'Concept — Password policy, and why the guidance reversed',
        body: 'Old policy demanded complexity rules and 90-day expiry. Both produced worse passwords: complexity drove predictable substitutions, and forced rotation drove incrementing digits. Current guidance, following NIST SP 800-63B, is length over complexity, no scheduled expiry, screening against known-breached passwords, and rotation only on evidence of compromise. Being able to explain why the guidance reversed is a strong interview answer.',
      },
      {
        id: 'p5-l1-s3',
        title: 'Concept — MFA fatigue and number matching',
        body: 'Push notification MFA introduced a failure mode nobody anticipated: send enough prompts and eventually someone approves one to make it stop. Number matching mitigates it by requiring the user to type a digit shown on the login screen, which cannot be satisfied by reflex. It is a genuine improvement and still not phishing-resistant — the attacker relaying the login can simply show the number too.',
      },
      {
        id: 'p5-l1-s4',
        title: 'Example — Reading the Phase 3 compromise again',
        body: 'The attack chain succeeded despite MFA being enforced. The sign-in log showed a legitimate MFA challenge that was approved, because the attacker relayed the real login and the user approved a genuine prompt. Nothing was broken; the factor was simply relayable. Swap the factor for FIDO2 and the same attack fails at the same step with no other change.',
      },
      {
        id: 'p5-l1-s5',
        title: 'Scenario — Recommending a factor',
        body: 'Asked to strengthen authentication, the weak answer is "enable MFA". The strong answer names the factor and the reason: phishing-resistant FIDO2 for privileged and high-risk accounts, number-matched push as the general baseline where hardware keys are not yet feasible, and SMS only as a temporary fallback with a plan to retire it. That answer shows you know the trade-offs rather than the acronym.',
      },
      {
        id: 'p5-l1-s6',
        title: 'Review — What must stick',
        body: 'Know, have, are — plus location and behaviour. Multi-factor means different categories. SMS, TOTP, and push are relayable; FIDO2 and WebAuthn are origin-bound and therefore phishing-resistant. Password guidance is length over complexity, breach screening, and no scheduled expiry. Number matching addresses fatigue but not relaying.',
      },
    ],
    quiz: [
      {
        id: 'p5-q3',
        type: 'mcq',
        stem: 'A system requires a password and the answer to a security question. Is this multi-factor authentication?',
        options: [
          'Yes — two credentials are required',
          'No — both are something you know, so it is single-factor',
          'Yes, provided the security question is sufficiently obscure',
          'Only if the answers are stored hashed',
        ],
        answer: 1,
        explanation:
          'Multi-factor requires factors from different categories. A password and a security answer are both knowledge, so this is two-step but single-factor.',
        examClue: 'Count categories, not credentials. Two things you know is still one factor.',
        domain: 'Security Architecture',
        conceptId: 'authentication',
      },
      {
        id: 'p5-q4',
        type: 'scenario',
        stem: 'An attacker relays a login in real time. The user receives a genuine push prompt and approves it. Which factor would have prevented this?',
        options: [
          'SMS one-time passcode',
          'TOTP authenticator code',
          'FIDO2 security key bound to the origin',
          'A longer, more complex password',
        ],
        answer: 2,
        explanation:
          'FIDO2 performs a cryptographic operation tied to the actual origin, so it will not respond to the attacker lookalike domain. SMS and TOTP codes can both be relayed, and password strength is irrelevant when the password is being proxied.',
        domain: 'Security Architecture',
        conceptId: 'phishing-resistant-mfa',
      },
      {
        id: 'p5-q5',
        type: 'mcq',
        stem: 'Why does current guidance recommend against scheduled password expiry?',
        options: [
          'Because password databases are now encrypted',
          'Because forced rotation drives predictable incremental changes that weaken passwords',
          'Because MFA makes passwords irrelevant',
          'Because users cannot remember more than one password',
        ],
        answer: 1,
        explanation:
          'Users respond to forced rotation by incrementing a digit or making a predictable substitution. Current guidance is length, breach screening, and rotation only on evidence of compromise.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'password-policy',
      },
      {
        id: 'p5-q6',
        type: 'mcq',
        stem: 'What does number matching in push MFA specifically address?',
        options: [
          'Adversary-in-the-middle relaying',
          'MFA fatigue, where a user approves a prompt reflexively to stop the interruptions',
          'SIM swap attacks',
          'Credential stuffing',
        ],
        answer: 1,
        explanation:
          'Number matching requires deliberate input that reflex cannot satisfy, which addresses fatigue. It does not stop relaying — an attacker proxying the login can display the number too.',
        domain: 'Security Architecture',
        conceptId: 'mfa',
      },
    ],
  },

  {
    id: 'p5-lesson-2',
    phaseId: 'phase-5',
    title: 'SSO, Federation, SAML, OAuth and OpenID Connect',
    objectives: [
      'Explain single sign-on and federation as distinct ideas',
      'Distinguish SAML from OAuth from OpenID Connect by purpose',
      'State plainly what OAuth is and is not for',
      'Describe the trust relationship a federation depends on',
    ],
    concepts: ['sso', 'federation', 'saml', 'oauth', 'oidc'],
    homework:
      'Draw the SAML or OIDC redirect flow from memory, naming what the application receives at the end. Then state what a password reset does not revoke and why.',
    careerConnection:
      'The OAuth-versus-OIDC distinction is asked in almost every IAM interview, and getting it wrong reveals that someone has configured an integration without understanding it.',
    sections: [
      {
        id: 'p5-l2-s0',
        title: 'Concept — SSO and federation',
        body: 'Single sign-on means authenticating once and reaching many applications without repeating it. Federation is the trust arrangement that makes SSO possible across organisational or system boundaries: the application (the service provider or relying party) agrees to trust assertions issued by the identity provider. SSO is the experience; federation is the mechanism.',
      },
      {
        id: 'p5-l2-s1',
        title: 'Concept — SAML',
        body: 'SAML is an XML-based standard, mature and dominant in enterprise web applications. The IdP issues a signed assertion stating who the user is and often what attributes or groups they hold. The service provider validates the signature against a known certificate, checks the audience and the issuer, and establishes a session. The parts that break in practice are certificate rotation and clock skew.',
      },
      {
        id: 'p5-l2-s2',
        title: 'Concept — OAuth is authorisation, not authentication',
        body: 'This is the distinction the exam and every interviewer probe. OAuth 2.0 is a delegated authorisation framework: it lets an application obtain a token to act on a resource on your behalf, with a defined scope. It does not tell the application who you are. Using a raw OAuth access token as proof of identity is a genuine, historically common security mistake — the token says "the bearer may read this calendar", not "this is Priya".',
      },
      {
        id: 'p5-l2-s3',
        title: 'Concept — OpenID Connect closes the gap',
        body: 'OIDC is a thin identity layer built on top of OAuth 2.0. It adds an ID token — a signed JWT making explicit claims about the authenticated user — plus a standard userinfo endpoint and discovery. So: OAuth answers "what may this application do on your behalf", and OIDC answers "who are you". If a question involves logging a user in with a modern API-based protocol, the answer is OIDC, not bare OAuth.',
      },
      {
        id: 'p5-l2-s4',
        title: 'Example — Where federation breaks',
        body: 'Two failure modes account for most federation incidents. First, certificate rotation: the IdP rolls its signing certificate and a service provider still holds the old one, so every login fails with a signature error until metadata is refreshed. Second, session lifetime mismatch: the user is disabled centrally but an application session or refresh token issued earlier remains valid, so they keep working. Both are configuration problems, and both are entirely predictable.',
      },
      {
        id: 'p5-l2-s5',
        title: 'Scenario — The cost of centralisation',
        body: "Federation means the application never sees the password, which is a substantial security gain. It also means the application has delegated its trust entirely. If the IdP is compromised, every federated application accepts the attacker's assertions and none of them can tell. This is why IdP administration is the most privileged access in the estate and belongs behind the Phase 4 management-zone controls.",
      },
      {
        id: 'p5-l2-s6',
        title: 'Review — What must stick',
        body: 'SSO is the experience, federation is the trust. SAML is XML assertions for enterprise web SSO. OAuth is delegated authorisation and answers what an app may do. OIDC sits on OAuth and answers who the user is. Never treat an OAuth access token as proof of identity. Federation breaks on certificate rotation and session lifetime mismatches.',
      },
    ],
    quiz: [
      {
        id: 'p5-q7',
        type: 'mcq',
        stem: 'An application uses a raw OAuth 2.0 access token as proof of the user identity. What is wrong with this?',
        options: [
          'Nothing — OAuth is an authentication protocol',
          'OAuth grants delegated authorisation; the token states what the bearer may do, not who they are',
          'OAuth tokens expire too quickly to be useful',
          'OAuth cannot be used over TLS',
        ],
        answer: 1,
        explanation:
          'OAuth is delegated authorisation. An access token conveys permission, not identity. OpenID Connect adds an ID token with explicit identity claims for exactly this reason.',
        examClue:
          'If the question is about logging a user in, the answer is OIDC or SAML. OAuth alone is about delegated access.',
        domain: 'Security Architecture',
        conceptId: 'oauth',
      },
      {
        id: 'p5-q8',
        type: 'scenario',
        stem: 'All logins to one federated application begin failing with a signature validation error. Other applications are unaffected. What is the most likely cause?',
        options: [
          'The user passwords have expired',
          'The IdP signing certificate rotated and this service provider still holds the old certificate',
          'The application database is corrupt',
          'MFA enrolment was reset for all users',
        ],
        answer: 1,
        explanation:
          'A signature error at one service provider while others work points to that provider trusting a stale signing certificate. Automating metadata refresh prevents it.',
        domain: 'Security Architecture',
        conceptId: 'saml',
      },
      {
        id: 'p5-q9',
        type: 'mcq',
        stem: 'What does OpenID Connect add to OAuth 2.0?',
        options: [
          'Encryption of the transport channel',
          'An identity layer: a signed ID token with claims about the authenticated user',
          'Support for XML assertions',
          'Automatic account provisioning',
        ],
        answer: 1,
        explanation:
          'OIDC layers identity onto OAuth authorisation with an ID token, a userinfo endpoint, and discovery. Transport encryption is TLS; XML assertions are SAML.',
        domain: 'Security Architecture',
        conceptId: 'oidc',
      },
      {
        id: 'p5-q10',
        type: 'pbq',
        stem: 'Match the protocol to its purpose. Select in this order: enterprise XML web SSO, delegated authorisation, identity layer on top of OAuth.',
        options: ['SAML', 'OAuth 2.0', 'OpenID Connect'],
        answer: [0, 1, 2],
        explanation:
          'SAML is XML-based enterprise web SSO. OAuth 2.0 is delegated authorisation. OpenID Connect adds the identity layer on top of OAuth.',
        domain: 'Security Architecture',
        conceptId: 'federation',
      },
    ],
  },

  {
    id: 'p5-lesson-3',
    phaseId: 'phase-5',
    title: 'Directory Services — LDAP, Active Directory and Kerberos',
    objectives: [
      'Describe what a directory stores and how LDAP queries it',
      'Explain the structure of Active Directory',
      'Walk the Kerberos exchange at a level you can troubleshoot',
      'Recognise identity attacks that target the directory',
    ],
    concepts: ['ldap', 'active-directory', 'kerberos', 'directory-attacks'],
    homework:
      'Write out the Kerberos exchange in four steps, then explain why the password is never sent to the file server you are opening.',
    careerConnection:
      'Active Directory remains the backbone of most enterprises. Being able to read a Kerberos failure is a skill that separates a junior analyst from a ticket router.',
    sections: [
      {
        id: 'p5-l3-s0',
        title: 'Concept — Directories and LDAP',
        body: 'A directory is a hierarchical database of organisational objects: users, groups, computers, printers. LDAP is the protocol for querying and modifying it, on TCP 389 unencrypted and 636 for LDAPS. Objects are identified by a distinguished name that reads from most specific to least — CN=priya.raman,OU=Finance,DC=lab,DC=local. Recognising that structure on sight is worth a mark on the exam and a lot of time on the job.',
      },
      {
        id: 'p5-l3-s1',
        title: 'Concept — Active Directory structure',
        body: 'AD organises objects into a forest containing domains, with organisational units inside domains for delegation and policy. Group Policy applies configuration down that tree. Domain controllers hold the directory and authenticate users. Two facts matter for security: the domain controller is the highest-value target in most estates, and Group Policy is a mechanism for pushing configuration to every machine at once — which is exactly why attackers want it.',
      },
      {
        id: 'p5-l3-s2',
        title: 'Concept — Kerberos, at troubleshooting depth',
        body: "The user authenticates to the Key Distribution Center and receives a ticket-granting ticket. To reach a service, they present the TGT to request a service ticket for that specific service. They present the service ticket to the service, which validates it without ever contacting the KDC. Note the property that makes Kerberos work: the user's password crosses the network once, and the service never sees it at all.",
      },
      {
        id: 'p5-l3-s3',
        title: 'Concept — Why Kerberos fails in practice',
        body: 'Three causes account for most Kerberos failures. Clock skew beyond about five minutes invalidates tickets, because timestamps prevent replay. A missing or duplicate service principal name means the KDC cannot identify which service a ticket is for. And DNS misresolution sends the client to the wrong host, so the service ticket does not match. If Kerberos breaks, check time, SPNs, and DNS in that order.',
      },
      {
        id: 'p5-l3-s4',
        title: 'Concept — Attacks that target the directory',
        body: 'Named at recognition level, since Security+ expects the terms. Pass-the-hash reuses a stolen hash without knowing the password. Kerberoasting requests service tickets and cracks them offline to recover service account passwords — which is why service account passwords must be long and random. Golden and silver ticket attacks forge tickets using stolen key material. The common thread: all of them are post-compromise, and all are far easier when service accounts are weak or privileged accounts are over-used.',
      },
      {
        id: 'p5-l3-s5',
        title: 'Scenario — Reading a failure',
        body: 'A user cannot reach a file server, the error mentions Kerberos, and other services work. Other services working rules out a broad KDC problem. Check clock skew on the client and the server, then check whether the file server has a correctly registered SPN, then check that DNS resolves the name the client used. Systematic beats guessing, and this order is roughly frequency-ordered.',
      },
      {
        id: 'p5-l3-s6',
        title: 'Review — What must stick',
        body: 'LDAP queries a hierarchical directory; 389 plain, 636 LDAPS. AD is forest, domain, OU, with Group Policy applying down the tree. Kerberos: TGT from the KDC, then a service ticket per service, validated without contacting the KDC. Failures are clock skew, SPNs, and DNS. Pass-the-hash, Kerberoasting, and ticket forgery are post-compromise attacks on the directory.',
      },
    ],
    quiz: [
      {
        id: 'p5-q11',
        type: 'scenario',
        stem: 'A user cannot access one file server with a Kerberos error. All other services work normally. What should you check first?',
        options: [
          'Reset the user password',
          'Clock skew between the client and the server',
          'Rebuild the domain controller',
          'Disable Kerberos and fall back to NTLM',
        ],
        answer: 1,
        explanation:
          'Kerberos tickets carry timestamps to prevent replay, so skew beyond roughly five minutes invalidates them. Other services working rules out a broad KDC failure. Check time, then the SPN, then DNS.',
        examClue:
          'Kerberos plus a single failing service points at time, SPN, or DNS — in that order.',
        domain: 'Security Operations',
        conceptId: 'kerberos',
      },
      {
        id: 'p5-q12',
        type: 'mcq',
        stem: 'What does an attacker obtain from a successful Kerberoasting attack?',
        options: [
          'A forged ticket-granting ticket',
          'A service ticket they can crack offline to recover a service account password',
          'Direct administrative access to the domain controller',
          'The NTLM hash of every domain user',
        ],
        answer: 1,
        explanation:
          'Kerberoasting requests service tickets encrypted with the service account key, then cracks them offline. This is why service account passwords must be long and random — and why managed service accounts exist.',
        domain: 'Threats, Vulnerabilities, and Mitigations',
        conceptId: 'directory-attacks',
      },
      {
        id: 'p5-q13',
        type: 'mcq',
        stem: 'In the distinguished name CN=priya.raman,OU=Finance,DC=lab,DC=local, what does OU=Finance represent?',
        options: [
          'The domain the user belongs to',
          'The organisational unit containing the user object, used for delegation and policy',
          'The user primary group',
          'The certificate authority that issued the user certificate',
        ],
        answer: 1,
        explanation:
          'A DN reads from most specific to least: the common name, then the organisational unit, then the domain components. OUs exist for delegating administration and scoping Group Policy.',
        domain: 'Security Architecture',
        conceptId: 'ldap',
      },
    ],
  },

  {
    id: 'p5-lesson-4',
    phaseId: 'phase-5',
    title: 'Authorization Models — RBAC, ABAC, Least Privilege and PAM',
    objectives: [
      'Contrast RBAC with ABAC by expressiveness and auditability',
      'Explain privilege creep and how access reviews catch it',
      'Describe privileged access management and what it adds',
      'Apply least privilege to human and non-human identities',
    ],
    concepts: ['rbac', 'abac', 'least-privilege', 'pam', 'conditional-access'],
    homework:
      'Model three job roles for a fictional team as RBAC roles with named permissions. Then describe how each role would drift after a year of people moving teams.',
    careerConnection:
      'Access reviews and PAM deployments are among the most common IAM projects, and privilege creep is the most common finding in any audit.',
    sections: [
      {
        id: 'p5-l4-s0',
        title: 'Concept — RBAC',
        body: 'Role-based access control grants permissions to roles and assigns people to roles. Its strength is auditability: you can answer "who can approve payments" by listing the role members, and "what can this person do" by listing their roles. Its weakness is expressiveness — it cannot easily say "only during business hours" or "only for records in their own department" without creating a new role for every combination, which is how role explosion begins.',
      },
      {
        id: 'p5-l4-s1',
        title: 'Concept — ABAC',
        body: 'Attribute-based access control evaluates attributes of the subject, the resource, the action, and the environment: department, clearance, data classification, time, device compliance, location. It is far more expressive and expresses exactly the conditions RBAC cannot. It is also far harder to reason about — answering "who can read this record" may require evaluating policy against every user. Most real estates use RBAC as the backbone with a few ABAC conditions layered where they are genuinely needed.',
      },
      {
        id: 'p5-l4-s2',
        title: 'Concept — Privilege creep and access reviews',
        body: 'People accumulate access. They change roles and keep the old entitlements, they receive exceptions for a project that ends, they inherit permissions from a group nobody remembers. Nothing here is malicious — it is the default behaviour of any system where adding access is easier than removing it. Access reviews are the detective control: periodically, a manager confirms each person still needs each entitlement. They work when they are scoped tightly enough that reviewers actually read them.',
      },
      {
        id: 'p5-l4-s3',
        title: 'Concept — Privileged access management',
        body: 'PAM treats administrative access as something you check out rather than something you hold. Credentials are vaulted rather than known. Elevation is just-in-time and time-bound. Sessions are recorded. The effect is that a compromised workstation does not yield standing domain admin, because nobody holds standing domain admin — which directly addresses the Phase 2 shared-account non-repudiation failure and the Phase 4 management-zone boundary at the same time.',
      },
      {
        id: 'p5-l4-s4',
        title: 'Concept — Conditional access as authorisation in context',
        body: 'Conditional access evaluates the circumstances of a request, not just the identity: is the device compliant, is the location plausible, is the sign-in risk elevated, is this a sensitive action requiring step-up. This is where Zero Trust becomes a concrete policy rather than a principle. Note that it needs the device signal Phase 4 NAC produces and the identity signal this phase produces — neither alone is enough.',
      },
      {
        id: 'p5-l4-s5',
        title: 'Scenario — Diagnosing over-permission',
        body: 'A user can read records outside their department. Ask whether the role is too coarse — granting at application scope rather than data scope — or whether an attribute condition is missing. RBAC alone would need a role per department; one ABAC condition on department attribute expresses it directly. The right answer is usually to fix the role granularity first and add the attribute condition only where roles genuinely cannot express the rule.',
      },
      {
        id: 'p5-l4-s6',
        title: 'Review — What must stick',
        body: 'RBAC: roles, auditable, can explode. ABAC: attributes, expressive, harder to reason about. Most estates combine them. Privilege creep is the default and access reviews are the detective control. PAM makes privilege something checked out rather than held. Conditional access is authorisation evaluated in context, and it is how Zero Trust gets implemented.',
      },
    ],
    quiz: [
      {
        id: 'p5-q14',
        type: 'scenario',
        stem: 'A requirement states that users may read records only for their own department, and only during business hours. Which model expresses this most directly?',
        options: [
          'RBAC, with one role per department',
          'ABAC, evaluating department and time attributes',
          'Discretionary access control',
          'Mandatory access control',
        ],
        answer: 1,
        explanation:
          'The rule depends on attributes of the subject, the resource, and the environment. RBAC could approximate the department half with a role per department, but time-of-day would need roles multiplied again — this is the role explosion ABAC exists to avoid.',
        domain: 'Security Architecture',
        conceptId: 'abac',
      },
      {
        id: 'p5-q15',
        type: 'mcq',
        stem: 'What does privileged access management primarily change about administrative access?',
        options: [
          'It encrypts administrator passwords at rest',
          'It makes privilege something checked out just-in-time and recorded, rather than something held permanently',
          'It removes the need for administrator accounts entirely',
          'It replaces MFA for administrators',
        ],
        answer: 1,
        explanation:
          'PAM vaults credentials, grants elevation just-in-time and time-bound, and records sessions. The security value is that nobody holds standing privilege, so compromising a workstation does not yield domain admin.',
        domain: 'Security Architecture',
        conceptId: 'pam',
      },
      {
        id: 'p5-q16',
        type: 'scenario',
        stem: 'An access review finds a user with 47 entitlements where role peers hold about 12, following a department transfer. What is this, and what is the systemic fix?',
        options: [
          'Insider threat; disable the account and investigate',
          'Privilege creep; recalculate the full entitlement set on role change rather than only adding',
          'A provisioning outage; re-run account creation',
          'Normal variation; no action needed',
        ],
        answer: 1,
        explanation:
          'The mover process added new entitlements without removing the old ones. Manually stripping this user fixes one case and leaves every future mover broken — recalculation on role change is the systemic fix.',
        examClue:
          'When several people show the same pattern, the answer is a process fix, not an individual action.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'least-privilege',
      },
      {
        id: 'p5-q17',
        type: 'mcq',
        stem: 'Which two signals does a conditional access policy typically combine?',
        options: [
          'Password length and account age',
          'Identity context (who, sign-in risk) and device context (compliance, managed state)',
          'Firewall logs and DNS records',
          'Physical badge access and CCTV',
        ],
        answer: 1,
        explanation:
          'Conditional access evaluates who is asking and from what, plus location and risk. The device signal comes from management or NAC; the identity signal from the IdP. Neither alone is sufficient.',
        domain: 'Security Architecture',
        conceptId: 'conditional-access',
      },
    ],
  },

  {
    id: 'p5-lesson-5',
    phaseId: 'phase-5',
    title: 'The Identity Lifecycle and Non-Human Identities',
    objectives: [
      'Walk the joiner, mover and leaver flows end to end',
      'Explain why deprovisioning must revoke as well as disable',
      'Describe service accounts and machine identities and how they differ from users',
      'Explain certificates as machine identity and why expiry causes outages',
    ],
    concepts: [
      'account-lifecycle',
      'provisioning',
      'deprovisioning',
      'service-accounts',
      'machine-identity',
      'certificates',
    ],
    homework:
      'Write the joiner/mover/leaver checklist for a fictional employee, and mark the single step whose omission causes the most damage. Justify the choice.',
    careerConnection:
      'Joiner/Mover/Leaver is the core operational work of an IAM team. If you can describe the flow and its failure modes, you can do the job.',
    sections: [
      {
        id: 'p5-l5-s0',
        title: 'Concept — The lifecycle, driven by HR',
        body: 'HR is the authoritative source: a person exists because HR says so, with a start date, a role, and a manager. The identity platform consumes that and calculates birthright entitlements. Provisioning writes the account. The user enrols MFA, authenticates through SSO, reaches applications, and is authorised by role. Everything is logged. On departure, deprovisioning reverses it. An identity programme not driven by HR drifts within months, because nothing tells it when reality changed.',
      },
      {
        id: 'p5-l5-s1',
        title: 'Concept — Joiner, mover, leaver',
        body: 'Joiner: create the identity, provision birthright access, enrol factors. The failure mode is being late, so the person cannot work on day one. Mover: recalculate entitlements for the new role. The failure mode is adding without removing, which is privilege creep. Leaver: disable, revoke, reclaim, transfer ownership. The failure mode is being slow, and every day of delay is a live credential nobody is watching.',
      },
      {
        id: 'p5-l5-s2',
        title: 'Concept — Disable is not revoke',
        body: 'This distinction causes real incidents. Disabling a directory account prevents future authentication. It does nothing to a session or refresh token already issued and still within its lifetime — the application will keep working from that token without consulting the IdP again. Proper deprovisioning revokes sessions and tokens explicitly. And disable before delete, always, so evidence survives the investigation that may follow.',
      },
      {
        id: 'p5-l5-s3',
        title: 'Concept — Service accounts',
        body: 'A service account is a non-human identity used by an application or scheduled task. It should have no interactive logon, a long random password or a managed credential, a documented owner, and the narrowest possible permissions. The two chronic problems are that service accounts get over-permissioned because it makes things work, and that they are excluded from lifecycle processes — so when the human owner leaves, nobody knows what will break.',
      },
      {
        id: 'p5-l5-s4',
        title: 'Concept — Machine identity and certificates',
        body: 'Machines authenticate too: servers, containers, devices, and workloads. Their identity is usually a certificate, which is a signed statement binding a public key to a name, with a validity period. The operationally important property is that certificates expire — and an expired certificate is an outage, not a warning. Certificate lifecycle management exists because most organisations discover their inventory during the outage.',
      },
      {
        id: 'p5-l5-s5',
        title: 'Scenario — The orphaned account',
        body: 'A reconciliation finds an account in the directory with no matching identity in the identity platform. It was created manually, bypassing provisioning. Nobody owns it, nobody reviews it, and it will survive every leaver process because no HR record will ever trigger its removal. Orphaned accounts are found by reconciliation, not by review — which is why reconciliation is a distinct control from access review.',
      },
      {
        id: 'p5-l5-s6',
        title: 'Review — What must stick',
        body: 'HR drives the lifecycle. Joiner is late, mover accumulates, leaver is slow — those are the three characteristic failures. Disable stops future authentication; revoke kills what was already issued, and you need both. Service accounts need no interactive logon, a documented owner, and narrow permissions. Certificates are machine identity, and expiry is an outage.',
      },
    ],
    quiz: [
      {
        id: 'p5-q18',
        type: 'scenario',
        stem: 'A departed employee accesses an application nine days after their account was disabled. There is no sign-in event at the identity provider. What happened?',
        options: [
          'The account was never actually disabled',
          'An existing refresh token or application session was never revoked, so the application never consulted the IdP',
          'They are using a colleague credentials',
          'The identity provider is not logging sign-ins',
        ],
        answer: 1,
        explanation:
          'The absence of an IdP sign-in event is the decisive clue: the application is working from a token issued earlier. Disabling prevents new authentication; it does not revoke what already exists.',
        examClue:
          'When federated access continues after a disable, look for an unrevoked token or session.',
        domain: 'Security Operations',
        conceptId: 'deprovisioning',
      },
      {
        id: 'p5-q19',
        type: 'mcq',
        stem: 'Which property should a service account have?',
        options: [
          'Interactive logon rights so an administrator can test it',
          'No interactive logon, a documented owner, and narrowly scoped permissions',
          'Membership of Domain Admins for reliability',
          'The same password as the application it supports',
        ],
        answer: 1,
        explanation:
          'Service accounts run code, not sessions. Interactive logon widens the attack surface, and undocumented ownership means nobody knows what breaks when it changes. Over-permissioning is the chronic failure.',
        domain: 'Security Architecture',
        conceptId: 'service-accounts',
      },
      {
        id: 'p5-q20',
        type: 'mcq',
        stem: 'An account exists in the directory with no corresponding record in the identity platform. What is it, and which control finds it?',
        options: [
          'A service account; found by access review',
          'An orphaned account; found by reconciliation against the authoritative source',
          'A machine identity; found by certificate inventory',
          'A federated identity; found by metadata refresh',
        ],
        answer: 1,
        explanation:
          'Orphaned accounts are created outside the provisioning workflow, so no HR event will ever remove them. Access review asks whether known access is still needed; reconciliation finds accounts nobody knows about at all.',
        domain: 'Security Program Management and Oversight',
        conceptId: 'account-lifecycle',
      },
      {
        id: 'p5-q21',
        type: 'pbq',
        stem: 'Order the leaver deprovisioning steps: [0] Reassign data ownership, [1] Disable the account, [2] Revoke sessions and tokens, [3] Reclaim licences.',
        options: [
          'Disable the account',
          'Revoke sessions and tokens',
          'Reassign data ownership',
          'Reclaim licences',
        ],
        answer: [1, 2, 0, 3],
        explanation:
          'Disable first to stop new authentication, then revoke what is already issued — those two together are what actually ends access. Data ownership transfer and licence reclamation follow. Note that deletion is not on this list: disable before delete, so evidence survives.',
        domain: 'Security Operations',
        conceptId: 'deprovisioning',
      },
    ],
  },
];

const LABS: Lab[] = [
  {
    id: 'p5-lab-0',
    phaseId: 'phase-5',
    title: 'Design the Employee Lifecycle',
    objective:
      'Walk the full joiner-to-leaver workflow, identify what each stage produces for the next, and name the control that belongs at each one.',
    securityConcepts: [
      'Account lifecycle',
      'Joiner/Mover/Leaver',
      'Provisioning',
      'Authoritative source',
    ],
    environment: 'Deterministic simulator — prepared identity artifacts, nothing is executed',
    topology: 'HR → identity platform → DC-01 → MFA → SSO → applications → SIEM → deprovisioning',
    prerequisites: ['Complete Phase 4'],
    steps: [
      {
        id: 's0',
        instruction: 'Trace the full identity lifecycle end to end.',
        command: 'trace identity lifecycle',
        expected: 'Nine stages from HR system through to deprovisioning.',
      },
      {
        id: 's1',
        instruction: 'Review what the joiner flow provisions.',
        command: 'show joiner flow',
        expected:
          'Birthright entitlements calculated from role, then account creation and MFA enrolment.',
      },
      {
        id: 's2',
        instruction: 'Review the leaver flow and note the ordering.',
        command: 'show leaver flow',
        expected: 'Disable, then revoke sessions and tokens, then reclaim and transfer.',
      },
      {
        id: 's3',
        instruction: 'Inspect the directory account the workflow created.',
        command: 'show ad user priya.raman',
        expected: 'Distinguished name, group memberships, and account status.',
      },
    ],
    expectedResults: [
      'Nine lifecycle stages identified in order',
      'Joiner and leaver flows distinguished',
      'Directory account structure read',
      'Controls named per stage',
    ],
    verification: [
      'Learner can name the authoritative source and explain why it must be HR',
      'Learner can explain what each stage hands to the next',
      'Learner can state why disable and revoke are different actions',
    ],
    troubleshooting: [
      'Unsure which stage owns a control → ask which system enforces it. That names the stage.',
      'Confused by the distinguished name → read it most specific to least: CN, then OU, then DC.',
    ],
    challenge:
      'Write the joiner runbook for a new Finance analyst: every stage, the system that acts, what it produces, and the control that must hold. Then state the one stage where being late causes the most business pain, and why.',
    evidence: [
      {
        id: 'ev0',
        label: 'Lifecycle design',
        type: 'report',
        placeholder: 'Stage, system, produces, control',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'The lifecycle only works if HR drives it. An identity programme that is not connected to the authoritative source drifts within months, because nothing tells it when reality changed.',
  },

  {
    id: 'p5-lab-1',
    phaseId: 'phase-5',
    title: 'Authentication, MFA and Federation',
    objective:
      'Examine an authentication flow end to end, compare MFA factor strength, and read a federation assertion structure.',
    securityConcepts: ['MFA', 'Phishing-resistant factors', 'SAML', 'OIDC', 'Federation'],
    environment: 'Deterministic simulator — prepared artifacts with all secrets redacted',
    topology: 'analyst1 → IdP → SAML/OIDC → finance application',
    prerequisites: ['Complete "Design the Employee Lifecycle"'],
    steps: [
      {
        id: 's0',
        instruction: 'Compare the available MFA factors by resistance to relaying.',
        command: 'compare mfa factors',
        expected: 'SMS, TOTP, and push are relayable; FIDO2 is origin-bound.',
      },
      {
        id: 's1',
        instruction: 'Inspect the structure of a SAML assertion.',
        command: 'show saml assertion',
        expected: 'Issuer, subject, audience, conditions, and a redacted signature.',
      },
      {
        id: 's2',
        instruction: 'Inspect an OIDC ID token structure and note what it claims.',
        command: 'show oidc token',
        expected: 'Header, claims, redacted signature — identity claims, not permissions.',
      },
      {
        id: 's3',
        instruction: 'Review the conditional access policy evaluated at sign-in.',
        command: 'show conditional access',
        expected: 'Device compliance, location, and risk conditions with their actions.',
      },
    ],
    expectedResults: [
      'Factor strength compared on relay resistance',
      'SAML assertion structure read',
      'OIDC ID token distinguished from an OAuth access token',
      'Conditional access conditions understood',
    ],
    verification: [
      'Learner can explain why FIDO2 resists phishing and push does not',
      'Learner can state what an ID token claims versus what an access token grants',
      'Learner can name two signals conditional access evaluates',
    ],
    troubleshooting: [
      'Signature shown as redacted → deliberate. This platform never contains usable key material.',
      'OAuth vs OIDC unclear → OAuth says what an app may do; OIDC says who you are.',
    ],
    challenge:
      'An executive asks why the organisation should buy security keys when it already has MFA. Write four sentences they would accept, using the relay mechanism rather than jargon.',
    evidence: [
      {
        id: 'ev0',
        label: 'Factor comparison',
        type: 'report',
        placeholder: 'Factor, category, relay-resistant?, recommended use',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'MFA is not one control, it is a family of controls with very different strengths. The factor decision determines whether an MFA rollout stops the attack chain or merely raises its cost.',
  },

  {
    id: 'p5-lab-2',
    phaseId: 'phase-5',
    title: 'Directory Services and Kerberos',
    objective:
      'Query a directory, read a Kerberos ticket cache, and diagnose an authentication failure systematically.',
    securityConcepts: ['LDAP', 'Active Directory', 'Kerberos', 'Service principal names'],
    environment: 'Deterministic simulator — prepared directory artifacts, nothing is executed',
    topology: 'DC-01 (lab.local) in the Servers zone, WS-01 in the Users zone',
    prerequisites: ['Complete "Authentication, MFA and Federation"'],
    steps: [
      {
        id: 's0',
        instruction: 'Query the directory for a user object.',
        command: 'show ad user priya.raman',
        expected: 'Distinguished name, group memberships, account status, last logon.',
      },
      {
        id: 's1',
        instruction: 'Read the Kerberos ticket cache on the workstation.',
        command: 'klist',
        expected: 'A ticket-granting ticket plus service tickets, with lifetimes.',
      },
      {
        id: 's2',
        instruction: 'Review the Kerberos exchange and its failure causes.',
        command: 'explain kerberos flow',
        expected: 'AS-REQ through service ticket validation, plus the three common failures.',
      },
      {
        id: 's3',
        instruction: 'Cross-reference the domain membership recorded on the endpoint.',
        command: 'systeminfo',
        expected: 'Domain lab.local, logon server DC-01.',
      },
    ],
    expectedResults: [
      'Directory object read and interpreted',
      'Ticket cache understood, TGT distinguished from service tickets',
      'Kerberos exchange traced',
      'Three common failure causes identified in order',
    ],
    verification: [
      'Learner can read a distinguished name',
      'Learner can explain why the service never contacts the KDC',
      'Learner can list the three things to check when Kerberos fails',
    ],
    troubleshooting: [
      'Kerberos error on one service only → check clock skew, then SPN, then DNS.',
      'Confused about the TGT → it is the ticket that lets you request other tickets.',
    ],
    challenge:
      'A user cannot reach one file server with a Kerberos error while everything else works. Write your diagnostic plan: the three checks in order, what each would show if it were the cause, and what you would conclude from each result.',
    evidence: [
      {
        id: 'ev0',
        label: 'Kerberos diagnostic plan',
        type: 'report',
        placeholder: 'Check, expected result if this is the cause, conclusion',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Kerberos looks intimidating and troubleshoots systematically. Time, SPN, DNS — roughly frequency-ordered. Systematic beats guessing, and this is the pattern for every protocol you will ever debug.',
  },

  {
    id: 'p5-lab-3',
    phaseId: 'phase-5',
    title: 'Authorization, Privilege Creep and PAM',
    objective:
      'Review entitlements against role peers, identify privilege creep, and evaluate what privileged access management changes.',
    securityConcepts: ['RBAC', 'ABAC', 'Access review', 'Privilege creep', 'PAM'],
    environment: 'Deterministic simulator — prepared entitlement artifacts, nothing is executed',
    topology: 'Identity platform entitlement data across Finance and Marketing roles',
    prerequisites: ['Complete "Directory Services and Kerberos"'],
    steps: [
      {
        id: 's0',
        instruction: 'Run an access review comparing entitlements against role peers.',
        command: 'show access review',
        expected: 'One user holding 47 entitlements where peers hold around 12.',
      },
      {
        id: 's1',
        instruction: 'Compare the two authorisation models.',
        command: 'compare rbac abac',
        expected: 'RBAC auditable but coarse; ABAC expressive but harder to reason about.',
      },
      {
        id: 's2',
        instruction: 'Review the privileged access model.',
        command: 'show pam model',
        expected: 'Vaulted credentials, just-in-time elevation, session recording.',
      },
      {
        id: 's3',
        instruction: 'Check for accounts that bypassed the provisioning workflow.',
        command: 'show orphaned accounts',
        expected: 'Directory accounts with no matching identity record.',
      },
    ],
    expectedResults: [
      'Privilege creep identified by peer comparison',
      'RBAC and ABAC trade-offs articulated',
      'PAM model understood as just-in-time rather than standing privilege',
      'Orphaned accounts distinguished from reviewed access',
    ],
    verification: [
      'Learner can explain why peer comparison makes over-permission diagnosable',
      'Learner can state when ABAC is worth its complexity',
      'Learner can explain why reconciliation and access review are different controls',
    ],
    troubleshooting: [
      'Unsure whether 47 entitlements is too many → compare against role peers. Absolute counts mean nothing.',
      'Orphaned vs unused account → orphaned has no owning identity at all; unused has one who has stopped using it.',
    ],
    challenge:
      'Three movers show the same accumulation pattern. Write the finding as a manager would need it: the observation, why it is systemic rather than individual, the process fix, and what you would measure to confirm the fix worked.',
    evidence: [
      {
        id: 'ev0',
        label: 'Access review finding',
        type: 'report',
        placeholder: 'Observation, peer comparison, systemic cause, fix, measure of success',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Privilege creep is the default behaviour of any system where granting is easier than revoking. It is not misconduct and treating it as such damages trust — the fix is process, and the evidence is peer comparison.',
  },

  {
    id: 'p5-lab-4',
    phaseId: 'phase-5',
    title: 'Troubleshoot the Identity Workflow',
    objective:
      'Diagnose three real IAM failures: localise the failing lifecycle stage, identify the root cause, and choose the fix that addresses it.',
    securityConcepts: [
      'Fault localisation',
      'Deprovisioning',
      'Privilege creep',
      'MFA factor strength',
    ],
    environment: 'Interactive troubleshooting workbench plus the deterministic simulator',
    topology: 'The full lifecycle, with three injected failures',
    prerequisites: ['Complete all earlier Phase 5 labs'],
    steps: [
      {
        id: 's0',
        instruction: 'Review the lifecycle so you can localise faults against it.',
        command: 'trace identity lifecycle',
        expected: 'Nine stages, each with the system that owns it.',
      },
      {
        id: 's1',
        instruction:
          'Open the IAM Troubleshooting workbench and diagnose incident 1, "The leaver who still has access". Localise the stage before choosing a cause.',
        expected: 'Deprovisioning stage; unrevoked refresh token; revoke sessions and tokens.',
      },
      {
        id: 's2',
        instruction: 'Diagnose incident 2, "The mover who kept everything".',
        expected:
          'Identity platform stage; add-without-remove; recalculate entitlements on role change.',
      },
      {
        id: 's3',
        instruction: 'Diagnose incident 3, "MFA was enabled and the attacker got in anyway".',
        expected: 'MFA stage; relayable push factor; move to phishing-resistant FIDO2.',
      },
      {
        id: 's4',
        instruction: 'Confirm the deprovisioning ordering that incident 1 depends on.',
        command: 'show leaver flow',
        expected: 'Disable, then revoke — two distinct actions.',
      },
    ],
    expectedResults: [
      'All three incidents localised to the correct lifecycle stage',
      'Root causes identified from evidence rather than assumption',
      'Fixes chosen that address the cause rather than the symptom',
      'The disable-versus-revoke distinction applied',
    ],
    verification: [
      'Learner localises the stage before proposing a cause',
      'Learner can explain what the absence of an IdP sign-in event proves',
      'Learner rejects fixes that resolve one case while leaving the process broken',
    ],
    troubleshooting: [
      'Tempted to guess the cause first → localise the stage. Fixing the wrong layer fixes nothing.',
      'Several causes look plausible → re-read the evidence. Most distractors are excluded by a stated fact.',
    ],
    challenge:
      'Take incident 1 and write the post-incident report: timeline, root cause, why the existing control did not catch it, the fix, and one detection you would add so the next occurrence is found in hours rather than nine days.',
    evidence: [
      {
        id: 'ev0',
        label: 'Post-incident report',
        type: 'report',
        placeholder: 'Timeline, root cause, control gap, fix, new detection',
      },
      { id: 'ev1', label: 'Command transcript', type: 'log', placeholder: 'Paste the transcript' },
    ],
    securityLesson:
      'Localise before you diagnose. Every one of these incidents has a tempting wrong answer that a plausible engineer would reach for, and in each case the evidence already excludes it — the skill is reading what is there rather than pattern-matching to what is familiar.',
  },
];

export const PHASE_5: Phase = {
  id: 'phase-5',
  number: 5,
  title: 'Identity & Access Management',
  description:
    'The major career component. Identity as the control plane, authentication factors and why not all MFA is equal, federation protocols, directory services and Kerberos, authorisation models, and the joiner-mover-leaver lifecycle you will spend your career operating.',
  examDomain: 'Security Architecture',
  scene: 'identity',
  lessons: LESSONS,
  labs: LABS,
};
