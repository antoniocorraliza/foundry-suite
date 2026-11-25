import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchRejection } from '@foundry-test/functions/catch-rejection.function';
import { createHexDigest } from './create-hex-digest.function';
import { sha256 } from './sha256.function';

describe('sha256', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each<[string, string]>([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ])('gives the standard vector of %j: 64 hexadecimal characters in lowercase', async (text, digest) => {
    expect(await sha256(text)).toBe(digest);
  });

  it('returns what createHexDigest returns with SHA-256, also for a view and without crypto.subtle', async () => {
    const inputs: ReadonlyArray<string | Uint8Array | ArrayBuffer> = [
      'abc',
      '',
      new Uint8Array([0, 97, 98, 99, 0]).subarray(1, 4),
      new ArrayBuffer(2),
    ];
    expect(await Promise.all(inputs.map((input) => sha256(input)))).toEqual(
      await Promise.all(inputs.map((input) => createHexDigest('SHA-256', input))),
    );
    vi.stubGlobal('crypto', {});
    const rejection: unknown = await catchRejection(() => sha256('abc'));
    const digestRejection: unknown = await catchRejection(() => createHexDigest('SHA-256', 'abc'));
    expect((rejection as FoundryCryptoUnavailableError).missingApi).toBe((digestRejection as FoundryCryptoUnavailableError).missingApi);
  });
});
