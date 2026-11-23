import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryDateFormat } from '../types/foundry-date-format.type';
import type { DATE_FORMATS } from './date-formats.constant';

describe('DATE_FORMATS', () => {
  it('has the same values as FoundryDateFormat', () => {
    expectTypeOf<(typeof DATE_FORMATS)[number]>().toEqualTypeOf<FoundryDateFormat>();
  });
});
