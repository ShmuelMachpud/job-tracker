import { JobApplication } from '../models/job-application';

/**
 * החדשה ביותר למעלה: לפי תאריך ההגשה, ובאותו יום לפי השעה.
 * באותו יום, משרות בלי שעה מופיעות אחרי משרות עם שעה, ובינן לבין עצמן לפי מתי נוספו.
 */
export function sortApplications(applications: readonly JobApplication[]): JobApplication[] {
  return [...applications].sort(
    (a, b) =>
      b.appliedAt.localeCompare(a.appliedAt) ||
      (b.appliedTime ?? '').localeCompare(a.appliedTime ?? '') ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
