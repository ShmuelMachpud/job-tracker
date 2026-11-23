import { NonNullableFormBuilder, ValidatorFn, Validators } from '@angular/forms';

import { Recruiter, RecruiterKind, RecruiterRequest } from '../models/recruiter';

/** שדה חובה: ריק או רווחים בלבד אינם נחשבים ערך. */
const notBlank: ValidatorFn = (control) =>
  String(control.value ?? '').trim() === '' ? { required: true } : null;

/** ריק, או כתובת מלאה של http או https. */
const webUrl: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  return value === '' || /^https?:\/\/\S+$/i.test(value) ? null : { url: true };
};

export function createRecruiterForm(fb: NonNullableFormBuilder) {
  return fb.group({
    name: ['', notBlank],
    kind: ['internal' as RecruiterKind],
    company: [''],
    phone: [''],
    email: ['', Validators.email],
    linkedIn: ['', webUrl],
    notes: [''],
    lastContactAt: [''],
    nextAction: [''],
    nextActionAt: [''],
  });
}

export type RecruiterForm = ReturnType<typeof createRecruiterForm>;
export type RecruiterFormValue = ReturnType<RecruiterForm['getRawValue']>;

/** ממלא את הטופס ממגייס קיים, לעריכה. שדה ריק (null) הופך לטקסט ריק. */
export function toFormValue(recruiter: Recruiter): RecruiterFormValue {
  return {
    name: recruiter.name,
    kind: recruiter.kind,
    company: recruiter.company ?? '',
    phone: recruiter.phone ?? '',
    email: recruiter.email ?? '',
    linkedIn: recruiter.linkedIn ?? '',
    notes: recruiter.notes ?? '',
    lastContactAt: recruiter.lastContactAt ?? '',
    nextAction: recruiter.nextAction ?? '',
    nextActionAt: recruiter.nextActionAt ?? '',
  };
}

export function toRecruiterRequest(value: RecruiterFormValue): RecruiterRequest {
  return {
    name: value.name.trim(),
    kind: value.kind,
    company: emptyToNull(value.company),
    phone: emptyToNull(value.phone),
    email: emptyToNull(value.email),
    linkedIn: emptyToNull(value.linkedIn),
    notes: emptyToNull(value.notes),
    lastContactAt: emptyToNull(value.lastContactAt),
    nextAction: emptyToNull(value.nextAction),
    nextActionAt: emptyToNull(value.nextActionAt),
  };
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
