import { IsoDate, IsoDateTime } from '../../applications/models/job-application';

export const RECRUITER_KINDS = ['internal', 'agency', 'referrer'] as const;

export type RecruiterKind = (typeof RECRUITER_KINDS)[number];

export const RECRUITER_KIND_LABELS: Record<RecruiterKind, string> = {
  internal: 'מגייס בחברה',
  agency: 'חברת השמה',
  referrer: 'מפנה',
};

/** מקביל ל־Recruiter בשרת. */
export interface Recruiter {
  id: string;
  name: string;
  kind: RecruiterKind;
  company: string | null;
  phone: string | null;
  email: string | null;
  linkedIn: string | null;
  notes: string | null;
  lastContactAt: IsoDate | null;
  nextAction: string | null;
  nextActionAt: IsoDate | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

/** מה שהאתר שולח ביצירה ובעדכון. מקביל ל־RecruiterRequest בשרת. */
export type RecruiterRequest = Omit<Recruiter, 'id' | 'createdAt' | 'updatedAt'>;
