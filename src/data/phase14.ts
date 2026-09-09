import type { Lesson, Lab, LabStep, LessonSection, QuizQuestion, Phase } from '../types';

// ---------------------------------------------------------------------------
// Phase 14 — Cloud Security
// Aligned with CompTIA Security+ SY0-701 (Domain 3: Security Architecture)
// ---------------------------------------------------------------------------

// ---------- Lesson 1: Cloud Service Models & Shared Responsibility ----------

const LESSON_14_L1_SECTIONS: LessonSection[] = [
  {
    id: 'p14-l1-s0',
    title: 'Concept — Cloud Service Models',
    body:
      'Three models determine how much you manage: IaaS gives you virtual machines and networking — you manage the OS up; PaaS gives you a runtime — you manage your code and data; SaaS gives you an application — you manage your users and configuration. The exam tests whether you can place a service into the correct model, and misplacement always means you misunderstand who patches what.',
  },
  {
    id: 'p14-l1-s1',
    title: 'Concept — The Shared Responsibility Model',
    body:
      'The provider is never responsible for your data classification, identity configuration, or access decisions. You are never responsible for the physical data centre, hypervisor patches, or global network backbone. Everything in between shifts depending on IaaS, PaaS, or SaaS. The exam\'s favourite trick is placing a responsibility at the wrong boundary — "the cloud provider handles encryption" is only true if you chose a SaaS product that enforces it. In IaaS, encryption at rest is your job unless you explicitly enable a provider-managed key.',
  },
  {
    id: 'p14-l1-s2',
    title: 'Concept — Cloud IAM',
    body:
      'Cloud IAM is identity at API scale. Every action — launching a VM, reading a storage object, changing a firewall rule — is an authenticated API call governed by a policy. Policies attach to principals (users, groups, roles, service accounts). The principle of least privilege matters more here than on-prem because a single over-permissive policy can expose thousands of resources in seconds. Federated identity lets on-prem Active Directory or an IdP issue tokens accepted by the cloud provider, so users authenticate once.',
  },
  {
    id: 'p14-l1-s3',
    title: 'Concept — Security Groups and Network ACLs',
    body:
      'A security group is a stateful virtual firewall attached to an instance. Stateful means if you allow inbound TCP/443, the return traffic is automatically allowed. A network ACL is a stateless rule set at the subnet boundary — you must explicitly allow both directions. The exam expects you to know that security groups default to deny-all inbound and allow-all outbound, and that opening 0.0.0.0/0 on any port is the single most common cloud misconfiguration.',
  },
  {
    id: 'p14-l1-s4',
    title: 'Concept — Cloud Logging and Monitoring',
    body:
      'Every API call in a well-configured cloud account is logged. AWS CloudTrail, Azure Activity Log, and GCP Cloud Audit Logs all capture who did what, when, from where, and whether it succeeded. These are your forensic evidence in a cloud incident. The mistake is not enabling them — it is not reviewing them, not alerting on them, and not protecting the log bucket from deletion by the same compromised identity that triggered the alert.',
  },
  {
    id: 'p14-l1-s5',
    title: 'Concept — Encryption in the Cloud',
    body:
      'Encryption at rest protects stored data if physical media is stolen or improperly decommissioned. Encryption in transit protects data on the wire. Key management determines who can decrypt: provider-managed keys are simple but mean the provider holds the key; customer-managed keys (CMK) let you control rotation and revocation; customer-supplied keys mean you hold the key material entirely. The more control you demand, the more operational burden you accept — and the higher the risk of locking yourself out.',
  },
  {
    id: 'p14-l1-s6',
    title: 'Example — A misconfigured cloud storage bucket',
    body:
      'A developer creates an S3 bucket with "Block Public Access" disabled and an ACL granting "Everyone" read access. The bucket holds customer PII. A researcher discovers it, notifies the press. Root cause: the shared responsibility model placed bucket ACLs squarely on the customer, not the provider. The control that would have prevented it — an organisation-level Service Control Policy denying s3:PutBucketAcl with public grants — costs nothing and takes five minutes.',
  },
  {
    id: 'p14-l1-s7',
    title: 'Review — What must stick',
    body:
      'IaaS/PaaS/SaaS define the responsibility boundary. The provider never owns your data classification or access decisions. Cloud IAM is API-scale policy. Security groups are stateful; network ACLs are stateless. Log every API call and protect the log store. Encryption at rest is your job in IaaS unless explicitly enabled.',
  },
];

