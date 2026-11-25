import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { sha512 } from './sha512.function';

describe('sha512', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each<[string, string]>([
    [
      '',
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    ],
    [
      'abc',
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    ],
  ])('gives the standard vector of %j: 128 hexadecimal characters in lowercase', async (text, digest) => {
    expect(await sha512(text)).toBe(digest);
  });

  it('computes with the shared digest of this entry: only the bytes of a view, and the named error without crypto.subtle', async () => {
    expect(await sha512(new Uint8Array([0, 97, 98, 99, 0]).subarray(1, 4))).toBe(await sha512('abc'));
    vi.stubGlobal('crypto', {});
    const rejection: unknown = await catchRejection(() => sha512('abc'));
    expect((rejection as FoundryCryptoUnavailableError).missingApi).toBe('crypto.subtle');
  });
});
