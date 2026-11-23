import { NonNullableFormBuilder, ValidatorFn } from '@angular/forms';

import { todayIsoDate } from '../logic/iso-date';
import { ApplicationDetailsRequest } from '../models/application-details-request';
import { JobApplication } from '../models/job-application';
import { JobDetailsSuggestion } from '../models/job-details-suggestion';

/** שדה חובה: ריק או רווחים בלבד אינם נחשבים ערך. */
const notBlank: ValidatorFn = (control) =>
  String(control.value ?? '').trim() === '' ? { required: true } : null;

export function createApplicationForm(fb: NonNullableFormBuilder) {
  return fb.group({
    company: ['', notBlank],
    role: ['', notBlank],
    appliedAt: [todayIsoDate()],
    appliedTime: [''],
    source: [''],
    url: [''],
    contact: [''],
    recruiterId: [''],
    salary: [''],
    nextAction: [''],
    nextActionAt: [''],
    notes: [''],
  });
}

export type ApplicationForm = ReturnType<typeof createApplicationForm>;
export type ApplicationFormValue = ReturnType<ApplicationForm['getRawValue']>;

/** ממלא את הטופס ממשרה קיימת, לעריכה. שדה ריק (null) הופך לטקסט ריק. */
export function toFormValue(application: JobApplication): ApplicationFormValue {
  return {
    company: application.company,
    role: application.role,
    appliedAt: application.appliedAt,
    // שדה שעה בדפדפן עובד עם "09:30", בלי שניות
    appliedTime: application.appliedTime?.slice(0, 5) ?? '',
    source: application.source ?? '',
    url: application.url ?? '',
    contact: application.contact ?? '',
    recruiterId: application.recruiterId ?? '',
    salary: application.salary ?? '',
    nextAction: application.nextAction ?? '',
    nextActionAt: application.nextActionAt ?? '',
    notes: application.notes ?? '',
  };
}

/** השדות שהצעה מקישור יכולה למלא, עם השם שלהם להודעה למשתמש. */
const SUGGESTION_FIELDS = [
  ['company', 'חברה'],
  ['role', 'תפקיד'],
  ['source', 'מקור'],
  ['salary', 'שכר'],
  ['url', 'קישור'],
] as const;

/**
 * ממלא בטופס רק שדות ריקים, כדי לא לדרוס מה שהמשתמש כבר הקליד.
 * מחזיר את שמות השדות שמולאו.
 */
export function applySuggestion(form: ApplicationForm, suggestion: JobDetailsSuggestion): string[] {
  const filled: string[] = [];

  for (const [field, label] of SUGGESTION_FIELDS) {
    const control = form.controls[field];
    const value = suggestion[field];
    if (value && control.value.trim() === '') {
      control.setValue(value);
      filled.push(label);
    }
  }

  return filled;
}

export function toDetailsRequest(value: ApplicationFormValue): ApplicationDetailsRequest {
  return {
    company: value.company.trim(),
    role: value.role.trim(),
    appliedAt: emptyToNull(value.appliedAt),
    appliedTime: toIsoTime(value.appliedTime),
    source: emptyToNull(value.source),
    url: emptyToNull(value.url),
    contact: emptyToNull(value.contact),
    salary: emptyToNull(value.salary),
    nextAction: emptyToNull(value.nextAction),
    nextActionAt: emptyToNull(value.nextActionAt),
    notes: emptyToNull(value.notes),
    recruiterId: emptyToNull(value.recruiterId),
  };
}

/** "09:30" מהדפדפן הופך ל־"09:30:00", הפורמט שהשרת מצפה לו. */
export function toIsoTime(value: string): string | null {
  const time = value.trim();
  if (time === '') {
    return null;
  }
  return time.length === 5 ? `${time}:00` : time;
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