const LESSON_14_L1_QUIZ: QuizQuestion[] = [
  {
    id: 'p14-q0',
    type: 'mcq',
    stem: 'A company uses virtual machines in AWS where it manages the OS, middleware, and applications. Which cloud service model is this?',
    options: ['IaaS', 'PaaS', 'SaaS', 'FaaS'],
    answer: 0,
    explanation:
      'When you manage the OS upward on provider-hosted infrastructure, you are using Infrastructure as a Service (IaaS). PaaS manages the OS for you; SaaS manages the entire application.',
    domain: 'Security Architecture',
    conceptId: 'cloud-service-models',
  },
  {
    id: 'p14-q1',
    type: 'mcq',
    stem: 'In the shared responsibility model for IaaS, who is responsible for patching the guest operating system?',
    options: [
      'The customer',
      'The cloud provider',
      'Both equally',
      'Neither — it is automated',
    ],
    answer: 0,
    explanation:
      'In IaaS the customer manages the OS upward, including patching. The provider manages the hypervisor and physical infrastructure.',
    domain: 'Security Architecture',
    conceptId: 'shared-responsibility',
  },
  {
    id: 'p14-q2',
    type: 'mcq',
    stem: 'What is the primary difference between a cloud security group and a network ACL?',
    options: [
      'Security groups are stateful; network ACLs are stateless',
      'Security groups are stateless; network ACLs are stateful',
      'Security groups apply at the subnet level; network ACLs apply at the instance level',
      'Security groups support only allow rules; network ACLs support only deny rules',
    ],
    answer: 0,
    explanation:
      'Security groups are stateful (return traffic is automatically allowed). Network ACLs are stateless and require explicit allow/deny rules for both directions.',
    domain: 'Security Architecture',
    conceptId: 'cloud-security-groups',
  },
  {
    id: 'p14-q3',
    type: 'mcq',
    stem: 'Which cloud logging service records every API call in an AWS account?',
    options: ['CloudTrail', 'CloudWatch', 'GuardDuty', 'Inspector'],
    answer: 0,
    explanation:
      'AWS CloudTrail logs API calls (who, what, when, from where). CloudWatch monitors metrics and logs. GuardDuty is a threat detection service. Inspector assesses vulnerabilities.',
    domain: 'Security Architecture',
    conceptId: 'cloud-logging',
  },
  {
    id: 'p14-q4',
    type: 'mcq',
    stem: 'A customer-managed key (CMK) for cloud encryption means:',
    options: [
      'The customer controls key rotation and revocation but the key material is stored in the provider\'s key management service',
      'The customer physically holds the key material on premises',
      'The provider manages all aspects of the key lifecycle',
      'Encryption is handled at the application layer only',
    ],
    answer: 0,
    explanation:
      'A CMK is stored in the provider\'s KMS but the customer controls rotation, access policies, and revocation. Customer-supplied keys go further — the customer holds the material itself.',
    domain: 'Security Architecture',
    conceptId: 'cloud-encryption',
  },
  {
    id: 'p14-q5',
    type: 'scenario',
    stem: 'An analyst discovers that an S3 bucket containing PII has "Block Public Access" disabled and an ACL granting Everyone read access. Under the shared responsibility model, who is at fault?',
    options: [
      'The customer — bucket ACLs and public access settings are the customer\'s responsibility',
      'The cloud provider — they should prevent public buckets by default',
      'Both — the provider should warn and the customer should configure',
      'Neither — this is an expected configuration for public websites',
    ],
    answer: 0,
    explanation:
      'The shared responsibility model places data configuration, access control, and bucket policies squarely on the customer. The provider offers tools (Block Public Access, SCPs) but enabling them is the customer\'s job.',
    domain: 'Security Architecture',
    conceptId: 'shared-responsibility',
  },
  {
    id: 'p14-q6',
    type: 'scenario',
    stem: 'A cloud security group allows inbound TCP/22 from 0.0.0.0/0. What is the risk and what should the rule be changed to?',
    options: [
      'SSH is exposed to the entire internet; restrict the source to a known management CIDR or bastion host IP',
      'SSH is encrypted so there is no risk; the rule is fine',
      'The port should be changed to TCP/2222 for security through obscurity',
      'The security group should be replaced with a network ACL',
    ],
    answer: 0,
    explanation:
      'Allowing SSH from 0.0.0.0/0 exposes the instance to brute-force and credential-stuffing attacks from any source on the internet. Restrict to a bastion CIDR or use a managed session service.',
    domain: 'Security Architecture',
    conceptId: 'cloud-security-groups',
  },
  {
    id: 'p14-q7',
    type: 'scenario',
    stem: 'A company federated its on-premises Active Directory with AWS IAM Identity Center. Users authenticate once on-prem and receive temporary AWS credentials. Which concept does this describe?',
    options: [
      'Federated identity with SSO',
      'Multi-factor authentication',
      'Role-based access control',
      'Certificate-based authentication',
    ],
    answer: 0,
    explanation:
      'Federation lets an external identity provider (on-prem AD) issue assertions accepted by the cloud provider. Combined with SSO, users authenticate once and access cloud resources without a separate cloud password.',
    domain: 'Security Architecture',
    conceptId: 'cloud-iam',
  },
  {
    id: 'p14-q-pbq',
    type: 'pbq',
    stem: 'Order the response to a public cloud identity account that is over-provisioned.',
    options: [
      'List the account\'s current roles and group memberships',
      'Compare the entitlements to peers in the same job function',
      'Remove roles that are not justified by the job function',
      'Schedule a periodic access review and add it to the audit trail',
    ],
    answer: [0, 1, 2, 3],
    explanation:
      'You cannot judge over-provisioning without an inventory and a peer baseline. Once excessive roles are found, remove them and add governance so the same drift is caught next time.',
    domain: 'Security Architecture',
    conceptId: 'cloud-iam',
  },
];

