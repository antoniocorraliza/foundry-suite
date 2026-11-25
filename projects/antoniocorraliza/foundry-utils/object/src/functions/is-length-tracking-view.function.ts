import type { ViewParts } from '../interfaces/view-parts.interface';

function readBufferGetter(name: string, buffer: object): unknown {
  return Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, name)?.get?.call(buffer);
}

function setByteLength(buffer: object, byteLength: number): void {
  Reflect.apply(Reflect.get(ArrayBuffer.prototype, 'resize') as (newByteLength: number) => void, buffer, [byteLength]);
}

function isReadable(read: () => unknown): boolean {
  try {
    read();
    return true;
  } catch {
    return false;
  }
}

function isInBounds(view: ArrayBufferView): boolean {
  return view instanceof DataView ? isReadable(() => view.byteLength) : isReadable(() => (view as Uint8Array).at(0));
}

/**
 * Tells whether a view follows the length of its resizable buffer, which no getter says. It resizes the buffer of a structured clone
 * of the view, which keeps that: at the offset of the view only a following view is still readable, and at the maximum only it grows.
 */
export function isLengthTrackingView(view: object, parts: ViewParts): boolean {
  if (readBufferGetter('resizable', parts.buffer) !== true) return false;
  const twin: ArrayBufferView = structuredClone(view) as ArrayBufferView;
  setByteLength(twin.buffer, parts.byteOffset);
  if (!isInBounds(twin)) return false;
  if (parts.byteLength > 0) return true;
  setByteLength(twin.buffer, readBufferGetter('maxByteLength', twin.buffer) as number);
  return twin.byteLength > 0;
}
