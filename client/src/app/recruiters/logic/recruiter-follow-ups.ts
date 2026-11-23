import { daysBetween } from '../../applications/logic/iso-date';
import { IsoDate } from '../../applications/models/job-application';
import { Recruiter } from '../models/recruiter';
import { jobCountFor, RecruiterJobCount } from './recruiter-summary';

/** אחרי כמה ימים בלי קשר, מגייס עם משרות פעילות נכנס לרשימת המעקב. */
export const SILENCE_DAYS_THRESHOLD = 14;

export type RecruiterFollowUpReason =
  | { kind: 'nextActionDue'; action: string | null; daysLate: number }
  | { kind: 'silent'; days: number };

export interface RecruiterFollowUp {
  recruiter: Recruiter;
  reason: RecruiterFollowUpReason;
}

/** מגייסים שדורשים פעולה עכשיו, הדחוף ביותר ראשון. */
export function getRecruiterFollowUps(
  recruiters: readonly Recruiter[],
  jobCounts: ReadonlyMap<string, RecruiterJobCount>,
  today: IsoDate,
): RecruiterFollowUp[] {
  return recruiters
    .flatMap((recruiter) => {
      const reason = followUpReason(recruiter, jobCountFor(jobCounts, recruiter.id), today);
      return reason ? [{ recruiter, reason }] : [];
    })
    .sort((a, b) => urgency(b.reason) - urgency(a.reason));
}

function followUpReason(
  recruiter: Recruiter,
  jobs: RecruiterJobCount,
  today: IsoDate,
): RecruiterFollowUpReason | null {
  // פעולה הבאה עם תאריך קובעת: אם היא עוד לא הגיעה, יש תוכנית ולא צריך להזכיר
  if (recruiter.nextActionAt !== null) {
    const daysLate = daysBetween(recruiter.nextActionAt, today);
    return daysLate >= 0 ? { kind: 'nextActionDue', action: recruiter.nextAction, daysLate } : null;
  }

  if (jobs.active === 0) {
    return null;
  }

  // בלי קשר רשום סופרים מיום ההוספה, כדי שמגייס חדש לא ייכנס לרשימה מיד
  const since = recruiter.lastContactAt ?? recruiter.createdAt.slice(0, 10);
  const days = daysBetween(since, today);
  return days >= SILENCE_DAYS_THRESHOLD ? { kind: 'silent', days } : null;
}

function urgency(reason: RecruiterFollowUpReason): number {
  return reason.kind === 'nextActionDue' ? reason.daysLate : reason.days;
}