// ---------- Lesson 2: Cloud-Native Risks & Modern Workloads ----------

const LESSON_14_L2_SECTIONS: LessonSection[] = [
  {
    id: 'p14-l2-s0',
    title: 'Concept — Cloud Misconfiguration',
    body:
      'Misconfiguration is the leading cause of cloud breaches. Public storage buckets, overly permissive IAM roles, unencrypted databases, disabled logging, and open security groups are the usual suspects. The reason misconfiguration dominates is speed: cloud lets you provision in seconds, and the default settings are often permissive to reduce friction. A Service Control Policy (SCP) or Azure Policy that enforces guardrails at the organisation level is the preventive control — it makes dangerous configurations impossible before anyone tries them.',
  },
  {
    id: 'p14-l2-s1',
    title: 'Concept — Containers',
    body:
      'A container packages an application and its dependencies into an isolated process that shares the host kernel. Docker is the most common runtime. Containers are not VMs — they share the host kernel, which means a kernel exploit escapes the container. Security concerns: base image vulnerabilities (scan with Trivy, Grype, or Snyk), running as root inside the container (use a non-root user), storing secrets in the image (use a secrets manager), and pulling unverified images from public registries.',
  },
  {
    id: 'p14-l2-s2',
    title: 'Concept — Container Orchestration (Kubernetes)',
    body:
      'Kubernetes orchestrates containers across a cluster. Security-critical components: the API server (authenticates and authorises every request), RBAC (controls who can do what in which namespace), network policies (segment pod-to-pod traffic), pod security standards (restrict privileges, capabilities, and host access), and secrets objects (stored in etcd, encrypted at rest only if you enable it). The most common Kubernetes misconfiguration is granting cluster-admin to a service account that only needs read access in one namespace.',
  },
  {
    id: 'p14-l2-s3',
    title: 'Concept — Serverless Security',
    body:
      'Serverless (Lambda, Azure Functions, Cloud Functions) removes the OS entirely — you deploy a function that runs in response to an event. You manage only the code and its configuration. Security risks: over-permissive execution roles (the function IAM role should follow least privilege), hardcoded secrets in environment variables (use a secrets manager), dependency vulnerabilities in the function package, and event injection (malicious input in the event payload that the function trusts without validation).',
  },
  {
    id: 'p14-l2-s4',
    title: 'Concept — API Security',
    body:
      'Cloud-native applications expose APIs, not ports. An API gateway sits in front, handling authentication (API keys, OAuth tokens, mutual TLS), authorisation (scope checks, rate limiting), input validation, and logging. Common API attacks: broken authentication (missing or weak token validation), excessive data exposure (returning more fields than the caller needs), lack of rate limiting (enabling enumeration and DoS), and BOLA (broken object-level authorisation — accessing another user\'s resources by changing an ID in the URL).',
  },
  {
    id: 'p14-l2-s5',
    title: 'Concept — Secrets Management',
    body:
      'Secrets (API keys, database credentials, TLS private keys, encryption keys) must never be hardcoded in source code, stored in environment variables without encryption, or committed to version control. A secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) stores secrets encrypted, controls access via IAM policies, rotates them automatically, and provides an audit trail of every access. The rotation schedule is the part everyone defers — and the part that matters most when a secret is compromised.',
  },
  {
    id: 'p14-l2-s6',
    title: 'Example — Container image supply-chain attack',
    body:
      'A developer pulls a popular base image from Docker Hub without verifying its digest. The image has been modified to include a cryptocurrency miner that runs at low priority. The container passes functional tests because the miner does not affect the application. The control: pin images by SHA-256 digest, scan every image before deployment, and restrict pulls to an approved internal registry.',
  },
  {
    id: 'p14-l2-s7',
    title: 'Review — What must stick',
    body:
      'Misconfiguration is the leading cloud risk. Containers share the host kernel — they are not VMs. Kubernetes RBAC must follow least privilege per namespace. Serverless removes the OS but not the responsibility for code, dependencies, and IAM. API gateways enforce authentication, authorisation, and rate limiting. Secrets belong in a vault, not in code or environment variables.',
  },
];

