import {
  ɵisOptionsValue,
  ɵparseEnumOption,
  ɵparseIntegerOption,
  ɵparseLanguageTag,
  ɵparseTextOption,
} from '@antoniocorraliza/foundry-utils';
import { GROUPINGS } from '../constants/groupings.constant';
import { MAX_FRACTION_DIGITS } from '../constants/number-limits.constant';
import { USE_GROUPING_VALUES } from '../constants/use-grouping-values.constant';
import type { NumberFormatSettings } from '../interfaces/number-format-settings.interface';
import type { NumberWriter } from '../interfaces/number-writer.interface';
import type { NumberFormatStyle } from '../types/number-format-style.type';

function createIntlFormat(locale: string, settings: NumberFormatSettings): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, settings as unknown as Intl.NumberFormatOptions);
  } catch (error) {
    throw new RangeError(`[foundry-utils]: ${String(settings.currency)} is not a well-formed currency code`, { cause: error });
  }
}

/**
 * Reads the options of a formatting function and creates its `Intl.NumberFormat`.
 * @throws {RangeError} When the language tag, the currency or the digits are not valid.
 * @throws {TypeError} When the options are not valid.
 */
export function createNumberFormat(options: unknown, style: NumberFormatStyle): NumberWriter {
  if (options === undefined || !ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the format options must be an object');
  const locale: string = ɵparseTextOption({ options, name: 'locale' });
  const currency: string | null = style === 'currency' ? ɵparseTextOption({ options, name: 'currency' }) : null;
  const minimumFractionDigits: number | null = ɵparseIntegerOption({
    options,
    name: 'minimumFractionDigits',
    minimum: 0,
    maximum: MAX_FRACTION_DIGITS,
    fallback: null,
  });
  const maximumFractionDigits: number | null = ɵparseIntegerOption({
    options,
    name: 'maximumFractionDigits',
    minimum: 0,
    maximum: MAX_FRACTION_DIGITS,
    fallback: null,
  });
  if (minimumFractionDigits !== null && maximumFractionDigits !== null && minimumFractionDigits > maximumFractionDigits) {
    throw new RangeError(
      `[foundry-utils]: the minimum fraction digits ${minimumFractionDigits} are more than the maximum ${maximumFractionDigits}`,
    );
  }
  const settings: NumberFormatSettings = {
    style,
    ...(currency === null ? {} : { currency }),
    ...(minimumFractionDigits === null ? {} : { minimumFractionDigits }),
    ...(maximumFractionDigits === null ? {} : { maximumFractionDigits }),
    useGrouping: USE_GROUPING_VALUES[ɵparseEnumOption({ options, name: 'grouping', allowedValues: GROUPINGS, fallback: 'locale' })],
    signDisplay: 'negative',
  };
  return {
    format: createIntlFormat(ɵparseLanguageTag(locale), settings),
    fallback: ɵparseTextOption({ options, name: 'fallback', fallback: '' }),
  };
}
