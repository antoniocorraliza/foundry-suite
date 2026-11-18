/*
 * B1 smoke test: plain TypeScript on Node, one forked process per time zone.
 * The first test is the guard that every time zone project needs: if TZ is lost,
 * date tests could pass in UTC by chance.
 */
import { describe, expect, inject, it } from 'vitest';

describe('B1 smoke · plain TypeScript on Node', () => {
  it('runs in the time zone of its project', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(inject('expectedTimeZone'));
  });

  it('runs without a DOM', () => {
    expect('document' in globalThis).toBe(false);
  });
});
