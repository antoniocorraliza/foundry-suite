import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { ɵparseIntegerOption } from './parse-integer-option.function';

describe('ɵparseIntegerOption', () => {
  it('returns the value when it is an integer within the limits, both included', () => {
    expect(ɵparseIntegerOption({ options: { weeks: 1 }, name: 'weeks', minimum: 1, maximum: 5 })).toBe(1);
    expect(ɵparseIntegerOption({ options: { weeks: 5 }, name: 'weeks', minimum: 1, maximum: 5 })).toBe(5);
  });

  it('returns the fallback when the option is missing, undefined or null', () => {
    expect(ɵparseIntegerOption({ options: undefined, name: 'weeks', minimum: 1, fallback: 3 })).toBe(3);
    expect(ɵparseIntegerOption({ options: { weeks: undefined }, name: 'weeks', minimum: 1, fallback: 3 })).toBe(3);
    expect(ɵparseIntegerOption({ options: { weeks: null }, name: 'weeks', minimum: 1, fallback: 3 })).toBe(3);
  });

  it('accepts any integer from the minimum when there is no maximum', () => {
    expect(ɵparseIntegerOption({ options: { count: Number.MAX_SAFE_INTEGER }, name: 'count', minimum: 0 })).toBe(Number.MAX_SAFE_INTEGER);
  });

  it.each<unknown>([0, 6, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2', true])('throws a RangeError for %j', (weeks) => {
    expect(catchThrown(() => ɵparseIntegerOption({ options: { weeks }, name: 'weeks', minimum: 1, maximum: 5 }))).toBeInstanceOf(
      RangeError,
    );
  });

  it('throws a RangeError when the option is missing and has no fallback', () => {
    expect(catchThrown(() => ɵparseIntegerOption({ options: {}, name: 'yearsBefore', minimum: 0 }))).toBeInstanceOf(RangeError);
  });

  it('names the option, its limits and the value in the message', () => {
    const withMaximum: unknown = catchThrown(() =>
      ɵparseIntegerOption({ options: { weeks: 0 }, name: 'weeks', minimum: 1, maximum: 5228 }),
    );
    const withoutMaximum: unknown = catchThrown(() => ɵparseIntegerOption({ options: { step: -1 }, name: 'step', minimum: 1 }));
    expect((withMaximum as RangeError).message).toBe('[foundry-utils]: the weeks option must be an integer from 1 to 5228, got 0');
    expect((withoutMaximum as RangeError).message).toBe('[foundry-utils]: the step option must be an integer of at least 1, got -1');
  });

  it('returns null when the fallback is null and the option is missing, undefined or null', () => {
    expect(ɵparseIntegerOption({ options: undefined, name: 'digits', minimum: 0, maximum: 100, fallback: null })).toBeNull();
    expect(ɵparseIntegerOption({ options: { digits: undefined }, name: 'digits', minimum: 0, maximum: 100, fallback: null })).toBeNull();
    expect(ɵparseIntegerOption({ options: { digits: null }, name: 'digits', minimum: 0, maximum: 100, fallback: null })).toBeNull();
  });

  it('still returns the value, and still checks it, when the fallback is null', () => {
    expect(ɵparseIntegerOption({ options: { digits: 0 }, name: 'digits', minimum: 0, maximum: 100, fallback: null })).toBe(0);
    expect(
      catchThrown(() => ɵparseIntegerOption({ options: { digits: 101 }, name: 'digits', minimum: 0, maximum: 100, fallback: null })),
    ).toBeInstanceOf(RangeError);
  });
});
