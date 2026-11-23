import { job, recruiter } from '../testing/builders';
import { getRecruiterFollowUps, SILENCE_DAYS_THRESHOLD } from './recruiter-follow-ups';
import { countJobsByRecruiter } from './recruiter-summary';

const TODAY = '2026-11-23';

function followUps(recruiters = [recruiter()], jobs = [job({ recruiterId: 'r1' })]) {
  return getRecruiterFollowUps(recruiters, countJobsByRecruiter(jobs), TODAY);
}

describe('getRecruiterFollowUps', () => {
  it('includes a recruiter whose next action is due today', () => {
    const result = followUps([recruiter({ nextAction: 'להתקשר', nextActionAt: TODAY })]);

    expect(result).toEqual([
      expect.objectContaining({
        reason: { kind: 'nextActionDue', action: 'להתקשר', daysLate: 0 },
      }),
    ]);
  });

  it('skips a recruiter whose next action is in the future, even after a long silence', () => {
    const result = followUps([
      recruiter({ nextActionAt: '2026-11-30', lastContactAt: '2026-09-01' }),
    ]);

    expect(result).toEqual([]);
  });

  it(`includes a recruiter with active jobs and no contact for ${SILENCE_DAYS_THRESHOLD} days`, () => {
    const result = followUps([recruiter({ lastContactAt: '2026-11-09' })]);

    expect(result.map((f) => f.reason)).toEqual([{ kind: 'silent', days: 14 }]);
  });

  it('skips a recruiter contacted recently', () => {
    expect(followUps([recruiter({ lastContactAt: '2026-11-10' })])).toEqual([]);
  });

  it('skips a silent recruiter when all their jobs are closed', () => {
    const result = followUps(
      [recruiter({ lastContactAt: '2026-09-01' })],
      [job({ recruiterId: 'r1', status: 'rejected' })],
    );

    expect(result).toEqual([]);
  });

  it('counts silence from when the recruiter was added if there is no contact yet', () => {
    const fresh = recruiter({ createdAt: '2026-11-20T08:00:00+00:00' });
    const old = recruiter({ id: 'r2', createdAt: '2026-11-01T08:00:00+00:00' });
    const jobs = [job({ recruiterId: 'r1' }), job({ id: 'j2', recruiterId: 'r2' })];

    const result = followUps([fresh, old], jobs);

    expect(result.map((f) => f.recruiter.id)).toEqual(['r2']);
  });

  it('puts the most urgent recruiter first', () => {
    const late = recruiter({ id: 'late', nextActionAt: '2026-11-13' });
    const today = recruiter({ id: 'today', nextActionAt: TODAY });

    const result = followUps([today, late], []);

    expect(result.map((f) => f.recruiter.id)).toEqual(['late', 'today']);
  });
});
