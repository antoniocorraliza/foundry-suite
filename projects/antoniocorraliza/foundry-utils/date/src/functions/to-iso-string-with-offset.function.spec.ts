import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { parseDate } from './parse-date.function';
import { toIsoStringWithOffset } from './to-iso-string-with-offset.function';

const timeZone: string = inject('expectedTimeZone');

const TEXTS_OF_JULY_FIRST: Readonly<Record<string, string>> = {
  'Europe/Madrid': '2026-07-01T12:00:00.000+02:00',
  'America/Mexico_City': '2026-07-01T04:00:00.000-06:00',
  'America/Santiago': '2026-07-01T06:00:00.000-04:00',
  UTC: '2026-07-01T10:00:00.000+00:00',
};

describe('toIsoStringWithOffset', () => {
  it('writes the local time with three decimals and the local offset, never a Z', () => {
    expect(toIsoStringWithOffset(new Date('2026-07-01T10:00:00.000Z'))).toBe(TEXTS_OF_JULY_FIRST[timeZone]);
  });

  it('writes a text that parseDate reads as the same instant', () => {
    const date: Date = new Date('2026-07-01T10:00:00.042Z');
    expect(parseDate(toIsoStringWithOffset(date))?.getTime()).toBe(date.getTime());
  });

  it('throws a RangeError for an invalid date', () => {
    expect(catchThrown(() => toIsoStringWithOffset(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
  });

  it.runIf(timeZone === 'Europe/Madrid')('throws a RangeError when the local offset has seconds instead of writing another instant', () => {
    expect(catchThrown(() => toIsoStringWithOffset(new Date(1800, 0, 1, 12)))).toBeInstanceOf(RangeError);
    expect(toIsoStringWithOffset(new Date(1901, 5, 1, 12))).toBe('1901-06-01T12:00:00.000+00:00');
  });
});
