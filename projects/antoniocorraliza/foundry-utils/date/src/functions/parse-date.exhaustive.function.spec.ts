import { describe, expect, it } from 'vitest';
import { DAY_IN_MILLISECONDS } from '@foundry-test/constants/time-units.constant';
import { findMismatches } from '@foundry-test/functions/find-mismatches.function';
import { listDaysOfYears } from '@foundry-test/functions/list-days-of-years.function';
import type { FoundryParseDateOptions } from '../interfaces/foundry-parse-date-options.interface';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { FoundryTimePrecision } from '../types/foundry-time-precision.type';
import type { FoundryTimeZoneMode } from '../types/foundry-time-zone-mode.type';
import { formatDate } from './format-date.function';
import { parseDate } from './parse-date.function';
import { startOfDay } from './start-of-day.function';

interface RoundTripOptions {
  readonly format: FoundryDateFormat;
  readonly time: FoundryTimePrecision;
  readonly timeZone: FoundryTimeZoneMode;
}

const ROUND_TRIP_OPTIONS: ReadonlyArray<RoundTripOptions> = (['iso', 'eu', 'us'] as const).flatMap((format) =>
  (['none', 'minutes', 'seconds', 'milliseconds'] as const).flatMap((time) =>
    (['local', 'utc'] as const).map((timeZone) => ({ format, time, timeZone })),
  ),
);

function truncateDate(date: Date, options: RoundTripOptions): number {
  if (options.time === 'none') {
    return options.timeZone === 'local' ? startOfDay(date).getTime() : date.getTime() - (date.getTime() % DAY_IN_MILLISECONDS);
  }
  const unit: number = { minutes: 60_000, seconds: 1000, milliseconds: 1 }[options.time];
  return date.getTime() - (date.getTime() % unit);
}

function findRoundTripMismatch(date: Date, options: RoundTripOptions): string | null {
  const text: string = formatDate(date, options);
  const parseOptions: FoundryParseDateOptions = { format: options.format, timeZone: options.timeZone };
  if (parseDate(text, parseOptions)?.getTime() !== truncateDate(date, options)) return `${date.toISOString()} ${JSON.stringify(options)}`;
  return formatDate(parseDate(text, parseOptions), options) === text ? null : `${text} ${JSON.stringify(options)}`;
}

function findDayMismatch(day: string): string | null {
  const date: Date = new Date(Date.parse(day));
  date.setHours(13, 47, 29, 123);
  return findMismatches(ROUND_TRIP_OPTIONS, (options) => findRoundTripMismatch(date, options), 1)[0] ?? null;
}

describe('parseDate and formatDate on every day from 2020 to 2030', () => {
  it('reads back what formatDate writes, truncated to its precision, in every format and mode', () => {
    expect(findMismatches(listDaysOfYears(2020, 2030), findDayMismatch)).toEqual([]);
  });
});
