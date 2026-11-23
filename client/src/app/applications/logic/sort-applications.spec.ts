import { job } from '../../recruiters/testing/builders';
import { sortApplications } from './sort-applications';

describe('sortApplications', () => {
  it('puts the newest date first, and the latest time first within a day', () => {
    const sorted = sortApplications([
      job({ id: 'older-day', appliedAt: '2026-11-20', appliedTime: '23:00:00' }),
      job({ id: 'morning', appliedAt: '2026-11-23', appliedTime: '09:30:00' }),
      job({ id: 'evening', appliedAt: '2026-11-23', appliedTime: '18:15:00' }),
    ]);

    expect(sorted.map((a) => a.id)).toEqual(['evening', 'morning', 'older-day']);
  });

  it('puts jobs without a time after timed ones on the same day, newest added first', () => {
    const sorted = sortApplications([
      job({ id: 'no-time-old', appliedAt: '2026-11-23', createdAt: '2026-11-23T08:00:00+00:00' }),
      job({ id: 'timed', appliedAt: '2026-11-23', appliedTime: '07:00:00' }),
      job({ id: 'no-time-new', appliedAt: '2026-11-23', createdAt: '2026-11-23T12:00:00+00:00' }),
    ]);

    expect(sorted.map((a) => a.id)).toEqual(['timed', 'no-time-new', 'no-time-old']);
  });
});
