import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { addDays } from './add-days.function';

describe('addDays in a time zone that skips a whole day', () => {
  it('throws a RangeError naming the skipped day instead of landing two days later', () => {
    const error: unknown = catchThrown(() => addDays(new Date(2011, 11, 29, 10), 1));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toContain('2011-12-30');
  });

  it('jumps over the skipped day when the target day exists', () => {
    expect(addDays(new Date(2011, 11, 29, 10), 2).toISOString()).toBe('2011-12-30T20:00:00.000Z');
  });
});
