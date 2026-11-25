import { ɵcopyArrayItems, ɵdefineOwnProperty, ɵgetOwnDataEntries, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';
import type { ViewParts } from '../interfaces/view-parts.interface';
import type { ViewConstructor } from '../types/view-constructor.type';
import { isLengthTrackingView } from './is-length-tracking-view.function';
import { readLastIndex } from './read-last-index.function';
import { readMapEntries } from './read-map-entries.function';
import { readSetValues } from './read-set-values.function';
import { readViewParts } from './read-view-parts.function';

function copyView(view: object, copies: Map<object, unknown>): ArrayBufferView {
  const parts: ViewParts = readViewParts(view);
  const buffer: ArrayBufferLike = copyValueWith(parts.buffer, copies) as ArrayBufferLike;
  const isLengthTracking: boolean = isLengthTrackingView(view, parts);
  if (parts.typedArrayName === null) {
    return isLengthTracking ? new DataView(buffer, parts.byteOffset) : new DataView(buffer, parts.byteOffset, parts.byteLength);
  }
  const viewConstructor: ViewConstructor = Reflect.get(globalThis, parts.typedArrayName) as ViewConstructor;
  if (isLengthTracking) return new viewConstructor(buffer, parts.byteOffset);
  return new viewConstructor(buffer, parts.byteOffset, parts.byteLength / viewConstructor.BYTES_PER_ELEMENT);
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
    case 'regExp': {
      const copy: RegExp = structuredClone(value as RegExp);
      copies.set(value, copy);
      copy.lastIndex = copyValueWith(readLastIndex(value), copies) as number;
      return copy;
    }
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
