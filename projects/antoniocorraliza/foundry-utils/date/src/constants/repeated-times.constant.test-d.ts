import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryLocalDateTimeToDateOptions } from '../interfaces/foundry-local-date-time-to-date-options.interface';
import type { REPEATED_TIMES } from './repeated-times.constant';

describe('REPEATED_TIMES', () => {
  it('has the same values as the repeatedTime option', () => {
    expectTypeOf<(typeof REPEATED_TIMES)[number]>().toEqualTypeOf<NonNullable<FoundryLocalDateTimeToDateOptions['repeatedTime']>>();
  });
});
