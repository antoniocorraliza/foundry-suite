import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { FoundryInstantRange } from '../interfaces/foundry-instant-range.interface';
import { addDays } from './add-days.function';
import { parseDate } from './parse-date.function';
import { toInstantRange } from './to-instant-range.function';

const timeZone: string = inject('expectedTimeZone');

const RANGES_OF_SEPTEMBER_SIXTH: Readonly<Record<string, [string, string]>> = {
  'Europe/Madrid': ['2026-09-05T22:00:00.000Z', '2026-09-06T22:00:00.000Z'],
  'America/Mexico_City': ['2026-09-06T06:00:00.000Z', '2026-09-07T06:00:00.000Z'],
  'America/Santiago': ['2026-09-06T04:00:00.000Z', '2026-09-07T03:00:00.000Z'],
  UTC: ['2026-09-06T00:00:00.000Z', '2026-09-07T00:00:00.000Z'],
};

function isInRange(time: string, range: FoundryInstantRange): boolean {
  const instant: number = new Date(time).getTime();
  return range.start.getTime() <= instant && instant < range.endExclusive.getTime();
}

describe('toInstantRange', () => {
  it('gives the half-open range of the local instants of a day', () => {
    const range: FoundryInstantRange = toInstantRange('2026-09-06');
    expect([range.start.toISOString(), range.endExclusive.toISOString()]).toEqual(RANGES_OF_SEPTEMBER_SIXTH[timeZone]);
  });

  it('gives the same range for a day and for a range of that one day', () => {
    expect(toInstantRange({ start: '2026-09-06', end: '2026-09-06' })).toEqual(toInstantRange('2026-09-06'));
  });

  it('gives UTC midnights when asked, in every time zone', () => {
    const range: FoundryInstantRange = toInstantRange({ start: '2026-09-01', end: '2026-09-06' }, { timeZone: 'utc' });
    expect([range.start.toISOString(), range.endExclusive.toISOString()]).toEqual(['2026-09-01T00:00:00.000Z', '2026-09-07T00:00:00.000Z']);
  });

  it('throws a RangeError when the start is a later day than the end', () => {
    expect(catchThrown(() => toInstantRange({ start: '2026-09-07', end: '2026-09-06' }))).toBeInstanceOf(RangeError);
  });

  it('lets the end of the last day of the range fall in the year 10000', () => {
    expect(catchThrown(() => toInstantRange('9999-12-31'))).toBeNull();
    expect(toInstantRange('9999-12-31', { timeZone: 'utc' }).endExclusive.getUTCFullYear()).toBe(10000);
  });

  it('returns new objects with new dates each time', () => {
    const first: FoundryInstantRange = toInstantRange('2026-09-06');
    const second: FoundryInstantRange = toInstantRange('2026-09-06');
    expect(first).not.toBe(second);
    expect(first.start).not.toBe(second.start);
  });

  describe.runIf(timeZone === 'America/Santiago')('in a time zone whose clock changes at midnight', () => {
    it('gives a day of 23 hours when the clock skips midnight and one of 25 when it repeats an hour', () => {
      const short: FoundryInstantRange = toInstantRange('2026-09-06');
      const long: FoundryInstantRange = toInstantRange('2026-04-04');
      expect(short.endExclusive.getTime() - short.start.getTime()).toBe(23 * 3_600_000);
      expect(long.endExclusive.getTime() - long.start.getTime()).toBe(25 * 3_600_000);
    });

    it('filters by days without the hour that adding one day to the end would let in', () => {
      const range: FoundryInstantRange = toInstantRange({ start: '2026-09-01', end: '2026-09-06' });
      const end: Date | null = parseDate('2026-09-06');
      expect(isInRange('2026-09-07T03:30:00.000Z', range)).toBe(false);
      expect(isInRange('2026-09-07T02:59:59.999Z', range)).toBe(true);
      expect(end === null ? null : addDays(end, 1).getTime() > new Date('2026-09-07T03:30:00.000Z').getTime()).toBe(true);
    });
  });
});
