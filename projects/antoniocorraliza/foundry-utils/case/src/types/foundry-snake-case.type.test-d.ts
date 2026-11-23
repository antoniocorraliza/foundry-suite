import { describe, expectTypeOf, it } from 'vitest';
import type { FoundrySnakeCase } from './foundry-snake-case.type';

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
