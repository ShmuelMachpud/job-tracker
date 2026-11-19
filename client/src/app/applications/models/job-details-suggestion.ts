/** הצעה למילוי הטופס מתוך דף משרה. מקביל ל־JobDetailsSuggestion בשרת. */
export interface JobDetailsSuggestion {
  company: string | null;
  role: string | null;
  source: string | null;
  salary: string | null;
  url: string;
}
