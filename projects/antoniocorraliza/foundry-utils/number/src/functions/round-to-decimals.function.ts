import { ɵisOptionsValue, ɵparseEnumOption } from '@antoniocorraliza/foundry-utils';
import { ROUNDING_MODES } from '../constants/rounding-modes.constant';
import type { FoundryRoundingMode } from '../types/foundry-rounding-mode.type';

/**
 * Rounds a number as it is written in decimal, not its binary value; ties go away from zero unless `mode` says otherwise.
 * @throws {RangeError} When `decimals` is not an integer from 0 to 20.
 * @throws {TypeError} When the value is not a number, or the options are not valid.
 */
export function roundToDecimals(value: number, decimals: number, options?: { readonly mode?: FoundryRoundingMode }): number {
  if (typeof value !== 'number') throw new TypeError(`[foundry-utils]: the value of roundToDecimals must be a number, got ${typeof value}`);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 20) {
    throw new RangeError(`[foundry-utils]: the decimals of roundToDecimals must be an integer from 0 to 20, got ${String(decimals)}`);
  }
  if (!ɵisOptionsValue(options)) throw new TypeError('[foundry-utils]: the options of roundToDecimals must be an object');
  const mode: FoundryRoundingMode = ɵparseEnumOption({
    options,
    name: 'mode',
    allowedValues: ROUNDING_MODES,
    fallback: 'halfAwayFromZero',
  });
  if (!Number.isFinite(value) || value === 0) return value === 0 ? 0 : value;
  const [mantissa = '', exponentText = '0']: Array<string> = String(Math.abs(value)).split('e');
  const [integerDigits = '', fractionDigits = '']: Array<string> = mantissa.split('.');
  const exponent: number = Number(exponentText) - fractionDigits.length;
  if (exponent >= -decimals) return value;
  const divisor: bigint = 10n ** BigInt(-decimals - exponent);
  const digits: bigint = BigInt(`${integerDigits}${fractionDigits}`);
  const quotient: bigint = digits / divisor;
  const twiceRemainder: bigint = (digits % divisor) * 2n;
  const isTie: boolean = twiceRemainder === divisor;
  const isRoundedUp: boolean = twiceRemainder > divisor || (isTie && (mode === 'halfAwayFromZero' || quotient % 2n === 1n));
  const rounded: number = readScaledInteger(isRoundedUp ? quotient + 1n : quotient, decimals);
  return value < 0 && rounded !== 0 ? -rounded : rounded;
}

function readScaledInteger(integer: bigint, decimals: number): number {
  if (decimals === 0) return Number(integer);
  const digits: string = integer.toString().padStart(decimals + 1, '0');
  return Number(`${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`);
}
