import { describe, expect, it } from 'vitest';
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

const DAY_IN_MILLISECONDS: number = 86_400_000;

const MAXIMUM_MISMATCHES: number = 10;

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

function listDatesOfDays(): Array<Date> {
  const first: number = Date.UTC(2020, 0, 1);
  const count: number = (Date.UTC(2030, 11, 31) - first) / DAY_IN_MILLISECONDS + 1;
  return Array.from({ length: count }, (_entry, index) => {
    const date: Date = new Date(first + index * DAY_IN_MILLISECONDS);
    date.setHours(13, 47, 29, 123);
    return date;
  });
}

describe('parseDate and formatDate on every day from 2020 to 2030', () => {
  it('reads back what formatDate writes, truncated to its precision, in every format and mode', () => {
    const mismatches: Array<string> = [];
    listDatesOfDays().some((date) =>
      ROUND_TRIP_OPTIONS.some((options) => {
        const text: string = formatDate(date, options);
        const parseOptions: FoundryParseDateOptions = { format: options.format, timeZone: options.timeZone };
        if (parseDate(text, parseOptions)?.getTime() !== truncateDate(date, options)) {
          mismatches.push(`${date.toISOString()} ${JSON.stringify(options)}`);
        } else if (formatDate(parseDate(text, parseOptions), options) !== text) mismatches.push(`${text} ${JSON.stringify(options)}`);
        return mismatches.length >= MAXIMUM_MISMATCHES;
      }),
    );
    expect(mismatches).toEqual([]);
  });
});
