import { ɵgetFoundryOwnDataEntries, ɵgetFoundryValueKind } from '@antoniocorraliza/foundry-utils';

function readFields(options: unknown): ReadonlyArray<string> | null {
  if (typeof options !== 'object' || options === null) return null;
  const fields: unknown = (options as Readonly<Record<string, unknown>>)['fields'];
  return Array.isArray(fields) && fields.every((field) => typeof field === 'string') ? (fields as ReadonlyArray<string>) : null;
}

function isEmpty(value: unknown, ancestors: ReadonlyArray<object>): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value !== 'object' || ancestors.includes(value)) return false;
  const inner: ReadonlyArray<object> = [...ancestors, value];
  switch (ɵgetFoundryValueKind(value)) {
    case 'date':
      return Number.isNaN(Date.prototype.getTime.call(value));
    case 'map':
      return Array.from(Map.prototype.keys.call(value) as Iterable<unknown>).length === 0;
    case 'set':
      return Array.from(Set.prototype.values.call(value) as Iterable<unknown>).length === 0;
    case 'array':
    case 'plainObject': {
      const values: Array<unknown> = ɵgetFoundryOwnDataEntries(value).map(([, item]) => item);
      const length: number = Array.isArray(value) ? value.length : values.length;
      return length === 0 || values.length < length || values.some((item) => isEmpty(item, inner));
    }
    default:
      return false;
  }
}

/** Tells whether a value, or any value inside it, is empty: `null`, `undefined`, blank text, `NaN`, an invalid date or an empty collection. */
export function hasEmptyValue(value: unknown, options?: { readonly fields?: ReadonlyArray<string> }): boolean {
  const fields: ReadonlyArray<string> | null = readFields(options);
  if (fields === null || ɵgetFoundryValueKind(value) !== 'plainObject') return isEmpty(value, []);
  const values: Map<string, unknown> = new Map<string, unknown>(ɵgetFoundryOwnDataEntries(value as object));
  return fields.some((field) => isEmpty(values.get(field), [value as object]));
}
