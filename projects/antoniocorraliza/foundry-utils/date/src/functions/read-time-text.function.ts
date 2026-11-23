import { ISO_TIME_TEXT_PATTERN, SEPARATED_TIME_TEXT_PATTERN } from '../constants/text-patterns.constant';
import type { ClockTime } from '../interfaces/clock-time.interface';
import type { TimeTextReading } from '../interfaces/time-text-reading.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import { isExistingClockTime } from './is-existing-clock-time.function';

function readOffsetMinutes(groups: Readonly<Record<string, string | undefined>>): number | null {
  if (groups['utc'] !== undefined) return 0;
  if (groups['sign'] === undefined) return null;
  const minutes: number = Number(groups['offsetHours']) * 60 + Number(groups['offsetMinutes'] ?? '0');
  return groups['sign'] === '-' ? -minutes : minutes;
}

/** Reads the time that follows the date of a text, or returns `null` when it is outside the format or out of range. */
export function readTimeText(text: string, format: FoundryDateFormat): TimeTextReading | null {
  const groups: Readonly<Record<string, string | undefined>> | undefined = (
    format === 'iso' ? ISO_TIME_TEXT_PATTERN : SEPARATED_TIME_TEXT_PATTERN
  ).exec(text)?.groups;
  if (groups === undefined) return null;
  const fraction: string = groups['fraction'] ?? '';
  const time: ClockTime = {
    hours: Number(groups['hours']),
    minutes: Number(groups['minutes']),
    seconds: Number(groups['seconds'] ?? '0'),
    milliseconds: Number(fraction.padEnd(3, '0').slice(0, 3)),
  };
  const isOffsetInRange: boolean = Number(groups['offsetHours'] ?? '0') <= 23 && Number(groups['offsetMinutes'] ?? '0') <= 59;
  if (!isExistingClockTime(time) || !isOffsetInRange) return null;
  return { ...time, isWholeMinute: time.seconds === 0 && /^0*$/.test(fraction), offsetMinutes: readOffsetMinutes(groups) };
}
