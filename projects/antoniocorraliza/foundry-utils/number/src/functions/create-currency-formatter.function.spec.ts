import { afterEach, describe, expect, it, vi } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { FoundryCurrencyFormatOptions } from '../interfaces/foundry-currency-format-options.interface';
import { createCurrencyFormatter } from './create-currency-formatter.function';
import { formatCurrency } from './format-currency.function';

const EUROS: FoundryCurrencyFormatOptions = { locale: 'es-ES', currency: 'EUR' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createCurrencyFormatter', () => {
  it('writes each amount as formatCurrency does', () => {
    const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter({ ...EUROS, fallback: '?' });
    [0, 1234.5, -2.345, 4.015].forEach((amount) => expect(formatEuros(amount)).toBe(formatCurrency(amount, EUROS)));
    expect(formatEuros(null)).toBe('?');
    expect(formatEuros(Number.NaN)).toBe('?');
  });

  it('creates a single number format for every amount', () => {
    const constructor: unknown = vi.spyOn(Intl, 'NumberFormat');
    const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter(EUROS);
    Array.from({ length: 1000 }, (_value, index) => formatEuros(index / 7));
    expect(constructor).toHaveBeenCalledTimes(1);
  });

  it('can be passed to map, which only gives it the amount', () => {
    const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter(EUROS);
    expect([1, 2.5].map(formatEuros)).toEqual([formatCurrency(1, EUROS), formatCurrency(2.5, EUROS)]);
  });

  it('works without this', () => {
    const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter(EUROS);
    expect(formatEuros.call(undefined, 1)).toBe(formatCurrency(1, EUROS));
  });

  it('checks the options when it is created, before any amount', () => {
    expect(catchThrown(() => createCurrencyFormatter({ locale: 'es_ES', currency: 'EUR' }))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => createCurrencyFormatter({ locale: 'es-ES' } as FoundryCurrencyFormatOptions))).toBeInstanceOf(TypeError);
  });

  it('throws a TypeError for an amount that is not a number', () => {
    const formatEuros: (amount: number | null | undefined) => string = createCurrencyFormatter(EUROS);
    expect(catchThrown(() => formatEuros('12' as never))).toBeInstanceOf(TypeError);
  });

  it('leaves its options unchanged', () => {
    const options: FrozenSnapshot<FoundryCurrencyFormatOptions> = freezeAndSnapshot<FoundryCurrencyFormatOptions>({ ...EUROS });
    createCurrencyFormatter(options.value)(1);
    expect(options.listChanges()).toEqual([]);
  });
});
