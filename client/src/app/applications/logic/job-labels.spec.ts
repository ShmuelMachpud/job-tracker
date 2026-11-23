import { job } from '../../recruiters/testing/builders';
import { jobSubtitle, jobTitle } from './job-labels';

describe('jobTitle', () => {
  it('uses the company when it is known', () => {
    expect(jobTitle(job({ company: 'Wix', role: 'Backend' }), 'Dana')).toBe('Wix');
  });

  it('uses the role and the recruiter when the company is not specified', () => {
    const application = job({ company: ' לא צוין ', role: 'Backend Node.js' });

    expect(jobTitle(application, 'Or Cohen')).toBe('Backend Node.js · דרך Or Cohen');
    expect(jobTitle(application)).toBe('Backend Node.js');
  });

  it('says there are no details when both company and role are not specified', () => {
    expect(jobTitle(job({ company: 'לא צוין', role: 'לא צוין' }), 'Or Cohen')).toBe(
      'משרה בלי פרטים · דרך Or Cohen',
    );
  });

  it('keeps a company that only mentions "not specified" inside a longer name', () => {
    expect(jobTitle(job({ company: 'ארגון ביטחוני (לא צוין)' }))).toBe('ארגון ביטחוני (לא צוין)');
  });
});

describe('jobSubtitle', () => {
  it('shows the role, or that the company is unknown when the role is already the title', () => {
    expect(jobSubtitle(job({ company: 'Wix', role: 'Backend' }))).toBe('Backend');
    expect(jobSubtitle(job({ company: 'לא צוין', role: 'Backend' }))).toBe('חברה לא ידועה');
  });
});
