import { describe, expectTypeOf, it } from 'vitest';
import type { FoundrySnakeCase } from '../types/foundry-snake-case.type';
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

describe('FoundrySnakeCase', () => {
  it('computes the same keys as toSnakeCase', () => {
    expectTypeOf<FoundrySnakeCase<'userName'>>().toEqualTypeOf<'user_name'>();
    expectTypeOf<FoundrySnakeCase<'line1Name'>>().toEqualTypeOf<'line1_name'>();
    expectTypeOf<FoundrySnakeCase<'parseHTMLString'>>().toEqualTypeOf<'parse_html_string'>();
    expectTypeOf<FoundrySnakeCase<'userID'>>().toEqualTypeOf<'user_id'>();
    expectTypeOf<FoundrySnakeCase<'addressLine1'>>().toEqualTypeOf<'address_line1'>();
    expectTypeOf<FoundrySnakeCase<'IBAN'>>().toEqualTypeOf<'iban'>();
    expectTypeOf<FoundrySnakeCase<'_id'>>().toEqualTypeOf<'_id'>();
    expectTypeOf<FoundrySnakeCase<'añoNacimiento'>>().toEqualTypeOf<'año_nacimiento'>();
    expectTypeOf<FoundrySnakeCase<'2faCode'>>().toEqualTypeOf<'2fa_code'>();
  });
});
