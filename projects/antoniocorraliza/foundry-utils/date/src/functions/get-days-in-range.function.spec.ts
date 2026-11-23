import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getDaysInRange } from './get-days-in-range.function';

function createLocalNoon(year: number, month: number, day: number): Date {
  const date: Date = new Date(2000, 0, 1, 12);
  date.setFullYear(year, month - 1, day);
  return date;
}

describe('getDaysInRange', () => {
  it('includes both ends and compares days, not instants', () => {
    expect(getDaysInRange(new Date(2026, 2, 1, 23, 0), new Date(2026, 2, 3, 1, 0))).toEqual([
      new Date(2026, 2, 1),
      new Date(2026, 2, 2),
      new Date(2026, 2, 3),
    ]);
  });

  it('gives one day when both ends fall on the same day, whatever their order inside it', () => {
    expect(getDaysInRange(new Date(2026, 2, 1, 23, 0), new Date(2026, 2, 1, 1, 0))).toEqual([new Date(2026, 2, 1)]);
  });

  it('throws a RangeError when the start is a later day than the end, instead of giving an empty list', () => {
    expect(catchThrown(() => getDaysInRange(new Date(2026, 2, 2), new Date(2026, 2, 1, 23, 0)))).toBeInstanceOf(RangeError);
  });

  it('steps by the given number of days and gives only the start when the step is longer than the range', () => {
    expect(getDaysInRange(new Date(2026, 2, 1), new Date(2026, 2, 8), { stepInDays: 3 })).toEqual([
      new Date(2026, 2, 1),
      new Date(2026, 2, 4),
      new Date(2026, 2, 7),
    ]);
    expect(getDaysInRange(new Date(2026, 2, 1), new Date(2026, 2, 8), { stepInDays: 30 })).toEqual([new Date(2026, 2, 1)]);
  });

  it.each<unknown>([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2'])('throws a RangeError for a step of %j days', (stepInDays) => {
    expect(
      catchThrown(() => getDaysInRange(new Date(2026, 2, 1), new Date(2026, 2, 8), { stepInDays: stepInDays as number })),
    ).toBeInstanceOf(RangeError);
  });

  it('gives up to 36600 days and throws a RangeError, with the number asked, beyond them', () => {
    const start: Date = createLocalNoon(2000, 1, 1);
    expect(getDaysInRange(start, createLocalNoon(2100, 3, 16))).toHaveLength(36_600);
    const error: unknown = catchThrown(() => getDaysInRange(start, createLocalNoon(2100, 3, 17)));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toContain('36601');
  });

  it('counts the days it gives, not the days it walks', () => {
    expect(getDaysInRange(createLocalNoon(1, 1, 1), createLocalNoon(9999, 12, 31), { stepInDays: 365 })).toHaveLength(10_006);
  });
});
