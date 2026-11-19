import { IsoDate } from '../models/job-application';

/** התאריך של היום לפי השעון המקומי, בפורמט "2026-11-19". */
export function todayIsoDate(): IsoDate {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
