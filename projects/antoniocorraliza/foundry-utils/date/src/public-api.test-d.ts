import { describe, expectTypeOf, it } from 'vitest';
import type {
  FoundryCalendarDay,
  FoundryCalendarDayParts,
  FoundryCalendarDayRange,
  FoundryDateFormat,
  FoundryDateParts,
  FoundryDateSeparator,
  FoundryDuration,
  FoundryFormatCalendarDayOptions,
  FoundryFormatDateOptions,
  FoundryFormatLocalDateTimeOptions,
  FoundryInstantRange,
  FoundryIsoWeek,
  FoundryLocalDateTime,
  FoundryLocalDateTimeToDateOptions,
  FoundryParseCalendarDayOptions,
  FoundryParseDateOptions,
  FoundryParseLocalDateTimeOptions,
  FoundryTimePrecision,
  FoundryTimeZoneMode,
  FoundryWeekday,
} from './public-api';
import {
  compareCalendarDays,
  compareDays,
  formatCalendarDay,
  formatDate,
  formatLocalDateTime,
  formatTime,
  getDateParts,
  getIsoWeek,
  getIsoWeeksOfMonth,
  getYearRange,
  isCalendarDay,
  isLocalDateTime,
  localDateTimeToDate,
  parseCalendarDay,
  parseDate,
  parseLocalDateTime,
  splitDuration,
  toInstantRange,
} from './public-api';

describe('types of the date entry', () => {
  it('declares the closed values exactly', () => {
    expectTypeOf<FoundryDateFormat>().toEqualTypeOf<'iso' | 'eu' | 'us'>();
    expectTypeOf<FoundryDateSeparator>().toEqualTypeOf<'/' | '-' | '.'>();
    expectTypeOf<FoundryTimePrecision>().toEqualTypeOf<'none' | 'minutes' | 'seconds' | 'milliseconds'>();
    expectTypeOf<FoundryTimeZoneMode>().toEqualTypeOf<'local' | 'utc'>();
    expectTypeOf<FoundryWeekday>().toEqualTypeOf<0 | 1 | 2 | 3 | 4 | 5 | 6>();
    expectTypeOf<NonNullable<FoundryParseDateOptions['timestampUnit']>>().toEqualTypeOf<'milliseconds' | 'seconds'>();
    expectTypeOf<NonNullable<FoundryParseCalendarDayOptions['timestampUnit']>>().toEqualTypeOf<'milliseconds' | 'seconds'>();
    expectTypeOf<NonNullable<FoundryLocalDateTimeToDateOptions['repeatedTime']>>().toEqualTypeOf<'earlier' | 'later'>();
  });

  it('keeps days and local date-times as plain strings', () => {
    expectTypeOf<FoundryCalendarDay>().toEqualTypeOf<string>();
    expectTypeOf<FoundryLocalDateTime>().toEqualTypeOf<string>();
    expectTypeOf(parseCalendarDay('2026-09-06')).toEqualTypeOf<string | null>();
    expectTypeOf(parseLocalDateTime('2026-09-06T10:00')).toEqualTypeOf<string | null>();
  });

  it('declares the object types with their read-only members', () => {
    expectTypeOf<FoundryDateParts>().toEqualTypeOf<{
      readonly year: number;
      readonly month: number;
      readonly day: number;
      readonly hours?: number;
      readonly minutes?: number;
      readonly seconds?: number;
      readonly milliseconds?: number;
    }>();
    expectTypeOf<FoundryCalendarDayRange>().toEqualTypeOf<{ readonly start: string; readonly end: string }>();
    expectTypeOf<FoundryCalendarDayParts>().toEqualTypeOf<{
      readonly year: number;
      readonly month: number;
      readonly day: number;
      readonly weekday: FoundryWeekday;
    }>();
    expectTypeOf<FoundryInstantRange>().toEqualTypeOf<{ readonly start: Date; readonly endExclusive: Date }>();
    expectTypeOf<FoundryIsoWeek>().toEqualTypeOf<{ readonly year: number; readonly week: number }>();
    expectTypeOf<FoundryDuration>().toEqualTypeOf<{
      readonly sign: 1 | -1;
      readonly hours: number;
      readonly minutes: number;
      readonly seconds: number;
    }>();
    expectTypeOf<keyof FoundryFormatDateOptions>().toEqualTypeOf<'format' | 'separator' | 'time' | 'timeZone'>();
    expectTypeOf<keyof FoundryFormatCalendarDayOptions>().toEqualTypeOf<'format' | 'separator'>();
    expectTypeOf<keyof FoundryFormatLocalDateTimeOptions>().toEqualTypeOf<'format' | 'separator'>();
    expectTypeOf<keyof FoundryParseLocalDateTimeOptions>().toEqualTypeOf<'format'>();
  });

  it('returns a string for a date and string or null for a date or null', () => {
    const maybeDate: Date | null = parseDate('2026-09-06');
    expectTypeOf(formatDate(new Date())).toEqualTypeOf<string>();
    expectTypeOf(formatDate(maybeDate)).toEqualTypeOf<string | null>();
    expectTypeOf(formatCalendarDay('2026-09-06')).toEqualTypeOf<string>();
    expectTypeOf(formatCalendarDay(parseCalendarDay('2026-09-06'))).toEqualTypeOf<string | null>();
    expectTypeOf(formatLocalDateTime('2026-09-06T10:00')).toEqualTypeOf<string>();
    expectTypeOf(formatLocalDateTime(parseLocalDateTime('2026-09-06T10:00'))).toEqualTypeOf<string | null>();
  });

  it('narrows a list with the guards', () => {
    expectTypeOf(['2026-09-06', 3].filter(isCalendarDay)).toEqualTypeOf<Array<string>>();
    expectTypeOf(['2026-09-06T10:00', 3].filter(isLocalDateTime)).toEqualTypeOf<Array<string>>();
  });

  it('does not accept parseDate as a map callback', () => {
    // @ts-expect-error the index of map is not an options object
    ['2026-09-06'].map(parseDate);
  });

  it('sorts dates and days with the compare functions', () => {
    expectTypeOf([new Date()].sort(compareDays)).toEqualTypeOf<Array<Date>>();
    expectTypeOf(['2026-09-06'].sort(compareCalendarDays)).toEqualTypeOf<Array<string>>();
  });

  it('rejects values outside the option types', () => {
    // @ts-expect-error formatTime always writes a time
    formatTime(new Date(), { precision: 'none' });
    // @ts-expect-error repeatedTime is earlier or later
    localDateTimeToDate('2026-10-25T02:30', { repeatedTime: 'first' });
    // @ts-expect-error getYearRange has no default numbers
    getYearRange();
    // @ts-expect-error yearsBefore and yearsAfter are required
    getYearRange({ referenceYear: 2026 });
  });

  it('gives the exact result types', () => {
    expectTypeOf(localDateTimeToDate('2026-10-25T02:30')).toEqualTypeOf<Date | null>();
    expectTypeOf(getDateParts(new Date())).toEqualTypeOf<Required<FoundryDateParts>>();
    expectTypeOf(getIsoWeek(new Date())).toEqualTypeOf<FoundryIsoWeek>();
    expectTypeOf(getIsoWeeksOfMonth(new Date())).toEqualTypeOf<Array<FoundryIsoWeek>>();
    expectTypeOf(toInstantRange('2026-09-06')).toEqualTypeOf<FoundryInstantRange>();
    expectTypeOf(splitDuration(1)).toEqualTypeOf<FoundryDuration>();
    expectTypeOf(getYearRange({ yearsBefore: 1, yearsAfter: 1 })).toEqualTypeOf<Array<number>>();
  });
});
