import { NonNullableFormBuilder } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { nowTimeOfDay } from '../logic/iso-date';
import { JobDetailsSuggestion } from '../models/job-details-suggestion';
import { job } from '../../recruiters/testing/builders';
import { applySuggestion, createApplicationForm, toFormValue, toIsoTime } from './application-form';

describe('applied time', () => {
  it('sends the browser time with seconds, and nothing when empty', () => {
    expect(toIsoTime('09:30')).toBe('09:30:00');
    expect(toIsoTime('09:30:15')).toBe('09:30:15');
    expect(toIsoTime(' ')).toBeNull();
  });

  it('fills the form time without seconds', () => {
    expect(toFormValue(job({ appliedTime: '09:30:00' })).appliedTime).toBe('09:30');
    expect(toFormValue(job({ appliedTime: null })).appliedTime).toBe('');
  });

  it('formats the current time for the time field', () => {
    expect(nowTimeOfDay(new Date(2026, 10, 23, 9, 5))).toBe('09:05');
    expect(nowTimeOfDay(new Date(2026, 10, 23, 17, 42))).toBe('17:42');
  });
});

describe('applySuggestion', () => {
  const suggestion: JobDetailsSuggestion = {
    company: 'קבוצת Aman',
    role: 'מפתח /ת תוכנה',
    source: 'AllJobs',
    salary: null,
    notes: 'מיקום: ירושלים\nסוג משרה: משרה מלאה',
    url: 'https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=8908812',
  };

  function newForm() {
    return createApplicationForm(TestBed.inject(NonNullableFormBuilder));
  }

  it('fills the notes from the posting details', () => {
    const form = newForm();

    const filled = applySuggestion(form, suggestion);

    expect(form.controls.notes.value).toBe('מיקום: ירושלים\nסוג משרה: משרה מלאה');
    expect(filled).toContain('הערות');
  });

  it('keeps notes the user already wrote', () => {
    const form = newForm();
    form.controls.notes.setValue('ההערה שלי');

    applySuggestion(form, suggestion);

    expect(form.controls.notes.value).toBe('ההערה שלי');
  });
});