const LESSON_14_L2_QUIZ: QuizQuestion[] = [
  {
    id: 'p14-q8',
    type: 'mcq',
    stem: 'What is the leading cause of cloud security breaches?',
    options: [
      'Misconfiguration',
      'Zero-day exploits',
      'Insider threats',
      'DDoS attacks',
    ],
    answer: 0,
    explanation:
      'Cloud misconfiguration (public buckets, over-permissive IAM, open security groups, disabled logging) is consistently the number one cause of cloud breaches. Speed of provisioning without guardrails is the root cause.',
    domain: 'Security Architecture',
    conceptId: 'cloud-misconfiguration',
  },
  {
    id: 'p14-q9',
    type: 'mcq',
    stem: 'How do containers differ from virtual machines?',
    options: [
      'Containers share the host kernel; VMs have their own kernel',
      'Containers are more isolated than VMs',
      'Containers require a hypervisor; VMs do not',
      'Containers cannot run on Linux',
    ],
    answer: 0,
    explanation:
      'Containers share the host OS kernel and isolate at the process level. VMs virtualise the entire hardware stack, including the kernel. This makes containers lighter but means a kernel exploit can escape the container.',
    domain: 'Security Architecture',
    conceptId: 'containers',
  },
  {
    id: 'p14-q10',
    type: 'mcq',
    stem: 'In Kubernetes, what controls which users and service accounts can perform actions in a namespace?',
    options: ['RBAC', 'Network policies', 'Pod security standards', 'Ingress controllers'],
    answer: 0,
    explanation:
      'Kubernetes RBAC (Role-Based Access Control) defines Roles (permissions in a namespace) and RoleBindings (who gets those permissions). ClusterRoles and ClusterRoleBindings apply cluster-wide.',
    domain: 'Security Architecture',
    conceptId: 'k8s-rbac',
  },
  {
    id: 'p14-q11',
    type: 'mcq',
    stem: 'Which serverless security risk involves storing database passwords directly in the function configuration?',
    options: [
      'Hardcoded secrets in environment variables',
      'Cold-start latency',
      'Event injection',
      'Function timeout',
    ],
    answer: 0,
    explanation:
      'Storing secrets in environment variables exposes them to anyone who can read the function configuration. Use a secrets manager (Secrets Manager, Key Vault, Parameter Store with encryption) instead.',
    domain: 'Security Architecture',
    conceptId: 'secrets-management',
  },
  {
    id: 'p14-q12',
    type: 'mcq',
    stem: 'What does an API gateway primarily provide?',
    options: [
      'Authentication, authorisation, rate limiting, and input validation for API traffic',
      'Container orchestration across multiple cloud regions',
      'Automatic scaling of serverless functions',
      'Encryption of data at rest in databases',
    ],
    answer: 0,
    explanation:
      'An API gateway is the front door for API traffic. It handles authentication (tokens, keys), authorisation (scopes), rate limiting (preventing abuse), and can perform input validation before requests reach backend services.',
    domain: 'Security Architecture',
    conceptId: 'api-security',
  },
  {
    id: 'p14-q13',
    type: 'mcq',
    stem: 'A secrets manager provides all of the following EXCEPT:',
    options: [
      'Automatic code review for hardcoded credentials',
      'Encrypted storage of secrets',
      'IAM-controlled access to secrets',
      'Automatic secret rotation',
    ],
    answer: 0,
    explanation:
      'A secrets manager stores, controls access to, and rotates secrets. Scanning code for hardcoded credentials requires a separate tool (e.g., git-secrets, truffleHog, or a CI/CD pre-commit hook).',
    domain: 'Security Architecture',
    conceptId: 'secrets-management',
  },
  {
    id: 'p14-q14',
    type: 'mcq',
    stem: 'Which preventive control makes dangerous cloud configurations impossible at the organisation level before anyone tries them?',
    options: [
      'Service Control Policies (SCPs)',
      'Security groups',
      'CloudWatch alarms',
      'IAM user passwords',
    ],
    answer: 0,
    explanation:
      'SCPs (AWS) and Azure Policies are organisation-level guardrails that restrict what any account or subscription can do. They act as preventive controls — blocking actions rather than detecting them after the fact.',
    domain: 'Security Architecture',
    conceptId: 'cloud-misconfiguration',
  },
  {
    id: 'p14-q15',
    type: 'scenario',
    stem: 'A developer pulls a base Docker image from a public registry without checking its digest. Later, a cryptocurrency miner is found running inside the container. What control would have prevented this?',
    options: [
      'Pin images by SHA-256 digest, scan before deployment, and restrict to an approved internal registry',
      'Use a larger base image with more built-in security tools',
      'Run the container with root privileges to enable security monitoring',
      'Disable container networking to prevent outbound connections',
    ],
    answer: 0,
    explanation:
      'Pinning by digest ensures the exact image is used. Scanning catches known CVEs. Restricting to an internal registry prevents untrusted image pulls. Running as root and disabling networking are anti-patterns.',
    domain: 'Security Architecture',
    conceptId: 'containers',
  },
  {
    id: 'p14-q16',
    type: 'scenario',
    stem: 'An attacker changes an ID in an API URL to access another user\'s data. The API returns the data without checking ownership. What vulnerability is this?',
    options: [
      'Broken Object-Level Authorisation (BOLA)',
      'SQL injection',
      'Cross-site scripting (XSS)',
      'Server-side request forgery (SSRF)',
    ],
    answer: 0,
    explanation:
      'BOLA (also called IDOR — Insecure Direct Object Reference) occurs when an API does not verify that the authenticated user is authorised to access the specific object identified by the request parameter.',
    domain: 'Security Architecture',
    conceptId: 'api-security',
  },
  {
    id: 'p14-q17',
    type: 'scenario',
    stem: 'A Kubernetes service account in the "payments" namespace is bound to cluster-admin. What is the risk and what is the correct fix?',
    options: [
      'The service account can do anything cluster-wide; bind it to a namespace-scoped Role with only the permissions it needs',
      'The service account cannot authenticate; create an API key for it',
      'The payments namespace is too restrictive; move the workload to default',
      'cluster-admin is the recommended role for payment services due to compliance',
    ],
    answer: 0,
    explanation:
      'cluster-admin grants unrestricted access to all resources in all namespaces. A compromised pod could read secrets, delete deployments, and escalate further. The fix is a namespace-scoped Role with minimal permissions.',
    domain: 'Security Architecture',
    conceptId: 'k8s-rbac',
  },
  {
    id: 'p14-q18',
    type: 'scenario',
    stem: 'A Lambda function has an execution role with Action: "*" and Resource: "*". The function only needs to read from one DynamoDB table. What is the correct remediation?',
    options: [
      'Restrict the policy to dynamodb:GetItem and dynamodb:Query on the specific table ARN only',
      'Add a condition key to limit invocations to business hours',
      'Remove the execution role entirely — Lambda functions do not need IAM roles',
      'Change Action to "dynamodb:*" to limit it to DynamoDB',
    ],
    answer: 0,
    explanation:
      'Least privilege means the smallest set of actions on the smallest set of resources. Action: "*", Resource: "*" is the cloud equivalent of root — any compromise of the function gives the attacker full account access.',
    domain: 'Security Architecture',
    conceptId: 'cloud-iam',
  },
  {
    id: 'p14-q19',
    type: 'scenario',
    stem: 'An organisation\'s CloudTrail logs are stored in an S3 bucket. The IAM role that was compromised in an incident also has s3:DeleteObject on that bucket. What should have been done differently?',
    options: [
      'Store logs in a separate account with a cross-account bucket policy that denies deletion, and enable S3 Object Lock',
      'Store logs locally on each EC2 instance instead of S3',
      'Disable CloudTrail to reduce storage costs',
      'Grant the IAM role full S3 access so it can manage its own logs',
    ],
    answer: 0,
    explanation:
      'Logs must be protected from the identities they monitor. A separate logging account with immutable storage (Object Lock, WORM) prevents a compromised identity from covering its tracks.',
    domain: 'Security Architecture',
    conceptId: 'cloud-logging',
  },
];

