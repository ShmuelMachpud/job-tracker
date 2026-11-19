import { NonNullableFormBuilder, ValidatorFn } from '@angular/forms';

import { todayIsoDate } from '../logic/iso-date';
import { ApplicationDetailsRequest } from '../models/application-details-request';
import { JobApplication } from '../models/job-application';

/** שדה חובה: ריק או רווחים בלבד אינם נחשבים ערך. */
const notBlank: ValidatorFn = (control) =>
  String(control.value ?? '').trim() === '' ? { required: true } : null;

export function createApplicationForm(fb: NonNullableFormBuilder) {
  return fb.group({
    company: ['', notBlank],
    role: ['', notBlank],
    appliedAt: [todayIsoDate()],
    source: [''],
    url: [''],
    contact: [''],
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
    source: application.source ?? '',
    url: application.url ?? '',
    contact: application.contact ?? '',
    salary: application.salary ?? '',
    nextAction: application.nextAction ?? '',
    nextActionAt: application.nextActionAt ?? '',
    notes: application.notes ?? '',
  };
}

export function toDetailsRequest(value: ApplicationFormValue): ApplicationDetailsRequest {
  return {
    company: value.company.trim(),
    role: value.role.trim(),
    appliedAt: emptyToNull(value.appliedAt),
    source: emptyToNull(value.source),
    url: emptyToNull(value.url),
    contact: emptyToNull(value.contact),
    salary: emptyToNull(value.salary),
    nextAction: emptyToNull(value.nextAction),
    nextActionAt: emptyToNull(value.nextActionAt),
    notes: emptyToNull(value.notes),
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
