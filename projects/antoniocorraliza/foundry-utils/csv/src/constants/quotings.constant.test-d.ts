import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import type { QUOTINGS } from './quotings.constant';

describe('QUOTINGS', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof QUOTINGS)[number]>().toEqualTypeOf<NonNullable<FoundryCsvWriteOptions<object>['quoting']>>();
  });
});
