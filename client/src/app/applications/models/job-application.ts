import { ApplicationStatus } from './application-status';

/** תאריך בלי שעה, למשל "2026-11-19". מקביל ל־DateOnly בשרת. */
export type IsoDate = string;

/** שעה בלי תאריך, למשל "09:30:00". מקביל ל־TimeOnly בשרת. */
export type IsoTime = string;

/** תאריך ושעה, למשל "2026-11-19T14:32:10+02:00". מקביל ל־DateTimeOffset בשרת. */
export type IsoDateTime = string;

export interface StatusChange {
  status: ApplicationStatus;
  at: IsoDateTime;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  appliedAt: IsoDate;
  /** שעת ההגשה לפי שעון ישראל, אם ידועה. */
  appliedTime: IsoTime | null;
  source: string | null;
  url: string | null;
  contact: string | null;
  /** המגייס שדרכו המשרה מתנהלת, אם יש. */
  recruiterId: string | null;
  salary: string | null;
  nextAction: string | null;
  nextActionAt: IsoDate | null;
  notes: string | null;
  status: ApplicationStatus;
  history: StatusChange[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
