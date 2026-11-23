import type { FoundryObjectPath } from '@antoniocorraliza/foundry-utils';
import { FoundryCircularReferenceError, ɵdefineOwnProperty, ɵgetOwnDataEntries, ɵisPlainObject } from '@antoniocorraliza/foundry-utils';
import type { EmptyValuesCleaning } from '../interfaces/empty-values-cleaning.interface';
import type { FoundryRemoveEmptyValuesOptions } from '../interfaces/foundry-remove-empty-values-options.interface';
import type { FoundryWithoutEmptyValues } from '../types/foundry-without-empty-values.type';
import { readCleaning } from './read-cleaning.function';

function isEmptyCollection(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0;
  return ɵisPlainObject(value) && Object.keys(value).length === 0;
}

function isRemovedProperty(original: unknown, cleaned: unknown, cleaning: EmptyValuesCleaning): boolean {
  if (original === null || original === undefined) return true;
  if (cleaning.removeEmptyStrings && original === '') return true;
  return cleaning.removeEmptyCollections && isEmptyCollection(cleaned);
}

function clean(value: unknown, path: FoundryObjectPath, ancestors: ReadonlyArray<object>, cleaning: EmptyValuesCleaning): unknown {
  if (!Array.isArray(value) && !ɵisPlainObject(value)) return value;
  const object: object = value as object;
  if (ancestors.includes(object)) throw new FoundryCircularReferenceError({ path });
  const inner: ReadonlyArray<object> = [...ancestors, object];
  if (Array.isArray(object)) {
    return (object as ReadonlyArray<unknown>)
      .map((item, index) => [item, clean(item, [...path, index], inner, cleaning)])
      .filter(([item]) => !cleaning.removeEmptyArrayItems || (item !== null && item !== undefined))
      .map(([, cleaned]) => cleaned);
  }
  const result: object = {};
  ɵgetOwnDataEntries(object).forEach(([key, item]) => {
    const cleaned: unknown = clean(item, [...path, key], inner, cleaning);
    if (!isRemovedProperty(item, cleaned, cleaning)) ɵdefineOwnProperty(result, key, cleaned);
  });
  return result;
}

/**
 * Returns a copy without `null` and `undefined` properties, in depth. Dates, files and other objects are kept as they are.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function removeEmptyValues<T>(
  value: T,
  options?: FoundryRemoveEmptyValuesOptions & { readonly removeEmptyArrayItems?: false },
): FoundryWithoutEmptyValues<T>;

/**
 * Returns a copy without `null` and `undefined` properties or array items, in depth.
 * @throws {FoundryCircularReferenceError} When the value contains a cycle.
 * @throws {TypeError} When the options are not an object or have an unknown value.
 */
export function removeEmptyValues<T>(
  value: T,
  options: FoundryRemoveEmptyValuesOptions & { readonly removeEmptyArrayItems: true },
): FoundryWithoutEmptyValues<T, true>;

export function removeEmptyValues(value: unknown, options?: FoundryRemoveEmptyValuesOptions): unknown {
  return clean(value, [], [], readCleaning(options));
}
