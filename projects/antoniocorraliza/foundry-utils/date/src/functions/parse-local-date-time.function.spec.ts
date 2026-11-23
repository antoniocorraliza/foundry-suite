import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { isLocalDateTime } from './is-local-date-time.function';
import { parseLocalDateTime } from './parse-local-date-time.function';

describe('parseLocalDateTime', () => {
  it.each([
    ['14/11/2026 09:30', 'eu'],
    ['14-11-2026 09:30', 'eu'],
    ['11/14/2026 09:30', 'us'],
    [' 2026-11-14T09:30 ', 'iso'],
  ] as const)('reads %j in %s as the canonical value', (text, format) => {
    expect(parseLocalDateTime(text, { format })).toBe('2026-11-14T09:30');
  });

  it('reads written times that the local clock skips, because a text does not look at the time zone', () => {
    expect(parseLocalDateTime('2026-03-29T02:30')).toBe('2026-03-29T02:30');
    expect(parseLocalDateTime('2026-09-06T00:30')).toBe('2026-09-06T00:30');
  });

  it.each(['2026-11-14', '09:30', '2026-02-29T10:00', '26-11-14T09:30', '0000-01-01T00:00', '10000-01-01T00:00', '14/11-2026 09:30'])(
    'gives null for %j',
    (text) => {
      expect(parseLocalDateTime(text)).toBeNull();
    },
  );

  it.each<[unknown, string | null]>([
    [{ year: 2026, month: 11, day: 14, hours: 9, minutes: 30 }, '2026-11-14T09:30'],
    [{ year: 2026, month: 11, day: 14, hours: 9, minutes: 30, seconds: 0, milliseconds: 0 }, '2026-11-14T09:30'],
    [{ year: 2026, month: 11, day: 14, hours: 9, minutes: 30, seconds: undefined, weekday: 6 }, '2026-11-14T09:30'],
    [{ year: 50, month: 1, day: 1, hours: 0, minutes: 0 }, '0050-01-01T00:00'],
    [{ year: 2026, month: 11, day: 14, hours: 9, minutes: 30, seconds: 5 }, null],
    [{ year: 2026, month: 11, day: 14, minutes: 30 }, null],
    [{ year: 2026, month: 11, day: 14, hours: 9 }, null],
    [{ year: 2026, month: 11, day: 14, hours: 9.5, minutes: 0 }, null],
    [{ year: 2026, month: 11, day: 14, hours: 24, minutes: 0 }, null],
    [{ year: 2026, month: 11, day: 14, hours: '09', minutes: 30 }, null],
  ])('reads the parts %j as %j', (parts, expected) => {
    expect(parseLocalDateTime(parts)).toBe(expected);
  });

  it.each<unknown>([new Date(2026, 10, 14, 9, 30), 1_789_378_200_000, null, undefined, '', true, {}])(
    'gives null for %j, because the time zone is chosen with toLocalDateTime',
    (value) => {
      expect(parseLocalDateTime(value)).toBeNull();
    },
  );

  it('never throws and gives null or a canonical value, for any value', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const result: string | null = parseLocalDateTime(value);
        return result === null || isLocalDateTime(result);
      }),
    );
  });
});
