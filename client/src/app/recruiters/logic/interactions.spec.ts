import { interaction } from '../testing/builders';
import { interactionsFor, sortInteractions } from './interactions';

describe('sortInteractions', () => {
  it('puts the newest date first, and the latest recorded first on the same day', () => {
    const result = sortInteractions([
      interaction({ id: 'old', date: '2026-11-01' }),
      interaction({ id: 'same-day-early', date: '2026-11-10', createdAt: '2026-11-10T08:00:00Z' }),
      interaction({ id: 'same-day-late', date: '2026-11-10', createdAt: '2026-11-10T18:00:00Z' }),
    ]);

    expect(result.map((i) => i.id)).toEqual(['same-day-late', 'same-day-early', 'old']);
  });
});

describe('interactionsFor', () => {
  const all = [
    interaction({ id: 'a', recruiterId: 'r1', applicationId: 'j1' }),
    interaction({ id: 'b', recruiterId: 'r1', applicationId: null }),
    interaction({ id: 'c', recruiterId: 'r2', applicationId: 'j1' }),
  ];

  it('filters by recruiter', () => {
    expect(interactionsFor(all, { recruiterId: 'r1' }).map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('filters by job', () => {
    expect(interactionsFor(all, { applicationId: 'j1' }).map((i) => i.id)).toEqual(['a', 'c']);
  });
});
