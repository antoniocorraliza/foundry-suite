import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { NumberWriter } from '../interfaces/number-writer.interface';
import { createNumberFormat } from './create-number-format.function';

const SIGNS: RegExp = /[-−]/u;

describe('createNumberFormat', () => {
  it('creates a number format for the language, and a currency format with its currency', () => {
    const decimal: Intl.ResolvedNumberFormatOptions = createNumberFormat({ locale: 'es-ES' }, 'decimal').format.resolvedOptions();
    const currency: Intl.ResolvedNumberFormatOptions = createNumberFormat(
      { locale: 'es-ES', currency: 'EUR' },
      'currency',
    ).format.resolvedOptions();
    expect([decimal.locale, decimal.style]).toEqual(['es-ES', 'decimal']);
    expect([currency.locale, currency.style, currency.currency]).toEqual(['es-ES', 'currency', 'EUR']);
  });

  it('returns an empty fallback by default, and the given one otherwise', () => {
    expect(createNumberFormat({ locale: 'es-ES' }, 'decimal').fallback).toBe('');
    expect(createNumberFormat({ locale: 'es-ES', fallback: null }, 'decimal').fallback).toBe('');
    expect(createNumberFormat({ locale: 'es-ES', fallback: '—' }, 'decimal').fallback).toBe('—');
  });

  it.each<[string, unknown]>([
    ['locale', 'auto'],
    ['always', 'always'],
    ['never', false],
  ])('passes the grouping %s to Intl as %j', (grouping, useGrouping) => {
    expect(createNumberFormat({ locale: 'es-ES', grouping }, 'decimal').format.resolvedOptions().useGrouping).toBe(useGrouping);
  });

  it('groups as the language does when the grouping is missing or null', () => {
    expect(createNumberFormat({ locale: 'es-ES' }, 'decimal').format.resolvedOptions().useGrouping).toBe('auto');
    expect(createNumberFormat({ locale: 'es-ES', grouping: null }, 'decimal').format.resolvedOptions().useGrouping).toBe('auto');
  });

  it('passes the fraction digits to Intl, from 0 to 100', () => {
    const options: Intl.ResolvedNumberFormatOptions = createNumberFormat(
      { locale: 'es-ES', minimumFractionDigits: 0, maximumFractionDigits: 100 },
      'decimal',
    ).format.resolvedOptions();
    expect([options.minimumFractionDigits, options.maximumFractionDigits]).toEqual([0, 100]);
  });

  it('accepts fewer fraction digits than the currency uses', () => {
    const writer: NumberWriter = createNumberFormat({ locale: 'es-ES', currency: 'EUR', maximumFractionDigits: 0 }, 'currency');
    expect(writer.format.resolvedOptions().maximumFractionDigits).toBe(0);
  });

  it('never writes the sign of a zero, also of a negative value that rounds to zero', () => {
    const decimal: Intl.NumberFormat = createNumberFormat({ locale: 'es-ES', maximumFractionDigits: 2 }, 'decimal').format;
    const currency: Intl.NumberFormat = createNumberFormat({ locale: 'es-ES', currency: 'EUR' }, 'currency').format;
    expect(decimal.format(-0)).not.toMatch(SIGNS);
    expect(decimal.format(-0.001)).not.toMatch(SIGNS);
    expect(currency.format(-0.001)).not.toMatch(SIGNS);
    expect(decimal.format(-1)).toMatch(SIGNS);
    expect(currency.format(-0.01)).toMatch(SIGNS);
  });

  it.each<unknown>([undefined, null, 5, 'es-ES', [], () => ({ locale: 'es-ES' })])('throws a TypeError for the options %j', (options) => {
    expect(catchThrown(() => createNumberFormat(options, 'decimal'))).toBeInstanceOf(TypeError);
  });

  it.each<unknown>([{}, { locale: undefined }, { locale: null }, { locale: 5 }, { locale: ['es-ES'] }])(
    'throws a TypeError for %j, without a language tag that is a string, instead of using the language of the device',
    (options) => {
      const error: TypeError = catchError(() => createNumberFormat(options, 'decimal'), TypeError);
      expect(error.message).toMatch(/^\[foundry-utils\]: .*\blocale\b/u);
    },
  );

  it('throws its own RangeError for an invalid language tag, with the error of Intl as the cause', () => {
    const error: RangeError = catchError(() => createNumberFormat({ locale: 'es_ES' }, 'decimal'), RangeError);
    expect(error.message).toMatch(/^\[foundry-utils\]: /u);
    expect(error.cause).toBeInstanceOf(RangeError);
  });

  it.each<unknown>([
    { locale: 'es-ES' },
    { locale: 'es-ES', currency: undefined },
    { locale: 'es-ES', currency: null },
    { locale: 'es-ES', currency: 978 },
  ])('throws a TypeError for the currency format %j, without a currency that is a string', (options) => {
    expect(catchThrown(() => createNumberFormat(options, 'currency'))).toBeInstanceOf(TypeError);
  });

  it('throws its own RangeError for a malformed currency code, with the error of Intl as the cause', () => {
    const error: RangeError = catchError(() => createNumberFormat({ locale: 'es-ES', currency: 'EURO' }, 'currency'), RangeError);
    expect(error.message).toMatch(/^\[foundry-utils\]: /u);
    expect(error.cause).toBeInstanceOf(RangeError);
  });

  it('accepts any well-formed currency code, as Intl does, in any case', () => {
    expect(createNumberFormat({ locale: 'es-ES', currency: 'XYZ' }, 'currency').format.resolvedOptions().currency).toBe('XYZ');
    expect(createNumberFormat({ locale: 'es-ES', currency: 'eur' }, 'currency').format.resolvedOptions().currency).toBe('EUR');
  });

  it.each<unknown>([-1, 101, 1.5, Number.NaN, '2'])('throws a RangeError for %j fraction digits', (digits) => {
    expect(catchThrown(() => createNumberFormat({ locale: 'es-ES', minimumFractionDigits: digits }, 'decimal'))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => createNumberFormat({ locale: 'es-ES', maximumFractionDigits: digits }, 'decimal'))).toBeInstanceOf(RangeError);
  });

  it('throws its own RangeError when the minimum fraction digits are more than the maximum', () => {
    const error: RangeError = catchError(
      () => createNumberFormat({ locale: 'es-ES', minimumFractionDigits: 3, maximumFractionDigits: 2 }, 'decimal'),
      RangeError,
    );
    expect(error.message).toMatch(/^\[foundry-utils\]: /u);
  });

  it.each<unknown>([
    { locale: 'es-ES', grouping: 'auto' },
    { locale: 'es-ES', grouping: true },
    { locale: 'es-ES', fallback: 0 },
  ])('throws a TypeError for the unknown option values %j', (options) => {
    expect(catchThrown(() => createNumberFormat(options, 'decimal'))).toBeInstanceOf(TypeError);
  });
});
