import { IsoDate, JobApplication } from '../models/job-application';
import { daysBetween } from './iso-date';
import { isClosed } from './status-groups';

/** אחרי כמה ימים בסטטוס "הוגש" בלי פעולה הבאה המשרה נכנסת לרשימת המעקב. */
export const WAITING_DAYS_THRESHOLD = 7;

export type FollowUpReason =
  | { kind: 'nextActionDue'; action: string | null; daysLate: number }
  | { kind: 'waiting'; days: number };

export interface FollowUp {
  application: JobApplication;
  reason: FollowUpReason;
}

/** משרות שדורשות פעולה עכשיו, הדחופה ביותר ראשונה. */
export function getFollowUps(applications: readonly JobApplication[], today: IsoDate): FollowUp[] {
  return applications
    .flatMap((application) => {
      const reason = followUpReason(application, today);
      return reason ? [{ application, reason }] : [];
    })
    .sort((a, b) => urgency(b.reason) - urgency(a.reason));
}

function followUpReason(application: JobApplication, today: IsoDate): FollowUpReason | null {
  if (isClosed(application.status)) {
    return null;
  }

  if (application.nextActionAt !== null) {
    const daysLate = daysBetween(application.nextActionAt, today);
    return daysLate >= 0 ? { kind: 'nextActionDue', action: application.nextAction, daysLate } : null;
  }

  if (application.status === 'applied' && application.nextAction === null) {
    const days = daysBetween(application.appliedAt, today);
    return days >= WAITING_DAYS_THRESHOLD ? { kind: 'waiting', days } : null;
  }

  return null;
}

function urgency(reason: FollowUpReason): number {
  return reason.kind === 'nextActionDue' ? reason.daysLate : reason.days;
}
