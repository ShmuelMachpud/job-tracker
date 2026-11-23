import { isClosed } from '../../applications/logic/status-groups';
import { JobApplication } from '../../applications/models/job-application';
import { Recruiter, RecruiterKind } from '../models/recruiter';

export interface RecruiterJobCount {
  total: number;
  /** משרות שהתהליך בהן עוד לא נגמר (לא "נדחה" ולא "אין מענה"). */
  active: number;
}

const NO_JOBS: RecruiterJobCount = { total: 0, active: 0 };

/** כמה משרות מקושרות לכל מגייס. מגייס בלי משרות לא מופיע במפה. */
export function countJobsByRecruiter(
  applications: readonly JobApplication[],
): Map<string, RecruiterJobCount> {
  const counts = new Map<string, RecruiterJobCount>();

  for (const application of applications) {
    if (application.recruiterId === null) {
      continue;
    }
    const current = counts.get(application.recruiterId) ?? NO_JOBS;
    counts.set(application.recruiterId, {
      total: current.total + 1,
      active: current.active + (isClosed(application.status) ? 0 : 1),
    });
  }

  return counts;
}

export function jobCountFor(
  counts: ReadonlyMap<string, RecruiterJobCount>,
  recruiterId: string,
): RecruiterJobCount {
  return counts.get(recruiterId) ?? NO_JOBS;
}

export interface RecruiterFilter {
  query: string;
  kind: RecruiterKind | null;
}

export const EMPTY_RECRUITER_FILTER: RecruiterFilter = { query: '', kind: null };

export function filterRecruiters(
  recruiters: readonly Recruiter[],
  filter: RecruiterFilter,
): Recruiter[] {
  const query = normalize(filter.query);

  return recruiters.filter(
    (recruiter) =>
      (filter.kind === null || recruiter.kind === filter.kind) &&
      (query === '' ||
        [recruiter.name, recruiter.company, recruiter.email].some(
          (value) => value !== null && normalize(value).includes(query),
        )),
  );
}

export function isRecruiterFilterActive(filter: RecruiterFilter): boolean {
  return normalize(filter.query) !== '' || filter.kind !== null;
}

/** מגייסים ששמם או החברה שלהם מתאימים לטקסט שהוקלד, להשלמה אוטומטית. */
export function matchRecruiters(recruiters: readonly Recruiter[], text: string): Recruiter[] {
  const query = normalize(text);
  if (query === '') {
    return [...recruiters];
  }
  return recruiters.filter(
    (recruiter) =>
      normalize(recruiter.name).includes(query) ||
      (recruiter.company !== null && normalize(recruiter.company).includes(query)),
  );
}

/** הטקסט שמופיע בשדה ובהשלמה: שם, ובסוגריים החברה אם יש. */
export function recruiterLabel(recruiter: Recruiter): string {
  return recruiter.company ? `${recruiter.name} (${recruiter.company})` : recruiter.name;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}
