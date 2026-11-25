import type { ViewParts } from '../interfaces/view-parts.interface';

function readBuiltInGetter(prototype: object, name: PropertyKey, view: object): unknown {
  return Object.getOwnPropertyDescriptor(prototype, name)?.get?.call(view);
}

/** Reads a view with the native getters of its kind, so that an own property of the view cannot change what is read. */
export function readViewParts(view: object): ViewParts {
  const typedArrayPrototype: object = Object.getPrototypeOf(Uint8Array.prototype) as object;
  const typedArrayName: unknown = readBuiltInGetter(typedArrayPrototype, Symbol.toStringTag, view);
  const viewPrototype: object = typeof typedArrayName === 'string' ? typedArrayPrototype : DataView.prototype;
  return {
    typedArrayName: typeof typedArrayName === 'string' ? typedArrayName : null,
    buffer: readBuiltInGetter(viewPrototype, 'buffer', view) as object,
    byteOffset: readBuiltInGetter(viewPrototype, 'byteOffset', view) as number,
    byteLength: readBuiltInGetter(viewPrototype, 'byteLength', view) as number,
  };
}
