import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryParseCalendarDayOptions } from '../interfaces/foundry-parse-calendar-day-options.interface';
import type { FoundryParseDateOptions } from '../interfaces/foundry-parse-date-options.interface';
import type { TIMESTAMP_UNITS } from './timestamp-units.constant';

describe('TIMESTAMP_UNITS', () => {
  it('has the same values as the timestampUnit options of parseDate and parseCalendarDay', () => {
    expectTypeOf<(typeof TIMESTAMP_UNITS)[number]>().toEqualTypeOf<NonNullable<FoundryParseDateOptions['timestampUnit']>>();
    expectTypeOf<(typeof TIMESTAMP_UNITS)[number]>().toEqualTypeOf<NonNullable<FoundryParseCalendarDayOptions['timestampUnit']>>();
  });
});
