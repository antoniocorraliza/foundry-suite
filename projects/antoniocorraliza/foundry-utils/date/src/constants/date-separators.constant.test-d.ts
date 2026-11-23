import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryDateSeparator } from '../types/foundry-date-separator.type';
import type { DATE_SEPARATORS } from './date-separators.constant';

describe('DATE_SEPARATORS', () => {
  it('has the same values as FoundryDateSeparator', () => {
    expectTypeOf<(typeof DATE_SEPARATORS)[number]>().toEqualTypeOf<FoundryDateSeparator>();
  });
});
