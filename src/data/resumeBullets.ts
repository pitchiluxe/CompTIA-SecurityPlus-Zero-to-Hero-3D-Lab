// ---------------------------------------------------------------------------
// Phase 26 — "Never fabricate professional experience" honesty check.
//
// Reuses the Phase 25 provenance-honesty lesson (real/simulated/prepared)
// applied specifically to resume/portfolio bullet points. The skill being
// graded is discrimination — the same shape as Phase 7's alert triage and
// Phase 23's capstone triage, applied to a different kind of claim.
// ---------------------------------------------------------------------------

export type ResumeBulletVerdict = 'honest' | 'fabricated';

export type ResumeBullet = {
  id: string;
  text: string;
  verdict: ResumeBulletVerdict;
  rationale: string;
};

export const RESUME_BULLETS: ResumeBullet[] = [
  {
    id: 'rb0',
    text: 'Completed a structured, simulated SOC investigation covering credential compromise, lateral movement, and containment across a five-host lab environment.',
    verdict: 'honest',
    rationale:
      'Accurately scopes the work as simulated and lab-based, while still describing genuine, specific, demonstrable skills.',
  },
  {
    id: 'rb1',
    text: 'Responded to a live ransomware incident affecting enterprise production infrastructure, containing the attacker within minutes.',
    verdict: 'fabricated',
    rationale:
      'Claims real-system, production incident response when the work was a platform simulation — this collapses under one clarifying interview question about the actual infrastructure or business impact involved.',
  },
  {
    id: 'rb2',
    text: 'Built and documented a two-axis containment decision model (stops the attacker vs. preserves evidence) across two independent incident-response lab scenarios.',
    verdict: 'honest',
    rationale:
      'Describes a specific, real skill and artifact (the decision model and its documentation) without claiming any real-system or employer context that did not exist.',
  },
  {
    id: 'rb3',
    text: 'Worked as a SOC Analyst for two years managing enterprise security operations.',
    verdict: 'fabricated',
    rationale:
      'Claims an actual job title, employer, and duration of professional experience that was never held — this is fabricated professional experience, exactly what this platform instructs against.',
  },
  {
    id: 'rb4',
    text: 'Practiced identity lifecycle troubleshooting across simulated joiner/mover/leaver scenarios, correctly diagnosing root cause in 3 of 3 incidents.',
    verdict: 'honest',
    rationale:
      'Specific, quantified, and honestly scoped as simulated practice — a legitimate and still meaningfully impressive claim.',
  },
  {
    id: 'rb5',
    text: 'Certified penetration tester with 5 years of experience conducting authorized red-team engagements for Fortune 500 clients.',
    verdict: 'fabricated',
    rationale:
      'Claims a specific professional certification, years of experience, and named-scale client engagements, none of which exist — an extreme case of the same fabrication risk as claiming a job title never held.',
  },
  {
    id: 'rb6',
    text: 'Generated a documented GitHub repository for a vulnerability-scanning lab, including findings, remediation, and validation sections for each identified issue.',
    verdict: 'honest',
    rationale:
      'Describes an artifact that genuinely exists and can be reviewed directly — the strongest kind of honest claim, since it is independently verifiable.',
  },
  {
    id: 'rb7',
    text: 'Led a team of five analysts through a critical incident response, briefing executive leadership on containment status.',
    verdict: 'fabricated',
    rationale:
      'Claims a leadership role, a team, and executive interaction that never occurred in a solo, simulated lab exercise — fabricating scale and seniority, not just the underlying work.',
  },
];

export function getBullet(id: string): ResumeBullet | undefined {
  return RESUME_BULLETS.find((b) => b.id === id);
}
