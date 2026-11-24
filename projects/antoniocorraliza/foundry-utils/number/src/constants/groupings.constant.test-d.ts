import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryNumberFormatOptions } from '../interfaces/foundry-number-format-options.interface';
import type { GROUPINGS } from './groupings.constant';

describe('GROUPINGS', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof GROUPINGS)[number]>().toEqualTypeOf<NonNullable<FoundryNumberFormatOptions['grouping']>>();
  });
});
