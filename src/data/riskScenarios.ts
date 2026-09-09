import type { RiskScenario } from '../types';

// ---------------------------------------------------------------------------
// Phase 2 — interactive risk-assessment scenarios.
//
// Each scenario shares ONE option pool across all six fields. Placing an option
// removes it from the others, so the learner must actively separate threat from
// vulnerability rather than answering six independent questions.
//
// Every organisation below is fictional. No real company, person, or breach is
// described.
// ---------------------------------------------------------------------------

export const RISK_SCENARIOS: RiskScenario[] = [
  {
    id: 'p2-scenario-0',
    title: 'The unpatched remote access appliance',
    business:
      'Northwind Clinic is a 40-person medical practice. Staff work from home two days a week and reach the practice network through a VPN appliance at the perimeter. The appliance is four firmware versions behind, and the vendor published an advisory three months ago for an authentication bypass in that firmware. The VPN fronts the patient records system, which holds the medical histories of about 12,000 patients. Nobody at the practice reviews VPN logs. The practice manager asks what should be done first.',
    domain: 'Security Program Management and Oversight',
    conceptIds: ['risk', 'threat', 'vulnerability', 'controls'],
    options: [
      {
        id: 'o0',
        text: 'The patient records system and the 12,000 medical histories it holds',
        correctFor: 'asset',
        rationale:
          'The asset is what has value and needs protecting. The VPN appliance is infrastructure in front of it; the records are what an attacker actually wants and what regulators care about.',
      },
      {
        id: 'o1',
        text: 'An external attacker scanning the internet for vulnerable VPN appliances',
        correctFor: 'threat',
        rationale:
          'A threat is the actor or event that could cause harm. It exists whether or not you are weak — attackers scan for these appliances continuously regardless of whether Northwind patched.',
      },
      {
        id: 'o2',
        text: 'Firmware four versions behind, with a published authentication bypass advisory',
        correctFor: 'vulnerability',
        rationale:
          "A vulnerability is the weakness the threat could exploit, and it is yours to fix. The unpatched firmware is entirely within the practice's control.",
      },
      {
        id: 'o3',
        text: 'A high likelihood of unauthorised access to patient records, with severe regulatory and patient-harm impact',
        correctFor: 'risk',
        rationale:
          'Risk combines likelihood with impact. A published advisory plus internet exposure makes likelihood high; medical records make impact severe. Risk is a statement about both, never one alone.',
      },
      {
        id: 'o4',
        text: 'Apply the vendor firmware update and enable MFA on VPN authentication',
        correctFor: 'control',
        rationale:
          'The control is the safeguard that reduces likelihood or impact. Patching removes the specific weakness; MFA reduces the value of any credential an attacker still obtains.',
      },
      {
        id: 'o5',
        text: 'Remaining exposure to an unknown flaw in the patched firmware, and to a stolen session token',
        correctFor: 'residualRisk',
        rationale:
          'Residual risk is what remains after controls. Patching closes the known flaw, not future ones, and MFA does not stop an attacker who steals an already-authenticated session. Residual risk is never zero.',
      },
      {
        id: 'o6',
        text: 'Nobody at the practice reviews VPN logs',
        correctFor: null,
        rationale:
          'This is a genuine weakness, but it is a detection gap rather than the weakness the advisory describes. Watch for scenarios containing more than one plausible vulnerability — pick the one the threat actually exploits.',
      },
      {
        id: 'o7',
        text: 'Staff work from home two days a week',
        correctFor: null,
        rationale:
          'This is business context, not a security finding. Remote work creates the need for the VPN; it is not itself an asset, threat, vulnerability, or control.',
      },
      {
        id: 'o8',
        text: 'Decommission the VPN and require all staff to work on site',
        correctFor: null,
        rationale:
          'This would eliminate the risk but destroy the business requirement. Risk treatment has to remain compatible with what the organisation actually needs to do — avoidance at this cost is rarely the right answer.',
      },
    ],
    debrief:
      'Two things to carry forward. First, the threat and the vulnerability are different objects: the attacker exists regardless of your patching, and the missing patch exists regardless of whether anyone is scanning. You control one of them. Second, "nobody reviews VPN logs" was a real finding but the wrong answer here — scenarios often contain more weaknesses than the question asks about, and picking the one the stated threat exploits is the skill being tested.',
  },

  {
    id: 'p2-scenario-1',
    title: 'The finance department wire transfer',
    business:
      'Harbour Logistics processes supplier payments through a finance team of three. Payment instructions arrive by email and are actioned by whoever is available, with no second approver for transfers under £50,000. Last month a supplier emailed new bank details from an address one character different from the real one, and £38,000 was transferred before anyone noticed. The finance director wants to know how to stop it happening again.',
    domain: 'Security Program Management and Oversight',
    conceptIds: ['risk', 'controls', 'aaa', 'non-repudiation'],
    options: [
      {
        id: 'o0',
        text: 'Supplier payment funds and the payment process that moves them',
        correctFor: 'asset',
        rationale:
          'The asset is what has value. Here it is the funds themselves, plus the integrity of the process that authorises their movement.',
      },
      {
        id: 'o1',
        text: 'An attacker impersonating a supplier by registering a lookalike domain',
        correctFor: 'threat',
        rationale:
          'This is business email compromise. The threat is the fraudulent actor — it exists in the market whether or not Harbour has approval controls.',
      },
      {
        id: 'o2',
        text: 'No second approver required for transfers under £50,000, and no out-of-band verification of changed bank details',
        correctFor: 'vulnerability',
        rationale:
          'The weakness is a process gap, not a technical flaw. Vulnerabilities are frequently administrative — Security+ tests whether you recognise that.',
      },
      {
        id: 'o3',
        text: 'A high likelihood of repeat fraudulent payment, with direct and largely unrecoverable financial loss',
        correctFor: 'risk',
        rationale:
          'The attack already succeeded once, which makes likelihood demonstrably high. Impact is direct financial loss that is usually unrecoverable once transferred.',
      },
      {
        id: 'o4',
        text: 'Require dual authorisation for all transfers and verify any bank-detail change by callback to a previously known number',
        correctFor: 'control',
        rationale:
          'Separation of duties plus out-of-band verification. Both are administrative controls, and together they attack the process gap rather than the email itself.',
      },
      {
        id: 'o5',
        text: 'Two colluding approvers, or an attacker who compromises the phone number used for callback verification',
        correctFor: 'residualRisk',
        rationale:
          'Dual authorisation fails against collusion; callback verification fails if the number itself was tampered with. Naming the specific way a control can still fail is what separates a real assessment from a checkbox.',
      },
      {
        id: 'o6',
        text: 'The finance team has only three people',
        correctFor: null,
        rationale:
          'Team size is a constraint on how you implement separation of duties, not a vulnerability in itself. It matters for feasibility, not for classification.',
      },
      {
        id: 'o7',
        text: 'Block all inbound email from external domains',
        correctFor: null,
        rationale:
          'Disproportionate and unworkable — suppliers must be able to email. A control that stops the business functioning is not a control the business will keep.',
      },
      {
        id: 'o8',
        text: '£38,000 was transferred before anyone noticed',
        correctFor: null,
        rationale:
          'This is the realised impact of an incident that already occurred. It is evidence that the risk is real, but it is not itself the risk statement — risk is forward-looking.',
      },
    ],
    debrief:
      'Note that nothing here was a technical vulnerability. The weakness was a process gap and the controls were administrative. Security+ deliberately tests this: candidates who only look for a missing patch will misclassify half the scenarios on the exam. Note too that residual risk was stated as a specific failure mode — "collusion between two approvers" — not as a vague "some risk remains".',
  },

  {
    id: 'p2-scenario-2',
    title: 'The shared administrator account',
    business:
      'Cedar Analytics runs its production database on a server that four engineers administer. All four log in with the same "dbadmin" account, sharing the password through a team chat channel. Last Tuesday a production table was dropped at 02:14. The logs show the deletion was performed by dbadmin, but nobody knows which engineer was logged in, and one engineer left the company six weeks ago. The CTO wants to know who did it.',
    domain: 'General Security Concepts',
    conceptIds: ['aaa', 'non-repudiation', 'least-privilege', 'controls'],
    options: [
      {
        id: 'o0',
        text: 'The production database and the accountability record of who changed it',
        correctFor: 'asset',
        rationale:
          'Two things of value are at stake: the data, and the ability to attribute actions to a person. Accountability is itself an asset — losing it is what makes this incident unresolvable.',
      },
      {
        id: 'o1',
        text: 'A departed employee, or any holder of the shared password, acting with administrator rights',
        correctFor: 'threat',
        rationale:
          'The threat here includes insiders and former staff. A credential shared in a chat channel has an unbounded and unknowable holder list.',
      },
      {
        id: 'o2',
        text: 'A shared account with a password distributed in team chat and no per-person identity',
        correctFor: 'vulnerability',
        rationale:
          'The weakness breaks the first A of AAA — authentication no longer identifies a person, only a role. Everything downstream of identity then fails.',
      },
      {
        id: 'o3',
        text: 'A moderate likelihood of unattributable destructive change, with high impact on data integrity and the ability to investigate',
        correctFor: 'risk',
        rationale:
          'The impact is doubled: the data loss itself, and the permanent loss of investigative capability. A risk statement should name both when they differ.',
      },
      {
        id: 'o4',
        text: 'Issue named administrator accounts, enable per-user auditing, and remove the shared credential',
        correctFor: 'control',
        rationale:
          'Named accounts restore authentication and accounting, which is what makes non-repudiation possible. Without individual identity there is nothing to hold anyone to.',
      },
      {
        id: 'o5',
        text: 'An administrator who abuses their own named account, or who tampers with the audit log they can reach',
        correctFor: 'residualRisk',
        rationale:
          'Named accounts fix attribution but not authorised misuse. This is why privileged access management and write-once log storage exist — the next control layer addresses exactly this residual risk.',
      },
      {
        id: 'o6',
        text: 'The table was dropped at 02:14',
        correctFor: null,
        rationale:
          'A timestamp is evidence, not a classification. Useful for the timeline, but it is not an asset, threat, vulnerability, risk, or control.',
      },
      {
        id: 'o7',
        text: 'Restore the dropped table from the most recent backup',
        correctFor: null,
        rationale:
          'This is a corrective action for one incident, not a control that reduces the underlying risk. Recovery and risk treatment are different activities — the shared account remains after the restore.',
      },
      {
        id: 'o8',
        text: 'Four engineers administer the server',
        correctFor: null,
        rationale:
          'Multiple administrators is normal and not itself a weakness. The weakness is that four people share one identity, not that four people have access.',
      },
    ],
    debrief:
      'This scenario is really about AAA. Authentication failed to identify a person, so accounting could not record who acted, so non-repudiation was impossible — the CTO\'s question is unanswerable by design. Notice that "restore from backup" was a distractor: it resolves the incident without touching the risk. Recovering from an event and reducing the chance of the next one are separate jobs, and the exam tests whether you conflate them.',
  },
];

export function getScenario(id: string): RiskScenario | undefined {
  return RISK_SCENARIOS.find((s) => s.id === id);
}
