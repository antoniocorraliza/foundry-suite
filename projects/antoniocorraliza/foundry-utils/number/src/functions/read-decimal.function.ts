import { LEADING_DIRECTION_MARKS, SEPARATOR_PATTERNS } from '../constants/decimal-text.constant';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';

/** Reads a decimal number written with separators that are already checked, or returns `null` when the value is not such a number. */
export function readDecimal(value: unknown, format: Required<FoundryParseDecimalOptions>): number | null {
  if (typeof value !== 'string') return null;
  const groups: Record<string, string | undefined> | undefined = createDecimalPattern(format).exec(
    value.trim().replace(LEADING_DIRECTION_MARKS, ''),
  )?.groups;
  if (groups === undefined) return null;
  const integerDigits: string = (groups['integer'] ?? '').replace(/\D/gu, '');
  const number: number = Number(`${integerDigits}.${groups['fraction'] ?? ''}`);
  if (!Number.isFinite(number)) return null;
  const isNegative: boolean = groups['sign'] === '-' || groups['sign'] === '\u2212';
  return isNegative && number !== 0 ? -number : number;
}

function createDecimalPattern(format: Required<FoundryParseDecimalOptions>): RegExp {
  const decimalSeparator: string = SEPARATOR_PATTERNS[format.decimalSeparator];
  const integer: string = format.groupSeparator === null ? '\\d+' : `\\d+|${createGroupedPattern(format)}`;
  return new RegExp(`^(?<sign>[+\\-\\u2212])?(?<integer>${integer})(?:${decimalSeparator}(?<fraction>\\d+))?$`, 'u');
}

function createGroupedPattern(format: Required<FoundryParseDecimalOptions>): string {
  const groupSeparator: string = format.groupSeparator === null ? '' : SEPARATOR_PATTERNS[format.groupSeparator];
  if (format.groupStyle === 'indian') return `\\d{1,2}(?:${groupSeparator}\\d{2})*${groupSeparator}\\d{3}`;
  return `\\d{1,3}(?:${groupSeparator}\\d{3})+`;
}
