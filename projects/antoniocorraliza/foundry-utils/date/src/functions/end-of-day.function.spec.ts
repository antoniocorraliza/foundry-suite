import { describe, expect, inject, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { endOfDay } from './end-of-day.function';

const timeZone: string = inject('expectedTimeZone');

describe('endOfDay', () => {
  it('returns a new date at the last millisecond of the local day', () => {
    const input: Date = new Date(2026, 10, 14, 15, 30);
    const result: Date = endOfDay(input);
    expect(result).toEqual(new Date(2026, 10, 14, 23, 59, 59, 999));
    expect(result).not.toBe(input);
  });

  it.runIf(timeZone === 'America/Santiago')(
    'gives the last instant of a day whose last hour repeats, just before the next day starts',
    () => {
      expect(endOfDay(new Date(2026, 3, 4, 12)).toISOString()).toBe('2026-04-05T03:59:59.999Z');
    },
  );

  it('throws a RangeError for an invalid date or one of the year 10000', () => {
    expect(catchThrown(() => endOfDay(new Date(Number.NaN)))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => endOfDay(new Date(Date.UTC(10000, 0, 1, 12))))).toBeInstanceOf(RangeError);
  });
});
