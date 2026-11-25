import { describe, expect, it } from 'vitest';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import { getParseDecimalOptions } from './get-parse-decimal-options.function';

const COMMA_DOT_GROUPS: Required<FoundryParseDecimalOptions> = {
  decimalSeparator: ',',
  groupSeparator: '.',
  groupStyle: 'thousands',
};
const DOT_COMMA_GROUPS: Required<FoundryParseDecimalOptions> = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupStyle: 'thousands',
};
const COMMA_SPACE_GROUPS: Required<FoundryParseDecimalOptions> = {
  decimalSeparator: ',',
  groupSeparator: ' ',
  groupStyle: 'thousands',
};
const DOT_APOSTROPHE_GROUPS: Required<FoundryParseDecimalOptions> = {
  decimalSeparator: '.',
  groupSeparator: "'",
  groupStyle: 'thousands',
};
const COMMA_APOSTROPHE_GROUPS: Required<FoundryParseDecimalOptions> = {
  decimalSeparator: ',',
  groupSeparator: "'",
  groupStyle: 'thousands',
};
const INDIAN_GROUPS: Required<FoundryParseDecimalOptions> = { decimalSeparator: '.', groupSeparator: ',', groupStyle: 'indian' };

describe('getParseDecimalOptions with the language data of Node', () => {
  it.each<[string, Required<FoundryParseDecimalOptions>]>([
    ['es-ES', COMMA_DOT_GROUPS],
    ['de-DE', COMMA_DOT_GROUPS],
    ['en-US', DOT_COMMA_GROUPS],
    ['fr-FR', COMMA_SPACE_GROUPS],
    ['pl-PL', COMMA_SPACE_GROUPS],
    ['sv-SE', COMMA_SPACE_GROUPS],
    ['de-CH', DOT_APOSTROPHE_GROUPS],
    ['it-CH', DOT_APOSTROPHE_GROUPS],
    ['fr-CH', COMMA_APOSTROPHE_GROUPS],
    ['en-IN', INDIAN_GROUPS],
    ['hi-IN', INDIAN_GROUPS],
    ['he-IL', DOT_COMMA_GROUPS],
    ['ar-EG-u-nu-latn', DOT_COMMA_GROUPS],
    ['ar-MA', COMMA_DOT_GROUPS],
  ])('returns the separators that Intl writes in %s', (locale, options) => {
    expect(getParseDecimalOptions(locale)).toEqual(options);
  });

  it.each<string>(['ar-EG', 'fa-IR', 'bn-BD'])('throws a RangeError for %s, whose default digits are not Latin', (locale) => {
    const error: unknown = catchThrown(() => getParseDecimalOptions(locale));
    expect(error).toBeInstanceOf(RangeError);
    expect((error as RangeError).message).toContain(`${locale}-u-nu-latn`);
  });
});
