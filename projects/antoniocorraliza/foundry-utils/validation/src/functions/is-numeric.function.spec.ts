import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import { parseDecimal } from '@antoniocorraliza/foundry-utils/number';
import { isNumeric } from './is-numeric.function';

describe('isNumeric', () => {
  it('reads texts as parseDecimal does, without group separators', () => {
    ['12', '12.5', ' 12 ', '1,5', '1.234,5', '0x1A'].forEach((text) => {
      expect(isNumeric(text)).toBe(parseDecimal(text, { decimalSeparator: '.' }) !== null);
      expect(isNumeric(text, { decimalSeparator: ',' })).toBe(parseDecimal(text, { decimalSeparator: ',' }) !== null);
    });
  });

  it('uses a dot as the decimal separator by default', () => {
    expect(isNumeric('12.5')).toBe(true);
    expect(isNumeric('12,5')).toBe(false);
    expect(isNumeric('12,5', { decimalSeparator: ',' })).toBe(true);
  });

  it.each<string>(['0x1A', '1e3', 'Infinity', '', '   ', '1.234,5', '1,234.5', '.5', '5.'])('rejects %j', (text) => {
    expect(isNumeric(text)).toBe(false);
  });

  it.each<string>([' 12 ', '−5', '‎-5', '+5', '-0'])('accepts %j', (text) => {
    expect(isNumeric(text)).toBe(true);
  });

  it('accepts a finite number, as a number input gives it', () => {
    expect(isNumeric(5)).toBe(true);
    expect(isNumeric(-0.5)).toBe(true);
    expect(isNumeric(0)).toBe(true);
  });

  it.each<unknown>([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 5n, new Number(5), null, undefined, true])(
    'rejects %s',
    (value) => {
      expect(isNumeric(value)).toBe(false);
    },
  );

  it.each<unknown>(['x', ' ', 1, null])('uses a dot when the decimal separator is %j', (decimalSeparator) => {
    expect(isNumeric('12.5', { decimalSeparator } as never)).toBe(true);
    expect(isNumeric('12,5', { decimalSeparator } as never)).toBe(false);
  });

  it('does not run a getter of its options', () => {
    const getter: () => string = vi.fn(() => ',');
    expect(isNumeric('12,5', Object.defineProperty({}, 'decimalSeparator', { get: getter, enumerable: true }))).toBe(false);
    expect(getter).not.toHaveBeenCalled();
  });

  it('never throws', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (value, options) => {
        expect(typeof isNumeric(value, options as never)).toBe('boolean');
      }),
    );
  });
});
