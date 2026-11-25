import { ɵgetOwnDataEntries, ɵgetOwnDataValue, ɵgetValueKind, ɵisEmptyValue, ɵisTextList } from '@antoniocorraliza/foundry-utils';

function readFields(options: unknown): ReadonlyArray<string> | null {
  const fields: unknown = ɵgetOwnDataValue(options, 'fields');
  return ɵisTextList(fields) ? fields : null;
}

function hasHoles(array: ReadonlyArray<unknown>, entries: ReadonlyArray<[string, unknown]>): boolean {
  return entries.length < array.length;
}

function isEmpty(value: unknown, ancestors: ReadonlyArray<object>): boolean {
  if (typeof value === 'object' && value !== null && ancestors.includes(value)) return false;
  return ɵisEmptyValue(value, (container, entries) => hasEmptyEntry(container, entries, [...ancestors, container]));
}

function hasEmptyEntry(container: object, entries: ReadonlyArray<[string, unknown]>, ancestors: ReadonlyArray<object>): boolean {
  if (Array.isArray(container) && hasHoles(container, entries)) return true;
  return entries.some(([, item]) => isEmpty(item, ancestors));
}

/** Tells whether a value, or any value inside it, is empty: `null`, `undefined`, blank text, `NaN`, an invalid date or an empty collection. */
export function hasEmptyValue(value: unknown, options?: { readonly fields?: ReadonlyArray<string> }): boolean {
  const fields: ReadonlyArray<string> | null = readFields(options);
  if (fields === null || ɵgetValueKind(value) !== 'plainObject') return isEmpty(value, []);
  const values: Map<string, unknown> = new Map<string, unknown>(ɵgetOwnDataEntries(value as object));
  return fields.some((field) => isEmpty(values.get(field), [value as object]));
}
