import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import type { DECIMAL_SEPARATORS } from './decimal-separators.constant';

describe('DECIMAL_SEPARATORS', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof DECIMAL_SEPARATORS)[number]>().toEqualTypeOf<FoundryParseDecimalOptions['decimalSeparator']>();
  });
});
