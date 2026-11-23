import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryCamelCase } from './foundry-camel-case.type';

describe('FoundryCamelCase', () => {
  it('computes the same keys as toCamelCase', () => {
    expectTypeOf<FoundryCamelCase<'valid_until'>>().toEqualTypeOf<'validUntil'>();
    expectTypeOf<FoundryCamelCase<'user_id'>>().toEqualTypeOf<'userId'>();
    expectTypeOf<FoundryCamelCase<'_id'>>().toEqualTypeOf<'_id'>();
    expectTypeOf<FoundryCamelCase<'__v'>>().toEqualTypeOf<'__v'>();
    expectTypeOf<FoundryCamelCase<'parentCategoryId'>>().toEqualTypeOf<'parentCategoryId'>();
    expectTypeOf<FoundryCamelCase<'user_ID'>>().toEqualTypeOf<'userId'>();
    expectTypeOf<FoundryCamelCase<'USER_NAME'>>().toEqualTypeOf<'userName'>();
    expectTypeOf<FoundryCamelCase<'IBAN'>>().toEqualTypeOf<'iban'>();
    expectTypeOf<FoundryCamelCase<'userID'>>().toEqualTypeOf<'userID'>();
    expectTypeOf<FoundryCamelCase<'UserName'>>().toEqualTypeOf<'userName'>();
    expectTypeOf<FoundryCamelCase<'content-type'>>().toEqualTypeOf<'contentType'>();
    expectTypeOf<FoundryCamelCase<'user name'>>().toEqualTypeOf<'userName'>();
    expectTypeOf<FoundryCamelCase<'user__name'>>().toEqualTypeOf<'userName'>();
    expectTypeOf<FoundryCamelCase<''>>().toEqualTypeOf<''>();
    expectTypeOf<FoundryCamelCase<'-user-name-'>>().toEqualTypeOf<'userName'>();
    expectTypeOf<FoundryCamelCase<'año_nacimiento'>>().toEqualTypeOf<'añoNacimiento'>();
    expectTypeOf<FoundryCamelCase<'ÑU_ID'>>().toEqualTypeOf<'ñuId'>();
    expectTypeOf<FoundryCamelCase<'2fa_code'>>().toEqualTypeOf<'2faCode'>();
  });

  it('keeps string as string', () => {
    expectTypeOf<FoundryCamelCase<string>>().toEqualTypeOf<string>();
  });
});
