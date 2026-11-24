import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { padNumber } from './pad-number.function';

describe('padNumber', () => {
  it('counts only the digits and writes the sign in front of them', () => {
    expect(padNumber(-5, 2)).toBe('-05');
    expect(padNumber(-5, 3)).toBe('-005');
    expect(padNumber(5, 3)).toBe('005');
    expect(padNumber(0, 1)).toBe('0');
  });

  it('never cuts a number with more digits than the length', () => {
    expect(padNumber(1234, 2)).toBe('1234');
    expect(padNumber(-1234, 2)).toBe('-1234');
  });

  it('writes negative zero without a sign', () => {
    expect(padNumber(-0, 2)).toBe('00');
  });

  it('writes the largest safe integers with all their digits', () => {
    expect(padNumber(Number.MAX_SAFE_INTEGER, 2)).toBe('9007199254740991');
    expect(padNumber(Number.MIN_SAFE_INTEGER, 2)).toBe('-9007199254740991');
  });

  it.each<unknown>([1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53, 1e21, '5', null])(
    'throws a RangeError for the value %j, which is not a safe integer',
    (value) => {
      expect(catchThrown(() => padNumber(value as number, 2))).toBeInstanceOf(RangeError);
    },
  );

  it.each<number>([0, -1, 1.5, Number.NaN])('throws a RangeError for the length %j', (length) => {
    expect(catchThrown(() => padNumber(5, length))).toBeInstanceOf(RangeError);
  });

  it('has no maximum length', () => {
    expect(padNumber(7, 40)).toBe(`${'0'.repeat(39)}7`);
  });
});
