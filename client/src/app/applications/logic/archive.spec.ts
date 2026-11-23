import { job } from '../../recruiters/testing/builders';
import { countByView, inView, isArchived } from './archive';

describe('archive', () => {
  const applications = [
    job({ id: 'applied', status: 'applied' }),
    job({ id: 'interview', status: 'interview' }),
    job({ id: 'not-applied', status: 'notApplied' }),
    job({ id: 'rejected', status: 'rejected' }),
    job({ id: 'no-response', status: 'noResponse' }),
  ];

  it('archives only rejected and no-response jobs', () => {
    expect(isArchived('rejected')).toBe(true);
    expect(isArchived('noResponse')).toBe(true);
    expect(isArchived('offer')).toBe(false);
    expect(isArchived('notApplied')).toBe(false);
  });

  it('splits the list into active and archive', () => {
    expect(inView(applications, 'active').map((a) => a.id)).toEqual([
      'applied',
      'interview',
      'not-applied',
    ]);
    expect(inView(applications, 'archive').map((a) => a.id)).toEqual(['rejected', 'no-response']);
  });

  it('counts each view', () => {
    expect(countByView(applications)).toEqual({ active: 3, archive: 2 });
  });
});