// ---------- Lab 1: Audit a Cloud Environment ----------

const LAB_14_0_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Survey the simulated cloud environment — list all deployed services.',
    command: 'show cloud environment',
    expected: 'An overview showing VPCs, EC2 instances, S3 buckets, RDS databases, Lambda functions, and IAM entities.',
  },
  {
    id: 's1',
    instruction: 'Review the IAM policies for over-permissive grants.',
    command: 'show iam policies',
    expected: 'At least one policy with Action: "*" and Resource: "*" is flagged.',
  },
  {
    id: 's2',
    instruction: 'Inspect security group rules for dangerous open ports.',
    command: 'show security groups',
    expected: 'A security group allowing 0.0.0.0/0 on SSH (22) and RDP (3389) is identified.',
  },
  {
    id: 's3',
    instruction: 'Check storage configurations for public access.',
    command: 'show storage config',
    expected: 'An S3 bucket with Block Public Access disabled and an Everyone-read ACL is found.',
  },
  {
    id: 's4',
    instruction: 'Review cloud audit logs for suspicious API calls.',
    command: 'show cloud logs',
    expected: 'CloudTrail entries show a root account login without MFA and a policy attachment granting *:*.',
  },
  {
    id: 's5',
    instruction: 'Verify encryption-at-rest status across all services.',
    command: 'show encryption status',
    expected: 'An RDS instance and one S3 bucket are found with encryption disabled.',
  },
];

