import { ɵgetOwnDataEntries, ɵgetValueKind } from '@antoniocorraliza/foundry-utils';
import { readMapSize } from './read-map-size.function';
import { readSetSize } from './read-set-size.function';

function readFields(options: unknown): ReadonlyArray<string> | null {
  if (typeof options !== 'object' || options === null) return null;
  const fields: unknown = (options as Readonly<Record<string, unknown>>)['fields'];
  return Array.isArray(fields) && fields.every((field) => typeof field === 'string') ? (fields as ReadonlyArray<string>) : null;
}

function hasHoles(array: ReadonlyArray<unknown>, entries: ReadonlyArray<[string, unknown]>): boolean {
  return entries.length < array.length;
}

function isEmpty(value: unknown, ancestors: ReadonlyArray<object>): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value !== 'object' || ancestors.includes(value)) return false;
  const inner: ReadonlyArray<object> = [...ancestors, value];
  switch (ɵgetValueKind(value)) {
    case 'date':
      return Number.isNaN(Date.prototype.getTime.call(value));
    case 'map':
      return readMapSize(value) === 0;
    case 'set':
      return readSetSize(value) === 0;
    case 'array':
    case 'plainObject': {
      const entries: Array<[string, unknown]> = ɵgetOwnDataEntries(value);
      if (Array.isArray(value) && (value.length === 0 || hasHoles(value, entries))) return true;
      return entries.length === 0 || entries.some(([, item]) => isEmpty(item, inner));
    }
    default:
      return false;
  }
}

/** Tells whether a value, or any value inside it, is empty: `null`, `undefined`, blank text, `NaN`, an invalid date or an empty collection. */
export function hasEmptyValue(value: unknown, options?: { readonly fields?: ReadonlyArray<string> }): boolean {
  const fields: ReadonlyArray<string> | null = readFields(options);
  if (fields === null || ɵgetValueKind(value) !== 'plainObject') return isEmpty(value, []);
  const values: Map<string, unknown> = new Map<string, unknown>(ɵgetOwnDataEntries(value as object));
  return fields.some((field) => isEmpty(values.get(field), [value as object]));
}
