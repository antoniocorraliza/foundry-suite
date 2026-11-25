import { describe, expectTypeOf, it } from 'vitest';
import { createRandomCode, createTemporaryId, createUuidV4 } from './public-api';

describe('types of the random entry', () => {
  it('declares the functions as the design fixes them', () => {
    expectTypeOf(createUuidV4).toEqualTypeOf<() => string>();
    expectTypeOf(createRandomCode).toEqualTypeOf<(length: number, options?: { readonly alphabet?: string }) => string>();
    expectTypeOf(createTemporaryId).toEqualTypeOf<() => number>();
  });

  it('does not take the alphabet as the second argument', () => {
    // @ts-expect-error the alphabet goes inside the options
    createRandomCode(6, 'abc');
  });

  it('does not compile createRandomCode in map, which would pass the index as the options', () => {
    // @ts-expect-error map passes the index as the second argument
    [6, 8].map(createRandomCode);
  });
});
