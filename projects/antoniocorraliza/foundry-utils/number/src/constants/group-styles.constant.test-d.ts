import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryParseDecimalOptions } from '../interfaces/foundry-parse-decimal-options.interface';
import type { GROUP_STYLES } from './group-styles.constant';

describe('GROUP_STYLES', () => {
  it('has the same values as the public type', () => {
    expectTypeOf<(typeof GROUP_STYLES)[number]>().toEqualTypeOf<NonNullable<FoundryParseDecimalOptions['groupStyle']>>();
  });
});
