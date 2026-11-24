import { describe, expectTypeOf, it } from 'vitest';
import type { isPhoneNumber } from '../functions/is-phone-number.function';
import type { PHONE_COUNTRIES } from './phone-countries.constant';

describe('PHONE_COUNTRIES', () => {
  it('has the same values as the option of isPhoneNumber', () => {
    expectTypeOf<(typeof PHONE_COUNTRIES)[number]>().toEqualTypeOf<
      NonNullable<NonNullable<Parameters<typeof isPhoneNumber>[1]>['country']>
    >();
  });
});
