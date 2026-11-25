import type { QueuedCrypto } from '../interfaces/queued-crypto.interface.ts';

/**
 * Creates a stand-in for `crypto`, without `randomUUID`, whose `getRandomValues` fills each array with the next bytes of the queue,
 * whatever its size, and with zeros once the queue is empty.
 */
export function createQueuedCrypto(bytes: ReadonlyArray<number>): QueuedCrypto {
  const queue: Array<number> = [...bytes];
  const queuedCrypto: QueuedCrypto = {
    getRandomValues<T extends ArrayBufferView>(this: unknown, array: T): T {
      // Node and the browsers throw when getRandomValues is called without crypto as this, and so does the stand-in.
      if (this !== queuedCrypto) throw new TypeError('[create-queued-crypto]: getRandomValues was called without crypto as this');
      const view: Uint8Array = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      view.set(Array.from(view, () => queue.shift() ?? 0));
      return array;
    },
  };
  return queuedCrypto;
}
