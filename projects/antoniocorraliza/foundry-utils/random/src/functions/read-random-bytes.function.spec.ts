import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createQueuedCrypto } from '@foundry-test/functions/create-queued-crypto.function';
import { readRandomBytes } from './read-random-bytes.function';

describe('readRandomBytes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns that many bytes of crypto.getRandomValues', () => {
    const bytes: Uint8Array = readRandomBytes(32);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(32);
  });

  it('returns the bytes of getRandomValues in their order', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([7, 8, 9]));
    expect(Array.from(readRandomBytes(3))).toEqual([7, 8, 9]);
  });

  it('calls getRandomValues as a method of crypto, which the engines require', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([1, 2]));
    expect(Array.from(readRandomBytes(2))).toEqual([1, 2]);
  });

  it('reads crypto when it is called, so a stand-in installed after the import is used', () => {
    expect(readRandomBytes(1).length).toBe(1);
    vi.stubGlobal('crypto', createQueuedCrypto([200]));
    expect(Array.from(readRandomBytes(1))).toEqual([200]);
  });

  it('throws a FoundryCryptoUnavailableError for crypto, and not a ReferenceError, when crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    const thrown: FoundryCryptoUnavailableError = catchError(() => readRandomBytes(4), FoundryCryptoUnavailableError);
    expect(thrown.missingApi).toBe('crypto');
  });

  it.each<[string, unknown]>([
    ['without getRandomValues', {}],
    ['whose getRandomValues is not a function', { getRandomValues: 5 }],
  ])('throws a FoundryCryptoUnavailableError for crypto.getRandomValues with a crypto %s', (_description, stand) => {
    vi.stubGlobal('crypto', stand);
    const thrown: FoundryCryptoUnavailableError = catchError(() => readRandomBytes(4), FoundryCryptoUnavailableError);
    expect(thrown.missingApi).toBe('crypto.getRandomValues');
  });

  it('never calls Math.random, not even as a fallback when crypto is missing', () => {
    const random: unknown = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('[test]: the code called Math.random');
    });
    expect(readRandomBytes(16).length).toBe(16);
    vi.stubGlobal('crypto', undefined);
    expect(catchThrown(() => readRandomBytes(16))).toBeInstanceOf(FoundryCryptoUnavailableError);
    expect(random).not.toHaveBeenCalled();
  });
});
