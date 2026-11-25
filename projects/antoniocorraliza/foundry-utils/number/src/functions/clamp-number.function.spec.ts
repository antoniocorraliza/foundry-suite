import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { clampNumber } from './clamp-number.function';

describe('clampNumber', () => {
  it('returns the value when it is within the limits, and the nearest limit when it is not', () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-3, 0, 10)).toBe(0);
    expect(clampNumber(12, 0, 10)).toBe(10);
    expect(clampNumber(0, 0, 10)).toBe(0);
    expect(clampNumber(10, 0, 10)).toBe(10);
  });

  it('returns that value when both limits are the same', () => {
    expect(clampNumber(-4, 3, 3)).toBe(3);
    expect(clampNumber(9, 3, 3)).toBe(3);
  });

  it('throws a RangeError when the minimum is greater than the maximum, instead of returning the maximum', () => {
    expect(catchThrown(() => clampNumber(5, 10, 0))).toBeInstanceOf(RangeError);
  });

  it('accepts infinite limits', () => {
    expect(clampNumber(5, Number.NEGATIVE_INFINITY, 10)).toBe(5);
    expect(clampNumber(-1e308, Number.NEGATIVE_INFINITY, 10)).toBe(-1e308);
    expect(clampNumber(50, 0, Number.POSITIVE_INFINITY)).toBe(50);
  });

  it.each<[number, number, number]>([
    [Number.NaN, 0, 10],
    [5, Number.NaN, 10],
    [5, 0, Number.NaN],
  ])('throws a RangeError for NaN in clampNumber(%j, %j, %j)', (value, minimum, maximum) => {
    expect(catchThrown(() => clampNumber(value, minimum, maximum))).toBeInstanceOf(RangeError);
  });

  it.each<[unknown, unknown, unknown]>([
    ['5', 0, 10],
    [5, '0', 10],
    [5, 0, null],
    [5n, 0, 10],
    [new Number(5), 0, 10],
  ])('throws a TypeError for clampNumber(%s, %s, %s), whose arguments are not all numbers', (value, minimum, maximum) => {
    const error: TypeError = catchError(() => clampNumber(value as number, minimum as number, maximum as number), TypeError);
    expect(error.message).toMatch(/^\[foundry-utils\]: /u);
  });
});
