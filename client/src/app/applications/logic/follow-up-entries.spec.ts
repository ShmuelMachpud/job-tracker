import { job, recruiter } from '../../recruiters/testing/builders';
import { followUpKey, mergeFollowUps } from './follow-up-entries';

describe('mergeFollowUps', () => {
  it('mixes jobs and recruiters by urgency, jobs first on a tie', () => {
    const result = mergeFollowUps(
      [
        { application: job({ id: 'j-3' }), reason: { kind: 'waiting', days: 3 } },
        { application: job({ id: 'j-10' }), reason: { kind: 'waiting', days: 10 } },
      ],
      [
        { recruiter: recruiter({ id: 'r-20' }), reason: { kind: 'silent', days: 20 } },
        {
          recruiter: recruiter({ id: 'r-3' }),
          reason: { kind: 'nextActionDue', action: null, daysLate: 3 },
        },
      ],
    );

    expect(result.map(followUpKey)).toEqual([
      'recruiter-r-20',
      'application-j-10',
      'application-j-3',
      'recruiter-r-3',
    ]);
  });
});
