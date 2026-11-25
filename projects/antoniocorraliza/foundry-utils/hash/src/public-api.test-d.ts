import { describe, expectTypeOf, it } from 'vitest';
import type { FoundryBinaryInput } from '@antoniocorraliza/foundry-utils';
import { sha256, sha512 } from './public-api';

describe('types of the hash entry', () => {
  it('declares the functions, which return a promise', () => {
    expectTypeOf(sha256).toEqualTypeOf<(input: string | FoundryBinaryInput) => Promise<string>>();
    expectTypeOf(sha512).toEqualTypeOf<(input: string | FoundryBinaryInput) => Promise<string>>();
  });

  it('takes a text, an ArrayBuffer or any view', () => {
    expectTypeOf(sha256).toBeCallableWith('abc');
    expectTypeOf(sha256).toBeCallableWith(new ArrayBuffer(1));
    expectTypeOf(sha256).toBeCallableWith(new Uint8Array(1));
    expectTypeOf(sha512).toBeCallableWith(new DataView(new ArrayBuffer(1)));
  });

  it('does not take a number or a Blob', () => {
    // @ts-expect-error a number is neither a text nor bytes
    expectTypeOf(sha256).toBeCallableWith(5);
    // @ts-expect-error a Blob is not bytes: its bytes are read asynchronously
    expectTypeOf(sha512).toBeCallableWith(new Blob(['abc']));
  });
});
