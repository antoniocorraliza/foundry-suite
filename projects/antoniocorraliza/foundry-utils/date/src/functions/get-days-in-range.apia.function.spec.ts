import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { getDaysInRange } from './get-days-in-range.function';

describe('getDaysInRange in a time zone that skips a whole day', () => {
  it('throws a RangeError naming the skipped day instead of leaving it out', () => {
    const error: unknown = catchThrown(() => getDaysInRange(new Date(2011, 11, 29), new Date(2011, 11, 31)));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toContain('2011-12-30');
  });
});
