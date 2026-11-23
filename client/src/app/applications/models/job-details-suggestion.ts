/** הצעה למילוי הטופס מתוך דף משרה. מקביל ל־JobDetailsSuggestion בשרת. */
export interface JobDetailsSuggestion {
  company: string | null;
  role: string | null;
  source: string | null;
  salary: string | null;
  /** פרטים נוספים מהמודעה (מיקום, סוג משרה, תאריך פרסום), שורה לכל פרט. */
  notes: string | null;
  url: string;
}
