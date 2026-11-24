import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { FoundryRoundingMode } from '../types/foundry-rounding-mode.type';
import { roundToDecimals } from './round-to-decimals.function';

function roundWithBigInt(value: number, decimals: number, mode: FoundryRoundingMode): number {
  if (!Number.isFinite(value) || value === 0) return Number.isNaN(value) ? value : value + 0;
  const [mantissa = '', exponentText = '0']: Array<string> = String(Math.abs(value)).split('e');
  const [integerDigits = '', fractionDigits = '']: Array<string> = mantissa.split('.');
  const exponent: number = Number(exponentText) - fractionDigits.length;
  if (exponent >= -decimals) return value;
  const divisor: bigint = 10n ** BigInt(-decimals - exponent);
  const digits: bigint = BigInt(`${integerDigits}${fractionDigits}`);
  const twiceRemainder: bigint = (digits % divisor) * 2n;
  const quotient: bigint = digits / divisor;
  const isTie: boolean = twiceRemainder === divisor;
  const isUp: boolean = twiceRemainder > divisor || (isTie && (mode === 'halfAwayFromZero' || quotient % 2n === 1n));
  const rounded: number = Number(`${isUp ? quotient + 1n : quotient}e${-decimals}`);
  return value < 0 && rounded !== 0 ? -rounded : rounded;
}

describe('roundToDecimals', () => {
  it('rounds the shortest written decimal, not the binary value', () => {
    expect(roundToDecimals(4.015, 2)).toBe(4.02);
    expect(roundToDecimals(2.135, 2)).toBe(2.14);
    expect(roundToDecimals(1024.215, 2)).toBe(1024.22);
    expect(roundToDecimals(1.005, 2)).toBe(1.01);
  });

  it('rounds negative ties away from zero by default, as positive ones', () => {
    expect(roundToDecimals(-2.345, 2)).toBe(-2.35);
    expect(roundToDecimals(-0.5, 0)).toBe(-1);
    expect(roundToDecimals(-1.005, 2)).toBe(-1.01);
    expect(roundToDecimals(0.5, 0)).toBe(1);
  });

  it('breaks ties towards the even digit with the halfEven mode, whatever the sign', () => {
    expect(roundToDecimals(2.345, 2, { mode: 'halfEven' })).toBe(2.34);
    expect(roundToDecimals(2.355, 2, { mode: 'halfEven' })).toBe(2.36);
    expect(roundToDecimals(-2.345, 2, { mode: 'halfEven' })).toBe(-2.34);
    expect(roundToDecimals(2.5, 0, { mode: 'halfEven' })).toBe(2);
  });

  it('rounds the binary noise of a sum away instead of returning NaN', () => {
    expect(roundToDecimals(0.1 + 0.2 - 0.3, 2)).toBe(0);
    expect(roundToDecimals(12345.678, 18)).toBe(12345.678);
  });

  it('reads values written in exponential notation', () => {
    expect(roundToDecimals(1e-7, 2)).toBe(0);
    expect(roundToDecimals(1.5e-7, 7)).toBe(2e-7);
    expect(roundToDecimals(1e21, 2)).toBe(1e21);
  });

  it('returns the value as it is when it has no decimals to remove', () => {
    expect(roundToDecimals(12.5, 3)).toBe(12.5);
    expect(roundToDecimals(7, 0)).toBe(7);
  });

  it('never returns negative zero, not even for negative zero or a tiny negative value', () => {
    expect(Object.is(roundToDecimals(-0, 0), 0)).toBe(true);
    expect(Object.is(roundToDecimals(-0, 2), 0)).toBe(true);
    expect(Object.is(roundToDecimals(-0, 20), 0)).toBe(true);
    expect(Object.is(roundToDecimals(-1e-7, 2), 0)).toBe(true);
    expect(Object.is(roundToDecimals(-0.4, 0), 0)).toBe(true);
    expect(Object.is(roundToDecimals(-0.001, 2, { mode: 'halfEven' }), 0)).toBe(true);
  });

  it('returns NaN and infinities as they are', () => {
    expect(roundToDecimals(Number.NaN, 2)).toBeNaN();
    expect(roundToDecimals(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY);
    expect(roundToDecimals(Number.NEGATIVE_INFINITY, 2)).toBe(Number.NEGATIVE_INFINITY);
  });

  it('accepts from 0 to 20 decimals', () => {
    expect(roundToDecimals(1.25, 0)).toBe(1);
    expect(roundToDecimals(0.12345678901234568, 20)).toBe(0.12345678901234568);
  });

  it.each<number>([-1, 21, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('throws a RangeError for %j decimals', (decimals) => {
    expect(catchThrown(() => roundToDecimals(1.5, decimals))).toBeInstanceOf(RangeError);
  });

  it.each<unknown>([5, 'up', true, null, [], { mode: 'up' }, { mode: 'HalfEven' }])('throws a TypeError for the options %j', (options) => {
    expect(catchThrown(() => roundToDecimals(1.5, 0, options as never))).toBeInstanceOf(TypeError);
  });

  it('takes a null mode as the default one', () => {
    expect(roundToDecimals(2.5, 0, { mode: null } as never)).toBe(3);
  });

  it.each<unknown>(['4.015', null, undefined, 4n, new Number(4.015), {}])(
    'throws a TypeError for the value %s, which is not a number',
    (value) => {
      const error: unknown = catchThrown(() => roundToDecimals(value as number, 2));
      expect(error).toBeInstanceOf(TypeError);
      expect((error as TypeError).message).toMatch(/^\[foundry-utils\]: /u);
    },
  );

  it('throws a TypeError when map passes its index and array as decimals and options', () => {
    expect(catchThrown(() => [1.5].map(roundToDecimals as (value: number, index: number, array: Array<number>) => number))).toBeInstanceOf(
      TypeError,
    );
  });

  it('matches an exact reference with integers for any finite value', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), fc.integer({ min: 0, max: 20 }), (value, decimals) => {
        expect(roundToDecimals(value, decimals)).toBe(roundWithBigInt(value, decimals, 'halfAwayFromZero'));
        expect(roundToDecimals(value, decimals, { mode: 'halfEven' })).toBe(roundWithBigInt(value, decimals, 'halfEven'));
      }),
    );
  });

  it('never returns negative zero or NaN for a finite value', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), fc.integer({ min: 0, max: 20 }), (value, decimals) => {
        const rounded: number = roundToDecimals(value, decimals);
        expect(Object.is(rounded, -0)).toBe(false);
        expect(rounded).not.toBeNaN();
      }),
    );
  });
});
