import { ApplicationMetrics } from './application-metrics';

/** ברכה לפי שעת היום. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'בוקר טוב';
  }
  if (hour >= 12 && hour < 17) {
    return 'צהריים טובים';
  }
  if (hour >= 17 && hour < 22) {
    return 'ערב טוב';
  }
  return 'לילה טוב';
}

/** למשל "יום רביעי, 19 בנובמבר". */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

/** משפט אחד שמסכם איפה החיפוש עומד ומה מחכה היום. */
export function summarize(metrics: ApplicationMetrics, followUpCount: number): string {
  if (metrics.total === 0) {
    return 'עוד לא הוספת משרות. זה זמן טוב להתחיל.';
  }

  const active = metrics.active === 1 ? 'משרה פעילה אחת' : `${metrics.active} משרות פעילות`;

  if (followUpCount === 0) {
    return `${active}, ואין משהו שמחכה לך היום.`;
  }

  const waiting = followUpCount === 1 ? 'אחת מחכה לך היום' : `${followUpCount} מחכות לך היום`;
  return `${active}, ו־${waiting}.`;
}