const LAB_14_0: Lab = {
  id: 'p14-lab-0',
  phaseId: 'phase-14',
  title: 'Audit a Cloud Environment',
  objective:
    'Audit a simulated cloud environment for misconfigurations, over-permissive IAM, open security groups, public storage, and missing encryption. Produce a findings report.',
  securityConcepts: [
    'Shared responsibility',
    'Cloud IAM',
    'Security groups',
    'Storage ACLs',
    'Cloud logging',
    'Encryption at rest',
    'Misconfiguration',
  ],
  environment: 'Deterministic cloud simulator — prepared outputs only, nothing is executed against a real cloud account',
  topology: 'Simulated AWS account with VPC (10.0.0.0/16), 3 EC2 instances, 2 S3 buckets, 1 RDS instance, 5 IAM users, 3 IAM roles, 2 Lambda functions',
  prerequisites: ['Complete Phase 4 (Security Architecture)', 'Complete Phase 5 (IAM)'],
  steps: LAB_14_0_STEPS,
  expectedResults: [
    'Over-permissive IAM policy identified',
    'Open security group (SSH/RDP from 0.0.0.0/0) flagged',
    'Public S3 bucket with PII exposure risk identified',
    'Missing encryption on RDS and S3 flagged',
    'Suspicious root account activity in CloudTrail identified',
  ],
  verification: [
    'Learner can name at least three distinct misconfigurations',
    'Learner can explain the shared responsibility boundary for each finding',
    'Learner can recommend a specific remediation for each finding',
  ],
  troubleshooting: [
    'Command not recognised → the simulator is a closed allowlist. Type help to list available commands.',
    'Output looks static → it is. Prepared artifacts are deterministic so findings are reproducible.',
    'Unsure what counts as a misconfiguration → ask: "Would this survive a SOC 2 audit?" If the answer is no, it is a finding.',
  ],
  challenge:
    'Write a one-page findings report: for each misconfiguration, state the finding, the risk, the shared-responsibility owner, and a specific remediation. Prioritise by severity.',
  evidence: [
    {
      id: 'ev0',
      label: 'Cloud audit command transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Findings report',
      type: 'report',
      placeholder: 'Finding, risk, owner, remediation for each misconfiguration',
    },
  ],
  securityLesson:
    'Cloud misconfiguration is not a technical failure — it is a governance failure. The tools to prevent every finding in this lab already exist in the provider\'s console. The gap is always process: who reviews, who enforces, and who is accountable.',
};

