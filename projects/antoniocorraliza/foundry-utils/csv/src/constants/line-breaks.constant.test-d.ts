import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import type { LINE_BREAKS } from './line-breaks.constant';

describe('LINE_BREAKS', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof LINE_BREAKS)[number]>().toEqualTypeOf<NonNullable<FoundryCsvWriteOptions<object>['lineBreak']>>();
  });
});
