import { LEADING_DIRECTION_MARKS } from '../constants/decimal-text.constant';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import { getSeparatorPattern } from './get-separator-pattern.function';

function createDecimalPattern(format: Required<FoundryParseDecimalOptions>): RegExp {
  const decimalSeparator: string = getSeparatorPattern(format.decimalSeparator);
  const integer: string =
    format.groupSeparator === null ? '\\d+' : `\\d+|${createGroupedPattern(getSeparatorPattern(format.groupSeparator), format.groupStyle)}`;
  return new RegExp(`^(?<sign>[+\\-\\u2212])?(?<integer>${integer})(?:${decimalSeparator}(?<fraction>\\d+))?$`, 'u');
}

function createGroupedPattern(groupSeparator: string, groupStyle: Required<FoundryParseDecimalOptions>['groupStyle']): string {
  if (groupStyle === 'indian') return `\\d{1,2}(?:${groupSeparator}\\d{2})*${groupSeparator}\\d{3}`;
  return `\\d{1,3}(?:${groupSeparator}\\d{3})+`;
}

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
