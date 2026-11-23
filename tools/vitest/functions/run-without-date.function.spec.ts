import { describe, expect, it } from 'vitest';
import { runWithoutDate } from './run-without-date.function.ts';

describe('runWithoutDate', () => {
  it('returns what the action returns when it does not use Date', () => {
    expect(runWithoutDate(() => '2026-09-06'.slice(0, 4))).toBe('2026');
  });

  it.each([
    ['a new date', (): unknown => new Date(2026, 8, 6)],
    ['Date called as a function', (): unknown => (Date as unknown as () => string)()],
    ['Date.now', (): unknown => Date.now()],
    ['Date.UTC', (): unknown => Date.UTC(2026, 8, 6)],
    ['an instanceof check', (): unknown => ({}) instanceof Date],
  ])('throws when the action uses %s', (_name, action) => {
    expect(() => runWithoutDate(action)).toThrow('[run-without-date]: the code used Date');
  });

  it('restores Date after the action, also when it throws', () => {
    const originalDate: DateConstructor = Date;
    expect(() => runWithoutDate(() => new Date())).toThrow();
    expect(Date).toBe(originalDate);
    runWithoutDate(() => null);
    expect(Date).toBe(originalDate);
  });
});
