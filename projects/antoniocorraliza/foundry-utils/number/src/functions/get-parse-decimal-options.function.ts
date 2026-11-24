import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';

/**
 * Returns the options of `parseDecimal` that read what `Intl.NumberFormat` writes in a language.
 * @throws {RangeError} When the language tag is invalid, its digits are not Latin or its separators are not supported.
 * @throws {TypeError} When the language tag is not a string.
 */
export function getParseDecimalOptions(locale: string): Required<FoundryParseDecimalOptions> {
  throw new Error('[foundry-utils]: not implemented yet');
}
