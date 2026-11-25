import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchError } from '@foundry-test/functions/catch-error.function';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createQueuedCrypto } from '@foundry-test/functions/create-queued-crypto.function';
import { createUuidV4 } from './create-uuid-v4.function';
import { readRandomBytes } from './read-random-bytes.function';

const UUID_V4: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('createUuidV4', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a version 4 UUID of 36 characters in lowercase', () => {
    expect(createUuidV4()).toMatch(UUID_V4);
  });

  it('gives a different value on each call', () => {
    expect(new Set(Array.from({ length: 100 }, () => createUuidV4())).size).toBe(100);
  });

  it('returns what crypto.randomUUID returns, called as a method of crypto, when it exists', () => {
    const getRandomValues: unknown = vi.fn();
    const standIn: Record<string, unknown> = {
      randomUUID(): string {
        return this === standIn ? '0b8f5a8e-6c1d-4a8e-9f3e-2d7c1b6a5e4f' : 'called without crypto as this';
      },
      getRandomValues,
    };
    vi.stubGlobal('crypto', standIn);
    expect(createUuidV4()).toBe('0b8f5a8e-6c1d-4a8e-9f3e-2d7c1b6a5e4f');
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it.each<[number, string]>([
    [0xff, 'ffffffff-ffff-4fff-bfff-ffffffffffff'],
    [0x00, '00000000-0000-4000-8000-000000000000'],
  ])('builds the UUID with getRandomValues when randomUUID is missing: all bytes %i give %s', (byte, uuid) => {
    vi.stubGlobal('crypto', createQueuedCrypto(Array.from({ length: 16 }, () => byte)));
    expect(createUuidV4()).toBe(uuid);
  });

  it('writes the 16 bytes in order, in lowercase hexadecimal, with the version and the variant in their places', () => {
    vi.stubGlobal('crypto', createQueuedCrypto(Array.from({ length: 16 }, (_byte, index) => index)));
    expect(createUuidV4()).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
  });

  it('builds a valid version 4 UUID with the real getRandomValues when randomUUID is missing', () => {
    const realCrypto: Crypto = crypto;
    vi.stubGlobal('crypto', { getRandomValues: <T extends ArrayBufferView>(array: T): T => realCrypto.getRandomValues(array as never) });
    expect(createUuidV4()).toMatch(UUID_V4);
  });

  it('throws a FoundryCryptoUnavailableError for crypto when crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    const thrown: unknown = catchThrown(() => createUuidV4());
    expect(thrown).toBeInstanceOf(FoundryCryptoUnavailableError);
    expect((thrown as FoundryCryptoUnavailableError).missingApi).toBe('crypto');
  });

  it('names the API that readRandomBytes names when crypto has neither randomUUID nor getRandomValues', () => {
    vi.stubGlobal('crypto', {});
    expect(catchError(() => createUuidV4(), FoundryCryptoUnavailableError).missingApi).toBe(
      catchError(() => readRandomBytes(1), FoundryCryptoUnavailableError).missingApi,
    );
  });
});
