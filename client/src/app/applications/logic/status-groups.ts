import { ApplicationStatus } from '../models/application-status';
import { JobApplication } from '../models/job-application';

/** משרות שהתהליך בהן נגמר בלי הצעה. */
const CLOSED: ReadonlySet<ApplicationStatus> = new Set(['rejected', 'noResponse']);

/** שלבים שמשמעותם שהגעת לראיון או הלאה. */
const INTERVIEW_STAGE: ReadonlySet<ApplicationStatus> = new Set(['interview', 'homeTask', 'offer']);

/** סטטוסים שאינם תגובה מהחברה. כל סטטוס אחר, גם "נדחה", הוא תגובה. */
const NO_RESPONSE: ReadonlySet<ApplicationStatus> = new Set(['applied', 'noResponse']);

export function isClosed(status: ApplicationStatus): boolean {
  return CLOSED.has(status);
}

export function reachedInterview(application: JobApplication): boolean {
  return everHad(application, (status) => INTERVIEW_STAGE.has(status));
}

export function gotResponse(application: JobApplication): boolean {
  return everHad(application, (status) => !NO_RESPONSE.has(status));
}

/** בודק את הסטטוס הנוכחי וגם את ההיסטוריה, כי משרה שנדחתה אחרי ראיון עדיין הגיעה לראיון. */
function everHad(application: JobApplication, matches: (status: ApplicationStatus) => boolean): boolean {
  return matches(application.status) || application.history.some((change) => matches(change.status));
}
