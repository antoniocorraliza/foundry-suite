import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import type { GROUP_SEPARATORS } from './group-separators.constant';

describe('GROUP_SEPARATORS', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof GROUP_SEPARATORS)[number]>().toEqualTypeOf<NonNullable<FoundryParseDecimalOptions['groupSeparator']>>();
  });
});
