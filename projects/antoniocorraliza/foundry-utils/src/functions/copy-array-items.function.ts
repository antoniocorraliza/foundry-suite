import { ɵgetOwnDataEntries } from './get-own-data-entries.function';
import { ɵisArrayIndex } from './is-array-index.function';

/** Returns a copy of the items of an array, holes included, without running any getter: an index with a getter is copied as a hole. */
export function ɵcopyArrayItems(array: ReadonlyArray<unknown>): Array<unknown> {
  const items: Array<unknown> = new Array<unknown>(array.length);
  ɵgetOwnDataEntries(array).forEach(([key, item]) => {
    if (ɵisArrayIndex(key)) items[Number(key)] = item;
  });
  return items;
}
