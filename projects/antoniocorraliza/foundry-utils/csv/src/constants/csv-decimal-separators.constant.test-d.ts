import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCsvWriteOptions } from '../interfaces/foundry-csv-write-options.interface';
import type { CSV_DECIMAL_SEPARATORS } from './csv-decimal-separators.constant';

describe('CSV_DECIMAL_SEPARATORS', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof CSV_DECIMAL_SEPARATORS)[number]>().toEqualTypeOf<
      NonNullable<FoundryCsvWriteOptions<object>['decimalSeparator']>
    >();
  });
});
