import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { FoundryCurrencyFormatOptions } from '../interfaces/foundry-currency-format-options.interface';
import { createNumberFormat } from './create-number-format.function';
import { formatCurrency } from './format-currency.function';
import { roundToDecimals } from './round-to-decimals.function';
import { writeNumber } from './write-number.function';

const EUROS: FoundryCurrencyFormatOptions = { locale: 'es-ES', currency: 'EUR' };

describe('formatCurrency', () => {
  it('writes what writeNumber writes with the format of createNumberFormat, and the fallback for undefined', () => {
    const options: FoundryCurrencyFormatOptions = { locale: 'en-GB', currency: 'GBP', grouping: 'never', fallback: '?' };
    expect(formatCurrency(1234.5, options)).toBe(writeNumber(1234.5, createNumberFormat(options, 'currency')));
    expect(formatCurrency(undefined, options)).toBe('?');
  });

  it.each<unknown>([null, undefined, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'returns the fallback for %j, never zero euros or an infinity sign',
    (amount) => {
      expect(formatCurrency(amount as number, EUROS)).toBe('');
      expect(formatCurrency(amount as number, { ...EUROS, fallback: '—' })).toBe('—');
    },
  );

  it('writes no sign for a negative amount that rounds to zero', () => {
    expect(formatCurrency(-0.001, EUROS)).not.toMatch(/[-−]/u);
    expect(formatCurrency(-0.001, EUROS)).toBe(formatCurrency(0, EUROS));
  });

  it.each<unknown>(['1.234', '12', 12n, new Number(12)])('throws a TypeError for the amount %s, which is not a number', (amount) => {
    expect(catchThrown(() => formatCurrency(amount as number, EUROS))).toBeInstanceOf(TypeError);
  });

  it('throws a TypeError without a currency, instead of using a default one', () => {
    expect(catchThrown(() => formatCurrency(1, { locale: 'es-ES' } as FoundryCurrencyFormatOptions))).toBeInstanceOf(TypeError);
  });

  it('writes the same amount as roundToDecimals rounds it', () => {
    fc.assert(
      fc.property(fc.double({ min: -1e12, max: 1e12, noNaN: true, noDefaultInfinity: true }), (amount) => {
        expect(formatCurrency(amount, EUROS)).toBe(formatCurrency(roundToDecimals(amount, 2), EUROS));
      }),
      { numRuns: 2000 },
    );
  });

  it('writes the amounts ending in half a cent as roundToDecimals rounds them', () => {
    [4.015, 1.005, 2.135, 1024.215, -2.345, -1.005].forEach((amount) => {
      expect(formatCurrency(amount, EUROS)).toBe(formatCurrency(roundToDecimals(amount, 2), EUROS));
    });
  });
});
