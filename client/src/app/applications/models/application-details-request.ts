import { IsoDate, IsoTime } from './job-application';

/** מה שהאתר שולח ביצירה ובעדכון. מקביל ל־ApplicationDetailsRequest בשרת. */
export interface ApplicationDetailsRequest {
  company: string;
  role: string;
  appliedAt: IsoDate | null;
  appliedTime: IsoTime | null;
  source: string | null;
  url: string | null;
  contact: string | null;
  salary: string | null;
  nextAction: string | null;
  nextActionAt: IsoDate | null;
  notes: string | null;
  recruiterId: string | null;
}
