import { ɵcopyArrayItems, ɵdefineOwnProperty, ɵgetOwnDataEntries, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';
import type { ViewConstructor } from '../types/view-constructor.type';
import { readMapEntries } from './read-map-entries.function';
import { readSetValues } from './read-set-values.function';

function readBuiltInGetter(prototype: object, name: PropertyKey, value: object): unknown {
  return Object.getOwnPropertyDescriptor(prototype, name)?.get?.call(value);
}

function copyView(view: object, copies: Map<object, unknown>): ArrayBufferView {
  const typedArrayPrototype: object = Object.getPrototypeOf(Uint8Array.prototype) as object;
  const typedArrayName: unknown = readBuiltInGetter(typedArrayPrototype, Symbol.toStringTag, view);
  const viewPrototype: object = typeof typedArrayName === 'string' ? typedArrayPrototype : DataView.prototype;
  const buffer: ArrayBufferLike = copyValueWith(readBuiltInGetter(viewPrototype, 'buffer', view), copies) as ArrayBufferLike;
  const byteOffset: number = readBuiltInGetter(viewPrototype, 'byteOffset', view) as number;
  if (typeof typedArrayName === 'string') {
    const viewConstructor: ViewConstructor = Reflect.get(globalThis, typedArrayName) as ViewConstructor;
    return new viewConstructor(buffer, byteOffset, readBuiltInGetter(viewPrototype, 'length', view) as number);
  }
  return new DataView(buffer, byteOffset, readBuiltInGetter(viewPrototype, 'byteLength', view) as number);
}

function copyContainer(value: object, copies: Map<object, unknown>): unknown {
  switch (ɵgetValueKind(value)) {
    case 'array': {
      const copy: Array<unknown> = ɵcopyArrayItems(value as ReadonlyArray<unknown>);
      copies.set(value, copy);
      copy.forEach((item, index) => {
        copy[index] = copyValueWith(item, copies);
      });
      return copy;
    }
    case 'plainObject': {
      const copy: object = {};
      copies.set(value, copy);
      ɵgetOwnDataEntries(value).forEach(([key, item]) => ɵdefineOwnProperty(copy, key, copyValueWith(item, copies)));
      return copy;
    }
    case 'map': {
      const copy: Map<unknown, unknown> = new Map<unknown, unknown>();
      copies.set(value, copy);
      readMapEntries(value).forEach(([key, entry]) => copy.set(copyValueWith(key, copies), copyValueWith(entry, copies)));
      return copy;
    }
    case 'set': {
      const copy: Set<unknown> = new Set<unknown>();
      copies.set(value, copy);
      readSetValues(value).forEach((item) => copy.add(copyValueWith(item, copies)));
      return copy;
    }
    case 'date':
      return new Date(Date.prototype.getTime.call(value));
    case 'regExp':
    case 'arrayBuffer':
      return structuredClone(value);
    case 'view':
      return copyView(value, copies);
    default:
      return value;
  }
}

function copyValueWith(value: unknown, copies: Map<object, unknown>): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (copies.has(value)) return copies.get(value);
  const copy: unknown = copyContainer(value, copies);
  copies.set(value, copy);
  return copy;
}

/** Copies a value already checked by `checkCloneable`, keeping its cycles and shared references, and its blobs and files by reference. */
export function copyValue(value: unknown): unknown {
  return copyValueWith(value, new Map<object, unknown>());
}
