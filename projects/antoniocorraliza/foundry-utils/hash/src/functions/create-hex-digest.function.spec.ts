import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchRejectedError } from '@foundry-test/functions/catch-rejected-error.function';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { createObjectWithFakeTag } from '@foundry-test/functions/create-object-with-fake-tag.function';
import { freezeAndSnapshot } from '@foundry-test/functions/freeze-and-snapshot.function';
import type { FrozenSnapshot } from '@foundry-test/interfaces/frozen-snapshot.interface';
import { createHexDigest } from './create-hex-digest.function';

const SHA256_OF_ABC: string = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('createHexDigest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each<[string, string, string]>([
    ['SHA-256', '', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['SHA-256', 'abc', SHA256_OF_ABC],
    [
      'SHA-512',
      '',
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    ],
    [
      'SHA-512',
      'abc',
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
    ],
  ])('computes the %s of %j in lowercase hexadecimal', async (algorithm, text, digest) => {
    expect(await createHexDigest(algorithm as 'SHA-256' | 'SHA-512', text)).toBe(digest);
  });

  it.each<[string, string, string]>([
    ['with a composed letter', 'ñ', '024bb90888ca89a15a19e9bdd8c712bfb070465fce1ef25e43c170ea44fc5e5f'],
    ['with a decomposed letter', 'n\u0301', '4e748e9f01e478e3ee13896d86bd7ee581eb7933254a9a9defc71a5439bbb9e7'],
    ['with a leading space', ' a', '7de598b3ff8a99638e1f9bf49260baa0d98e069dde32d1f2e153adb5ce478242'],
    ['without spaces', 'a', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'],
    ['with accents, spaces and an emoji', 'Nuñez, José Ángel 🍎', 'e9296dd6a80da13b44474f4eb0f1ee4aedcb0425eced8f7243fc3608b10ae196'],
  ])('encodes a text %s as UTF-8, without normalizing or trimming it', async (_description, text, digest) => {
    expect(await createHexDigest('SHA-256', text)).toBe(digest);
  });

  it('gives different digests for a composed and a decomposed letter, and with and without a leading space', async () => {
    expect(await createHexDigest('SHA-256', 'ñ')).not.toBe(await createHexDigest('SHA-256', 'ń'));
    expect(await createHexDigest('SHA-256', ' a')).not.toBe(await createHexDigest('SHA-256', 'a'));
  });

  it('writes a lone surrogate as the replacement character, as TextEncoder does', async () => {
    expect(await createHexDigest('SHA-256', '\uD800')).toBe(await createHexDigest('SHA-256', '�'));
  });

  it.each<[string, () => ArrayBuffer | ArrayBufferView]>([
    ['an ArrayBuffer', () => new Uint8Array([97, 98, 99]).buffer],
    ['a Uint8Array', () => new Uint8Array([97, 98, 99])],
    ['a DataView', () => new DataView(new Uint8Array([97, 98, 99]).buffer)],
  ])('computes the digest of the bytes of %s', async (_description, createInput) => {
    expect(await createHexDigest('SHA-256', createInput())).toBe(SHA256_OF_ABC);
  });

  it('reads the bytes of any typed array', async () => {
    const values: Float64Array = new Float64Array([1.5, -2]);
    expect(await createHexDigest('SHA-256', values)).toBe(await createHexDigest('SHA-256', new Uint8Array(values.buffer)));
  });

  it('reads only the bytes of a view, not the whole buffer under it', async () => {
    const bytes: Uint8Array = new Uint8Array([0, 97, 98, 99, 0]);
    expect(await createHexDigest('SHA-256', bytes.subarray(1, 4))).toBe(SHA256_OF_ABC);
    expect(await createHexDigest('SHA-256', new DataView(bytes.buffer, 1, 3))).toBe(SHA256_OF_ABC);
  });

  it('leaves the bytes unchanged', async () => {
    const bytes: FrozenSnapshot<Uint8Array> = freezeAndSnapshot(new Uint8Array([97, 98, 99]));
    await createHexDigest('SHA-512', bytes.value);
    expect(bytes.listChanges()).toEqual([]);
  });

  it.each<unknown>([null, undefined, 5, true, {}, ['a'], new Blob(['abc'])])(
    'returns a promise rejected with a TypeError for %j, which is neither a text nor bytes, instead of throwing',
    async (input) => {
      const rejection: TypeError = await catchRejectedError(() => createHexDigest('SHA-256', input as string), TypeError);
      expect(rejection.message).toMatch(/^\[foundry-utils\]: /);
    },
  );

  it('returns a promise rejected with a TypeError for an object that only fakes the tag of an ArrayBuffer', async () => {
    const rejection: TypeError = await catchRejectedError(
      () => createHexDigest('SHA-256', createObjectWithFakeTag('ArrayBuffer') as ArrayBuffer),
      TypeError,
    );
    expect(rejection.message).toBe('[foundry-utils]: the input of SHA-256 must be a string, an ArrayBuffer or a view of one');
  });

  it('returns a promise rejected with a FoundryCryptoUnavailableError for crypto, and not a ReferenceError, when crypto is missing', async () => {
    vi.stubGlobal('crypto', undefined);
    const rejection: FoundryCryptoUnavailableError = await catchRejectedError(
      () => createHexDigest('SHA-256', 'abc'),
      FoundryCryptoUnavailableError,
    );
    expect(rejection.missingApi).toBe('crypto');
  });

  it('returns a promise rejected with a FoundryCryptoUnavailableError that explains the secure context when crypto.subtle is missing', async () => {
    vi.stubGlobal('crypto', { getRandomValues: vi.fn(), randomUUID: vi.fn() });
    const rejection: FoundryCryptoUnavailableError = await catchRejectedError(
      () => createHexDigest('SHA-512', new Uint8Array([1])),
      FoundryCryptoUnavailableError,
    );
    expect(rejection.missingApi).toBe('crypto.subtle');
    expect(rejection.message).toContain('secure context');
  });

  it('checks the input before looking for crypto', async () => {
    vi.stubGlobal('crypto', undefined);
    expect(await catchRejection(() => createHexDigest('SHA-256', 5 as never))).toBeInstanceOf(TypeError);
  });

  it('returns a promise rejected with a TypeError that names TextEncoder when a text needs it and the environment lacks it', async () => {
    vi.stubGlobal('TextEncoder', undefined);
    const rejection: TypeError = await catchRejectedError(() => createHexDigest('SHA-256', 'abc'), TypeError);
    expect(rejection.message).toMatch(/^\[foundry-utils\]: /);
    expect(rejection.message).toContain('TextEncoder');
  });

  it('reads crypto when it is called, so a stand-in installed after the import is used', async () => {
    const digest: unknown = vi.fn(async () => new Uint8Array([0, 15, 255]).buffer);
    vi.stubGlobal('crypto', { subtle: { digest } });
    expect(await createHexDigest('SHA-256', new Uint8Array([1]))).toBe('000fff');
    expect(digest).toHaveBeenCalledWith('SHA-256', expect.anything());
  });
});
