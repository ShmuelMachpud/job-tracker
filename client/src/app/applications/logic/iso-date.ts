import { IsoDate } from '../models/job-application';

/** התאריך של היום לפי השעון המקומי, בפורמט "2026-11-19". */
export function todayIsoDate(): IsoDate {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** השעה עכשיו לפי השעון המקומי, בפורמט של שדה שעה בדפדפן: "09:30". */
export function nowTimeOfDay(now = new Date()): string {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** כמה ימים עברו מ־from עד to. שלילי אם to לפני from. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

function toUtcMs(date: IsoDate): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}
