import { ɵparseLanguageTag } from '@antoniocorraliza/foundry-utils';
import { SEPARATOR_SAMPLE } from '../constants/decimal-text.constant';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import type { GroupSeparator } from '../types/group-separator.type';
import { readGroupSeparator } from './read-group-separator.function';

/**
 * Returns the options of `parseDecimal` that read what `Intl.NumberFormat` writes in a language.
 * @throws {RangeError} When the language tag is invalid, its digits are not Latin or its separators are not supported.
 * @throws {TypeError} When the language tag is not a string.
 */
export function getParseDecimalOptions(locale: string): Required<FoundryParseDecimalOptions> {
  const format: Intl.NumberFormat = new Intl.NumberFormat(ɵparseLanguageTag(locale));
  const numberingSystem: string = format.resolvedOptions().numberingSystem;
  if (numberingSystem !== 'latn') {
    const latinLocale: string = `${new Intl.Locale(locale).baseName}-u-nu-latn`;
    throw new RangeError(
      `[foundry-utils]: ${locale} writes ${numberingSystem} digits, which parseDecimal does not read; use ${latinLocale}`,
    );
  }
  const parts: Array<Intl.NumberFormatPart> = format.formatToParts(SEPARATOR_SAMPLE);
  const decimal: string | undefined = parts.find((part) => part.type === 'decimal')?.value;
  const group: string | null = parts.find((part) => part.type === 'group')?.value ?? null;
  const groupSeparator: GroupSeparator | null = group === null ? null : readGroupSeparator(group);
  if ((decimal !== '.' && decimal !== ',') || (group !== null && groupSeparator === null)) {
    throw new RangeError(`[foundry-utils]: parseDecimal does not read the separators that ${locale} writes`);
  }
  const integers: Array<Intl.NumberFormatPart> = parts.filter((part) => part.type === 'integer');
  return {
    decimalSeparator: decimal,
    groupSeparator,
    groupStyle: integers.length > 2 && integers[1]?.value.length === 2 ? 'indian' : 'thousands',
  };
}