// ---------- Lab 2: Secure a Cloud-Native Deployment ----------

const LAB_14_1_STEPS: LabStep[] = [
  {
    id: 's0',
    instruction: 'Scan the container images for known vulnerabilities.',
    command: 'show container images',
    expected: 'A scan report showing CVEs in the base image, including a critical-severity CVE in an outdated library.',
  },
  {
    id: 's1',
    instruction: 'Review Kubernetes RBAC bindings for over-permissive access.',
    command: 'show k8s rbac',
    expected: 'A service account in the payments namespace bound to cluster-admin is flagged.',
  },
  {
    id: 's2',
    instruction: 'Inspect the serverless function configuration for hardcoded secrets.',
    command: 'show serverless config',
    expected: 'A Lambda function with database credentials in plain-text environment variables is found.',
  },
  {
    id: 's3',
    instruction: 'Check the API gateway configuration for authentication and rate limiting.',
    command: 'show api gateway',
    expected: 'An API endpoint with no authentication and no rate limiting is discovered.',
  },
  {
    id: 's4',
    instruction: 'Verify the secrets vault status and rotation schedule.',
    command: 'show secrets vault',
    expected: 'Two secrets have not been rotated in over 180 days.',
  },
];

const LAB_14_1: Lab = {
  id: 'p14-lab-1',
  phaseId: 'phase-14',
  title: 'Secure a Cloud-Native Deployment',
  objective:
    'Review a cloud-native deployment for container, serverless, API, and secrets management security issues. Recommend remediations.',
  securityConcepts: [
    'Container security',
    'Kubernetes RBAC',
    'Serverless security',
    'API gateway',
    'Secrets management',
    'Image supply chain',
  ],
  environment: 'Deterministic cloud-native simulator — prepared outputs only',
  topology: 'Kubernetes cluster (3 namespaces: frontend, payments, monitoring), 2 Lambda functions, 1 API Gateway, 1 secrets vault',
  prerequisites: ['Complete Lab 1 (Audit a Cloud Environment)'],
  steps: LAB_14_1_STEPS,
  expectedResults: [
    'Critical CVE in container base image identified',
    'Over-permissive Kubernetes RBAC binding flagged',
    'Hardcoded secrets in Lambda function found',
    'Unauthenticated API endpoint discovered',
    'Stale secrets (>180 days) identified',
  ],
  verification: [
    'Learner can identify at least four distinct security issues',
    'Learner can explain why each issue is dangerous in a cloud-native context',
    'Learner can recommend a specific fix for each issue',
  ],
  troubleshooting: [
    'Command not recognised → type help for the available commands.',
    'Not sure what "cloud-native" means → it means designed for the cloud from scratch — containers, serverless, APIs, and managed services rather than lifted-and-shifted VMs.',
    'Confused by Kubernetes terms → a namespace is a logical boundary; RBAC controls who can do what within it; cluster-admin bypasses all RBAC.',
  ],
  challenge:
    'Design a CI/CD security gate: list five automated checks that must pass before a container image or serverless function is deployed to production.',
  evidence: [
    {
      id: 'ev0',
      label: 'Cloud-native audit transcript',
      type: 'log',
      placeholder: 'Paste the full simulator transcript',
    },
    {
      id: 'ev1',
      label: 'Security recommendations',
      type: 'report',
      placeholder: 'Issue, risk, remediation for each finding',
    },
    {
      id: 'ev2',
      label: 'CI/CD security gate design',
      type: 'report',
      placeholder: 'Five automated checks for the deployment pipeline',
    },
  ],
  securityLesson:
    'Cloud-native workloads trade one set of risks for another. You no longer patch an OS, but you must scan images, scope RBAC, protect secrets, and authenticate APIs. The attack surface has not shrunk — it has moved.',
};

