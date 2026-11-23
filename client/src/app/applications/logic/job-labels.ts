import { JobApplication } from '../models/job-application';

/** מה שנרשם כשהמודעה לא חשפה את שם החברה או את התפקיד. */
export const NOT_SPECIFIED = 'לא צוין';

export function isNotSpecified(value: string): boolean {
  return value.trim() === NOT_SPECIFIED;
}

/**
 * השם שמזהה משרה ברשימה. בדרך כלל זו החברה.
 * כשהחברה לא ידועה, "לא צוין" לא עוזר להבדיל בין משרות, ולכן מציגים את התפקיד,
 * ואם יש, גם דרך איזה מגייס הוגשה המועמדות.
 */
export function jobTitle(application: JobApplication, recruiterName: string | null = null): string {
  if (!isNotSpecified(application.company)) {
    return application.company;
  }
  const role = isNotSpecified(application.role) ? 'משרה בלי פרטים' : application.role;
  return recruiterName ? `${role} · דרך ${recruiterName}` : role;
}

/** השורה שמתחת לשם: התפקיד, או "חברה לא ידועה" כשהתפקיד כבר מופיע בשם. */
export function jobSubtitle(application: JobApplication): string {
  return isNotSpecified(application.company) ? 'חברה לא ידועה' : application.role;
}
