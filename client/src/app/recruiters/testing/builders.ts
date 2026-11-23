import { JobApplication } from '../../applications/models/job-application';
import { Interaction } from '../models/interaction';
import { Recruiter } from '../models/recruiter';

/** נתוני בדיקה: ערכי ברירת מחדל סבירים, וכל בדיקה משנה רק את מה שחשוב לה. */

export function recruiter(overrides: Partial<Recruiter> = {}): Recruiter {
  return {
    id: 'r1',
    name: 'דנה',
    kind: 'agency',
    company: null,
    phone: null,
    email: null,
    linkedIn: null,
    notes: null,
    lastContactAt: null,
    nextAction: null,
    nextActionAt: null,
    createdAt: '2026-11-01T10:00:00+00:00',
    updatedAt: '2026-11-01T10:00:00+00:00',
    ...overrides,
  };
}

export function job(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: 'j1',
    company: 'Acme',
    role: 'Backend',
    appliedAt: '2026-11-01',
    appliedTime: null,
    source: null,
    url: null,
    contact: null,
    recruiterId: null,
    salary: null,
    nextAction: null,
    nextActionAt: null,
    notes: null,
    status: 'applied',
    history: [],
    createdAt: '2026-11-01T10:00:00+00:00',
    updatedAt: '2026-11-01T10:00:00+00:00',
    ...overrides,
  };
}

export function interaction(overrides: Partial<Interaction> = {}): Interaction {
  return {
    id: 'i1',
    recruiterId: 'r1',
    applicationId: null,
    date: '2026-11-10',
    channel: 'phone',
    direction: 'outgoing',
    summary: 'שיחה',
    createdAt: '2026-11-10T10:00:00+00:00',
    updatedAt: '2026-11-10T10:00:00+00:00',
    ...overrides,
  };
}
