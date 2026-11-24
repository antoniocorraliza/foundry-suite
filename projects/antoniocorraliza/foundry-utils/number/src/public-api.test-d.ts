import { describe, expectTypeOf, it } from 'vitest';
import type {
  FoundryCurrencyFormatOptions,
  FoundryNumberFormatOptions,
  FoundryParseDecimalOptions,
  FoundryRoundingMode,
} from './public-api';
import {
  clampNumber,
  createCurrencyFormatter,
  formatCurrency,
  formatNumber,
  getParseDecimalOptions,
  padNumber,
  parseDecimal,
  roundToDecimals,
} from './public-api';

describe('types of the number entry', () => {
  it('declares the closed values exactly', () => {
    expectTypeOf<FoundryRoundingMode>().toEqualTypeOf<'halfAwayFromZero' | 'halfEven'>();
    expectTypeOf<FoundryParseDecimalOptions['decimalSeparator']>().toEqualTypeOf<'.' | ','>();
    expectTypeOf<FoundryParseDecimalOptions['groupSeparator']>().toEqualTypeOf<'.' | ',' | ' ' | "'" | null | undefined>();
    expectTypeOf<FoundryParseDecimalOptions['groupStyle']>().toEqualTypeOf<'thousands' | 'indian' | undefined>();
    expectTypeOf<FoundryNumberFormatOptions['grouping']>().toEqualTypeOf<'locale' | 'always' | 'never' | undefined>();
  });

  it('returns what the design fixes', () => {
    expectTypeOf(roundToDecimals).returns.toEqualTypeOf<number>();
    expectTypeOf(clampNumber).returns.toEqualTypeOf<number>();
    expectTypeOf(padNumber).returns.toEqualTypeOf<string>();
    expectTypeOf(parseDecimal).returns.toEqualTypeOf<number | null>();
    expectTypeOf(getParseDecimalOptions).returns.toEqualTypeOf<Required<FoundryParseDecimalOptions>>();
    expectTypeOf(formatNumber).returns.toEqualTypeOf<string>();
    expectTypeOf(formatCurrency).returns.toEqualTypeOf<string>();
    expectTypeOf(createCurrencyFormatter).returns.toEqualTypeOf<(amount: number | null | undefined) => string>();
  });

  it('requires the language and the currency, without defaults', () => {
    // @ts-expect-error the language is required
    formatNumber(1, {});
    // @ts-expect-error the currency is required
    formatCurrency(1, { locale: 'es-ES' });
    // @ts-expect-error the language is required
    createCurrencyFormatter({ currency: 'EUR' });
    expectTypeOf<FoundryCurrencyFormatOptions>().toExtend<FoundryNumberFormatOptions>();
  });

  it('requires the decimal separator of parseDecimal', () => {
    // @ts-expect-error the decimal separator is required
    parseDecimal('1', {});
  });

  it('passes the result of getParseDecimalOptions to parseDecimal as it is', () => {
    expectTypeOf(parseDecimal).toBeCallableWith('1 234,5', getParseDecimalOptions('fr-FR'));
  });

  it('writes the space group separator as a plain space', () => {
    // @ts-expect-error a no-break space is not one of the values
    parseDecimal('1', { decimalSeparator: ',', groupSeparator: ' ' });
  });

  it('cannot be passed to map as roundToDecimals, whose options would get the array', () => {
    // @ts-expect-error map gives the index as decimals and the array as options
    [1.5].map(roundToDecimals);
  });

  it('accepts a missing amount in the function of createCurrencyFormatter', () => {
    expectTypeOf(createCurrencyFormatter({ locale: 'es-ES', currency: 'EUR' })).toBeCallableWith(null);
    expectTypeOf(createCurrencyFormatter({ locale: 'es-ES', currency: 'EUR' })).toBeCallableWith(undefined);
  });
});
