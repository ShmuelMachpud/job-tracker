import { RecruiterFollowUp } from '../../recruiters/logic/recruiter-follow-ups';
import { FollowUp } from './follow-ups';

/** פריט אחד ברשימת "צריך לעקוב": משרה או מגייס. */
export type FollowUpEntry =
  { kind: 'application'; followUp: FollowUp } | { kind: 'recruiter'; followUp: RecruiterFollowUp };

/** משרות ומגייסים ברשימה אחת, הדחוף ביותר ראשון (לפי ימי איחור או המתנה). */
export function mergeFollowUps(
  applications: readonly FollowUp[],
  recruiters: readonly RecruiterFollowUp[],
): FollowUpEntry[] {
  const entries: FollowUpEntry[] = [
    ...applications.map((followUp) => ({ kind: 'application' as const, followUp })),
    ...recruiters.map((followUp) => ({ kind: 'recruiter' as const, followUp })),
  ];
  // sort יציב: באותה דחיפות, משרות לפני מגייסים
  return entries.sort((a, b) => urgency(b) - urgency(a));
}

function urgency(entry: FollowUpEntry): number {
  const reason = entry.followUp.reason;
  return reason.kind === 'nextActionDue' ? reason.daysLate : reason.days;
}

export function followUpKey(entry: FollowUpEntry): string {
  return entry.kind === 'application'
    ? `application-${entry.followUp.application.id}`
    : `recruiter-${entry.followUp.recruiter.id}`;
}
