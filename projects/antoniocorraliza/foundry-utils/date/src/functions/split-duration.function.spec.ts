import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { splitDuration } from './split-duration.function';

describe('splitDuration', () => {
  it.each([
    [3723, { sign: 1, hours: 1, minutes: 2, seconds: 3 }],
    [-3723, { sign: -1, hours: 1, minutes: 2, seconds: 3 }],
    [93600, { sign: 1, hours: 26, minutes: 0, seconds: 0 }],
    [0, { sign: 1, hours: 0, minutes: 0, seconds: 0 }],
    [-0, { sign: 1, hours: 0, minutes: 0, seconds: 0 }],
    [61.9, { sign: 1, hours: 0, minutes: 1, seconds: 1 }],
    [-0.5, { sign: 1, hours: 0, minutes: 0, seconds: 0 }],
  ])('splits %d seconds into %j, truncating towards zero', (totalSeconds, expected) => {
    expect(splitDuration(totalSeconds)).toEqual(expected);
  });

  it('returns a new object each time', () => {
    expect(splitDuration(1)).not.toBe(splitDuration(1));
  });

  it('splits the largest safe integers and throws a RangeError beyond them', () => {
    expect(splitDuration(Number.MAX_SAFE_INTEGER).hours).toBe(Math.trunc(Number.MAX_SAFE_INTEGER / 3600));
    expect(splitDuration(-Number.MAX_SAFE_INTEGER).sign).toBe(-1);
    expect(catchThrown(() => splitDuration(1e25))).toBeInstanceOf(RangeError);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('throws a RangeError for %d', (totalSeconds) => {
    expect(catchThrown(() => splitDuration(totalSeconds))).toBeInstanceOf(RangeError);
  });
});
