import { describe, expectTypeOf, it } from 'vitest';
import type { createFormData } from '../functions/create-form-data.function';
import type { ARRAY_KEY_STYLES } from './array-key-styles.constant';

describe('ARRAY_KEY_STYLES', () => {
  it('has the same values as the public option', () => {
    expectTypeOf<(typeof ARRAY_KEY_STYLES)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof createFormData>[1]>['arrayKeyStyle']>
    >();
  });
});
