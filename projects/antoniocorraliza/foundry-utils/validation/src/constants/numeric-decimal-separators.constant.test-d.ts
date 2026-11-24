import { describe, expectTypeOf, it } from 'vitest';
import type { isNumeric } from '../functions/is-numeric.function';
import type { NUMERIC_DECIMAL_SEPARATORS } from './numeric-decimal-separators.constant';

describe('NUMERIC_DECIMAL_SEPARATORS', () => {
  it('has the same values as the option of isNumeric', () => {
    expectTypeOf<(typeof NUMERIC_DECIMAL_SEPARATORS)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof isNumeric>[1]>['decimalSeparator']>
    >();
  });
});
