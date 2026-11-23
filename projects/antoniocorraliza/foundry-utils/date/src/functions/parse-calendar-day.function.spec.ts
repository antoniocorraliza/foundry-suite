import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { isCalendarDay } from './is-calendar-day.function';
import { parseCalendarDay } from './parse-calendar-day.function';

describe('parseCalendarDay', () => {
  it('reads the iso format by default', () => {
    expect(parseCalendarDay('2026-09-06')).toBe('2026-09-06');
    expect(parseCalendarDay('06/09/2026')).toBeNull();
  });

  it.each(['2026-09-06T10:00', '2026-09-06T00:00:00.000Z', '2026-09-06 00:00'])('gives null for %j, which has a time', (text) => {
    expect(parseCalendarDay(text)).toBeNull();
  });

  it.each<[unknown, string | null]>([
    [{ year: 2026, month: 9, day: 1 }, '2026-09-01'],
    [{ year: 2026, month: 9, day: 1, weekday: 2, hours: 10 }, '2026-09-01'],
    [{ year: 50, month: 1, day: 1 }, '0050-01-01'],
    [{ year: 2026, month: 2, day: 29 }, null],
    [{ year: 2026, month: 9 }, null],
    [{ year: 2026, month: 9, day: 1.5 }, null],
    [{ year: 2026, month: 9, day: null }, null],
    [{ year: '2026', month: 9, day: 1 }, null],
    [{ year: 0, month: 1, day: 1 }, null],
    [{ year: 2026, month: 9, day: 1, hours: undefined }, '2026-09-01'],
  ])('reads the parts %j as %j', (parts, expected) => {
    expect(parseCalendarDay(parts)).toBe(expected);
  });

  it('gives null for a date, also with acceptMidnightInstant, because the time zone is chosen with toCalendarDay', () => {
    expect(parseCalendarDay(new Date(2026, 8, 6))).toBeNull();
    expect(parseCalendarDay(new Date(Date.UTC(2026, 8, 6)), { acceptMidnightInstant: true })).toBeNull();
  });

  it('gives null for a timestamp unless it accepts a midnight instant, and ignores the unit otherwise', () => {
    expect(parseCalendarDay(1772323200000)).toBeNull();
    expect(parseCalendarDay(1772323200, { timestampUnit: 'seconds' })).toBeNull();
  });

  it('gives null for a midnight timestamp outside the years 1 to 9999', () => {
    expect(parseCalendarDay(new Date('0000-12-31T00:00:00.000Z').getTime(), { acceptMidnightInstant: true })).toBeNull();
  });

  it.each<unknown>([null, undefined, '', '   ', true, 10n, Symbol('day'), new String('2026-09-06'), [], {}])(
    'gives null for %s, never today',
    (value) => {
      expect(parseCalendarDay(value)).toBeNull();
    },
  );

  it('never throws and gives null or a canonical day, for any value', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const result: string | null = parseCalendarDay(value);
        return result === null || isCalendarDay(result);
      }),
    );
  });
});
