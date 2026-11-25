import { describe, expect, it } from 'vitest';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { ɵparseLanguageTag } from './parse-language-tag.function';

describe('ɵparseLanguageTag', () => {
  it.each<string>(['es-ES', 'es', 'de-CH', 'en-u-nu-latn', 'und-AE'])('returns %s as it is written', (locale) => {
    expect(ɵparseLanguageTag(locale)).toBe(locale);
  });

  it.each<string>(['es_ES', 'xx-', '', ' es', 'español'])(
    'throws a RangeError for %j, quoting it, with the error of the engine as the cause',
    (locale) => {
      const error: RangeError = catchError(() => ɵparseLanguageTag(locale), RangeError);
      expect(error.message).toBe(`[foundry-utils]: ${JSON.stringify(locale)} is not a valid language tag`);
      expect(error.cause).toBeInstanceOf(RangeError);
    },
  );

  it.each<unknown>([5, null, undefined, new String('es-ES'), ['es-ES']])('throws a TypeError for %j, naming its type', (locale) => {
    const error: TypeError = catchError(() => ɵparseLanguageTag(locale), TypeError);
    expect(error.message).toBe(`[foundry-utils]: the language tag must be a string, got ${typeof locale}`);
  });
});
