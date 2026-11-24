import { describe, expect, it } from 'vitest';
import type { FoundryCurrencyFormatOptions } from '../interfaces/foundry-currency-format-options.interface';
import { formatCurrency } from './format-currency.function';

const EUROS: FoundryCurrencyFormatOptions = { locale: 'es-ES', currency: 'EUR' };

describe('formatCurrency with the language data of Node', () => {
  it('writes four digits without a group separator in Spanish, as the language does', () => {
    expect(formatCurrency(1234.5, EUROS)).toBe('1234,50 €');
    expect(formatCurrency(12345.5, EUROS)).toBe('12.345,50 €');
  });

  it('writes group separators always or never when asked', () => {
    expect(formatCurrency(1234.5, { ...EUROS, grouping: 'always' })).toBe('1.234,50 €');
    expect(formatCurrency(12345.5, { ...EUROS, grouping: 'never' })).toBe('12345,50 €');
  });

  it('rounds half a cent as roundToDecimals does, also for negative amounts', () => {
    expect(formatCurrency(4.015, EUROS)).toBe('4,02 €');
    expect(formatCurrency(-2.345, EUROS)).toBe('-2,35 €');
  });

  it('writes zero euros without a sign for a negative amount that rounds to zero', () => {
    expect(formatCurrency(-0.001, EUROS)).toBe('0,00 €');
  });

  it('writes any well-formed currency code', () => {
    expect(formatCurrency(1, { ...EUROS, currency: 'XYZ' })).toBe('1,00 XYZ');
  });
});
