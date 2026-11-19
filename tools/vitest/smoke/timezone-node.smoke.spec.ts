import { describe, expect, inject, it } from 'vitest';

describe('smoke: plain TypeScript on Node', () => {
  // Every time zone project needs this guard: if TZ is lost, date tests could pass in UTC by chance.
  it('runs in the time zone of its project', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(inject('expectedTimeZone'));
  });

  it('runs without a DOM', () => {
    expect('document' in globalThis).toBe(false);
  });
});
