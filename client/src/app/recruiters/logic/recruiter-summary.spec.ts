import { job, recruiter } from '../testing/builders';
import {
  countJobsByRecruiter,
  EMPTY_RECRUITER_FILTER,
  filterRecruiters,
  jobCountFor,
  matchRecruiters,
  recruiterLabel,
} from './recruiter-summary';

describe('countJobsByRecruiter', () => {
  it('counts all linked jobs and only the open ones as active', () => {
    const counts = countJobsByRecruiter([
      job({ id: 'a', recruiterId: 'r1', status: 'interview' }),
      job({ id: 'b', recruiterId: 'r1', status: 'rejected' }),
      job({ id: 'c', recruiterId: 'r2', status: 'noResponse' }),
      job({ id: 'd', recruiterId: null }),
    ]);

    expect(jobCountFor(counts, 'r1')).toEqual({ total: 2, active: 1 });
    expect(jobCountFor(counts, 'r2')).toEqual({ total: 1, active: 0 });
    expect(jobCountFor(counts, 'nobody')).toEqual({ total: 0, active: 0 });
  });
});

describe('filterRecruiters', () => {
  const recruiters = [
    recruiter({ id: 'a', name: 'Dana', kind: 'agency', company: 'Nisha' }),
    recruiter({ id: 'b', name: 'Yossi', kind: 'internal', email: 'yossi@wix.com' }),
  ];

  it('searches name, company and email, ignoring case', () => {
    const ids = (query: string) =>
      filterRecruiters(recruiters, { ...EMPTY_RECRUITER_FILTER, query }).map((r) => r.id);

    expect(ids('nisha')).toEqual(['a']);
    expect(ids('WIX')).toEqual(['b']);
    expect(ids('  ')).toEqual(['a', 'b']);
  });

  it('filters by kind', () => {
    const result = filterRecruiters(recruiters, { query: '', kind: 'internal' });

    expect(result.map((r) => r.id)).toEqual(['b']);
  });
});

describe('matchRecruiters', () => {
  it('matches by name or company and returns everyone for empty text', () => {
    const recruiters = [
      recruiter({ id: 'a', name: 'Dana', company: 'Nisha' }),
      recruiter({ id: 'b', name: 'Nir' }),
    ];

    expect(matchRecruiters(recruiters, 'nis').map((r) => r.id)).toEqual(['a']);
    expect(matchRecruiters(recruiters, 'ni').map((r) => r.id)).toEqual(['a', 'b']);
    expect(matchRecruiters(recruiters, '')).toHaveLength(2);
  });
});

describe('recruiterLabel', () => {
  it('adds the company in brackets when there is one', () => {
    expect(recruiterLabel(recruiter({ name: 'Dana', company: 'Nisha' }))).toBe('Dana (Nisha)');
    expect(recruiterLabel(recruiter({ name: 'Dana' }))).toBe('Dana');
  });
});
