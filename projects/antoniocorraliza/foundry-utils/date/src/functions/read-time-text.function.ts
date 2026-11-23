import { ISO_TIME_TEXT_PATTERN, SEPARATED_TIME_TEXT_PATTERN } from '../constants/text-patterns.constant';
import type { TimeTextReading } from '../interfaces/time-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';

function readOffsetMinutes(match: RegExpExecArray): number | null {
  if (match[5] !== undefined) return 0;
  if (match[6] === undefined) return null;
  const hours: number = Number(match[7]);
  const minutes: number = Number(match[8] ?? '0');
  if (hours > 23 || minutes > 59) return Number.NaN;
  return (match[6] === '-' ? -1 : 1) * (hours * 60 + minutes);
}

/** Reads the time that follows the date of a text, or returns `null` when it is outside the format or out of range. */
export function readTimeText(text: string, format: FoundryDateFormat): TimeTextReading | null {
  const match: RegExpExecArray | null = (format === 'iso' ? ISO_TIME_TEXT_PATTERN : SEPARATED_TIME_TEXT_PATTERN).exec(text);
  if (match === null) return null;
  const hours: number = Number(match[1]);
  const minutes: number = Number(match[2]);
  const seconds: number = Number(match[3] ?? '0');
  const fraction: string = match[4] ?? '';
  const offsetMinutes: number | null = format === 'iso' ? readOffsetMinutes(match) : null;
  if (hours > 23 || minutes > 59 || seconds > 59 || Number.isNaN(offsetMinutes)) return null;
  const milliseconds: number = Number(fraction.padEnd(3, '0').slice(0, 3));
  return { hours, minutes, seconds, milliseconds, isWholeMinute: seconds === 0 && /^0*$/.test(fraction), offsetMinutes };
}
