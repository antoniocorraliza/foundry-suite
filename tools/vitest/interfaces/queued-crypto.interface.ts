export interface QueuedCrypto {
  getRandomValues<T extends ArrayBufferView>(array: T): T;
}
