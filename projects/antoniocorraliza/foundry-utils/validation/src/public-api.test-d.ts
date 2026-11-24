import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryUrlOptions, FoundryValidatableControl, FoundryValidationErrors } from './public-api';
import {
  createControlValidator,
  hasValue,
  isDniOrNie,
  isEmail,
  isNumeric,
  isPhoneNumber,
  isStrongPassword,
  isUrl,
  isUuid,
  isValidJson,
  normalizeDniOrNie,
  normalizePhoneNumber,
  normalizeUrl,
} from './public-api';

describe('types of the validation entry', () => {
  it('declares the public types as the design fixes them', () => {
    expectTypeOf<FoundryValidationErrors>().toEqualTypeOf<Readonly<Record<string, true>>>();
    expectTypeOf<FoundryValidatableControl>().toEqualTypeOf<{ readonly value: unknown }>();
    expectTypeOf<FoundryUrlOptions['protocols']>().toEqualTypeOf<ReadonlyArray<string> | undefined>();
    expectTypeOf<FoundryUrlOptions['allowMissingProtocol']>().toEqualTypeOf<boolean | undefined>();
  });

  it('returns a boolean from the checks and a text or null from the normalizers', () => {
    [isEmail, isUrl, isPhoneNumber, isUuid, isDniOrNie, isStrongPassword, isNumeric, isValidJson, hasValue].forEach((check) => {
      expectTypeOf(check).returns.toEqualTypeOf<boolean>();
      expectTypeOf(check).parameter(0).toEqualTypeOf<unknown>();
    });
    [normalizeUrl, normalizePhoneNumber, normalizeDniOrNie].forEach((normalize) => {
      expectTypeOf(normalize).returns.toEqualTypeOf<string | null>();
    });
  });

  it('can pass the checks without options to filter, and not the checks with options', () => {
    const values: Array<unknown> = [];
    values.filter(isEmail);
    values.filter(hasValue);
    // @ts-expect-error filter gives the index as the options of isUuid
    values.filter(isUuid);
    // @ts-expect-error filter gives the index as the options of isUrl
    values.filter(isUrl);
  });

  it('takes any check with one value in createControlValidator', () => {
    expectTypeOf(createControlValidator).toBeCallableWith(isUuid, 'uuid');
    expectTypeOf(createControlValidator).toBeCallableWith(isDniOrNie, 'dni');
    expectTypeOf(createControlValidator(isEmail, 'email')).returns.toEqualTypeOf<FoundryValidationErrors | null>();
  });

  it('accepts only the closed values of the options', () => {
    // @ts-expect-error the only country is ES
    isPhoneNumber('600000000', { country: 'FR' });
    // @ts-expect-error versions go from 1 to 8
    isUuid('a', { version: 9 });
    // @ts-expect-error the kinds are dni and nie
    isDniOrNie('a', { accept: ['cif'] });
    // @ts-expect-error the default protocol is https: or http:
    normalizeUrl('a', { defaultProtocol: 'ftp:' });
  });
});
