import { ɵdefineOwnProperty, ɵgetOwnDataEntries, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';
import { readMapEntries } from './read-map-entries.function';
import { readSetValues } from './read-set-values.function';

function copyContainer(value: object, copies: Map<object, unknown>): unknown {
  switch (ɵgetValueKind(value)) {
    case 'array': {
      const copy: Array<unknown> = new Array<unknown>((value as ReadonlyArray<unknown>).length);
      copies.set(value, copy);
      ɵgetOwnDataEntries(value).forEach(([key, item]) => {
        if (/^\d+$/.test(key)) copy[Number(key)] = copyValueWith(item, copies);
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
    case 'view':
      return structuredClone(value);
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
