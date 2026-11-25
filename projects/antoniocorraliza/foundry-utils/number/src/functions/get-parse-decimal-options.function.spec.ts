import fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ɵparseLanguageTag } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { formatNumber } from './format-number.function';
import { getParseDecimalOptions } from './get-parse-decimal-options.function';
import { parseDecimal } from './parse-decimal.function';
import { roundToDecimals } from './round-to-decimals.function';

const LATIN_LOCALES: ReadonlyArray<string> = [
  'es-ES',
  'de-DE',
  'it-IT',
  'pt-BR',
  'tr-TR',
  'en-US',
  'ja-JP',
  'zh-CN',
  'es-MX',
  'fr-FR',
  'pl-PL',
  'pt-PT',
  'cs-CZ',
  'ru-RU',
  'uk-UA',
  'sv-SE',
  'nb-NO',
  'fi-FI',
  'lt-LT',
  'et-EE',
  'de-CH',
  'it-CH',
  'fr-CH',
  'en-IN',
  'hi-IN',
  'he-IL',
  'ar-EG-u-nu-latn',
  'ar-MA',
];

function setFakeNumberFormat(group: string, decimal: string): void {
  const parts: Array<Intl.NumberFormatPart> = [
    { type: 'integer', value: '1' },
    { type: 'group', value: group },
    { type: 'integer', value: '234' },
    { type: 'group', value: group },
    { type: 'integer', value: '567' },
    { type: 'decimal', value: decimal },
    { type: 'fraction', value: '5' },
  ];
  const fakeFormat: Pick<Intl.NumberFormat, 'format' | 'formatToParts' | 'resolvedOptions'> = {
    format: () => parts.map((part) => part.value).join(''),
    formatToParts: () => parts,
    resolvedOptions: () => ({ locale: 'xx', numberingSystem: 'latn' }) as Intl.ResolvedNumberFormatOptions,
  };
  vi.spyOn(Intl, 'NumberFormat').mockImplementation(function createFakeNumberFormat(): Intl.NumberFormat {
    return fakeFormat as Intl.NumberFormat;
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getParseDecimalOptions', () => {
  it('returns the three options, with a closed value each', () => {
    const options: ReturnType<typeof getParseDecimalOptions> = getParseDecimalOptions('en-US');
    expect(Object.keys(options).sort()).toEqual(['decimalSeparator', 'groupSeparator', 'groupStyle']);
    expect(['.', ',']).toContain(options.decimalSeparator);
    expect(['.', ',', ' ', "'"]).toContain(options.groupSeparator);
    expect(['thousands', 'indian']).toContain(options.groupStyle);
  });

  it('reads Intl again on every call instead of keeping a result', () => {
    setFakeNumberFormat('.', ',');
    expect(getParseDecimalOptions('en-US')).toEqual({ decimalSeparator: ',', groupSeparator: '.', groupStyle: 'thousands' });
    setFakeNumberFormat(',', '.');
    expect(getParseDecimalOptions('en-US')).toEqual({ decimalSeparator: '.', groupSeparator: ',', groupStyle: 'thousands' });
  });

  it.each<[string, string]>([
    [' ', ','],
    [' ', ','],
    [' ', ','],
    [' ', ','],
  ])('maps the group separator %j to a space', (group, decimal) => {
    setFakeNumberFormat(group, decimal);
    expect(getParseDecimalOptions('xx').groupSeparator).toBe(' ');
  });

  it.each<string>(["'", '’'])('maps the group separator %j to an apostrophe', (group) => {
    setFakeNumberFormat(group, '.');
    expect(getParseDecimalOptions('xx').groupSeparator).toBe("'");
  });

  it.each<[string, string]>([
    ['_', ','],
    ['٬', '٫'],
    ['.', '٫'],
  ])('throws a RangeError for separators that parseDecimal does not read: %j and %j', (group, decimal) => {
    setFakeNumberFormat(group, decimal);
    expect(catchThrown(() => getParseDecimalOptions('xx'))).toBeInstanceOf(RangeError);
  });

  it.each<string>(['en-u-nu-arab', 'en-u-nu-deva', 'en-u-nu-beng'])(
    'throws a RangeError for %s, whose digits are not Latin, and suggests the Latin variant',
    (locale) => {
      const error: RangeError = catchError(() => getParseDecimalOptions(locale), RangeError);
      expect(error.message).toMatch(/^\[foundry-utils\]: .*-u-nu-latn/u);
    },
  );

  it.each<[unknown, typeof TypeError | typeof RangeError]>([
    [5, TypeError],
    ['es_ES', RangeError],
  ])('rejects the locale %j as parseLanguageTag does', (locale, errorClass) => {
    expect(catchError(() => getParseDecimalOptions(locale as string), errorClass).message).toBe(
      catchError(() => ɵparseLanguageTag(locale), errorClass).message,
    );
  });

  it('gives options that read back what formatNumber writes in each supported language', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LATIN_LOCALES),
        fc.double({ min: -1e15, max: 1e15, noNaN: true, noDefaultInfinity: true }),
        (locale, value) => {
          const text: string = formatNumber(value, { locale, maximumFractionDigits: 2 });
          expect(parseDecimal(text, getParseDecimalOptions(locale))).toBe(roundToDecimals(value, 2));
        },
      ),
      { numRuns: 2000 },
    );
  });
});
