/*
 * B1 smoke test: plain TypeScript in a real browser, one browser context per time zone.
 */
import { describe, expect, inject, it } from 'vitest';

describe('B1 smoke · plain TypeScript in a real browser', () => {
  it('runs in the time zone of its browser context', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(inject('expectedTimeZone'));
  });
});
