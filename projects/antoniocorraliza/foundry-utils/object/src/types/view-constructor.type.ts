/** Constructor of a typed array of the running context, called with a buffer, a byte offset and a number of items. */
export type ViewConstructor = new (buffer: ArrayBufferLike, byteOffset: number, length: number) => ArrayBufferView;
