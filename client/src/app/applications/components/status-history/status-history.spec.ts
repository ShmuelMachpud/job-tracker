import { isBeforeCreation } from './status-history';

describe('isBeforeCreation', () => {
  const createdAt = '2026-11-23T15:08:00+00:00';

  it('marks an entry dated before the job was added (a late-added job)', () => {
    expect(
      isBeforeCreation({ status: 'applied', at: '2026-11-15T00:00:00+00:00' }, createdAt),
    ).toBe(true);
  });

  it('keeps entries recorded when the job was added or later', () => {
    expect(isBeforeCreation({ status: 'applied', at: createdAt }, createdAt)).toBe(false);
    expect(
      isBeforeCreation({ status: 'rejected', at: '2026-11-25T09:00:00+00:00' }, createdAt),
    ).toBe(false);
    expect(isBeforeCreation({ status: 'applied', at: '2026-11-15T00:00:00+00:00' }, null)).toBe(
      false,
    );
  });
});
