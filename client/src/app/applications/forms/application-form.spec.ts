import { job } from '../../recruiters/testing/builders';
import { toFormValue, toIsoTime } from './application-form';

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
});
