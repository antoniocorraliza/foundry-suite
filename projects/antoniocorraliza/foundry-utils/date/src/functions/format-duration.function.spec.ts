import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { formatDuration } from './format-duration.function';

describe('formatDuration', () => {
  it.each([
    [3723, '01:02:03'],
    [93600, '26:00:00'],
    [-1, '-00:00:01'],
    [61.9, '00:01:01'],
    [-0.5, '00:00:00'],
    [0, '00:00:00'],
    [-0, '00:00:00'],
  ])('writes %d seconds as %s', (totalSeconds, expected) => {
    expect(formatDuration(totalSeconds)).toBe(expected);
  });

  it('writes the largest safe integer with every digit of its hours and throws a RangeError beyond it', () => {
    expect(formatDuration(Number.MAX_SAFE_INTEGER)).toBe('2501999792983:36:31');
    expect(formatDuration(-Number.MAX_SAFE_INTEGER)).toBe('-2501999792983:36:31');
    expect(catchThrown(() => formatDuration(1e25))).toBeInstanceOf(RangeError);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('throws a RangeError for %d', (totalSeconds) => {
    expect(catchThrown(() => formatDuration(totalSeconds))).toBeInstanceOf(RangeError);
  });
});