// ---------- Lessons ----------

const LESSON_14_L1: Lesson = {
  id: 'p14-lesson-0',
  phaseId: 'phase-14',
  title: 'Cloud Service Models & Shared Responsibility',
  objectives: [
    'Distinguish IaaS, PaaS, and SaaS and the security responsibilities of each',
    'Explain the shared responsibility model and where the boundary shifts',
    'Describe Cloud IAM, security groups, and network ACLs',
    'Explain cloud logging and monitoring capabilities',
    'Distinguish provider-managed, customer-managed, and customer-supplied encryption keys',
  ],
  sections: LESSON_14_L1_SECTIONS,
  quiz: LESSON_14_L1_QUIZ,
  concepts: [
    'cloud-service-models',
    'shared-responsibility',
    'cloud-iam',
    'cloud-security-groups',
    'cloud-logging',
    'cloud-encryption',
  ],
  homework:
    'Take three services you use and classify each as IaaS, PaaS, or SaaS. For each, write one security responsibility that is yours and one that is the provider\'s.',
  careerConnection:
    'Cloud Security Analyst — every cloud role starts with understanding the shared responsibility model. If you cannot draw the boundary for IaaS vs PaaS vs SaaS, you cannot audit, assess risk, or respond to incidents in any cloud environment.',
};

const LESSON_14_L2: Lesson = {
  id: 'p14-lesson-1',
  phaseId: 'phase-14',
  title: 'Cloud-Native Risks & Modern Workloads',
  objectives: [
    'Identify common cloud misconfigurations and their preventive controls',
    'Explain container security risks and image supply-chain controls',
    'Describe Kubernetes RBAC and why least privilege applies per namespace',
    'Identify serverless security risks including hardcoded secrets and over-permissive roles',
    'Explain API gateway security controls and common API vulnerabilities',
    'Describe secrets management best practices including rotation',
  ],
  sections: LESSON_14_L2_SECTIONS,
  quiz: LESSON_14_L2_QUIZ,
  concepts: [
    'cloud-misconfiguration',
    'containers',
    'k8s-rbac',
    'serverless-security',
    'api-security',
    'secrets-management',
  ],
  homework:
    'Write down where secrets live in a project you have worked on and how they would be rotated. If the answer is "in a file next to the code", write the plan to fix it.',
  careerConnection:
    'Cloud/DevSecOps Engineer — organisations are migrating to containers, serverless, and APIs. The analyst who can audit a Kubernetes RBAC binding or flag an unauthenticated API endpoint is immediately useful on day one.',
};

// ---------- Phase export ----------

export const PHASE_14: Phase = {
  id: 'phase-14',
  number: 14,
  title: 'Cloud Security',
  description:
    'Master cloud service models, the shared responsibility boundary, Cloud IAM, security groups, logging, encryption, container and serverless security, API protection, and secrets management — then audit a simulated cloud environment for misconfigurations.',
  examDomain: 'Security Architecture',
  scene: 'soc',
  lessons: [LESSON_14_L1, LESSON_14_L2],
  labs: [LAB_14_0, LAB_14_1],
};
