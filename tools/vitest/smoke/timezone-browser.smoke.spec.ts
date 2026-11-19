import { describe, expect, inject, it } from 'vitest';

describe('smoke: plain TypeScript in a real browser', () => {
  it('runs in the time zone of its browser context', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(inject('expectedTimeZone'));
  });
});
