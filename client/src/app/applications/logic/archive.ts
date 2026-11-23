import { ApplicationStatus } from '../models/application-status';
import { JobApplication } from '../models/job-application';
import { isClosed } from './status-groups';

/** הרשימה הראשית מציגה משרות פעילות. הארכיון מציג משרות שהתהליך בהן נגמר. */
export type ListView = 'active' | 'archive';

/**
 * משרה בארכיון כשהסטטוס שלה סגור ("נדחה" או "אין מענה").
 * אין לזה שדה נפרד: החזרת סטטוס פעיל מחזירה את המשרה לרשימה הראשית.
 */
export function isArchived(status: ApplicationStatus): boolean {
  return isClosed(status);
}

export function inView(applications: readonly JobApplication[], view: ListView): JobApplication[] {
  return applications.filter(
    (application) => isArchived(application.status) === (view === 'archive'),
  );
}

export function countByView(applications: readonly JobApplication[]): Record<ListView, number> {
  const archive = applications.filter((application) => isArchived(application.status)).length;
  return { active: applications.length - archive, archive };
}
