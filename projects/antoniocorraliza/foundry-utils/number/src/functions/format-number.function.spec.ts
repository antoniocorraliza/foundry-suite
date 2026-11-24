import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import type { FoundryNumberFormatOptions } from '../interfaces/foundry-number-format-options.interface';
import { createNumberFormat } from './create-number-format.function';
import { formatNumber } from './format-number.function';
import { writeNumber } from './write-number.function';

describe('formatNumber', () => {
  it('writes with the shared number format and fallback of this entry', () => {
    const options: FoundryNumberFormatOptions = { locale: 'de-DE', maximumFractionDigits: 1, grouping: 'always', fallback: '?' };
    expect(formatNumber(1234.56, options)).toBe(writeNumber(1234.56, createNumberFormat(options, 'decimal')));
    expect(formatNumber(null, options)).toBe('?');
  });

  it('returns an empty text for null, undefined, NaN and infinities by default', () => {
    expect(formatNumber(null, { locale: 'es-ES' })).toBe('');
    expect(formatNumber(undefined, { locale: 'es-ES' })).toBe('');
    expect(formatNumber(Number.NaN, { locale: 'es-ES' })).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY, { locale: 'es-ES' })).toBe('');
  });

  it('writes negative zero without a sign', () => {
    expect(formatNumber(-0, { locale: 'es-ES' })).toBe('0');
    expect(formatNumber(-0.001, { locale: 'es-ES', maximumFractionDigits: 2 })).toBe('0');
  });

  it('checks the options also when there is no number to write', () => {
    expect(catchThrown(() => formatNumber(null, { locale: 'es_ES' }))).toBeInstanceOf(RangeError);
    expect(catchThrown(() => formatNumber(null, { locale: undefined } as never))).toBeInstanceOf(TypeError);
  });

  it('throws a TypeError for a text, instead of writing it as a number', () => {
    expect(catchThrown(() => formatNumber('1.234' as never, { locale: 'es-ES' }))).toBeInstanceOf(TypeError);
  });

  it('leaves its options unchanged', () => {
    const options: FrozenSnapshot<FoundryNumberFormatOptions> = freezeAndSnapshot<FoundryNumberFormatOptions>({
      locale: 'es-ES',
      maximumFractionDigits: 2,
    });
    formatNumber(1.5, options.value);
    expect(options.listChanges()).toEqual([]);
  });
});
