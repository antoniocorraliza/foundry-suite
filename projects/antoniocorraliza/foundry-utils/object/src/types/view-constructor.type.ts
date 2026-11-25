/** Constructor of a typed array of the running context; without a number of items, the view follows the length of a resizable buffer. */
export type ViewConstructor = (new (buffer: ArrayBufferLike, byteOffset: number, length?: number) => ArrayBufferView) &
  Pick<Uint8ArrayConstructor, 'BYTES_PER_ELEMENT'>;
