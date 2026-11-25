import { describe, expect, it } from 'vitest';
import type { QueuedCrypto } from '../interfaces/queued-crypto.interface.ts';
import { createQueuedCrypto } from './create-queued-crypto.function.ts';

describe('createQueuedCrypto', () => {
  it('fills each array with the next bytes of the queue, whatever its size, and with zeros once it is empty', () => {
    const queuedCrypto: QueuedCrypto = createQueuedCrypto([1, 2, 3]);
    expect(Array.from(queuedCrypto.getRandomValues(new Uint8Array(2)))).toEqual([1, 2]);
    expect(Array.from(queuedCrypto.getRandomValues(new Uint8Array(3)))).toEqual([3, 0, 0]);
  });

  it('fills the bytes of any view, and only the bytes of the view', () => {
    const buffer: ArrayBuffer = new ArrayBuffer(4);
    createQueuedCrypto([7, 8]).getRandomValues(new Uint16Array(buffer, 2, 1));
    expect(Array.from(new Uint8Array(buffer))).toEqual([0, 0, 7, 8]);
  });

  it('throws a TypeError when getRandomValues is called without the stand-in as this', () => {
    const { getRandomValues } = createQueuedCrypto([1]);
    expect(() => getRandomValues(new Uint8Array(1))).toThrow(TypeError);
  });

  it('has no randomUUID', () => {
    expect('randomUUID' in createQueuedCrypto([])).toBe(false);
  });
});
