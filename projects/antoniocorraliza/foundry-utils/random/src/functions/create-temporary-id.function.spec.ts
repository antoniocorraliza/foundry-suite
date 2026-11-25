import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundryCryptoUnavailableError } from '@antoniocorraliza/foundry-utils';
import { catchThrown } from '@foundry-test/functions/catch-thrown.function';
import { createQueuedCrypto } from '@foundry-test/functions/create-queued-crypto.function';
import { createTemporaryId } from './create-temporary-id.function';

describe('createTemporaryId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns safe negative integers from -1 to -(2 ** 53 - 1), never zero', () => {
    const ids: Array<number> = Array.from({ length: 1000 }, () => createTemporaryId());
    expect(ids.every((id) => Number.isSafeInteger(id) && id <= -1 && id >= -(2 ** 53 - 1))).toBe(true);
    expect(ids.some((id) => Object.is(id, 0) || Object.is(id, -0))).toBe(false);
  });

  it('returns -(2 ** 53 - 1) when all the bits are 1, a value that does not fit in 32 bits', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]));
    const id: number = createTemporaryId();
    expect(id).toBe(-(2 ** 53 - 1));
    expect(Number.isSafeInteger(id)).toBe(true);
    expect(id).toBeLessThan(-(2 ** 31));
  });

  it('returns -1 when all the bits are 0 but the last one', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0, 0, 0, 0, 0, 0, 1]));
    expect(createTemporaryId()).toBe(-1);
  });

  it('reads seven bytes from left to right', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0x01, 0, 0, 0, 0, 0x01, 0x02]));
    expect(createTemporaryId()).toBe(-(2 ** 48 + 0x0102));
  });

  it('keeps only the five lowest bits of the first byte', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0xe0, 0, 0, 0, 0, 0, 1]));
    expect(createTemporaryId()).toBe(-1);
  });

  it('discards seven bytes that give zero and asks for seven more', () => {
    vi.stubGlobal('crypto', createQueuedCrypto([0xe0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]));
    expect(createTemporaryId()).toBe(-2);
  });

  it('throws a FoundryCryptoUnavailableError for crypto when crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    const thrown: unknown = catchThrown(() => createTemporaryId());
    expect(thrown).toBeInstanceOf(FoundryCryptoUnavailableError);
    expect((thrown as FoundryCryptoUnavailableError).missingApi).toBe('crypto');
  });

  it('reads its bytes with the shared reader of this entry: without getRandomValues, it names it', () => {
    vi.stubGlobal('crypto', {});
    const thrown: unknown = catchThrown(() => createTemporaryId());
    expect((thrown as FoundryCryptoUnavailableError).missingApi).toBe('crypto.getRandomValues');
  });
});
