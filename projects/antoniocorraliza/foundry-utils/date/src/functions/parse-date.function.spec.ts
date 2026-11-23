import { describe, expect, inject, it } from 'vitest';
import { parseDate } from './parse-date.function';

const timeZone: string = inject('expectedTimeZone');

describe('parseDate', () => {
  describe('date-only texts', () => {
    it('reads an iso day as that local day in every time zone, never the day before', () => {
      const date: Date | null = parseDate('2026-03-01');
      expect([date?.getFullYear(), date?.getMonth(), date?.getDate(), date?.getHours()]).toEqual([2026, 2, 1, 0]);
    });
  });

  describe('texts with a time zone', () => {
    it.each(['2026-07-01T10:00:00+02:00', '2026-07-01T10:00:00+0200', '2026-07-01T10:00:00+02', '2026-07-01T08:00:00Z'])(
      'subtracts a positive offset to reach UTC in %s',
      (text) => {
        expect(parseDate(text)?.toISOString()).toBe('2026-07-01T08:00:00.000Z');
      },
    );
  });

  describe('parts', () => {
    it('ignores an unknown hour key, so minutes without hours give null', () => {
      expect(parseDate({ year: 2026, month: 3, day: 1, hour: 10, minutes: 30 })).toBeNull();
    });

    it('ignores an unknown hour key and reads only the day', () => {
      expect(parseDate({ year: 2026, month: 3, day: 1, hour: 10 })).toEqual(new Date(2026, 2, 1));
    });
  });

  describe.runIf(timeZone === 'America/Santiago')('in a time zone whose clock skips midnight', () => {
    it('reads a day without a midnight as its first instant, not null', () => {
      expect(parseDate('2026-09-06')?.toISOString()).toBe('2026-09-06T04:00:00.000Z');
    });

    it('gives null for a written time that does not exist instead of moving it', () => {
      expect(parseDate('2026-09-06T00:30')).toBeNull();
    });
  });
});
