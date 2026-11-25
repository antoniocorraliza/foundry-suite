import { describe, expect, it } from 'vitest';
import { ɵparseIntegerOption } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createLocalTestDate } from '@foundry-test/functions/create-local-test-date.function';
import { getDaysInRange } from './get-days-in-range.function';

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

  it('rejects a step of 0 days as parseIntegerOption does', () => {
    expect(catchError(() => getDaysInRange(new Date(2026, 2, 1), new Date(2026, 2, 8), { stepInDays: 0 }), RangeError).message).toBe(
      catchError(() => ɵparseIntegerOption({ options: { stepInDays: 0 }, name: 'stepInDays', minimum: 1 }), RangeError).message,
    );
  });

  it('gives up to 36600 days and throws a RangeError, with the number asked, beyond them', () => {
    const start: Date = createLocalTestDate('2000-01-01');
    expect(getDaysInRange(start, createLocalTestDate('2100-03-16'))).toHaveLength(36_600);
    const error: unknown = catchThrown(() => getDaysInRange(start, createLocalTestDate('2100-03-17')));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toContain('36601');
  });

  it('counts the days it gives, not the days it walks', () => {
    expect(getDaysInRange(createLocalTestDate('0001-01-01'), createLocalTestDate('9999-12-31'), { stepInDays: 365 })).toHaveLength(10_006);
  });
});
